import Link from "next/link";
import React from "react";
import Layout from "~/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { JournalEntry } from "~/server/api/routers/journal";
import { api } from "~/utils/api";

function Entry({ entry }: { entry: JournalEntry }) {
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
          <CardHeader className="flex flex-col space-y-2">
            {entry.conversation.map((message, idx) => (
              <React.Fragment key={idx}>
                <p className="text-muted-foreground">{message.question}</p>
                <p>{message.answer}</p>
              </React.Fragment>
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
