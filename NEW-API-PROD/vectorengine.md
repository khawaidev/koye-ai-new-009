


## HERE IS A GUIDE TO CALL VECTOR API MODELS:

Request parameters
Authorization
Add parameters to the HeaderAuthorizationIts value is the Token appended after Bearer.
Example :
Authorization: Bearer ********************
Header parameters
Content-Type
string 
Required
Example :
application/json
Accept
string 
Required
Example :
application/json
Authorization
string 
Optional
Example :
Bearer {{YOUR_API_KEY}}
Body parameters
application/json
model
string 
Optional
The ID of the model to use. For details on which models can be used with the Chat API, please refer to the Model Endpoint Compatibility Table.
input
array [object] 
Optional
role
string 
Optional
content
string 
Optional
Example
{
    "model": "gpt-5.1",
    "input": [
        {
            "role": "user",
            "content": "Write a one-sentence bedtime story about a unicorn."
        }
    ]
  }
Request sample code
Fetch
Axios
jQuery
XHR
Native
Request
Unite
const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
myHeaders.append("Authorization", "Bearer <token>");
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
   "model": "gpt-5.1",
   "input": [
      {
         "role": "user",
         "content": "Write a one-sentence bedtime story about a unicorn."
      }
   ]
});

const requestOptions = {
   method: "POST",
   headers: myHeaders,
   body: raw,
   redirect: "follow"
};

fetch("https://api.vectorengine.ai/v1/responses", requestOptions)
   .then((response) => response.text())
   .then((result) => console.log(result))
   .catch((error) => console.error(error));
Return response
🟢200
OK
application/json
id
string 
Required
object
string 
Required
created
integer 
Required
choices
array [object] 
Required
index
integer 
Optional
message
object 
Optional
finish_reason
string 
Optional
usage
object 
Required
prompt_tokens
integer 
Required
completion_tokens
integer 
Required
total_tokens
integer 
Required
Example
{
    "id": "chatcmpl-123",
    "object": "chat.completion",
    "created": 1677652288,
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "\n\nHello there, how may I assist you today?"
            },
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 9,
        "completion_tokens": 12,
        "total_tokens": 21
    }
}

# STREAMING:

const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
myHeaders.append("Authorization", "Bearer <token>");
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
   "model": "gpt-4.1",
   "stream": true,
   "input": [
      {
         "role": "user",
         "content": "你好啊"
      }
   ]
});

const requestOptions = {
   method: "POST",
   headers: myHeaders,
   body: raw,
   redirect: "follow"
};

fetch("https://api.vectorengine.ai/v1/responses", requestOptions)
   .then((response) => response.text())
   .then((result) => console.log(result))
   .catch((error) => console.error(error));

# CONTROLLING LENGTH OF THOUGHTS:

const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
myHeaders.append("Authorization", "Bearer <token>");
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
   "model": "gpt-5.1",
   "input": [
      {
         "role": "user",
         "content": "Write a one-sentence bedtime story about a unicorn."
      }
   ],
   "reasoning": {
      "effort": "high"
   }
});

const requestOptions = {
   method: "POST",
   headers: myHeaders,
   body: raw,
   redirect: "follow"
};

fetch("https://api.vectorengine.ai/v1/responses", requestOptions)
   .then((response) => response.text())
   .then((result) => console.log(result))
   .catch((error) => console.error(error));

# CLAUDE SPECIFIC:

const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
myHeaders.append("Authorization", "Bearer <token>");
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
   "model": "claude-sonnet-4-20250514",
   "system": "你是一个智能AI助手,叫小王",
   "messages": [
      {
         "role": "user",
         "content": "你是谁?!"
      }
   ],
   "stream": true,
   "max_tokens": 8000,
   "thinking": {
      "type": "enabled",
      "budget_tokens": 1200
   }
});

const requestOptions = {
   method: "POST",
   headers: myHeaders,
   body: raw,
   redirect: "follow"
};

fetch("https://api.vectorengine.ai/v1/messages", requestOptions)
   .then((response) => response.text())
   .then((result) => console.log(result))
   .catch((error) => console.error(error));

# CLAUDE SPECIFIC WEB SERARCH FUNCTION[WHEN THE MODEL DOES NOT HAV THE IDEA/CONTEXT OF WHAT THE SUER IMPLES, HERE LIKE TO FIND OUT ABOUT GAMES USER MENTIONED, ETC]:

const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
myHeaders.append("Authorization", "Bearer <token>");
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
   "model": "claude-sonnet-4-6",
   "max_tokens": 1024,
   "messages": [
      {
         "role": "user",
         "content": "What is the weather in NYC?"
      }
   ],
   "tools": [
      {
         "type": "web_search_20250305",
         "name": "web_search"
      }
   ]
});

const requestOptions = {
   method: "POST",
   headers: myHeaders,
   body: raw,
   redirect: "follow"
};

fetch("https://api.vectorengine.ai/v1/messages", requestOptions)
   .then((response) => response.text())
   .then((result) => console.log(result))
   .catch((error) => console.error(error));

