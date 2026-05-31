

import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: "AIzaSyCRxsnSLLq7BzZeiowhKrPEjrV1BpL-XcI"
});

const session = await ai.live.connect({
    model: "gemini-3.1-flash-live-preview",

    config: {
        responseModalities: [Modality.TEXT]
    },

    callbacks: {
        onopen: () => {
            console.log("OPENED");
        },

        onmessage: (msg) => {
            console.log("MESSAGE:");
            console.dir(msg, { depth: null });
        },

        onerror: (e) => {
            console.log("ERROR:");
            console.dir(e, { depth: null });
        },

        onclose: (e) => {
            console.log("CLOSED:", e.reason);
        }
    }
});

console.log("CONNECTED");

await session.sendClientContent({
    turns: [
        {
            role: "user",
            parts: [
                {
                    text: "Hello, tell me who you are."
                }
            ]
        }
    ],
    turnComplete: true
});

console.log("PROMPT SENT");

// Give the model time to respond
setTimeout(() => {
    session.close();
}, 10000);