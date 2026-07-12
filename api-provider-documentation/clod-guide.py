

import requests
import json

url = "https://api.clod.io/v1/chat/completions"

headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJWaEJFdE0xQjJOUkRpRjRNc1NUSUJUR3RrcmgyIiwidXNlcklkIjoiVmhCRXRNMUIyTlJEaUY0TXNTVElCVEd0a3JoMiIsInRlYW1JZCI6ImU1N2Y5YWQ2LTMwMTUtNGRmMi1hNGI0LWU1YWY5ZjMxNjFjOSIsInRlYW1Sb2xlIjoib3duZXIiLCJwcm9qZWN0SWQiOiI4MjUyMTAyYy01MWYzLTQ3YzUtYjM4NS00MjI3ZDQyMTIwNTkiLCJpYXQiOjE3Nzk3ODY0NDksImV4cCI6MTgyOTc4NjQ0OX0.rWh2sDaLM9BjOlvY9GQyrfvyceW2Fg25eZiLTsomtPI",
    "Content-Type": "application/json"
}

data = {
    "model": "Qwen 3 235B A22B Thinking 2507",
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
    "max_completion_tokens": 6000
}

response = requests.post(url, headers=headers, json=data)
result = response.json()

print(json.dumps(result, indent=2))