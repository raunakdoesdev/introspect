/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Loader2, Wand2 } from "lucide-react";
import Link from "next/link";
import { NotionRenderer, PageIcon, Text } from "react-notion-x";
import Layout from "~/components/Layout";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import type { JournalEntryNotion } from "~/server/api/routers/journal";
import { api } from "~/utils/api";
import { useCompletion } from "ai/react";
import { extractInsightPrompt } from "~/utils/prompt";

function Entry({ entry }: { entry: JournalEntryNotion }) {
  const { complete, completion, isLoading } = useCompletion({
    api: "/api/completion",
  });

  const saveInsight = api.journal.saveEntryInsight.useMutation();

  const insight =
    entry.recordMap.raw?.page?.properties?.Insight?.rich_text[0]?.text.content;

  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="entry">Entry</TabsTrigger>
      </TabsList>
      <TabsContent value="summary">
        <Card>
          <CardHeader className="text-lg font-semibold">
            <div className="flex flex-row justify-between">
              <span>
                {entry.summary.emoji} {entry.summary.title}
              </span>
              <Button
                size={"sm"}
                onClick={() => {
                  const prompt = extractInsightPrompt(entry);
                  complete(prompt.user, {
                    body: prompt,
                  }).catch(console.error);
                }}
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>
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
          <CardContent>
            {entry.summary.content}
            {insight ?? completion ? (
              <Card className="mt-4">
                <CardHeader className="font-medium">Key Insight</CardHeader>
                <CardContent>{insight ?? completion ?? ""}</CardContent>
                {!saveInsight.isSuccess &&
                completion &&
                insight !== completion &&
                !isLoading ? (
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => {
                        console.log(entry.recordMap.raw.page.id);
                        saveInsight.mutate({
                          id: entry.recordMap.raw.page.id,
                          insight: completion,
                        });
                      }}
                    >
                      {saveInsight.isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Save Insight
                    </Button>
                  </CardFooter>
                ) : null}
              </Card>
            ) : null}
          </CardContent>
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
