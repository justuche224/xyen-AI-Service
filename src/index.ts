import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { quizRouter } from "./routes/quiz.route";
import { summaryRouter } from "./routes/summary.route";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    maxAge: 86400,
  })
);

// Root route
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// Mount routers
app.route("/api/v1", quizRouter);
app.route("/api/v1", summaryRouter);

const port = parseInt(process.env.PORT || "3002");
console.log(`Starting PDF extraction server on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
