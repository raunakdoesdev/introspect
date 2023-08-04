import { AnthropicStream, StreamingTextResponse } from "ai";
import { z } from "zod";
import { env } from "~/env.mjs";

export const runtime = "edge";

export default async function handler(req: Request, res: Response) {
  const { prompt } = z.object({ prompt: z.string() }).parse(await req.json());

  const response = await fetch("https://api.anthropic.com/v1/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
    },
    body: JSON.stringify({
      prompt: `Human: ${prompt}\n\nAssistant:`,
      model: "claude-2.0",
      temperature: 0.2,
      max_tokens_to_sample: 800,
      stream: true,
    }),
  });

  if (!response.ok) {
    return new Response(await response.text(), {
      status: response.status,
    });
  }

  const stream = AnthropicStream(response);
  return new StreamingTextResponse(stream);
}
