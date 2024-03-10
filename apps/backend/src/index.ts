import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import webauthn from "./routes/webauthn";

const app = new Hono();

app.use(cors());
app.route("/", webauthn);

const port = 8000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
