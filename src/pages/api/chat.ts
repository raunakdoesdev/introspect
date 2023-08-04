import { AnthropicStream, StreamingTextResponse } from "ai";
import { env } from "~/env.mjs";
import { z } from "zod";

export const runtime = "edge";

const Message = z.object({
  content: z.string(),
  role: z.enum(["user", "assistant"]),
});

type Message = z.infer<typeof Message>;

function buildPrompt(messages: Message[]) {
  return (
    messages
      .map(({ content, role }) => {
        if (role === "user") {
          return `Human: ${content}`;
        } else {
          return `Assistant: ${content}`;
        }
      })
      .join("\n\n") + "Assistant:"
  );
}

export default async function handler(req: Request, res: Response) {
  const { messages } = z
    .object({ messages: z.array(Message) })
    .parse(await req.json());

  const response = await fetch("https://api.anthropic.com/v1/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
    },
    body: JSON.stringify({
      prompt: buildPrompt(messages),
      model: "claude-2.0",
      max_tokens_to_sample: 300,
      temperature: 0.2,
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
