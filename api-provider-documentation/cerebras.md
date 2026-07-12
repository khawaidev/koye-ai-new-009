

import Cerebras from '@cerebras/cerebras_cloud_sdk';

const client = new Cerebras({
  apiKey: process.env['CEREBRAS_API_KEY'],
});

async function main() {
  const completionCreateResponse = await client.chat.completions.create({
    messages: [{ role: 'user', content: 'Why is fast inference important?' }],
    model: 'gpt-oss-120b',
  });

  console.log(completionCreateResponse);
}

main();



Capabilities
Reasoning
Reasoning models generate intermediate thinking tokens before their final response, enabling better problem-solving and allowing you to inspect the model’s thought process.

Documentation Index
Fetch the complete documentation index at: https://inference-docs.cerebras.ai/llms.txt

Use this file to discover all available pages before exploring further.

Reasoning capabilities are currently available for the OpenAI GPT OSS (gpt-oss-120b) and Z.ai GLM (zai-glm-4.7) models. Each model family has slight variations in the parameters used to control reasoning.
​
Reasoning Format
Control how reasoning text appears in responses using the reasoning_format parameter.
​
Available Formats
Format	Description
parsed	Reasoning returned in separate reasoning field; logprobs separated into reasoning_logprobs
raw	Reasoning prepended to content; GLM and Qwen use <think>...</think> tokens, GPT-OSS concatenates without separators
hidden	Reasoning text and logprobs dropped completely (tokens still counted)
none	Uses model’s default behavior
​
Default Behavior by Model
When reasoning_format is set to none or omitted, each model uses its default format:
Model	Default Reasoning Format
Qwen3	raw (hidden for JSON object/schema)
GLM	text_parsed
GPT-OSS	text_parsed
​
parsed Format
Reasoning text is returned in a separate reasoning field without start/end tokens. When logprobs are enabled, reasoning logprobs are returned in a separate reasoning_logprobs field.

Request

Non-streaming Response

Streaming Response
from cerebras.cloud.sdk import Cerebras

client = Cerebras()

response = client.chat.completions.create(
    model="zai-glm-4.7",
    messages=[
        {
            "role": "user",
            "content": "Can you help me with this?"
        }
    ],
    logprobs=True,
    reasoning_format="parsed"
)

print(response)
When streaming, reasoning tokens are delivered in the reasoning field of the delta.
​
raw Format
Reasoning text is included in the content field, prepended to the response. For GLM and Qwen models, reasoning is wrapped in <think>...</think> tokens. All logprobs are returned together in the standard logprobs field.
Since GPT-OSS does not use thinking tokens, reasoning and content are concatenated without separators when using raw format.
The raw format is not compatible with json_object or json_schema response formats. Models that default to raw will automatically use hidden instead when structured output is requested.

Request

Response
from cerebras.cloud.sdk import Cerebras

client = Cerebras()

response = client.chat.completions.create(
    model="zai-glm-4.7",
    messages=[
        {
            "role": "user",
            "content": "Can you help me with this?"
        }
    ],
    logprobs=True,
    reasoning_format="raw"
)

print(response)
​
hidden Format
Reasoning text and reasoning logprobs are dropped completely from the response. The reasoning tokens are still generated and counted toward total completion tokens.

Request

Response
from cerebras.cloud.sdk import Cerebras

client = Cerebras()

response = client.chat.completions.create(
    model="zai-glm-4.7",
    messages=[
        {
            "role": "user",
            "content": "Can you help me with this?"
        }
    ],
    logprobs=True,
    reasoning_format="hidden"
)

print(response)
​
Model-Specific Parameters
Each model family has its own parameter for controlling reasoning behavior.
There are key differences between the OpenAI client and the Cerebras SDK when using non-standard OpenAI parameters. These examples use the Cerebras SDK. For more info, see Passing Non-Standard Parameters.
​
GPT-OSS: reasoning_effort
Use reasoning_effort to control how much reasoning the model performs:
"low" - Minimal reasoning, faster responses
"medium" - Moderate reasoning (default)
"high" - Extensive reasoning, more thorough analysis

Python

Node.js
response = client.chat.completions.create(
    model="gpt-oss-120b",
    messages=[{"role": "user", "content": "Explain quantum entanglement."}],
    reasoning_effort="medium"
)
​
GLM: reasoning_effort and disable_reasoning
Reasoning is enabled by default on zai-glm-4.7. Use reasoning_effort="none" to disable it:

