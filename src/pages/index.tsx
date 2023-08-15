import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import Layout from "~/components/Layout";
import { buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { cn } from "../lib/utils";
import { Badge } from "~/components/ui/badge";
import { api } from "~/utils/api";

export default function Home() {
  const entries = api.journal.getJournalEntries.useQuery();
  const streak = entries.data?.reduce((streak, entry, index, arr) => {
    const currentDate = new Date();
    const entryDate = new Date(entry.createdAt);
    const diffInDays = Math.ceil(
      (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffInDays === 1) {
      return streak + 1;
    } else if (diffInDays > 1 && index !== 0) {
      const prevEntryDate = new Date(arr[index - 1]!.createdAt);
      const diffInDaysWithPrevEntry = Math.ceil(
        (entryDate.getTime() - prevEntryDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffInDaysWithPrevEntry === 1) {
        return streak + 1;
      }
    }
    return streak;
  }, 0);

  return (
    <>
      <Layout className="flex flex-col space-y-4">
        <ul className="flex flex-row space-x-5">
          <li className="underline-offset-3 font-medium underline underline-offset-4">
            Home
          </li>
          <Link href="/entries">
            <li>Entries</li>
          </Link>
        </ul>
        <div className="flex flex-row justify-between">
          <Badge>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Badge>
          <Badge variant={"secondary"}>🔥 {streak} day streak </Badge>
        </div>
        <Link
          className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
          href="/compose/checkin"
        >
          <Plus className="mr-2 h-4 w-4" /> New Entry
        </Link>
        <Card>
          <CardHeader className="text-sm uppercase text-muted-foreground">
            Evening Reflection
          </CardHeader>
          <CardContent>
            How was your day? Take a moment to reflect on your day and keep your
            streak going!
          </CardContent>
          <CardFooter>
            <Link
              className={cn(buttonVariants({ variant: "default" }), "w-full")}
              href="/compose/checkin?mode=review"
            >
              Check In <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
      </Layout>
    </>
  );
}
