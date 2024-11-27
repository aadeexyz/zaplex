"use client";

import { useState } from "react";
import { Plus, Trash, Copy, Check, Loader } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type ClientAPIPageProps = {
    keys: {
        id: string;
        name: string;
        owner: string;
        calls: number;
    }[];
};

type APIKey = {
    key: string;
    id: string;
    name: string;
};

const formSchema = z.object({
    name: z
        .string()
        .min(1, {
            message: "Name is required",
        })
        .max(64, {
            message: "Name is too long",
        }),
});

const ClientAPIPage = ({ keys }: ClientAPIPageProps) => {
    const [data, setData] = useState(keys);
    const [newKey, setNewKey] = useState<APIKey | null>(null);
    const [generatingKey, setGeneratingKey] = useState<boolean>(false);
    const [step, setStep] = useState<"new" | "copy" | null>(null);
    const [error, setError] = useState<string | null>(null);

    const addKeyMutation = useMutation({
        mutationFn: async (body: { name: string }) => {
            setError(null);
            setNewKey(null);
            setGeneratingKey(true);

            const response = await fetch("/api/keys", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const result = await response.json();

            return result;
        },
        onError: (error) => {
            setError(error.message);
            console.error(error);
        },
        onSuccess: (data: APIKey) => {
            setNewKey(data);
            setGeneratingKey(false);
            setData((prev) => [
                ...prev,
                {
                    id: data.id,
                    name: data.name,
                    owner: "me",
                    calls: 0,
                },
            ]);
            setStep("copy");
            setError(null);
        },
    });

    const deleteKeyMutation = useMutation({
        mutationFn: async (id: string) => {
            setError(null);

            const response = await fetch(`/api/keys/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const result = await response.json();

            return result;
        },
        onError: (error) => {
            setError(error.message);
            console.error(error);
        },
        onSuccess: (data: APIKey) => {
            setData((prev) => prev.filter((key) => key.id !== data.id));
            setError(null);
        },
    });

    return (
        <Dialog>
            <div className="w-full h-full flex flex-col justify-center items-center">
                <div className="max-w-[1000px] w-full px-10 space-y-5">
                    {error && (
                        <div className="bg-red-100 text-red-700 p-4 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="w-full flex justify-between">
                        <h1 className="text-xl font-semibold">API Keys</h1>
                        <DialogTrigger asChild>
                            <Button onClick={() => setStep("new")}>
                                <Plus size={16} />
                                Create Key
                            </Button>
                        </DialogTrigger>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-center">
                                    Calls
                                </TableHead>
                                <TableHead className="text-right">
                                    Delete Key
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell />
                                    <TableCell className="text-center">
                                        Please create an API key to get started
                                    </TableCell>
                                    <TableCell />
                                </TableRow>
                            ) : (
                                data.map((key) => (
                                    <TableRow key={key.id}>
                                        <TableCell>{key.name}</TableCell>
                                        <TableCell className="text-center">
                                            {key.calls}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant={"destructive"}
                                                    >
                                                        <Trash size={16} />
                                                        Delete Key
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent side="top">
                                                    <div className="flex flex-col">
                                                        <span className="text-muted-foreground">
                                                            {"I'm"} sure I want
                                                            to delete
                                                        </span>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() =>
                                                                deleteKeyMutation.mutate(
                                                                    key.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <DialogContent>
                {step === "new" && (
                    <NewKey
                        mutation={addKeyMutation}
                        generatingKey={generatingKey}
                    />
                )}
                {step === "copy" && newKey && <CopyKey apiKey={newKey} />}
            </DialogContent>
        </Dialog>
    );
};

const NewKey = ({
    mutation,
    generatingKey,
}: {
    mutation: UseMutationResult<APIKey, Error, { name: string }, unknown>;
    generatingKey: boolean;
}) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        mutation.mutate(values);
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>New API Key</DialogTitle>
                <DialogDescription>
                    Please enter a name for your new API key.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                    Name it something that makes sense to you.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={generatingKey}
                        className="w-full"
                    >
                        {generatingKey ? (
                            <Loader className="animate-spin" size={16} />
                        ) : (
                            "Create Key"
                        )}
                    </Button>
                </form>
            </Form>
        </>
    );
};

const CopyKey = ({ apiKey }: { apiKey: APIKey }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey.key);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>{apiKey.name}</DialogTitle>
                <DialogDescription>
                    Please copy your API key. It {"won't"} be shown again.
                </DialogDescription>
            </DialogHeader>
            <div className="flex w-full space-x-2">
                <div className="w-full">
                    <Label htmlFor="link" className="sr-only">
                        Link
                    </Label>
                    <Input id="link" value={apiKey.key} readOnly />
                </div>
                <Button onClick={handleCopy}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
            </div>
        </>
    );
};

export { ClientAPIPage };
