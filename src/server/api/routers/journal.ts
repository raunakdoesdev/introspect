import { Client } from "@notionhq/client";
import type {
  BlockObjectRequest,
  DatabaseObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { z } from "zod";
import { Conversation } from "~/pages/compose/checkin";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const JournalEntry = z.object({
  time: z.string().optional(),
  summary: z.object({
    emoji: z.string(),
    title: z.string(),
    content: z.string(),
  }),
  conversation: Conversation,
});
export type JournalEntry = z.infer<typeof JournalEntry>;

export const journalRouter = createTRPCRouter({
  getDatabaseId: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        notionDatabaseId: true,
      },
    });
    return user.notionDatabaseId;
  }),

  setDatabaseId: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          notionDatabaseId: input,
        },
      });
    }),
  notionDatabases: protectedProcedure.query(async ({ ctx }) => {
    const notionAccount = await prisma.account.findFirstOrThrow({
      where: {
        userId: ctx.session.user.id,
      },
    });

    const notion = new Client({
      auth: notionAccount.access_token!,
    });

    const databases = (
      await notion.search({
        filter: {
          value: "database",
          property: "object",
        },
      })
    ).results as DatabaseObjectResponse[];

    console.log("Ran search");

    return databases;
  }),
  getJournalEntries: protectedProcedure.query(async ({ ctx }) => {
    const notionAccount = await prisma.account.findFirstOrThrow({
      where: {
        userId: ctx.session.user.id,
      },
    });
    const notion = new Client({
      auth: notionAccount.access_token!,
    });
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        notionDatabaseId: true,
      },
    });
    const pages = (
      await notion.databases.query({
        database_id: user.notionDatabaseId!,
      })
    ).results;

    return pages
      .map((page: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const json = page.properties.JSON.rich_text[0]?.text?.content;
        if (json) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const parsed = JournalEntry.safeParse(JSON.parse(json));
          if (parsed.success) {
            return parsed.data;
          }
        }
      })
      .filter(Boolean);
  }),
  saveJournalEntry: protectedProcedure
    .input(JournalEntry)
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          notionDatabaseId: true,
        },
      });

      const notionAccount = await prisma.account.findFirstOrThrow({
        where: {
          userId: ctx.session.user.id,
        },
      });

      const notion = new Client({
        auth: notionAccount.access_token!,
      });

      await notion.pages.create({
        parent: { type: "database_id", database_id: user.notionDatabaseId! },
        properties: {
          Name: {
            title: [
              {
                type: "text",
                text: {
                  content: input.summary.title,
                },
              },
            ],
          },
          JSON: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: JSON.stringify(input),
                },
              },
            ],
          },
        },
        icon: {
          type: "emoji",
          emoji: input.summary.emoji as any,
        },
        children: [
          {
            type: "callout",
            callout: {
              icon: {
                type: "emoji",
                emoji: "🤖",
              },
              rich_text: [
                {
                  type: "text",
                  text: { content: input.summary.content },
                },
              ],
            },
          },
          ...input.conversation.map((message) => {
            const block: BlockObjectRequest = {
              type: "paragraph",
              paragraph: {
                rich_text: [
                  {
                    type: "text",
                    text: {
                      content: "\n" + message.question + "\n",
                    },
                    annotations: {
                      color: "blue",
                    },
                  },
                  {
                    type: "text",
                    text: {
                      content: message.answer!,
                    },
                  },
                ],
              },
            };
            return block;
          }),
        ],
      });
    }),
});
