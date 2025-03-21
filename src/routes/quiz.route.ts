import { Hono } from "hono";
import { generateQuiz } from "../services/quiz-service";
import { getTextFromPDFService } from "../services/pdf-service";
import { authMiddleware } from "../middleware/auth";
import * as fs from "fs";

const quizRouter = new Hono();

quizRouter.post("/generate-quiz", authMiddleware, async (c) => {
  try {
    const { url, type } = await c.req.json();

    if (!url || !type) {
      return c.json({ error: "URL and type is required" }, 400);
    }

    let quiztype = "multi choice";
    if (type === "MULTICHOICE") {
      quiztype = "multiple-choice";
    } else if (type === "YESANDNO") {
      quiztype = "yes or no";
    }

    const text = await getTextFromPDFService(url);

    if (!text) {
      return c.json({ error: "Failed to extract text from the pdf" }, 400);
    }

    const generatedQuiz = await generateQuiz(text, quiztype);

    console.log("got quiz", generatedQuiz.length);
    console.log("is array", Array.isArray(generatedQuiz));

    if (!Array.isArray(generatedQuiz)) {
      throw new Error("Failed to generate quiz");
    }

    fs.writeFileSync("quiz.json", JSON.stringify(generatedQuiz, null, 2));
    return c.json({ quiz: generatedQuiz });
  } catch (error) {
    console.error("Error in generate quiz route:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export { quizRouter };
