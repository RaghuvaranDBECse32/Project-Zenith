import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialized Gemini AI Client
let aiInstance: GoogleGenAI | null = null;
function getAIInstance(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please add it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// REST API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API endpoint to analyze current celestial sky
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const ai = getAIInstance();
    const { lat, lng, cityName, weather, objectsInView } = req.body;

    const formattedObjects = objectsInView && objectsInView.length > 0 
      ? objectsInView.map((obj: any) => `- ${obj.name} (${obj.type}): Alt: ${obj.altitude || "N/A"} km, Az: ${obj.azimuth || "N/A"}°, El: ${obj.elevation || "N/A"}°`).join("\n")
      : "No direct satellite passes detected in this micro-interval.";

    const prompt = `You are an expert astrophysicist and stellar surveyor for Project Zenith: The Celestial Eye.
Analyze the following stargazing conditions and coordinates:
- Location: ${cityName || "Custom Coordinates"} (${lat}°, ${lng}°)
- Local weather: Temp: ${weather.temp}°C, Humidity: ${weather.humidity}%, Cloud Cover: ${weather.clouds}%, Wind: ${weather.wind} km/h
- Celestial bodies currently at or near their Zenith (overhead):
${formattedObjects}

Generate an evocative, highly professional yet readable "Zenith Stargazing & Tracking Assessment".
Include the following Markdown structured sections:
1. **Cosmic Visibility Score & Summary**: Grade the stargazing viability (e.g. 52/100, "Fair") based on coordinates, cloud cover, and objects in view. Give a 2-sentence summary.
2. **Notable Targets Overhead**: Briefly describe what planets, major stars/constellations, or space hardware (like the ISS) are best to watch for. Give professional tips on how to view them (e.g., binocular power, tracking speed, or visible magnitude).
3. **Orbital Operations Intel**: Summarize the current path of any space stations/satellites listed. Explain the scientific, orbital, or structural significance of those tracking targets (e.g., how the ISS orbital altitude of ${objectsInView?.[0]?.altitude || 420}km protects it from thermosphere friction).

Keep your response extremely focused, elegant, scientifically rigorous, and educational. Do not add conversational intro/outro. Use structured Markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Gemini Analyze Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate celestial analysis" });
  }
});

// API endpoint for Astro AI Chatbot inquiries
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const ai = getAIInstance();
    const { message, lat, lng, cityName, history } = req.body;

    const systemInstruction = `You are a helpful, extremely knowledgeable Space and Astronomy Chatbot named "Zenith AI". 
You are speaking to users exploring the real-time celestial coordinates of Earth on the "Project Zenith: The Celestial Eye" platform.
The user's currently focused location is ${cityName || "custom coordinates"} (Lat: ${lat}°, Lng: ${lng}°).
When replying:
1. Provide accurate, encouraging, and highly educational answers about astronomy, star mapping, space station orbits, satellite tracking, constellations, and coordinate tracking (azimuth, elevation, declination).
2. Ground your answers in real celestial mechanics.
3. Keep answers concise but intellectually rich (150-200 words max). Do not use dry or cold language; sound like a passionate science educator (like Carl Sagan or Neil deGrasse Tyson).`;

    // Limit history length for performance and token savings
    const activeHistory = history ? history.slice(-6) : [];

    // Reconstruct conversation with system instructions
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: `Hi. My current coordinates are Lat: ${lat}, Lng: ${lng} near ${cityName}.` }] },
        { role: "model", parts: [{ text: `Greetings explorer! I'm Zenith AI, your celestial co-pilot. I am locked onto your zenith coordinates at ${cityName}. What stargazing secrets or satellite tracking paths shall we map today?` }] },
        ...activeHistory.map((item: any) => ({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.content }],
        })),
        { role: "user", parts: [{ text: message }] },
      ],
      config: {
        systemInstruction,
      },
    });

    res.json({ response: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat response" });
  }
});

// Setup Vite Dev Server / Static Files Serve
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Middlewares integrated in Vite active development mode");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static assets from dist folder");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Project Zenith] running on http://localhost:${PORT}`);
  });
}

setupServer();
