/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useCompletion } from "ai/react";
import { Loader2, Loader2Icon, Trash, Wand2 } from "lucide-react";
import Link from "next/link";
import Layout from "~/components/Layout";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { JournalEntry } from "~/server/api/routers/journal";
import { api } from "~/utils/api";
import { extractInsightPrompt } from "~/utils/prompt";

function Entry({ entry }: { entry: JournalEntry }) {
  const { complete, completion, isLoading } = useCompletion({
    api: "/api/completion",
  });

  const context = api.useContext();
  const saveInsight = api.journal.saveInsight.useMutation({
    onSuccess: () => {
      context.journal.getJournalEntries.invalidate().catch(console.error);
    },
  });
  const deleteEntry = api.journal.deleteEntry.useMutation({
    onSuccess: () => {
      context.journal.getJournalEntries.invalidate().catch(console.error);
    },
  });

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
                {entry.insight?.summary?.emoji} {entry?.insight.summary?.title}
              </span>
              <div className="flex flex-row space-x-2">
                {deleteEntry.isLoading ? (
                  <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <Trash
                    className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      deleteEntry.mutate(entry.id);
                    }}
                  />
                )}
                {entry.insight?.takeaway ? null : (
                  <Wand2
                    className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      const prompt = extractInsightPrompt(entry);
                      complete(prompt.user, {
                        body: prompt,
                      }).catch(console.error);
                    }}
                  />
                )}
              </div>
            </div>
            <CardDescription>
              {new Date(entry.modifiedAt).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {entry.insight.summary.content}
            {entry.insight.takeaway ?? completion ? (
              <Card className="mt-4">
                <CardHeader className="font-medium">Key Insight</CardHeader>
                <CardContent>
                  {entry.insight.takeaway ?? completion ?? ""}
                </CardContent>
                {!saveInsight.isSuccess &&
                completion &&
                entry.insight.takeaway !== completion &&
                !isLoading ? (
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => {
                        saveInsight.mutate({
                          id: entry.id,
                          insight: {
                            ...entry.insight,
                            takeaway: completion,
                          },
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
            {entry.content.conversation.map((pair, idx) => (
              <div key={idx}>
                <h3 className="font-light leading-tight text-muted-foreground">
                  {pair.question}
                </h3>
                <p>{pair.answer!}</p>
              </div>
            ))}
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
          entries.data.map((data, idx) => <Entry entry={data} key={idx} />)
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
