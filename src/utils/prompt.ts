/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/** Prompt engineering utilities */
import { Builder } from "xml2js";
import type { Conversation } from "~/pages/compose/checkin";
import { JournalEntryNotion } from "~/server/api/routers/journal";

export type Prompt = {
  user: string;
  assistant?: string;
  stop_sequences?: string[];
};

type Json = string | { [key: string]: string | Json };

const builder = new Builder({
  headless: true,
  rootName: "instruction",
});

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

/** Prompt for diving deeper. */
export function helperPrompt(conversaton: Conversation): Prompt {
  return {
    user: builder.buildObject({
      instruction:
        "You are a friend, a great listener, and expert in psychology (CBT/DBT/etc.), and an expert planner. Your friend is overwhelmed with too many tasks to do. You are trying to help your friend plan out their day and prioritize tasks. You should give them suggestions for what tasks to prioritize based on due dates and relative importances. You should ask questions if you are not sure. Keep your follow up short (1-2 short sentences).",
    }),
    assistant: "<response>",
    stop_sequences: ["</response>"],
  };
}

/** Summarize journal entry */
export function summarizeJournalPrompt(conversaton: Conversation): Prompt {
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

// recursively extract any field that is key "plain_text" and value is string and concatenate them (separated by newlines)
function extractPlainText(data: any) {
  let result = "";
  if (typeof data === "object") {
    for (const key in data) {
      if (key === "plain_text") {
        result += data[key] + "\n";
      } else {
        result += extractPlainText(data[key]);
      }
    }
  } else if (Array.isArray(data)) {
    data.forEach((item) => {
      result += extractPlainText(item) + "\n";
    });
  }
  return result;
}

/** Extract insight */
export function extractInsightPrompt(conversaton: JournalEntryNotion): Prompt {
  return {
    user: builder.buildObject({
      journal: extractPlainText(conversaton),
      instructions: {
        instruction:
          "Generate a key takeway or piece of advice from the above journal entry in 1-2 sentences. It should not include any personal details from the entry but instead just be a generic insight that could be extracted from the entry.",
        "sample-insight":
          "It's not always possible to be the bigger person. Sometimes, you may have to prioritize your own happiness, even if it makes others upset. Each person has their own boundary for it.",
      },
    }),
    assistant: "<insight>",
    stop_sequences: ["</insight>"],
  };
}
