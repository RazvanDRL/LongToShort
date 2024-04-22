"use client"
import { supabase } from "@/lib/supabaseClient";
import { Toaster, toast } from 'sonner';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import Badge from "@/components/badge";
import Header from "@/components/header";

import {
    Sparkles,
    User,
} from "lucide-react"

import React, { useEffect, useState } from 'react';

type User = {
    id: string;
    email: string;
    aud: string;
}

type Metadata = {
    created_at: string;
    name: string;
    duration: number;
    fps?: number;
    width?: number;
    height?: number;
    processed: boolean;
};
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
        const userFetch = (await supabase.auth.getUser()).data?.user;
        if (userFetch) {
            setUser({
                id: userFetch.id,
                email: userFetch.email || "",
                aud: userFetch.aud,
            });
            if (userFetch.aud !== 'authenticated') {
                router.replace('/login');
                return true;
            }
            else
                return false;
        } else {
            router.replace('/login');
            return true;
        }
    }

    supabase
        .channel('processing-queue-update-channel')
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'processing_queue' },
            async (payload) => {
                if (payload.new.video_id !== params.id) return;
                else {
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
                if (payload.new.video_id !== params.id) return;
                else {
                    const pN = payload.new.processed;
                    const pO = payload.old.processed;

                    if (pN !== pO && pN === true) {
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
        return <div className="bg-[#ec2626] z-50 w-screen h-screen"></div>;
    }

    return (
        <div>
            <Toaster richColors />

            {user ? <Header user_email={user.email} /> : null}
            <main className="flex justify-center items-center mt-24">
                <div className="flex justify-center items-center flex-col">
                    <div className="flex justify-between items-center w-full">
                        <div>
                            {
                                status !== "" ? (
                                    <Badge className="px-5 py-3 mb-6" text={(status === 'succeeded' || status === 'done') && elapsedTime > 0 ? `Status: ${status}` : `Status: ${status} - ${formatTime(elapsedTime)}`} color={statusData(status!)} />
                                ) : null
                            }
                        </div>
                        <div>
                            <Button className="mb-6 text-base font-medium" size="lg" onClick={() => processVideo()} disabled={processing}>
                                <Sparkles className="mr-2 h-5 w-5" />
                                Process video
                            </Button>
                        </div>
                    </div>
                    <div className="px-2 mx-auto bg-[#15171d] h-[500px] w-[800px] rounded-2xl">
                        <div className="px-8 py-10 font-mono font-medium text-2xl">
                            <span>
                                Fetching video <span className="text-blue-400 truncate">{metadata?.name}</span>
                            </span>
                            <br /><br />
                            {processing ?
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
                                Estimated cost ~ <span className="text-green-400">${queuePos?.estimated_cost}</span>
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