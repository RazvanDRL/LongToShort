"use client";
import { Player } from "@remotion/player";
import { AbsoluteFill, Video, Sequence, useVideoConfig } from "remotion";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Toaster, toast } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area"
import EmbeddedCheckoutButton from "@/components/EmbeddedCheckoutButton";

type User = {
    id: string;
    email: string;
    aud: string;
};

type Metadata = {
    created_at: string;
    name: string;
    duration: number;
    fps?: number;
    width?: number;
    height?: number;
    processed: boolean;
};

type Subtitle = {
    start: number;
    end: number;
    text: string;
};

export default function Project({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [video, setVideo] = useState<string | null>(null);
    const [shouldRender, setShouldRender] = useState(false);
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);

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
                fps: data.fps,
                width: data.width,
                height: data.height,
                processed: data.processed,
            });
        }

        return data;
    }

    async function fetchVideo() {
        const { data, error } = await supabase
            .storage
            .from('videos')
            .createSignedUrl(`${user?.id}/${params.id}.mp4`, 86400);

        if (error) {
            toast.error(error.message);
            return;
        }
        if (!data) {
            toast.error("Video not found");
            return;
        }

        try {
            const videoElement = document.createElement('video');
            videoElement.src = data.signedUrl;
            videoElement.onloadedmetadata = () => {
                const resolution = {
                    width: videoElement.videoWidth,
                    height: videoElement.videoHeight
                };
                // Assuming you need to store the resolution, you can set it in state or use it as needed
                // setStateForVideoResolution(resolution);
            };
            videoElement.onerror = () => {
                console.error('Error loading video');
            };
        } catch (error) {
            console.error('Error fetching video resolution:', error);
        }

        if (data && data.signedUrl) {
            setVideo(data.signedUrl);
        }
    }

    async function fetchSubtitles() {
        const { data, error } = await supabase
            .from('subs')
            .select('subtitles')
            .eq('id', params.id);

        if (error) {
            toast.error(error.message);
            return;
        }
        if (!data) {
            toast.error("Subtitles not found");
            return;
        }

        if (data && data.length > 0 && data[0].subtitles) {
            let subtitleData;
            try {
                subtitleData = JSON.parse(data[0].subtitles);
            } catch (error) {
                console.error('Error parsing subtitles:', error);
                toast.error('Error parsing subtitles');
                return;
            }
            let newSubtitles: Subtitle[] = [];
            for (const subtitle of subtitleData) {
                for (const wordObj of subtitle.words) {
                    const startTime = isNaN(wordObj.start) ? 0 : wordObj.start;
                    const endTime = isNaN(wordObj.end) ? 0 : wordObj.end;
                    const word = wordObj.word;
                    newSubtitles.push({ start: startTime, end: endTime, text: word });
                }
            }
            setSubtitles(newSubtitles);
        } else {
            toast.error("Subtitles not found");
        }
    }

    useEffect(() => {
        const runPrecheck = async () => {
            const result = await handleSignedIn();
            if (!result) {
                if (!user) return;
                try {
                    let metadata = await fetchMetadata();
                    if (metadata.processed === true) {
                        await fetchVideo();
                        await fetchSubtitles();
                        setShouldRender(true);
                    }
                    else if (metadata.processed === false) {
                        router.replace(`/video/${params.id}`);
                    }
                }
                catch (error: any) {
                    toast.error(error);
                }
            }

        };
        runPrecheck();
    }, [user?.id]);

    if (!shouldRender) {
        return <div className="bg-[#ec2626] z-50 w-screen h-screen"></div>;
    }

    function MyVideo() {
        const { fps } = useVideoConfig();

        const renderedSubtitles = useMemo(() => {
            return subtitles.map((subtitle) => {
                if (subtitle.start === 0 && subtitle.end === 0) {

                    const previousSubtitle = subtitles[subtitles.indexOf(subtitle) - 1];

                    if (previousSubtitle) {
                        subtitle.start = previousSubtitle.end;
                    };

                    const nextSubtitle = subtitles[subtitles.indexOf(subtitle) + 1];

                    if (nextSubtitle) {
                        subtitle.end = nextSubtitle.start;
                    }
                }

                const subtitleDuration = subtitle.end - subtitle.start;
                if (subtitleDuration <= 0) {
                    // Handle invalid subtitle duration
                    return null;
                }

                return (
                    <Sequence
                        key={subtitle.start}
                        from={subtitle.start * fps}
                        durationInFrames={subtitleDuration * fps}
                        className="items-center justify-center"
                    >
                        <div
                            style={{
                                color: "white",
                                fontSize: 24,
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 700,
                                textShadow:
                                    "0 0 4px #000, 0 0 5px #000, 0 0 6px #000, 0 0 7px #000, 0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000, 0 0 12px #000, 0 0 13px #000",
                            }}
                            className="drop-shadow-lg stroke-black stroke-2"
                        >
                            {subtitle.text.toUpperCase()}
                        </div>
                    </Sequence>
                );
            });
        }, [subtitles, fps]);

        return (
            <AbsoluteFill>
                <link href="https://fonts.googleapis.com/css?family=Montserrat:700" rel="stylesheet" />
                <Video
                    src={video!}
                    volume={1}
                    startFrom={0}
                    onError={(e) => console.error(e)}
                />

                {renderedSubtitles}
            </AbsoluteFill>
        );
    }

    // console.log(subtitles);

    return (
        <div>
            <Toaster />
            <main className="flex justify-center items-center mt-24">
                <div className="flex justify-center items-center flex-col">
                    {subtitles.length > 0 && (
                        <div className="rounded-lg bg-gray-800/50 p-2 mr-4 w-1/2">
                            <ScrollArea className="h-[50vh]">
                                <div className="p-4">
                                    {subtitles.map((subtitle, index) => (
                                        <div key={index} className="bg-white rounded-md p-2 mb-2 flex items-center">
                                            <div className="flex items-center mr-2">
                                                <span className="mr-2">Start:</span>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={subtitle.start}
                                                    onChange={(e) => {
                                                        const newSubtitles = [...subtitles];
                                                        newSubtitles[index].start = parseFloat(e.target.value);
                                                        setSubtitles(newSubtitles);
                                                    }}
                                                    className="w-20 px-2 py-1 rounded-md focus:outline-none"
                                                />
                                                <span className="ml-2">s</span>
                                            </div>
                                            <div className="flex items-center mr-2">
                                                <span className="mr-2">End:</span>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={subtitle.end}
                                                    onChange={(e) => {
                                                        const newSubtitles = [...subtitles];
                                                        newSubtitles[index].end = parseFloat(e.target.value);
                                                        setSubtitles(newSubtitles);
                                                    }}
                                                    className="w-20 px-2 py-1 rounded-md focus:outline-none"
                                                />
                                                <span className="ml-2">s</span>
                                            </div>
                                            <textarea
                                                className="w-full resize-none focus:outline-none"
                                                value={subtitle.text}
                                                onChange={(e) => {
                                                    const newSubtitles = [...subtitles];
                                                    newSubtitles[index].text = e.target.value;
                                                    setSubtitles(newSubtitles);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {video && metadata &&
                        <div className="rounded-lg bg-gray-800/50 p-2">
                            <Player
                                className="rounded-lg"
                                component={MyVideo}
                                durationInFrames={Math.ceil((metadata.duration) * (metadata.fps || 30))}
                                compositionWidth={metadata.width! / 4 > 270 ? metadata.width! / 4 : 270}
                                compositionHeight={metadata.height! / 4 > 480 ? metadata.height! / 4 : 480}
                                fps={metadata.fps || 30}
                                controls
                            />
                        </div>
                    }
                </div>
            </main>
        </div >
    );
};
