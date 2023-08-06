/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Link from "next/link";
import { NotionRenderer, PageIcon, Text } from "react-notion-x";
import Layout from "~/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import type { JournalEntryNotion } from "~/server/api/routers/journal";
import { api } from "~/utils/api";

function Entry({ entry }: { entry: JournalEntryNotion }) {
  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="entry">Entry</TabsTrigger>
      </TabsList>
      <TabsContent value="summary">
        <Card>
          <CardHeader className="text-lg font-semibold">
            {entry.summary.emoji} {entry.summary.title}
            {entry.time ? (
              <CardDescription>
                {new Date(entry.time).toLocaleString("en-US", {
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent>{entry.summary.content}</CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="entry">
        <Card>
          <CardHeader className="flex flex-col space-y-2 whitespace-pre-line">
            <NotionRenderer
              recordMap={entry.recordMap}
              components={{
                Checkbox: ({ isChecked }) => <Checkbox checked={isChecked} />,
                Callout: ({ blockId, block }: { blockId: any; block: any }) =>
                  block.format.page_icon === "🤖" ? null : (
                    <div
                      className={cn(
                        "notion-callout",
                        block.format?.block_color &&
                          `notion-${block.format?.block_color}_co`,
                        blockId
                      )}
                    >
                      <PageIcon block={block} />

                      <div className="notion-callout-text">
                        <Text value={block.properties?.title} block={block} />
                      </div>
                    </div>
                  ),
              }}
            />
          </CardHeader>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default function Entries() {
  const entries = api.journal.getJournalEntries.useQuery();
  return (
    <>
      <Layout className="flex flex-col space-y-4">
        <ul className="flex flex-row space-x-5">
          <Link href="/">Home</Link>

          <li className="underline-offset-3 font-medium underline underline-offset-4">
            Entries
          </li>
        </ul>
        {entries.data ? (
          entries.data
            ?.filter((data) => data)
            .map((data, idx) => <Entry entry={data!} key={idx} />)
        ) : (
          <div className="flex w-full flex-col space-y-4">
            <div className="flex w-full flex-col space-y-2">
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-48 w-full rounded-md" />
            </div>
            <div className="flex w-full flex-col space-y-2">
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-48 w-full rounded-md" />
            </div>
            <div className="flex w-full flex-col space-y-2">
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-48 w-full rounded-md" />
            </div>
            <div className="flex w-full flex-col space-y-2">
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-48 w-full rounded-md" />
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}
