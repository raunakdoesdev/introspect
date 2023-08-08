import { ArrowRight, Plus } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import Layout from "~/components/Layout";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { cn } from "../lib/utils";

export default function Home() {
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
        <Link
          className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
          href="/compose/checkin"
        >
          <Plus className="mr-2 h-4 w-4" /> New Entry
        </Link>
        <Link
          className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
          href="/compose/checkin?mode=plan"
        >
          <Plus className="mr-2 h-4 w-4" /> New Plan
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
