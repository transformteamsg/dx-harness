import { Hono } from "hono";

const app = new Hono();

app.get("/healthz", (c) => c.json({ status: "ok" }));

export default app;
