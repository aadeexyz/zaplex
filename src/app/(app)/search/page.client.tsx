"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Search, Zap, OctagonAlert } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const ClientSearchPage = () => {
    const [answering, setAnswering] = useState<boolean>(false);
    const [question, setQuestion] = useState<string>("");
    const [answer, setAnswer] = useState<string>("");
    const [error, setError] = useState<string>("");

    const mutation = useMutation({
        mutationFn: async () => {
            setAnswer("");
            setError("");
            setAnswering(true);

            const response = await fetch("/api/answer", {
                method: "POST",
                body: JSON.stringify({ question: question }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const result = await response.json();

            return result.answer;
        },
        onError: (error) => {
            setAnswer("");
            setError(error.message);
            setAnswering(false);
        },
        onSuccess: (data: string) => {
            console.log(data);

            setAnswer(data);
            setError("");
            setAnswering(false);
        },
    });

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const defaultRows = 1;
    const maxVisibleRows = 5;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (question.trim()) {
                mutation.mutate();
            } else {
                setError("Please enter a question");
            }
        }
    };

    const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        textarea.style.height = "auto";

        setQuestion(textarea.value);

        const style = window.getComputedStyle(textarea);
        const borderHeight =
            parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth);
        const paddingHeight =
            parseInt(style.paddingTop) + parseInt(style.paddingBottom);

        const lineHeight = parseInt(style.lineHeight);
        const maxHeight =
            lineHeight * maxVisibleRows + borderHeight + paddingHeight;

        const newHeight = Math.min(
            textarea.scrollHeight + borderHeight,
            maxHeight
        );

        textarea.style.height = `${newHeight}px`;

        if (textarea.scrollHeight > maxHeight) {
            textarea.style.overflowY = "auto";
        } else {
            textarea.style.overflowY = "hidden";
        }
    };

    const handleClick = () => {
        if (question.trim()) {
            mutation.mutate();
        } else {
            setError("Please enter a question");
        }
    };

    return (
        <>
            <div className="flex-grow w-full flex flex-col justify-center items-center">
                <div className="max-w-[1000px] w-full flex flex-col justify-center items-center px-10 space-y-10">
                    <h1 className="text-4xl font-semibold">
                        {"What's on your mind today?"}
                    </h1>

                    <div className="flex w-full">
                        <div className="space-y-2 w-full">
                            <Textarea
                                placeholder="Ask me anything..."
                                value={question}
                                ref={textareaRef}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                rows={defaultRows}
                                className="min-h-[none] resize-none peer rounded-e-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
                                style={{
                                    overflowY: "hidden",
                                    fontSize: "1.25rem",
                                    padding: "1rem",
                                }}
                            />
                        </div>

                        <button
                            disabled={answering}
                            className="flex items-center space-x-1 min-h-full peer-focus-visible:border-primary border border-s-0 rounded-e-md px-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
                            onClick={handleClick}
                        >
                            <Search size={20} />
                            <span>Ask</span>
                        </button>
                    </div>

                    {(answer || answering) && !error && (
                        <div className="flex space-x-2 items-center w-full">
                            <div className="border border-primary bg-primary rounded-full p-1">
                                <Zap
                                    size={18}
                                    className={cn(
                                        answering ? "animate-spin" : ""
                                    )}
                                />
                            </div>

                            {answering && (
                                <p className="text-xl text-muted-foreground">
                                    Answering...
                                </p>
                            )}

                            {!answering && answer && (
                                <p className="text-xl">{answer}</p>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="flex space-x-2 items-center w-full">
                            <div className="border border-red-600 bg-red-600 rounded-full p-1">
                                <OctagonAlert
                                    size={18}
                                    className="stroke-white"
                                />
                            </div>
                            <p className="text-xl text-red-600">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export { ClientSearchPage };
