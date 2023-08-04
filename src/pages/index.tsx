import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/utils/api";
import { useCompletion } from "ai/react";

const SYSTEM_PROMPT =
  "You are an expert AI therapist. You are assisting the user, in their journaling behaviors. You will ask them questions that will help them dive deeper and better understand themselves better.";

export default function Home() {
  const [rose, setRose] = useState("");
  const [thorn, setThorn] = useState("");

  const { completion, complete } = useCompletion({
    api: "/api/completion",
  });

  return (
    <>
      <Head>
        <title>Open Bud</title>
        <meta name="description" content="Open source rosebud clone." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-screen w-screen bg-[#F8F3F3] p-6">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-2xl font-semibold tracking-tight">
            Daily Check In
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Label htmlFor="rose">🌹 What was the highlight of your day?</Label>
            <Textarea
              id="rose"
              placeholder="Write..."
              value={rose}
              onChange={(e) => {
                setRose(e.target.value);
              }}
            />
            <Label htmlFor="thorn">
              🥀 What&apos;s something that didn&apos;t go as well today?
            </Label>
            <Textarea
              id="thorn"
              placeholder="Write..."
              value={thorn}
              onChange={(e) => {
                setThorn(e.target.value);
              }}
            />
            {rose && thorn ? (
              <div className="flex w-full flex-col space-y-2">
                {!completion ? (
                  <div className="flex w-full justify-between">
                    <Button
                      onClick={() => {
                        complete(`${SYSTEM_PROMPT} User entered good thing that happened: ${rose} User listed bad thing that happened: ${thorn}
                    === Please respond with exactly one question which is a follow up question that could help the user dive deeper into their feelings? `)
                          .then(() => {
                            console.log("completed");
                          })
                          .catch((err) => {
                            console.error(err);
                          });
                      }}
                    >
                      Go Deeper
                    </Button>
                    <Button variant="secondary">Finish</Button>
                  </div>
                ) : null}
                {completion ? (
                  <>
                    <p className="leading-7 [&:not(:first-child)]:mt-6">
                      {completion}
                    </p>
                    <Textarea />

                    <div className="flex w-full justify-between">
                      <Button>Go Deeper</Button>
                      <Button variant="secondary">Finish</Button>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
