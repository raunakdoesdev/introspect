import { journalRouter } from "~/server/api/routers/journal";
import { notionRouter } from "~/server/api/routers/notion";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  journal: journalRouter,
  notion: notionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
