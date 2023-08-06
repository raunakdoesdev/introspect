import { ArrowRight } from "lucide-react";
import Head from "next/head";
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

export default function Home() {
  return (
    <>
      <Head>
        <title>Introspect</title>
        <meta
          name="description"
          content="Open source AI powered journaling for introspection."
        />
      </Head>
      <Layout className="flex flex-col space-y-4">
        <ul className="flex flex-row space-x-5">
          <li className="underline-offset-3 font-medium underline underline-offset-4">
            Home
          </li>
          <Link href="/entries">
            <li>Entries</li>
          </Link>
        </ul>
        <Card>
          <CardHeader className="text-sm uppercase text-muted-foreground">
            Daily Reflection
          </CardHeader>
          <CardContent>
            How was your day? Take a moment to reflect on your day and keep your
            streak going!
          </CardContent>
          <CardFooter>
            <Link
              className={cn(buttonVariants({ variant: "default" }), "w-full")}
              href="/compose/checkin"
            >
              Check In <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
      </Layout>
    </>
  );
}
