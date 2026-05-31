




import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: "AIzaSyCRxsnSLLq7BzZeiowhKrPEjrV1BpL-XcI"
});

const session = await ai.live.connect({
    model: "gemini-3.1-flash-live-preview",

    callbacks: {
        onopen: () => {
            console.log("CONNECTED");
        },

        onmessage: (message) => {
            console.log(
                "MESSAGE:",
                JSON.stringify(message, null, 2)
            );
        },

        onerror: (err) => {
            console.error("ERROR:", err);
        },

        onclose: (event) => {
            console.log("CLOSED:", event);
        }
    }
});

console.log("SESSION READY");

await session.sendRealtimeInput({
    text: "Hello Gemini. Introduce yourself briefly."
});

console.log("TEXT SENT");