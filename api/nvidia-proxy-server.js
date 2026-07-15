/**
 * Local NVIDIA API Proxy Server
 * 
 * Run this alongside your Vite dev server:
 *   node api/nvidia-proxy-server.js
 * 
 * Proxies NVIDIA API calls to avoid CORS issues.
 */

import { config } from 'dotenv';
import http from 'http';
import https from 'https';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

const PORT = 3002;
const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

function proxyRequest(targetUrl, options, postData) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(targetUrl);
        const httpModule = urlObj.protocol === 'https:' ? https : http;
        
        const reqOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'POST',
            headers: options.headers || {},
        };

        const req = httpModule.request(reqOptions, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, headers: res.headers, body });
            });
        });

        req.on('error', reject);
        if (postData) req.write(JSON.stringify(postData));
        req.end();
    });
}

const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/v1/chat/completions') {
        try {
            const body = await parseBody(req);
            const apiKey = req.headers['x-api-key'] || process.env.VITE_NVIDIA_API_KEY;

            if (!apiKey) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing API key' }));
                return;
            }

            const targetUrl = `${NVIDIA_API_BASE}/chat/completions`;
            const result = await proxyRequest(
                targetUrl,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    }
                },
                body
            );

            res.writeHead(result.status || 200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            res.end(result.body);

        } catch (error) {
            console.error('NVIDIA Proxy Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`🚀 NVIDIA Proxy Server running on http://localhost:${PORT}`);
    console.log(`   Use this as your backend URL for NVIDIA API calls`);
});
