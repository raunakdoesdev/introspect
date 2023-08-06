/** Prompt engineering utilities */
import { Builder } from "xml2js";
import type { Conversation } from "~/pages/compose/checkin";

export type Prompt = {
  user: string;
  assistant?: string;
  stop_sequences?: string[];
};

type Json = string | { [key: string]: string | Json };

/** Parse XML Stream to JSON */
export function parseXMLStream(xmlStr: string): Json {
  const result: Json = {};
  xmlStr.replace(
    /<([^\/>]+)>(.*?)<\/\1>|<([^\/>]+)>([^<>]*)/g,
    (_, g1, g2, g3, g4) => {
      if (g1) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
        result[g1] = g2.indexOf("<") !== -1 ? parseXMLStream(g2) : g2;
      } else if (g3) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
        result[g3] = g4;
      }
      return "";
    }
  );
  return result;
}

/** Prompt for diving deeper. */
export function diveDeeperPrompt(conversaton: Conversation): Prompt {
  const builder = new Builder();
  return {
    user: builder.buildObject({
      instruction:
        "You are a friend, a great listener, and expert in psychology (CBT/DBT/etc.). You are trying to help your friend introspect by asking them questions. They will answer and you are trying to help them dive deeper and better understand themselves and their feelings. Don't sound too much like a therapist. You will keep a very casual/friendly/helpful tone. Respond with the next question you would ask your friend. Keep your follow up short (1-2 short sentences).",
      conversaton,
    }),
    assistant: "<question>",
    stop_sequences: ["</question>"],
  };
}

/** Summarize journal entry */
export function summarizeJournalPrompt(conversaton: Conversation): Prompt {
  const builder = new Builder();
  return {
    user: builder.buildObject({
      instruction:
        "Summarize the journal entry below in 4-5 sentences (the answers not the questions). Answer in the EXACT FORMAT of the example below (except with summary instead of example as the top level tag).",
      example: {
        emoji: "🏖️",
        title: "A day at the beach",
        content:
          "You were feeling great today and had a awesome day at the beach...",
      },
      journal: conversaton,
    }),
    assistant: "<summary>",
    stop_sequences: ["</summary>"],
  };
}