Python

Node.js
response = client.chat.completions.create(
    model="zai-glm-4.7",
    messages=[{"role": "user", "content": "Explain how photosynthesis works."}],
    reasoning_effort="none"  # Disables reasoning
)
Alternatively, use disable_reasoning to toggle reasoning on or off. Set to true to disable reasoning, or false (default) to enable it.

Python

Node.js
response = client.chat.completions.create(
    model="zai-glm-4.7",
    messages=[{"role": "user", "content": "Explain how photosynthesis works."}],
    disable_reasoning=False  # Set to True to disable reasoning
)
disable_reasoning is deprecated and will be removed after July 21, 2026. Use reasoning_effort="none" instead. See the deprecation notice for details.
​
Reasoning Context Retention
Reasoning tokens are not automatically retained across requests. To maintain awareness of prior reasoning in multi-turn conversations, include the reasoning text in the content field of the assistant message.
Use the same format the model outputs: for GLM and Qwen, include reasoning in <think>...</think> tags; for GPT-OSS, prepend reasoning text directly before the answer.
GPT-OSS
GLM / Qwen

Python

Node.js
# GPT-OSS: reasoning prepended directly before the answer
response = client.chat.completions.create(
    model="gpt-oss-120b",
    messages=[
        {"role": "user", "content": "What is 25 * 4?"},
        {"role": "assistant", "content": "I need to multiply 25 by 4. 25 * 4 = 100. The answer is 100."},
        {"role": "user", "content": "Now divide that by 2."}
    ]
)

Capabilities
Streaming Responses
Learn how to enable streaming responses in the Cerebras API.

Documentation Index
Fetch the complete documentation index at: https://inference-docs.cerebras.ai/llms.txt

Use this file to discover all available pages before exploring further.

To get started with a free API key, click here.
The Cerebras API supports streaming responses, allowing messages to be sent back in chunks and displayed incrementally as they are generated. To enable this feature, set the stream parameter to True within the chat.completions.create method. This will result in the API returning an iterable containing the chunks of the message.
Similarly, the same can be done in TypeScript by setting the stream property to true within the chat.completions.create method.
1
Initial Setup

Begin by importing the Cerebras SDK and setting up the client.

Python

Node.js
import os
from cerebras.cloud.sdk import Cerebras

client = Cerebras(
    # This is the default and can be omitted
    api_key=os.environ.get("CEREBRAS_API_KEY"),
)
2
Streaming Responses

Set the stream parameter to True within the chat.completions.create method to enable streaming responses.

Python

Node.js
stream = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Why is fast inference important?",
        }
    ],
    model="gpt-oss-120b",
    stream=True,
)

for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")

Structured Outputs
Generate structured data with the Cerebras Inference API

Documentation Index
Fetch the complete documentation index at: https://inference-docs.cerebras.ai/llms.txt

Use this file to discover all available pages before exploring further.

To get started with a free API key, click here.
Structured outputs is a feature that can enforce consistent JSON outputs for models in the Cerebras Inference API. This is particularly useful when building applications that need to process AI-generated data programmatically. Some of the key benefits of using structured outputs are:
Reduced Variability: Ensures consistent outputs by adhering to predefined fields.
Type Safety: Enforces correct data types, preventing mismatches.
Easier Parsing & Integration: Enables direct use in applications without extra processing.
​
Tutorial: Structured Outputs using Cerebras Inference
In this tutorial, we’ll explore how to use structured outputs with the Cerebras Cloud SDK. We’ll build a simple application that generates movie recommendations and uses structured outputs to ensure the response is in a consistent JSON format.
1
Initial Setup

First, ensure that you have completed steps 1 and 2 of our Quickstart Guide to set up your API key and install the Cerebras Cloud SDK.
Then, initialize the Cerebras client and import the necessary modules we will use in this tutorial.

Python

Node.js
import os
from cerebras.cloud.sdk import Cerebras
import json

client = Cerebras(
    api_key=os.environ.get("CEREBRAS_API_KEY")
)
2
Defining the Schema

To ensure structured responses from the model, we’ll use a JSON schema to define our output structure. Start by defining your schema, which specifies the fields, their types, and which ones are required. For our example, we’ll define a schema for a movie recommendation that includes the title, director, and year:
Note: For every required array you define in your schema, you must set additionalProperties to false.

Python

Node.js
movie_schema = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "director": {"type": "string"},
        "year": {"type": "integer"},
    },
    "required": ["title", "director", "year"],
    "additionalProperties": False
}
3
Using Structured Outputs

