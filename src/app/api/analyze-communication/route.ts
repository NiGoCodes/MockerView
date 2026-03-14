import { logger } from "@/lib/logger";
import {
  SYSTEM_PROMPT,
  getCommunicationAnalysisPrompt,
} from "@/lib/prompts/communication-analysis";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  logger.info("analyze-communication request received");

  try {
    const body = await req.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const completion = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: getCommunicationAnalysisPrompt(transcript),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    const analysis = completion.text;

    logger.info("Communication analysis completed successfully");

    return NextResponse.json({ analysis: JSON.parse(analysis || "{}") }, { status: 200 });
  } catch (error) {
    logger.error("Error analyzing communication skills");

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
