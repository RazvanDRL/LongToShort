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
    VideoIcon,
} from "lucide-react"

import React, { useEffect, useState } from 'react';

import type { Metadata, User } from "../../../types/constants";

type QueuePos = {
    position: number;
    estimated_time: number;
    processing_time: number;
}

type Status = "starting" | "in queue" | "processing" | "succeeded" | "done" | "";

export default function Video({ params }: { params: { id: string } }) {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [video, setVideo] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [queuePos, setQueuePos] = useState<QueuePos | null>(null);
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState<Status>("");
    const [startTime, setStartTime] = useState<number | null>(0);
    const [shouldRender, setShouldRender] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);


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
            { event: '*', schema: 'public', table: 'processing_queue' },
            async (payload: any) => {
                if (payload.new.video_id == params.id) {
                    const s = payload.new.status;
                    setStatus(s);
                }
                await queuePosition().then(async (pos) => {
                    await fetchEstimatedTime(pos!, metadata!).then((data) => {
                        setQueuePos({
                            position: pos!,
                            estimated_time: data.waitingTime,
                            processing_time: data.processingTime,
                        });
                    });
                });
            }
        )
        .subscribe();

    function formatTime(seconds: number) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours ? hours + "h" : ""} ${minutes ? minutes + "m" : ""} ${secs ? secs + "s" : ""}`;
    };

    async function queuePosition() {
        let { data, error } = await supabase
            .from('processing_queue')
            .select('*')
            .order('created_at', { ascending: true })
        if (error) {
            toast.error(error.message);
            return;
        }
        if (!data) {
            toast.error("Video not found");
            return;
        }
        let p = 1;
        data.forEach((element: any, index: number) => {
            if (element.video_id === params.id)
                p = index + 1;
        })
        return p;
    }

    async function fetchEstimatedTime(pos: number, metadata: Metadata) {
        let dur = metadata?.duration;
        if (dur <= 3) dur = 1;
        if (dur > 3 && dur <= 15) dur /= 3;
        if (dur > 15 && dur <= 30) dur /= 5;
        if (dur > 30 && dur <= 60) dur /= 7;
        if (dur > 60 && dur <= 120) dur /= 9;
        if (dur > 120 && dur <= 300) dur /= 11;
        if (dur > 300 && dur <= 600) dur /= 13;

        return {
            waitingTime: 90 + Math.floor(dur + ((pos - 1) * 7)),
            processingTime: dur,
        };
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
        if (status === "starting" || status === "loading") {
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
        const credits = await supabase.from("profiles").select("credits").eq("id", user?.id);
        if (credits.data && credits.data.length > 0 && credits.data[0].credits < 1) {
            toast.error("Not enough credits");
            return;
        }
        else {
            setProcessing(true);
            const { data, error } = await supabase
                .from('processing_queue')
                .insert({
                    video_id: params.id,
                    user_id: user?.id,
                    status: "in queue",
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
                if (update_created_at_error) {
                    toast.error(update_created_at_error.message);
                    return;
                }
                if (!update_created_at_error) {
                    await queuePosition().then(async (pos) => {
                        await fetchEstimatedTime(pos!, metadata!).then((data) => {
                            setQueuePos({
                                position: pos!,
                                estimated_time: data.waitingTime,
                                processing_time: data.processingTime,
                            });
                        });
                    });
                    setStartTime(new Date().getTime());
                    setStatus("in queue");
                }
            }
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

    function translateStatus(status: Status) {
        if (status === "in queue") return "Queueing for processing";
        if (status === "starting") return "AI model is starting";
        if (status === "processing") return "The AI does its magic";
        if (status === "succeeded") return "Succeeded";
        if (status === "done") return "Done";
        return "";
    }

    async function fetchVideo() {
        try {
            const response = await fetch(`/api/generate-signed-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.access_token}`,
                },
                body: JSON.stringify({ key: `${params.id}.mp4`, bucket: 'upload-bucket' }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch signed URL');
            }

            const data = await response.json();
            console.log(data.url);
            setVideo(data.url);
        } catch (error) {
            console.error('Error fetching video:', error);
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
                        if (metadata.video_src === null) {
                            await fetchVideo();
                        }
                        else {
                            // decide if platform is tiktok or instagram based on the video_src hostname
                            const hostname = new URL(metadata.video_src).hostname;
                            if (hostname.includes("tiktokcdn"))
                                setVideo(metadata.video_src);
                            else {
                                const video_path = metadata.video_src.replace(/^(?:\/\/|[^\/]+)*\//, "/");
                                setVideo("/instagram-dw" + video_path);
                            }
                        }
                        await fetchProcessingData();
                        await queuePosition().then(async (pos) => {
                            await fetchEstimatedTime(pos!, metadata!).then((data) => {
                                setQueuePos({
                                    position: pos!,
                                    estimated_time: data.waitingTime,
                                    processing_time: data.processingTime,
                                });
                            });
                        });
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
        if (!startTime) return;
        else {
            const interval = setInterval(() => {
                const currentTime = Date.now();
                const diffInSeconds = Math.floor((currentTime - startTime!) / 1000);
                setProgress(Math.min((diffInSeconds * 100) / queuePos?.estimated_time!, 100));
            }, 1000);
            return () => clearInterval(interval);

        }
    }, [processing, startTime, status]);

    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (!document.hidden) {
                // When the tab becomes visible, trigger a fetch request
                await fetchProcessingData();
            }
        };

        // Add event listener for visibility change
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Initial check when component mounts
        (async () => {
            await fetchProcessingData();
        })();

        // Cleanup function to remove event listener
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const sse = new EventSource(`/api/sse?id=${params.id}`);

        sse.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'video-processed' && data.videoId === params.id) {
                toast.success('Video processed successfully. Redirecting...');
                setTimeout(() => {
                    router.replace(`/project/${data.videoId}`);
                }, 2000);
            }
        };

        sse.onerror = (error) => {
            console.error('EventSource failed:', error);
            sse.close();
        };

        return () => {
            sse.close();
        };
    }, [params.id]);

    if (!shouldRender) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="z-50 w-16 h-16 flex justify-center items-center">
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
                {status !== "" ?
                    <div>
                        <div className="flex justify-between items-center w-full">
                            <div>                                {
                                status ? (
                                    <Badge className="mb-3 text-sm px-4 py-2 md:px-5 md:py-3 md:mb-6" text={`${translateStatus(status)}`} color={statusData(status!)} />
                                ) : null
                            }
                            </div>
                            <div>
                                {
                                    status === "done" ? (
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
                        {queuePos &&
                            <div className="relative">
                                <div className="font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white z-50">
                                    <Loader className="relative animate-spin w-12 h-12 text-secondary" />
                                </div>
                                <div className="w-full h-full bg-slate-800 opacity-70 rounded-xl z-30 absolute" />
                                <video
                                    src={video!}
                                    crossOrigin="anonymous"
                                    className="rounded-xl aspect-auto max-h-[60vh]"
                                    disablePictureInPicture
                                />
                            </div>
                        }

                    </div>
                    :
                    <div className="flex justify-center items-center w-full h-full">
                        {metadata &&
                            <div className="flex flex-col justify-center items-center">
                                <div className="mr-auto mb-2 font-medium flex items-center justify-center">
                                    <VideoIcon className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                                    {shortenFileName(metadata?.name)}.{metadata?.ext}
                                </div>
                                <video
                                    src={video!}
                                    crossOrigin="anonymous"
                                    className="rounded-xl aspect-auto max-h-[60vh]"
                                    controls
                                    disablePictureInPicture
                                />
                                <Button variant="ringHover" className="mt-3 font-medium md:mt-6 md:text-base md:px-8 md:py-6" onClick={() => processVideo()} disabled={processing}>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Generate subtitles
                                </Button>
                            </div>
                        }
                    </div>
                }
            </main >
        </div >
    );
}