import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log("Available models:");
    models.models.forEach(m => console.log(m.name));
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listModels();
