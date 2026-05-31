# Guide for Generating Game Asset Prompts

## Objective
Your task is to generate highly detailed, production-ready prompts for all the assets required to build the game defined in the Game Plan. You must break down every character, environment, item, sound effect, and UI element into specific instructions tailored for different AI generation services.

## Asset Generation Categories

For each asset identified in the game plan, you must create a prompt according to its type. Output the prompts in a structured JSON or Markdown format as requested by the pipeline.

### 1. 2D Images (RunwayML / FLUX / Midjourney)
Used for UI elements, backgrounds, textures, and concept art.
- **Subject**: Be extremely specific about what is in the frame.
- **Style**: Define the art style (e.g., "Pixel art, 16-bit, vibrant colors", "Photorealistic, cinematic lighting, Unreal Engine 5 style", "Anime style, cel-shaded").
- **Composition**: Camera angle, framing (close-up, wide shot), lighting.
- **Example**: `"A fantasy RPG inventory UI background, dark wood texture with gold filigree borders, glowing blue runic accents, high resolution, clean UI design, flat lighting."`

### 2. 3D Models (Tripo AI)
Used for characters, props, and environment pieces.
- **Subject**: Describe the physical shape, proportions, and details.
- **Pose**: Must specify "T-pose" or "A-pose" for characters that need rigging.
- **Style**: Low-poly, high-poly, stylized, realistic.
- **Colors & Textures**: Specific colors, material types (metallic, matte, glowing).
- **Example**: `"A stylized sci-fi space marine character in T-pose, wearing bulky white and orange armor, holding a plasma rifle, low-poly style, PBR textures, neutral lighting."`

### 3. Video / Animations (RunwayML Gen-4.5 / Veo3)
Used for cutscenes, dynamic backgrounds, or complex VFX.
- **Action**: Describe exactly what moves and how.
- **Subject**: Clear description of the entities involved.
- **Cinematography**: Camera movement (pan, zoom, tracking), lens type.
- **Example**: `"A glowing magical portal opening in a dark forest, swirling purple energy, sparks flying, camera slowly pushing in, cinematic lighting, 4k, hyperrealistic."`

### 4. Audio & Voice (RunwayML / ElevenLabs)
Used for background music, sound effects, and character dialogue.
- **Sound Effects (SFX)**: Describe the source, material, and feeling.
  - *Example*: `"A heavy metallic clang followed by a low bass hum, sci-fi door closing sound, ominous, 2 seconds long."`
- **Voice / Text-to-Speech (TTS)**: Provide the dialogue text and specify the voice preset and emotional delivery.
  - *Example*: `[Voice: "Serene"] "Welcome to the Nexus, traveler. Your journey begins here." (Tone: mysterious, calm, slightly echoing).`

## Output Format
Always structure your output clearly, categorizing assets so the orchestrator can dispatch them in parallel to the correct API endpoints.
