"use client";
import { Player } from "@remotion/player";
import { AbsoluteFill, Video, Sequence, useVideoConfig } from "remotion";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster, toast } from 'sonner';

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
    processed: boolean;
};

// Subtitle data in SRT format
let subtitles = [
    { start: 0.029, end: 0.149, text: "I" },
    { start: 0.189, end: 0.449, text: "f*cked" },
    { start: 0.469, end: 0.609, text: "up." },
    { start: 0.649, end: 0.830, text: "She" },
    { start: 0.870, end: 1.110, text: "left" },
    { start: 1.170, end: 1.290, text: "me" },
    { start: 1.310, end: 1.630, text: "because" },
    { start: 1.830, end: 1.951, text: "I" },
    { start: 2.011, end: 2.271, text: "wasn't" },
    { start: 2.291, end: 2.431, text: "good" },
    { start: 2.471, end: 2.711, text: "enough." },
    { start: 2.871, end: 2.991, text: "I'm" },
    { start: 3.031, end: 3.151, text: "going" },
    { start: 3.171, end: 3.211, text: "to" },
    { start: 3.232, end: 3.472, text: "become" },
    { start: 3.512, end: 3.752, text: "better." },
    { start: 3.772, end: 3.852, text: "You" },
    { start: 3.872, end: 3.972, text: "have" },
    { start: 3.992, end: 4.052, text: "to" },
    { start: 4.092, end: 4.272, text: "take" },
    { start: 4.292, end: 4.372, text: "the" },
    { start: 4.432, end: 5.073, text: "negativity" },
    { start: 5.153, end: 5.233, text: "and" },
    { start: 5.333, end: 5.593, text: "use" },
    { start: 5.613, end: 5.653, text: "it" },
    { start: 5.673, end: 5.733, text: "in" },
    { start: 5.773, end: 5.794, text: "a" },
    { start: 5.834, end: 6.214, text: "positive" },
    { start: 6.254, end: 6.514, text: "manner." },
    { start: 6.634, end: 6.774, text: "I'll" },
    { start: 6.814, end: 6.934, text: "tell" },
    { start: 6.954, end: 7.034, text: "you" },
    { start: 7.054, end: 7.175, text: "right" },
    { start: 7.195, end: 7.355, text: "now," },
    { start: 7.375, end: 7.415, text: "if" },
    { start: 7.455, end: 7.515, text: "you" },
    { start: 7.535, end: 7.635, text: "were" },
    { start: 7.655, end: 7.695, text: "to" },
    { start: 7.755, end: 7.915, text: "say" },
    { start: 7.955, end: 8.035, text: "to" },
    { start: 8.075, end: 8.195, text: "me," },
    { start: 8.295, end: 8.656, text: "Andrew," },
    { start: 8.736, end: 8.836, text: "you" },
    { start: 8.856, end: 8.956, text: "have" },
    { start: 8.976, end: 9.036, text: "to" },
    { start: 9.076, end: 9.216, text: "make" },
    { start: 9.296, end: 9.496, text: "double" },
    { start: 9.516, end: 9.576, text: "the" },
    { start: 9.596, end: 9.757, text: "money" },
    { start: 9.777, end: 9.897, text: "you're" },
    { start: 9.917, end: 10.197, text: "currently" },
    { start: 10.217, end: 10.517, text: "making," },
    { start: 10.617, end: 10.897, text: "what's" },
    { start: 10.958, end: 11.058, text: "the" },
    { start: 11.098, end: 11.298, text: "number" },
    { start: 11.358, end: 11.418, text: "one" },
    { start: 11.458, end: 11.798, text: "emotion" },
    { start: 11.858, end: 11.998, text: "you" },
    { start: 12.078, end: 12.239, text: "want" },
    { start: 12.279, end: 12.339, text: "to" },
    { start: 12.399, end: 12.559, text: "feel?" },
    { start: 12.619, end: 12.759, text: "I'd" },
    { start: 12.779, end: 12.919, text: "say" },
    { start: 12.959, end: 13.299, text: "heartbreak." },
    { start: 13.399, end: 13.560, text: "Break" },
    { start: 13.600, end: 13.740, text: "my" },
    { start: 13.780, end: 13.920, text: "heart" },
    { start: 13.940, end: 14.020, text: "and" },
    { start: 14.040, end: 14.120, text: "I'll" },
    { start: 14.140, end: 14.260, text: "make" },
    { start: 14.280, end: 14.300, text: "a" },
    { start: 14.340, end: 14.580, text: "f*cking" },
    { start: 14.600, end: 15.021, text: "million" },
    { start: 15.061, end: 15.341, text: "dollars." }
];

export default function Project({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [video, setVideo] = useState<string | null>(null);
    const [shouldRender, setShouldRender] = useState(false);

    async function handleSignedIn() {
        const userFetch = (await supabase.auth.getUser()).data?.user;
        if (userFetch) {
            setUser({
                id: userFetch.id,
                email: userFetch.email || "",
                aud: userFetch.aud,
            });
            if (userFetch.aud !== 'authenticated') {
                router.push('/login');
                return true;
            }
            else
                return false;
        } else {
            router.push('/login');
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

    useEffect(() => {
        const runPrecheck = async () => {
            const result = await handleSignedIn();
            if (!result) {
                if (!user) return;
                try {
                    let metadata = await fetchMetadata();
                    if (metadata.processed === true) {
                        await fetchVideo();
                        setShouldRender(true);
                    }
                    else if (metadata.processed === false) {
                        router.push(`/video/${params.id}`);
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
        return (
            <AbsoluteFill>
                <link href="https://fonts.googleapis.com/css?family=Montserrat:700" rel="stylesheet">
                </link>
                <Video src={video!} volume={1} startFrom={0} onError={(e) => console.error(e)} />
                {/* Mapping over subtitles and rendering them within Sequence */}
                {subtitles.map((subtitle, index) => (
                    <Sequence key={index} from={subtitle.start * fps} durationInFrames={(subtitle.end - subtitle.start) * fps} className="items-center justify-center">
                        <div style={{ color: "white", fontSize: 24, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textShadow: "0 0 4px #000, 0 0 5px #000, 0 0 6px #000, 0 0 7px #000, 0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000, 0 0 12px #000, 0 0 13px #000", }} className="drop-shadow-lg stroke-black stroke-2">{(subtitle.text).toUpperCase()}</div>
                    </Sequence>
                ))}
            </AbsoluteFill>
        );
    }

    console.log(metadata);

    return (
        <div>
            <Toaster />
            {video && metadata &&
                <Player
                    component={MyVideo}
                    durationInFrames={1419}
                    compositionWidth={270}
                    compositionHeight={480}
                    fps={metadata.fps || 30}
                    controls
                />
            }
        </div>
    );
};
