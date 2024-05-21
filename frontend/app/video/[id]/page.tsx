"use client"
import { supabase } from "@/lib/supabaseClient";
import { Toaster, toast } from 'sonner';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import Badge from "@/components/badge";
import Header from "@/components/header";
import Link from "next/link";

import {
    ExternalLink,
    Loader,
    Loader2,
    Sparkles,
} from "lucide-react"

import React, { useEffect, useState } from 'react';

import type { Metadata, User } from "../../../types/constants";

type QueuePos = {
    position: number;
    processing_time: string;
    estimated_cost: string;
}

export default function Video({ params }: { params: { id: string } }) {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [queuePos, setQueuePos] = useState<QueuePos | null>(null);
    const [estimatedTime, setEstimatedTime] = useState<number>(0);
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState<string | null>("");
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [startTime, setStartTime] = useState<number | null>(0);
    const [shouldRender, setShouldRender] = useState<boolean>(false);


    async function handleSignedIn() {
        const { data: { user } } = await supabase.auth.getUser();
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        if (user) {
            setUser({
                id: user.id,
                email: user.email!,
                access_token: token!,
            });
            return false;
        }
        else {
            router.replace("/login");
            return true;
        }
    }

    supabase
        .channel('processing-queue-update-channel')
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'processing_queue' },
            async (payload) => {
                if (payload.new.video_id == params.id) {
                    const s = payload.new.status;
                    setStatus(s);
                }
            }
        )
        .subscribe();

    supabase
        .channel('metadata-update-channel')
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'metadata' },
            async (payload) => {
                if (payload.new.id == params.id) {
                    console.log("processed", payload.new.processed);
                    if (payload.new.processed == true) {
                        const promise = () => new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
                            router.replace(`/project/${params.id}`);
                        });

                        toast.promise(promise, {
                            loading: 'File processed successfully. Redirecting...',
                        })
                    }
                }
            }
        )
        .subscribe();


    function formatTime(seconds: number) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours ? hours + "h" : ""} ${minutes ? minutes + "m" : ""} ${secs ? secs + "s" : ""}`;
    };

    async function queuePosition(metadata: Metadata) {
        let { data, error } = await supabase
            .from('processing_queue')
            .select('*')
        if (error) {
            toast.error(error.message);
            return;
        }
        if (!data) {
            toast.error("Video not found");
            return;
        }
        if (data && metadata && metadata.processed === false) {
            let pos = data.length;
            data = data.filter((item: any) => item.video_id === params.id);
            let dur = metadata.duration;
            if (dur <= 3) dur = 1;
            if (dur > 3 && dur <= 15) dur /= 3;
            if (dur > 15 && dur <= 30) dur /= 5;
            if (dur > 30 && dur <= 60) dur /= 7;
            if (dur > 60 && dur <= 120) dur /= 9;
            if (dur > 120 && dur <= 300) dur /= 11;
            if (dur > 300 && dur <= 600) dur /= 13;

            if (pos === 0 && data.length === 0) {
                setQueuePos(
                    {
                        position: 1,
                        processing_time: await formatTime(dur),
                        estimated_cost: (dur * 0.000225).toFixed(6),
                    });
                setEstimatedTime(dur + 210);
            }
            else if (pos === 1 && data.length !== 0) {
                setProcessing(true);
                setQueuePos(
                    {
                        position: 1,
                        processing_time: await formatTime(dur),
                        estimated_cost: (dur * 0.000225).toFixed(6),
                    });
                setEstimatedTime(dur + 210);
            }
            else if (data.length === 0) {
                setQueuePos(
                    {
                        position: pos + 1,
                        processing_time: await formatTime(dur),
                        estimated_cost: (dur * 0.000225).toFixed(6),
                    });
                setEstimatedTime((pos + 1) * (Math.floor(Math.random() * 3) + 5) + 150);
            } else if (data.length !== 0) {
                setProcessing(true);
                setQueuePos(
                    {
                        position: pos,
                        processing_time: await formatTime(dur),
                        estimated_cost: (dur * 0.000225).toFixed(6),
                    });
                setEstimatedTime((pos) * (Math.floor(Math.random() * 3) + 5) + 150);
            }
        }
    }

    async function fetchMetadata() {
        const { data, error } = await supabase
            .from('metadata')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error) {
            toast.error(error.message);
            return;
        }
        if (!data) {
            toast.error("Video not found");
            return;
        }

        if (data) {
            setMetadata({
                created_at: data.created_at,
                name: data.name,
                duration: data.duration,
                processed: data.processed,
                ext: data.ext,
            });
        }

        return data;
    }

    function statusData(status: string) {
        if (status === "starting") {
            return "yellow";
        }
        if (status === "processing") {
            return "blue";
        }
        if (status === "succeeded" || status === "done") {
            return "green";
        }
        return "gray";
    }

    async function processVideo() {
        setProcessing(true);
        const { data, error } = await supabase
            .from('processing_queue')
            .insert({
                video_id: params.id,
                user_id: user?.id,
            });

        if (error) {
            if (error.message.includes("duplicate key value violates unique constraint")) {
                toast.error("Video already in queue");
                return;
            }
            else
                toast.error(error.message);
            return;
        }

        if (!error) {
            toast.success("Video added to queue");

            const { data: update_created_at_data, error: update_created_at_error } = await supabase
                .from("processing_queue")
                .update([
                    { created_at: new Date().toISOString() },
                ])
                .match({ id: params.id });
            // set time as date in unix format
            setStartTime(new Date().getTime());
            setStatus("in queue");
        }
    }

    async function fetchProcessingData() {
        const { data, error } = await supabase
            .from('processing_queue')
            .select('*')
            .eq('video_id', params.id);

        if (error) {
            toast.error(error.message);
            return;
        }
        if (!data) {
            toast.error("Video not found");
            return;
        }

        if (data !== null && data.length > 0) {
            setStatus(data[0].status);
            setStartTime(new Date(data[0].created_at).getTime());
        }

    }

    function shortenFileName(name: string) {
        if (name.length > 20) {
            return name.substring(0, 20) + "..." + name.substring(name.length - 4, name.length);
        }
        return name;
    }

    useEffect(() => {
        const runPrecheck = async () => {
            const result = await handleSignedIn();
            if (!result) {
                if (!user) return;
                try {
                    let metadata = await fetchMetadata();
                    if (metadata.processed === false) {
                        await queuePosition(metadata);
                        await fetchProcessingData();
                        setShouldRender(true);
                    }
                    else if (metadata.processed === true) {
                        router.replace(`/project/${params.id}`);
                    }
                }
                catch (error: any) {
                    toast.error(error);
                }
            }
        };
        runPrecheck();
    }, [user?.id]);

    useEffect(() => {
        if (processing) {
            const interval = setInterval(() => {
                const currentTime = Date.now();
                const diffInSeconds = Math.floor((currentTime - startTime!) / 1000);
                setElapsedTime(diffInSeconds);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [processing, startTime]);

    if (!shouldRender) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-[#0a0a0a] z-50 w-16 h-16 flex justify-center items-center">
                    <Loader2 className="relative animate-spin w-16 h-16 text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <Toaster richColors />

            {user ? <Header user_email={user.email} /> : null}
            <main className="w-full h-screen flex justify-center items-center">
                <div>
                    <div className="flex justify-between items-center w-full">
                        <div>
                            {
                                status !== "" ? (
                                    <Badge className="mb-3 text-sm px-4 py-2 md:px-5 md:py-3 md:mb-6" text={(status === 'succeeded' || status === 'done') && elapsedTime > 0 ? `Status: ${status}` : `Status: ${status} - ${formatTime(elapsedTime)}`} color={statusData(status!)} />
                                ) : null
                            }
                        </div>
                        <div>
                            {
                                status === "" ? (
                                    <Button className="mb-3 font-medium md:mb-6 md:text-base md:px-8 md:py-6" onClick={() => processVideo()} disabled={processing}>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Process video
                                    </Button>
                                ) : null
                            }

                            {
                                status === "done" || status === "succeeded" ? (
                                    <Button asChild variant="outline" className="mb-3 font-medium md:mb-6 md:text-base md:px-8 md:py-6">
                                        <Link href={`/project/${params.id}`}>
                                            <ExternalLink className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                                            Go to project
                                        </Link>
                                    </Button>
                                ) : null
                            }
                        </div>
                    </div>
                    <div className="px-2 mx-auto bg-[#15171d] w-[90vw] h-[360px] md:h-[500px] md:w-[800px] rounded-2xl">
                        <div className="px-4 py-6 md:px-8 md:py-10 font-mono font-medium text-base md:text-2xl">
                            <span>
                                Fetched video <span className="text-blue-400">{shortenFileName(metadata?.name!)}.{metadata?.ext}</span>
                            </span>
                            <br /><br />
                            {status !== "" ?
                                (
                                    <div>
                                        <span>
                                            Queue position &rarr; <span className="text-yellow-400">{queuePos?.position}</span>
                                        </span>
                                        <br /><br />
                                    </div>
                                ) :
                                null
                            }
                            <span>
                                Estimated waiting time ~ <span className="text-green-400">{formatTime(estimatedTime)}</span>
                            </span>
                            <br /><br />
                            <span>
                                Estimated processing time ~ <span className="text-green-400">{queuePos?.processing_time}</span>
                            </span>
                            <br /><br />
                            <span>
                                Estimated cost ~ <span className="text-green-400">${(Number(queuePos?.estimated_cost) * 100).toFixed(2)}</span>
                            </span>
                            <br /><br />
                            <span>
                                You can safely leave this page, we will notify you by <span className="text-indigo-400">email</span> when your video is ready.
                            </span>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
}