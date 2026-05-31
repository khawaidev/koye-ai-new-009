const response = await fetch('https://laysoai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer sk-Ww56gWB3toFVCkhnMmv2FE7MnBKj7nqfzqFyZc6xF6hV378t`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
  "model": "gpt-5.4-mini",
  "messages": [
    {
      "role": "user",
      "content": "introduce yourself, your model name, your function, and your speciality,Explain quantum entanglement in one paragraph."
    }
  ],
  "temperature": 0.7
}),
})

const data = await response.json()
console.log(data)