Next, use the schema in your API call by setting the response_format parameter to include both the type and your schema. Setting strict to true will enforce the schema. Setting strict to false will allow the model to return additional fields that are not specified in the schema, similar to JSON mode.

Python

Node.js
completion = client.chat.completions.create(
    model="gpt-oss-120b",
    messages=[
        {"role": "system", "content": "You are a helpful assistant that generates movie recommendations."},
        {"role": "user", "content": "Suggest a sci-fi movie from the 1990s"}
    ],
    response_format={
        "type": "json_schema", 
        "json_schema": {
            "name": "movie_schema",
            "strict": True,
            "schema": movie_schema
        }
    }
)

# Parse the JSON response
movie_data = json.loads(completion.choices[0].message.content)
print(json.dumps(movie_data, indent=2))
Sample output:
{
  "title": "Terminator 2: Judgment Day",
  "director": "James Cameron",
  "year": 1991
}
Now you have a structured JSON response from the model, which can be used in your application.
​
Understanding Strict Mode
Strict mode guarantees that the model’s output will exactly match the JSON schema you provide. When strict is set to true, Cerebras employs constrained decoding to ensure schema conformance at the token level, making invalid outputs impossible.
​
Why Use Strict Mode
Without strict mode, you may encounter:
Malformed JSON that fails to parse
Missing required fields
Incorrect data types (e.g., "16" instead of 16)
Extra fields not defined in your schema
With strict model enabled, you get:
Guaranteed valid JSON
Schema compliance: Every field matches your specification
Type safety: Correct data types for all properties
No retries needed: Eliminates error handling for schema violations
​
Enabling Strict Mode
Set strict to true in your response_format configuration:
response_format={
    "type": "json_schema",
    "json_schema": {
        "name": "my_schema",
        "strict": True,  # Enable constrained decoding
        "schema": your_schema
    }
}
​
Schema Requirements for Strict Mode
When using strict mode, you must set additionalProperties: false. This is required for every object in your schema.
​
Limitations in Strict Mode
When strict mode is enabled, your schema must conform to specific requirements. See the Supported Schemas section for detailed information on constraints, limits, and unsupported features.
​
Schema References and Definitions
You can use $ref with $defs to define reusable schema components within your JSON schema. This is useful for avoiding repetition and creating more maintainable schemas.
schema_with_defs = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "director": {"$ref": "#/$defs/person"},
        "year": {"type": "integer"},
        "lead_actor": {"$ref": "#/$defs/person"},
        "studio": {"$ref": "#/$defs/studio"}
    },
    "required": ["title", "director", "year"],
    "additionalProperties": False,
    "$defs": {
        "person": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "age": {"type": "integer"}
            },
            "required": ["name"],
            "additionalProperties": False
        },
        "studio": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "founded": {"type": "integer"},
                "headquarters": {"type": "string"}
            },
            "required": ["name"],
            "additionalProperties": False
        }
    }
}
​
Supported Schemas
Structured Outputs supports a subset of JSON Schema. This section outlines the supported types, properties, and constraints.
​
Supported Types
The following types are supported for Structured Outputs:
Type	Description
string	Text values
number	Numeric values (floating point)
integer	Whole number values
boolean	True/false values
object	Nested objects with properties
array	Lists of items
enum	Constrained set of allowed values
null	Null values
anyOf	Union types
​
Schema Constraints
When using strict mode, the following constraints apply:
Constraint	Limit
Maximum schema length	5,000 characters
Maximum nesting depth	10 levels
Maximum object properties	500
Maximum total enum values	500 across all enum properties
Single enum string length	7,500 characters (when > 250 total enum values)
​
Required Schema Structure
All schemas must follow these rules:
Root must be an object: The top-level schema must have "type": "object".
No additional properties: You must set "additionalProperties": false for every object in your schema.
Schemas that do not follow these rules may be allowed in some cases today. Starting July 21, 2026, these requirements will be strictly enforced for all models and non-conforming schemas will return a validation error. To ensure forward compatibility, always follow these rules in your schema definitions. For more information about API versioning and deprecation timelines, see API Versions.
​
Supported Features
Your schema can include the following JSON Schema features:
Nested structures: Define complex objects with nested properties.
Required fields: Specify which fields must be present.
Enums (value constraints): Use the enum keyword to whitelist the exact literals a field may take. See rating in the example below.
Schema references: Use $ref with $defs to define reusable schema components within your schema.
Tuple validation: items: false is supported when used with prefixItems for tuple-like arrays.
Number constraints: Use minimum, maximum, exclusiveMinimum, exclusiveMaximum, and multipleOf to constrain number and integer values.
​
Unsupported Features
The following JSON Schema features are not supported in strict mode:
Feature	Notes
Recursive schemas	Self-referencing schemas are not supported
External $ref	References to external URLs are blocked for security
$anchor keyword	Use relative paths within definitions instead
items: true	Not supported for array types
Informational fields	Additional fields meant as guidelines (not used in validation) are not supported
String pattern	Regular expression constraints on strings are not supported
String format	Format validation (e.g., email, date-time, uuid) is not supported
Array constraints	minItems, maxItems are not supported
​
Example: Complex Schema
For example, a more complex schema might look like:
detailed_schema = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "director": {"type": "string"},
        "year": {"type": "integer"},
        "genres": {
            "type": "array",
            "items": {"type": "string"}
        },
        "rating": {
            "type": "string",
            "enum": ["G", "PG", "PG‑13", "R"]
        },
        "cast": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "role": {"type": "string"}
                },
                "required": ["name"],
                "additionalProperties": False
            }
        }
    },
    "required": ["title", "director", "year", "genres"],
    "additionalProperties": False
}
When used with the API, you might get a response like:
{
  "title": "Jurassic Park",
  "director": "Steven Spielberg",
  "year": 1993,
  "genres": ["Science Fiction", "Adventure", "Thriller"],
  "cast": [
    {"name": "Sam Neill", "role": "Dr. Alan Grant"},
    {"name": "Laura Dern", "role": "Dr. Ellie Sattler"},
    {"name": "Jeff Goldblum", "role": "Dr. Ian Malcolm"}
  ]
}
​
Key Ordering
The keys in the generated JSON output will appear in the same order as they are defined in your schema.
​
Working with Pydantic and Zod
Besides defining a JSON schema manually, you can use Pydantic (Python) or Zod (JavaScript) to create your schema and convert it to JSON. Pydantic’s model_json_schema and Zod’s zodToJsonSchema methods generate the JSON schema, which can then be used in the API call, as demonstrated in the workflow above.

