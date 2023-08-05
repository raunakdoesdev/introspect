import { ArrowRight, MessageSquare } from "lucide-react";
import Head from "next/head";
import Layout from "~/components/Layout";
import { Button } from "~/components/ui/button";
import Navbar from "~/components/Navbar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import {
  NavigationMenu,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import {
  NavigationMenuItem,
  NavigationMenuLink,
} from "@radix-ui/react-navigation-menu";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Open Bud</title>
        <meta name="description" content="Open source rosebud clone." />
      </Head>
      <Layout className="flex flex-col space-y-4">
        <Card>
          <CardHeader className="text-sm uppercase text-muted-foreground">
            Daily Reflection
          </CardHeader>
          <CardContent>
            How was your day? Take a moment to reflect on your day and keep your
            streak going!
          </CardContent>
          <CardFooter>
            <Link href="/compose/checkin" className="w-full">
              <Button className="w-full">
                Check In <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </Layout>
    </>
  );
}
