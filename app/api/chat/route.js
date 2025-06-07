
import axios from "axios";

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.gemini_api_key}`;

export async function POST(req) {
  try {
    const { message } = await req.json();

    const response = await axios.post(GEMINI_API_URL, {
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    });

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    return new Response(
      JSON.stringify({ reply: text }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Gemini 2.0 error:", error.response?.data || error.message);

    return new Response(
      JSON.stringify({ error: "Gemini 2.0 failed to respond." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
