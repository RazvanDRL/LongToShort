"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Toaster, toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Loader2, Sparkles, Video as VideoIcon, Clock, CheckCircle } from 'lucide-react'
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/header";
import type { Metadata, User } from "../../../types/constants";

type Status = 'queued' | 'processing' | 'done' | 'starting' | 'in queue' | 'succeeded' | ''

interface QueuePosition {
    position: number;
    estimated_time: number;
    processing_time: number;
}

export default function Video({ params }: { params: { id: string } }) {
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<Status>('')
    const [queuePos, setQueuePos] = useState<QueuePosition | null>(null)
    const [progress, setProgress] = useState(0)
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
    const [metadata, setMetadata] = useState<Metadata | null>(null)
    const [video, setVideo] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)
    const [loadingVideo, setLoadingVideo] = useState(true)
    const [isPortrait, setIsPortrait] = useState(false)
    const [startTime, setStartTime] = useState<number | null>(0);
    const [shouldRender, setShouldRender] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null)
    const router = useRouter()

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
                    setStatus(s as Status);
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
            setStatus(data[0].status as Status);
            setStartTime(new Date(data[0].created_at).getTime());
        }
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
            setLoadingVideo(false);
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
                        setShouldRender(true);
                        if (metadata.video_src === null) {
                            await fetchVideo();
                        }
                        await fetchProcessingData();
                        await updateQueuePosition();
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

    useEffect(() => {
        const checkAspectRatio = () => {
            if (videoRef.current) {
                const { videoWidth, videoHeight } = videoRef.current
                setIsPortrait(videoHeight > videoWidth)
            }
        }

        const video = videoRef.current
        if (video) {
            video.addEventListener('loadedmetadata', checkAspectRatio)
            return () => video.removeEventListener('loadedmetadata', checkAspectRatio)
        }
    }, [video])

    const translateStatus = (status: Status) => {
        const statusMap: Record<Status, string> = {
            queued: 'In Queue',
            processing: 'Processing',
            done: 'Completed',
            starting: 'Starting',
            'in queue': 'In Queue',
            succeeded: 'Succeeded',
            '': 'Not Started'
        }
        return statusMap[status]
    }

    const statusData = (status: Status) => {
        const statusMap: Record<Status, { color: string; icon: JSX.Element }> = {
            queued: { color: 'bg-yellow-500', icon: <Loader2 className="animate-spin" /> },
            processing: { color: 'bg-blue-500', icon: <Loader2 className="animate-spin" /> },
            done: { color: 'bg-green-500', icon: <CheckCircle /> },
            starting: { color: 'bg-yellow-500', icon: <Loader2 className="animate-spin" /> },
            'in queue': { color: 'bg-yellow-500', icon: <Clock /> },
            succeeded: { color: 'bg-green-500', icon: <CheckCircle /> },
            '': { color: 'bg-gray-500', icon: <VideoIcon /> }
        }
        return statusMap[status]
    }

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
        <>
            {user ? <Header /> : null}
            <div className="container mx-auto min-h-screen px-4 sm:px-6 lg:px-8 pt-16"> {/* Added pt-16 for top padding */}
                <Toaster richColors />
                <Card className="max-w-3xl mx-auto mt-8"> {/* Added mt-8 for top margin */}
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">Video Subtitle Generator</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {status !== "" ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <Badge variant="secondary" className="text-sm px-3 py-1">
                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${statusData(status)?.color || 'bg-gray-500'}`}></span>
                                        {translateStatus(status)}
                                    </Badge>
                                    {status === "done" && (
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/project/${params.id}`}>
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Project
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                                <div className={`relative rounded-lg overflow-hidden ${isPortrait ? 'max-w-[360px] mx-auto' : 'w-full'}`}>
                                    {(status === 'queued' || status === 'processing' || status === 'in queue' || status === 'starting') && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                                            <Loader2 className="animate-spin w-12 h-12 text-white" />
                                        </div>
                                    )}
                                    <video
                                        ref={videoRef}
                                        src={video!}
                                        crossOrigin="anonymous"
                                        className={`w-full ${isPortrait ? 'aspect-[9/16]' : 'aspect-video'} object-contain bg-black`}
                                        controls={status === 'done' || status === 'succeeded'}
                                        disablePictureInPicture
                                    />
                                </div>
                                {status !== 'done' && status !== 'succeeded' && (
                                    <div className="space-y-2">
                                        <Progress value={progress} className="w-full" />
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Queue Position: {queuePos?.position}</span>
                                            <span>
                                                Estimated Time: {timeRemaining ? `${Math.floor(timeRemaining / 60)}m ${timeRemaining % 60}s` : 'Calculating...'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <p className="text-center text-sm text-gray-500">
                                    {status === "processing"
                                        ? "Your video is being processed. This may take a few minutes."
                                        : "Your video is in the queue. We'll start processing it soon."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {metadata && (
                                    <>
                                        <div className="flex items-center space-x-2 text-gray-700">
                                            <VideoIcon className="h-5 w-5" />
                                            <span className="font-medium text-lg">{metadata.name}.mp4</span>
                                        </div>
                                        <div className={`relative rounded-lg overflow-hidden ${isPortrait ? 'max-w-[360px] mx-auto' : 'w-full'}`}>
                                            {loadingVideo && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                                    <Loader2 className="w-12 h-12 text-gray-500 animate-spin" />
                                                </div>
                                            )}
                                            <video
                                                ref={videoRef}
                                                src={video!}
                                                crossOrigin="anonymous"
                                                className={`w-full ${isPortrait ? 'aspect-[9/16]' : 'aspect-video'} object-contain bg-black`}
                                                controls
                                                disablePictureInPicture
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        {status === '' && (
                            <Button
                                variant="default"
                                className="w-full py-6 text-lg font-semibold"
                                onClick={processVideo}
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
                                        Generate Subtitles
                                    </>
                                )}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}