import { AnthropicStream, StreamingTextResponse } from "ai";
import { z } from "zod";
import { env } from "~/env.mjs";

export const runtime = "edge";

export default async function handler(req: Request, res: Response) {
  const body = z
    .object({
      prompt: z.string(),
      model: z.string().default("claude-2.0"),
      temperature: z.number().default(0.2),
      max_tokens_to_sample: z.number().default(300),
      assistant: z.string().default(""),
      stop_sequences: z.array(z.string()).optional(),
    })
    .parse(await req.json());

  console.log(body.stop_sequences);

  const response = await fetch("https://anthropic.hconeai.com/v1/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "Helicone-Auth": `Bearer ${env.HELICONE_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: `Human: ${body.prompt}\n\nAssistant:${body.assistant}`,
      model: body.model,
      temperature: body.temperature,
      max_tokens_to_sample: body.max_tokens_to_sample,
      stream: true,
      stop_sequences: body.stop_sequences,
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
