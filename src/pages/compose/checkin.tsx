import { ChevronLeft, Loader2Icon, User2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Layout from "~/components/Layout";
import { useSearchParams } from "next/navigation";
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
  helperPrompt,
  parseXMLStream,
  summarizeJournalPrompt,
  tagJournalPrompt,
} from "~/utils/prompt";
import { useRouter } from "next/router";
import { processTagJournalOutput } from "../../utils/prompt";
import { Badge } from "~/components/ui/badge";

export const Conversation = z.array(
  z.object({
    question: z.string(),
    answer: z.string().optional(),
  })
);
export type Conversation = z.infer<typeof Conversation>;

export default function Checkin() {
  const searchParams = useSearchParams();

  const router = useRouter();
  const saveJournal = api.journal.createEntry.useMutation({
    onSuccess: () => {
      router.push("/").catch(console.error);
    },
  });

  const [conversation, setConversation] = useState<Conversation>(
    searchParams.get("mode") === "review"
      ? [
          {
            question: "🌹 What was the highlight of your day?",
          },
          {
            question: "🥀 What's something that didn't go as well today?",
          },
        ]
      : [
          {
            question: "What's on your mind?",
          },
        ]
  );

  const numInitialQuestions = searchParams.get("mode") === "review" ? 2 : 1;

  const deeperCompletion = useCompletion({
    api: "/api/completion",
  });

  const summaryCompletion = useCompletion({
    api: "/api/completion",
  });

  const summary = summaryCompletion.isLoading
    ? (parseXMLStream(summaryCompletion.completion) as {
        emoji?: string;
        title?: string;
        content?: string;
      })
    : {};

  const tagCompletion = useCompletion({
    api: "/api/completion",
  });

  const tags = processTagJournalOutput(
    parseXMLStream(tagCompletion.completion ?? "{}") as any
  );

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
              {idx > numInitialQuestions - 1 ? (
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
              {conversationIdx === idx &&
              item.answer &&
              idx < numInitialQuestions - 1 ? (
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
              idx >= numInitialQuestions - 1 &&
              !deeperCompletion.isLoading ? (
                <div className="flex flex-row justify-between">
                  <Button
                    onClick={() => {
                      const prompt = diveDeeperPrompt(conversation);

                      deeperCompletion
                        .complete(prompt.user, {
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
                      const summaryPrompt =
                        summarizeJournalPrompt(conversation);
                      const tagPrompt = tagJournalPrompt(conversation);

                      Promise.all([
                        tagCompletion.complete(tagPrompt.user, {
                          body: tagPrompt,
                        }),

                        summaryCompletion.complete(summaryPrompt.user, {
                          body: summaryPrompt,
                        }),
                      ])
                        .then(([tagCompletion, summaryCompletion]) => {
                          // saveJournal.mutate({
                          //   content: {
                          //     type: "conversation",
                          //     conversation,
                          //   },
                          //   insight: {
                          //     summary: parseXMLStream(
                          //       summaryCompletion!
                          //     ) as any,
                          //     tags: processTagJournalOutput(
                          //       parseXMLStream(tagCompletion!) as any
                          //     ),
                          //   },
                          // });
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

          {deeperCompletion.isLoading ? (
            <p className="text-sm font-light leading-5">
              {deeperCompletion.completion}
            </p>
          ) : null}

          {summaryCompletion.isLoading ? (
            <Card>
              <CardHeader className="text-md font-medium">
                {summary.emoji} {summary.title}
              </CardHeader>
              <CardContent>{summary.content}</CardContent>
            </Card>
          ) : null}
          <div>
            {tags.people ? (
              <div className="flex flex-row items-center space-x-2">
                <Label>People</Label>
                {tags.people.map((person, idx) => (
                  <Badge
                    key={idx}
                    className="flex flex-row space-x-2"
                    variant={"secondary"}
                  >
                    <User2 className="mr-1 h-3 w-3" /> {person}
                  </Badge>
                ))}
              </div>
            ) : null}
            {tags.themes ? (
              <div className="flex flex-row items-center space-x-2">
                <Label>Themes</Label>
                {tags.themes.map((theme, idx) => (
                  <Badge key={idx} variant={"secondary"}>
                    {theme}
                  </Badge>
                ))}
              </div>
            ) : null}
            {tags.feelings ? (
              <div className="flex flex-row items-center space-x-2">
                <Label>Feelings</Label>
                {tags.feelings.map((feeling, idx) => (
                  <Badge key={idx} variant={"secondary"}>
                    {feeling}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
