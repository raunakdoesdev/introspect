import { Client } from "@notionhq/client";
import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

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

    console.log("Grabbed notion account");

    const notion = new Client({
      auth: notionAccount.access_token!,
    });

    console.log("Created notion client");

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
});
