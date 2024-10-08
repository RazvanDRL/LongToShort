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
    Clock,
    CheckCircle
} from "lucide-react"
import React, { useEffect, useState } from 'react';
import type { Metadata, User } from "../../../types/constants";
import { Progress } from "@/components/ui/progress";

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
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

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
                await updateQueuePosition();
            }
        )
        .subscribe();

    async function updateQueuePosition() {
        const pos = await queuePosition();
        if (pos && metadata) {
            const data = await fetchEstimatedTime(pos, metadata);
            setQueuePos({
                position: pos,
                estimated_time: data.waitingTime,
                processing_time: data.processingTime,
            });
        }
    }

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
            waitingTime: 120 + Math.floor(dur + ((pos - 1) * 10)),
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
                    await updateQueuePosition();
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
                        await fetchProcessingData();
                        await updateQueuePosition();
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
                const newProgress = Math.min((diffInSeconds * 100) / queuePos?.estimated_time!, 100);
                setProgress(newProgress);

                const remainingTime = Math.max(queuePos?.estimated_time! - diffInSeconds, 0);
                setTimeRemaining(remainingTime);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [processing, startTime, status, queuePos?.estimated_time]);

    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (!document.hidden) {
                await fetchProcessingData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        (async () => {
            await fetchProcessingData();
        })();

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Toaster richColors />

            {user ? <Header /> : null}
            <main className="w-full min-h-screen flex justify-center items-center">
                <div className="w-full max-w-3xl p-6 bg-white rounded-xl shadow-lg">
                    {status !== "" ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center w-full">
                                <Badge className="text-sm px-4 py-2" text={`${translateStatus(status)}`} color={statusData(status!)} />
                                {status === "done" && (
                                    <Button asChild variant="outline" className="font-medium">
                                        <Link href={`/project/${params.id}`}>
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Go to project
                                        </Link>
                                    </Button>
                                )}
                            </div>
                            {queuePos && (
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl z-10">
                                        <Loader className="animate-spin w-12 h-12 text-white" />
                                    </div>
                                    <video
                                        src={video!}
                                        crossOrigin="anonymous"
                                        className="rounded-xl aspect-video w-full"
                                        disablePictureInPicture
                                    />
                                </div>
                            )}
                            <div className="space-y-4">
                                <Progress value={progress} className="w-full" />
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Queue Position: {queuePos?.position}</span>
                                    <span>Estimated Time: {timeRemaining ? `${Math.floor(timeRemaining / 60)}m ${timeRemaining % 60}s` : 'Calculating...'}</span>
                                </div>
                            </div>
                            <div className="text-center text-sm text-gray-500">
                                {status === "processing" ? "Your video is being processed. This may take a few minutes." : "Your video is in the queue. We'll start processing it soon."}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {metadata && (
                                <>
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <VideoIcon className="h-5 w-5" />
                                        <span className="font-medium text-lg">{metadata?.name}.mp4</span>
                                    </div>
                                    <video
                                        src={video!}
                                        crossOrigin="anonymous"
                                        className="rounded-xl aspect-video w-full"
                                        controls
                                        disablePictureInPicture
                                    />
                                    <Button
                                        variant="default"
                                        className="w-full py-6 text-lg font-semibold"
                                        onClick={() => processVideo()}
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-5 w-5" />
                                                Generate subtitles
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}