import { Client } from "@notionhq/client";
import type {
  BlockObjectRequest,
  DatabaseObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const notionRouter = createTRPCRouter({
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
  // saveEntryInsight: protectedProcedure
  //   .input(z.object({ id: z.string(), insight: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     const notionAccount = await prisma.account.findFirstOrThrow({
  //       where: {
  //         userId: ctx.session.user.id,
  //       },
  //     });
  //     const notion = new Client({
  //       auth: notionAccount.access_token!,
  //     });
  //     // get the page id and set the insight property (create if it doesn't exist) to some string
  //     const page = (await notion.pages.retrieve({
  //       page_id: input.id,
  //     })) as PageObjectResponse;

  //     // get database id and create Insight property if it doesn't exist
  //     const database = (await notion.databases.retrieve({
  //       database_id:
  //         page.parent.type === "database_id" ? page.parent.database_id : "",
  //     })) as DatabaseObjectResponse;

  //     if (!database.properties.Insight) {
  //       await notion.databases.update({
  //         database_id:
  //           page.parent.type === "database_id" ? page.parent.database_id : "",
  //         properties: {
  //           Insight: {
  //             type: "rich_text",
  //             rich_text: {},
  //           },
  //         },
  //       });
  //     }

  //     console.log("Page: ", JSON.stringify(page.properties));

  //     await notion.pages.update({
  //       page_id: input.id,
  //       properties: {
  //         Insight: {
  //           type: "rich_text",
  //           rich_text: [
  //             {
  //               type: "text",
  //               text: {
  //                 content: input.insight,
  //               },
  //             },
  //           ],
  //         },
  //       },
  //     });
  //   }),
  // saveJournalEntry: protectedProcedure
  //   .input(JournalEntry)
  //   .mutation(async ({ ctx, input }) => {
  //     const user = await prisma.user.findUniqueOrThrow({
  //       where: {
  //         id: ctx.session.user.id,
  //       },
  //       select: {
  //         notionDatabaseId: true,
  //       },
  //     });

  //     const notionAccount = await prisma.account.findFirstOrThrow({
  //       where: {
  //         userId: ctx.session.user.id,
  //       },
  //     });

  //     const notion = new Client({
  //       auth: notionAccount.access_token!,
  //     });

  //     await notion.pages.create({
  //       parent: { type: "database_id", database_id: user.notionDatabaseId! },
  //       properties: {
  //         Name: {
  //           title: [
  //             {
  //               type: "text",
  //               text: {
  //                 content: input.summary.title,
  //               },
  //             },
  //           ],
  //         },
  //       },
  //       icon: {
  //         type: "emoji",
  //         emoji: input.summary.emoji as any,
  //       },
  //       children: [
  //         {
  //           type: "callout",
  //           callout: {
  //             icon: {
  //               type: "emoji",
  //               emoji: "🤖",
  //             },
  //             rich_text: [
  //               {
  //                 type: "text",
  //                 text: { content: input.summary.content },
  //               },
  //             ],
  //           },
  //         },
  //         ...input.conversation.map((message) => {
  //           const block: BlockObjectRequest = {
  //             type: "paragraph",
  //             paragraph: {
  //               rich_text: [
  //                 {
  //                   type: "text",
  //                   text: {
  //                     content: "\n" + message.question + "\n",
  //                   },
  //                   annotations: {
  //                     color: "blue",
  //                   },
  //                 },
  //                 {
  //                   type: "text",
  //                   text: {
  //                     content: message.answer!,
  //                   },
  //                 },
  //               ],
  //             },
  //           };
  //           return block;
  //         }),
  //       ],
  //     });
  //   }),
});
