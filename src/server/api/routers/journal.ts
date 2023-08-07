import { Client } from "@notionhq/client";
import type {
  BlockObjectRequest,
  BlockObjectResponse,
  DatabaseObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { z } from "zod";
import { Conversation } from "~/pages/compose/checkin";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { NotionAPI } from "notion-client";
// @ts-expect-error - no types
import { NotionCompatAPI } from "notion-compat";

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

export type JournalEntryNotion = Omit<JournalEntry, "conversation"> & {
  recordMap: any;
};

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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const notionClient = new NotionCompatAPI(notion) as any as NotionAPI;

    return await Promise.all(
      (pages as PageObjectResponse[]).map(async (page) => {
        // get blocks from this page

        let blocks = (
          await notion.blocks.children.list({
            block_id: page.id,
          })
        ).results as BlockObjectResponse[];

        let summaryContent = "No summary is available";
        const conversation: Conversation = [];

        if (blocks[0] && blocks[0].type === "callout") {
          summaryContent = blocks[0].callout.rich_text[0]!.plain_text;
          blocks = blocks.slice(1);
        }

        blocks
          .filter((block) => block.type === "paragraph")
          .forEach((block) => {
            if (block.type !== "paragraph") return;

            let q = "";
            let a = "";

            block.paragraph.rich_text.forEach((text) => {
              if (text.annotations.color === "blue") {
                q += text.plain_text;
              } else {
                a += text.plain_text;
              }
            });
            // strip leading and trailing newlines
            q = q.replace(/^\n+|\n+$/g, "");
            a = a.replace(/^\n+|\n+$/g, "");
            conversation.push({ question: q, answer: a });
          });

        if (!page.properties.Name || page.properties.Name.type !== "title") {
          return null;
        }

        const entry = {
          time: page.created_time,
          summary: {
            emoji: page?.icon?.type === "emoji" ? page.icon.emoji : "",
            title: page.properties.Name.title[0]!.plain_text,
            content: summaryContent,
          },
          recordMap: await notionClient.getPage(page.id),
        };

        return entry;
      })
    );
  }),
  saveEntryInsight: protectedProcedure
    .input(z.object({ id: z.string(), insight: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notionAccount = await prisma.account.findFirstOrThrow({
        where: {
          userId: ctx.session.user.id,
        },
      });
      const notion = new Client({
        auth: notionAccount.access_token!,
      });
      // get the page id and set the insight property (create if it doesn't exist) to some string
      const page = (await notion.pages.retrieve({
        page_id: input.id,
      })) as PageObjectResponse;

      // get database id and create Insight property if it doesn't exist
      const database = (await notion.databases.retrieve({
        database_id:
          page.parent.type === "database_id" ? page.parent.database_id : "",
      })) as DatabaseObjectResponse;

      if (!database.properties.Insight) {
        await notion.databases.update({
          database_id:
            page.parent.type === "database_id" ? page.parent.database_id : "",
          properties: {
            Insight: {
              type: "rich_text",
              rich_text: {},
            },
          },
        });
      }

      console.log("Page: ", JSON.stringify(page.properties));

      await notion.pages.update({
        page_id: input.id,
        properties: {
          Insight: {
            type: "rich_text",
            rich_text: [
              {
                type: "text",
                text: {
                  content: input.insight,
                },
              },
            ],
          },
        },
      });
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
