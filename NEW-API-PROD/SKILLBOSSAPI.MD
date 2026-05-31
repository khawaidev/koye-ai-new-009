


import requests

response = requests.post(
    "https://api.skillboss.co/v1/run",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "model": "openai/gpt-5.1",
        "inputs": {
            # Your parameters here
        }
    }
)

print(response.json())

another eg, 

import fs from "fs";

const API_KEY = process.env.SKILLBOSS_API_KEY;
const imageBase64 = fs.readFileSync("./game-ui.png", "base64");

const res = await fetch("https://api.heybossai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "openai/gpt-5", // or another vision-capable chat model from SkillBoss
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this game UI image. Extract scene type, UI elements, colors, layout, and art style."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${imageBase64}`
            }
          }
        ]
      }
    ],
    max_tokens: 1000
  })
});

const data = await res.json();
console.log(data.choices?.[0]?.message?.content ?? data);