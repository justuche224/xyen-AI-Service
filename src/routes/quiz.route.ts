import { Hono } from "hono";
import { generateQuiz } from "../services/quiz-service";
import { getTextFromPDFService } from "../services/pdf-service";
import { authMiddleware } from "../middleware/auth";

const quizRouter = new Hono();

quizRouter.post("/generate-quiz", authMiddleware, async (c) => {
  try {
    const { url, type, callbackUrl } = await c.req.json();
    const quizId = c.req.header("X-Quiz-ID");

    if (!url || !type) {
      return c.json({ error: "URL and type are required" }, 400);
    }

    // For asynchronous processing with callback
    if (callbackUrl) {
      // Start the process in the background without waiting
      // Using Node.js-friendly approach instead of executionCtx.waitUntil
      processQuizWithCallback(url, type, callbackUrl, quizId).catch((err) =>
        console.error("Background processing failed:", err)
      );

      return c.json(
        { accepted: true, message: "Quiz generation started" },
        202
      );
    } else {
      // Synchronous processing (wait for result)
      const result = await processQuizSync(url, type);
      return c.json(result);
    }
  } catch (error) {
    console.error("Error in generate quiz route:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

async function processQuizSync(url: string, type: string) {
  let quizType = type === "MULTICHOICE" ? "multiple-choice" : "yes or no";

  const text = await getTextFromPDFService(url);
  if (!text) {
    return { error: "Failed to extract text from the PDF" };
  }

  const generatedQuiz = await generateQuiz(text, quizType);
  if (!Array.isArray(generatedQuiz)) {
    return { error: "Failed to generate quiz" };
  }

  return { quiz: generatedQuiz };
}

async function processQuizWithCallback(
  url: string,
  type: string,
  callbackUrl: string,
  quizId: string | undefined
) {
  try {
    const result = await processQuizSync(url, type);

    // Send result to callback URL
    await fetch(callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CALLBACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        quizId,
        success: !result.error,
        data: result.quiz || null,
        error: result.error || null,
      }),
    });
  } catch (error) {
    console.error("Failed to process quiz or send callback:", error);

    // Try to notify about failure
    try {
      await fetch(callbackUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CALLBACK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          quizId,
          success: false,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error during processing",
        }),
      });
    } catch (cbError) {
      console.error("Failed to send failure callback:", cbError);
    }
  }
}

export { quizRouter };