Python (Pydantic)

Node.js (Zod)
from pydantic import BaseModel
import json

# Define your schema using Pydantic
class Movie(BaseModel):
    title: str
    director: str 
    year: int 

# Convert the Pydantic model to a JSON schema
movie_schema = Movie.model_json_schema()

# Print the JSON schema to verify it
print(json.dumps(movie_schema, indent=2))
​
JSON Mode
JSON mode is an alternative to structured outputs that generates JSON responses without enforcing a specific schema. The model decides what fields to include based on the context of your prompt.
We recommend using structured outputs with strict set to true instead of JSON mode whenever possible. Structured outputs guarantee schema adherence, while JSON mode only ensures valid JSON without enforcing a specific structure.
To use JSON mode, set the response_format parameter to json_object and include instructions in your message asking the model to respond in JSON format:

Python

Node.js
completion = client.chat.completions.create(
    model="gpt-oss-120b",
    messages=[
      {"role": "system", "content": "You are a helpful assistant that generates movie recommendations. Respond with JSON."},
      {"role": "user", "content": "Suggest a sci-fi movie from the 1990s"}
    ],
    response_format={"type": "json_object"}
)
​
Structured Outputs vs JSON Mode
The table below summarizes the key differences between Structured Outputs and JSON Mode:
Feature	Structured Outputs	JSON Mode
Outputs valid JSON	Yes	Yes
Enforces schema	Yes (when strict: true)	No
Constrained decoding	Yes (when strict: true)	No
Configuration	response_format: { type: "json_schema", json_schema: { "strict": true, "schema": ... } }	response_format: { type: "json_object" }
tools and response_format cannot be used in the same request.
​
Conclusion
Structured outputs with JSON schema enforcement ensures your AI-generated responses follow a consistent, predictable format. This makes it easier to build reliable applications that can process AI outputs programmatically without worrying about unexpected data structures or missing fields.
Check out some of our other tutorials to learn more about other features of the Cerebras Inference SDK:
Tool Use: extending models’ capabilities to access tools to answer questions and perform actions
Streaming: a feature for streaming responses from the model
CePO: a reasoning framework for improving reasoning model abilities with test-time compute