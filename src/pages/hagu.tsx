import { useCompletion } from "ai/react";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { z } from "zod";
import { useSession, signIn, signOut } from "next-auth/react";

const Conversation = z.array(
  z.object({
    question: z.string(),
    answer: z.string().optional(),
  })
);
type Conversation = z.infer<typeof Conversation>;

const SYSTEM_PROMPT =
  "You are an expert AI therapist. You are assisting the user, in their journaling behaviors. You will ask them questions that will help them dive deeper and understand themselves better.";

export default function Home() {
  // get login from next auth

  const [conversation, setConversation] = useState<Conversation>([
    { question: "🌹 What was the highlight of your day?" },
    { question: "🥀 What's something that didn't go as well today?" },
  ]);

  const { data: session } = useSession({
    required: true,
  });

  const [conversationIdx, setConversationIdx] = useState(0);
  const ref = useRef<HTMLTextAreaElement>(null);

  const { completion, complete } = useCompletion({
    api: "/api/completion",
  });

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "1px";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [conversation]);

  return (
    <>
      <Head>
        <title>Open Bud</title>
        <meta name="description" content="Open source rosebud clone." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-screen w-screen bg-background p-6">
        <Button
          onClick={() => {
            signOut().catch((e) => {
              console.error(e);
            });
          }}
        >
          Log Out
        </Button>
        <Card className="mx-auto max-w-md rounded-xl">
          <CardHeader className="text-2xl font-semibold tracking-tight">
            Journal Entry
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {conversation.slice(0, conversationIdx + 1).map((item, idx) => (
              <>
                <Label htmlFor={`question${idx}`}>{item.question}</Label>
                <Textarea
                  className=""
                  ref={idx === conversationIdx ? ref : undefined}
                  id={`question${idx}`}
                  placeholder="Write..."
                  value={item.answer}
                  onChange={
                    idx === conversationIdx
                      ? (e) => {
                          const newConversation = [...conversation];
                          newConversation[idx]!.answer = e.target.value;
                          setConversation(newConversation);
                        }
                      : undefined
                  }
                />
                {conversationIdx === idx && item.answer && idx < 2 ? (
                  <Button
                    onClick={() => {
                      setConversationIdx(conversationIdx + 1);
                    }}
                  >
                    Continue
                  </Button>
                ) : null}
              </>
            ))}
            {/* {rose && thorn ? (
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
                ) : null} */}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
