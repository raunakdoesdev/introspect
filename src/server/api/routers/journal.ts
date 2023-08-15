import type { Entry } from "@prisma/client";
import { z } from "zod";
import { Conversation } from "~/pages/compose/checkin";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const JournalContent = z.object({
  type: z.literal("conversation"),
  conversation: Conversation,
});

export const JournalInsight = z.object({
  summary: z.object({
    emoji: z.string(),
    title: z.string(),
    content: z.string(),
  }),
  takeaway: z.string().optional(),
  tags: z
    .object({
      people: z.array(z.string()).optional(),
      themes: z.array(z.string()).optional(),
      feelings: z.array(z.string()).optional(),
    })
    .optional(),
});

export type JournalEntry = Omit<Entry, "content" | "insight"> & {
  content: z.infer<typeof JournalContent>;
  insight: z.infer<typeof JournalInsight>;
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

  saveInsight: protectedProcedure
    .input(z.object({ id: z.string(), insight: JournalInsight }))
    .mutation(async ({ ctx, input }) => {
      await prisma.entry.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          insight: input.insight,
        },
      });
    }),
  deleteEntry: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await prisma.entry.delete({
        where: {
          id: input,
          userId: ctx.session.user.id,
        },
      });
    }),

  createEntry: protectedProcedure
    .input(z.object({ content: JournalContent, insight: JournalInsight }))
    .mutation(async ({ ctx, input }) => {
      await prisma.entry.create({
        data: {
          userId: ctx.session.user.id,
          content: input.content,
          insight: input.insight,
        },
      });
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
  getJournalEntries: protectedProcedure.query(async ({ ctx }) => {
    const entries = await prisma.entry.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });

    return entries.map((entry) => ({
      ...entry,
      content: JournalContent.parse(entry.content),
      insight: JournalInsight.parse(entry.insight),
    }));
  }),
});
