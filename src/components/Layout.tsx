import { useSession } from "next-auth/react";
import Head from "next/head";
import Navbar from "~/components/Navbar";
import { cn } from "~/lib/utils";

export default function Layout({
  children,
  className,
  hideNav = false,
}: {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
}) {
  useSession({ required: true });
  return (
    <>
      <Head>
        <title>Introspect</title>
        <meta
          name="description"
          content="Open source AI powered journaling for introspection."
        />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/favicon.png"></link>
      </Head>
      <main
        className={cn(
          "mx-auto w-screen max-w-md p-4 md:p-0 md:py-8 lg:max-w-lg xl:max-w-xl",
          className
        )}
      >
        {!hideNav && <Navbar />}
        {children}
      </main>
    </>
  );
}
