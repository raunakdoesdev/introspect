import { ChevronLeft, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Layout from "~/components/Layout";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";
import { z } from "zod";
import { useCompletion } from "ai/react";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
  diveDeeperPrompt,
  parseXMLStream,
  summarizeJournalPrompt,
} from "~/utils/prompt";
import { useRouter } from "next/router";

export const Conversation = z.array(
  z.object({
    question: z.string(),
    answer: z.string().optional(),
  })
);
export type Conversation = z.infer<typeof Conversation>;

export default function Checkin() {
  const router = useRouter();
  const saveJournal = api.journal.saveJournalEntry.useMutation({
    onSuccess: () => {
      router.push("/").catch(console.error);
    },
  });

  const [conversation, setConversation] = useState<Conversation>([
    {
      question: "🌹 What was the highlight of your day?",
    },
    {
      question: "🥀 What's something that didn't go as well today?",
    },
  ]);

  const { completion, complete, isLoading } = useCompletion({
    api: "/api/completion",
  });

  const [conversationIdx, setConversationIdx] = useState(0);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "1px";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [conversation]);

  return (
    <Layout hideNav>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Link href="/" className="flex flex-row items-center">
            <ChevronLeft id="leave" className="mr-2" />
            Daily check-in
          </Link>
          <div className="text-primary">Finish</div>
        </CardHeader>
        <Separator orientation="horizontal" className="mb-4" />
        <CardContent className="flex flex-col space-y-4">
          {conversation.slice(0, conversationIdx + 1).map((item, idx) => (
            <>
              {idx > 1 ? (
                <p className="text-sm font-light leading-5">{item.question}</p>
              ) : (
                <Label htmlFor={`question${idx}`}>{item.question}</Label>
              )}
              <Textarea
                className="resize-none border-transparent focus:border-transparent focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
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
              {conversationIdx === idx && item.answer && idx < 1 ? (
                <Button
                  onClick={() => {
                    setConversationIdx(conversationIdx + 1);
                  }}
                >
                  Continue
                </Button>
              ) : null}
              {conversationIdx === idx &&
              item.answer &&
              idx >= 1 &&
              !isLoading ? (
                <div className="flex flex-row justify-between">
                  <Button
                    onClick={() => {
                      const prompt = diveDeeperPrompt(conversation);
                      complete(prompt.user, {
                        body: prompt,
                      })
                        .then((completion) => {
                          setConversationIdx(conversationIdx + 1);
                          setConversation([
                            ...conversation,
                            {
                              question: completion!,
                            },
                          ]);
                        })
                        .catch(console.error);
                      setConversationIdx(conversationIdx + 1);
                    }}
                  >
                    Go Deeper
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const prompt = summarizeJournalPrompt(conversation);
                      complete(prompt.user, {
                        body: prompt,
                      })
                        .then((completion) => {
                          saveJournal.mutate({
                            time: new Date().toISOString(),
                            summary: parseXMLStream(completion!) as any,
                            conversation,
                          });
                        })
                        .catch(console.error);
                    }}
                  >
                    {saveJournal.isLoading ? (
                      <Loader2Icon className="mr-2 animate-spin" />
                    ) : null}
                    Finish
                  </Button>
                </div>
              ) : null}
            </>
          ))}

          {isLoading ? (
            <p className="text-sm font-light leading-5">{completion}</p>
          ) : null}
        </CardContent>
      </Card>
    </Layout>
  );
}
