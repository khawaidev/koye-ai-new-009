

use this model:Qwen 3 235B A22B Thinking 2507 [this is the actual name without the '-']

Chat Completions API
The /v1/chat/completions API is designed to generate text-based responses from various language models. It's built for flexibility, allowing you to choose your model, adjust settings, and optimize for cost, speed, or token rate.

Request Structure
Property	Value
HTTP Method	POST
Base URL	https://api.clod.io
Endpoint	/v1/chat/completions
Headers
Parameter	Description
Authorization	Bearer (apikey) Your unique CLōD API key
Content-Type	application/json
Request Body
Parameter	Type	Description
model	string	Identifier of the model or strategy to use (e.g., "GPT 4o", "GPT 4o@price", "@latency").
messages	array	An array of message objects, each with role ("user", "assistant", "system") and content.
temperature	number	Optional. Sampling temperature (0-2). Higher values make output more random. Default varies by model.
max_completion_tokens	integer	Optional. Maximum number of tokens to generate. Default varies by model.
stream	boolean	Optional. If true, enables streaming of results. Default: false.
…	…	Other OpenAI-compatible parameters are supported.
‍

Example Request
JSON Example
Copy
{
  "model": "GPT 4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ],
  "temperature": 0.7,
  "max_completion_tokens": 50
}
CURL Example
Copy
curl -X POST "https://api.clod.io/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "GPT 4o",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "What is the capital of France?"
      }
    ],
    "temperature": 0.7,
    "max_completion_tokens": 50
  }'
Python Example
Copy
import requests
import json

url = "https://api.clod.io/v1/chat/completions"

headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

data = {
    "model": "GPT 4o",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "What is the capital of France?"
        }
    ],
    "temperature": 0.7,
    "max_completion_tokens": 50
}

response = requests.post(url, headers=headers, json=data)
result = response.json()

print(json.dumps(result, indent=2))
Example Response
Copy
{
  "id": "chatcmpl-xxxxxxxxxxxxxxxxxxxx",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "GPT 4o", // Actual model used
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The capital of France is Paris."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 8,
    "total_tokens": 28
  }
}