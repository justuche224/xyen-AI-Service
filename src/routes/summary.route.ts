import { Hono } from "hono";
import { summarizeText } from "../services/summary-service";
import { getTextFromPDFService } from "../services/pdf-service";
import { authMiddleware } from "../middleware/auth";
import * as fs from "fs";

const summaryRouter = new Hono();

summaryRouter.post("/summarize", authMiddleware, async (c) => {
  try {
    const { url } = await c.req.json();

    const text = await getTextFromPDFService(url);

    if (!text) throw new Error("failed to extract text from pdf");
    console.log("text gotten", text.substring(0, 50) + "...");

    const summary = await summarizeText(text);
    // write to a file for testing
    fs.writeFileSync("summary.md", summary ?? "");
    return c.json({ summary: summary?.slice(0, 100) });
  } catch (error) {
    console.error("Error in summarize route:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export { summaryRouter };
