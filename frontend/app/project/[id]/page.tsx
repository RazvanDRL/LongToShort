"use client";
import { Player, PlayerRef } from "@remotion/player";
import { AbsoluteFill, Video, Sequence, useVideoConfig } from "remotion";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { Toaster, toast } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Eye, ListPlus, Trash2 } from "lucide-react";
import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorPicker, Space } from 'antd';
import type { ColorPickerProps } from 'antd';
import localFont from 'next/font/local'



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

const Komika = localFont({
    src: '../../../fonts/Komika.ttf',
    display: 'swap',
})

const TheBoldFont = localFont({
    src: '../../../fonts/TheBoldFont.ttf',
    display: 'swap',
})

export default function Project({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [video, setVideo] = useState<string | null>(null);
    const [shouldRender, setShouldRender] = useState(false);
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [startTimeSlider, setStartTimeSlider] = useState(0);
    const [endTimeSlider, setEndTimeSlider] = useState(0);
    const [focusedSubtitleIndex, setFocusedSubtitleIndex] = useState<number | null>(null);
    const [colorValue, setColorValue] = useState<ColorPickerProps['value']>('#ffffff');
    const [fontSizeValue, setFontSizeValue] = useState<number>(24);
    const [fontFamilyValue, setFontFamilyValue] = useState<string>(TheBoldFont.className);
    const [fontWeightValue, setFontWeightValue] = useState<number>(700);
    const [verticalPositionValue, setVerticalPositionValue] = useState<number>(50);
    const playerRef = useRef<PlayerRef>(null);

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
                        setFocusedSubtitleIndex(0);
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

    function ColorPickerComponent() {
        return (
            <Space direction="vertical">
                <ColorPicker
                    className="bg-background border border-neutral-800"
                    value={colorValue}
                    onChangeComplete={(c) => {
                        setColorValue(c.toHexString());
                    }}
                    showText={(color) => <span className="text-white/80">{color.toHexString().toUpperCase()}</span>}
                />
            </Space>
        );
    }

    function SubtitleRenderer({ subtitle, colorValue, fontSizeValue, fontWeightValue, fontFamilyValue, verticalPositionValue, fps }: { subtitle: Subtitle, colorValue: string, fontSizeValue: number, fontWeightValue: number, fontFamilyValue: string, verticalPositionValue: number, fps: number }) {
        return (
            <Sequence
                key={subtitle.start}
                from={subtitle.start * fps}
                durationInFrames={subtitle.start * fps}
                className="justify-center"
            >
                <div
                    style={{
                        color: colorValue as any,
                        fontSize: fontSizeValue,
                        fontWeight: fontWeightValue,
                        textShadow: "0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000, 0 0 12px #000, 0 0 13px #000, 0 0 14px #000, 0 0 15px #000, 0 0 16px #000, 0 0 17px #000",
                        transform: `translateY(${100 - verticalPositionValue}%)`,
                    }}
                    className={`${fontFamilyValue} antialiased`}
                >
                    {subtitle.text.toUpperCase()}
                </div>
            </Sequence>
        );
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
                        className="justify-center"
                    >
                        <div
                            style={{
                                color: colorValue as any,
                                fontSize: fontSizeValue,
                                fontWeight: fontWeightValue,
                                textShadow: "0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000, 0 0 12px #000, 0 0 13px #000, 0 0 14px #000, 0 0 15px #000, 0 0 16px #000, 0 0 17px #000",
                                transform: `translateY(${100 - verticalPositionValue}%)`,
                            }}
                            className={`${fontFamilyValue} antialiased`}
                        >
                            {subtitle.text.toUpperCase()}
                        </div>
                    </Sequence>
                );
            });
        }, [subtitles, fps]);

        return (
            <AbsoluteFill>
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

    return (
        <div>
            {/* <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" /> */}

            <Toaster />
            {user ? <Header user_email={user.email} /> : null}
            <main className="flex justify-center items-center mt-24">
                {video && metadata && (
                    <div className="flex justify-center items-center">
                        {subtitles.length > 0 && (
                            <div className="rounded-xl bg-transparent pr-2 mr-8 w-[500px] h-[640px] flex flex-col">
                                <Tabs defaultValue="style" className="w-full">
                                    <TabsList>
                                        <TabsTrigger value="style">Style</TabsTrigger>
                                        <TabsTrigger value="captions">Captions</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="style">
                                        <ScrollArea style={{ height: '593px' }} className="rounded-xl border border-neutral-800 shadow-xl shadow-neutral-800">
                                            {/* Themes */}
                                            <div className="p-6">
                                                <h3 className="mb-4">Themes</h3>
                                                <div className="grid-rows-3 flex justify-evenly gap-3">
                                                    <Button
                                                        className={`cursor-pointer p-2 h-12 w-32 rounded-sm border border-neutral-800 ${fontFamilyValue === TheBoldFont.className ? 'bg-white' : 'bg-neutral-200/20'}`} onClick={() => {
                                                            setFontFamilyValue(TheBoldFont.className);
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                color: "#fff",
                                                                fontSize: 16,
                                                                fontWeight: 700,
                                                                textShadow: "0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000, 0 0 12px #000, 0 0 13px #000, 0 0 14px #000, 0 0 15px #000, 0 0 16px #000, 0 0 17px #000",
                                                                position: "relative",
                                                                top: "2.2px", // Adjust this value according to the space below the text
                                                                textAlign: "center",
                                                                lineHeight: 1
                                                            }}
                                                            className={`${TheBoldFont.className} antialiased`}
                                                        >
                                                            HORMOZI
                                                        </div>
                                                    </Button>

                                                    <Button
                                                        className={`cursor-pointer p-2 h-12 w-32 rounded-sm border border-neutral-800 ${fontFamilyValue === Komika.className ? 'bg-white' : 'bg-neutral-200/20'}`}
                                                        onClick={() => {
                                                            setFontFamilyValue(Komika.className);
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                color: "#fff",
                                                                fontSize: 16,
                                                                textShadow: "0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000, 0 0 12px #000, 0 0 13px #000, 0 0 14px #000, 0 0 15px #000, 0 0 16px #000, 0 0 17px #000",
                                                                position: "relative",
                                                                top: "-1.3px", // Adjust this value according to the space below the text
                                                                textAlign: "center",
                                                                lineHeight: 1
                                                            }}
                                                            className={`${Komika.className} antialiased`}
                                                        >
                                                            BEAST
                                                        </div>
                                                    </Button>

                                                    <Button
                                                        className="cursor-pointer bg-neutral-200/20 p-2 h-12 w-32 rounded-sm border border-neutral-800"
                                                        onClick={() => {
                                                            setFontFamilyValue(Komika.className);
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                color: "#fff",
                                                                fontSize: 16,
                                                                textShadow: "0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000, 0 0 12px #000, 0 0 13px #000, 0 0 14px #000, 0 0 15px #000, 0 0 16px #000, 0 0 17px #000",
                                                                position: "relative",
                                                                textAlign: "center",
                                                                lineHeight: 1
                                                            }}
                                                        >
                                                            TikTok
                                                        </div>
                                                    </Button>
                                                </div>
                                                <h3 className="mb-4 mt-8">Font settings</h3>
                                                <div className="grid-rows-3 flex justify-evenly gap-3">
                                                    <div className="grid w-fit max-w-sm items-center gap-1.5">
                                                        <Label htmlFor="size">Font color</Label>
                                                        <ColorPickerComponent />
                                                    </div>
                                                    <div className="grid w-fit max-w-sm items-center gap-1.5">
                                                        <Label htmlFor="size">Font size</Label>
                                                        <Input type="number" id="size" placeholder={fontSizeValue.toString()} onChange={(e) => setFontSizeValue(Number(e.target.value))} />
                                                    </div>
                                                    <div className="grid w-fit max-w-sm items-center gap-1.5">
                                                        <Label htmlFor="size">Vertical position</Label>
                                                        <Slider defaultValue={[verticalPositionValue]} step={1} id="size" min={1} max={100} onValueChange={(e) => setVerticalPositionValue(e[0])} />
                                                    </div>

                                                </div>
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>
                                    <TabsContent value="captions">
                                        <ScrollArea style={{ height: '593px' }} className="rounded-xl border border-neutral-800 shadow-xl shadow-neutral-800">
                                            <div className="px-4 mt-6 mx-3 mb-3 flex shrink-0 flex-col justify-center text-sm md:text-base">
                                                <h3 className="mb-1 flex gap-1 font-bold">
                                                    <span>LongToShort AI</span>
                                                </h3>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Auto captions accuracy</span>
                                                        <span className="h-fit items-center gap-1 font-semibold rounded p-1 text-xs inline-block bg-green-50 text-green-500" data-testid="flowbite-badge">
                                                            <span>96.55%</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-6 py-4">
                                                {subtitles.map((subtitle, index) => (
                                                    <div
                                                        key={index}
                                                        className={`rounded-xl py-2 px-2 mb-2 flex flex-col cursor-pointer ${focusedSubtitleIndex === index ? 'bg-neutral-900' : 'bg-transparent'} hover:bg-neutral-900`} onFocus={() => setFocusedSubtitleIndex(index)}
                                                        onBlur={() => setFocusedSubtitleIndex(null)}
                                                        tabIndex={0} // Ensure that the div can receive focus
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <Popover onOpenChange={(isOpen) => {
                                                                if (isOpen) {
                                                                    setStartTimeSlider(subtitle.start);
                                                                    setEndTimeSlider(subtitle.end);
                                                                }
                                                            }}>
                                                                <PopoverTrigger asChild>
                                                                    <div>
                                                                        <Badge className="text-sm font-normal cursor-pointer" variant="default">
                                                                            {subtitle.start.toFixed(2)}&ensp;-&ensp;{subtitle.end.toFixed(2)}
                                                                        </Badge>
                                                                    </div>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-80">
                                                                    <div className="grid gap-4">
                                                                        <div className="grid gap-2">
                                                                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                                                                <Label htmlFor="width">Start &#40;min {subtitle.start}&#41;</Label>
                                                                                <Input
                                                                                    id="width"
                                                                                    value={startTimeSlider}
                                                                                    onChange={(e) => setStartTimeSlider(parseFloat(e.target.value))}
                                                                                    className="col-span-2 h-8" />
                                                                            </div>
                                                                            <Slider
                                                                                defaultValue={[subtitle.start]}
                                                                                min={subtitle.start}
                                                                                max={subtitle.end}
                                                                                step={0.001}
                                                                                onValueChange={(e) => setStartTimeSlider(e[0])} className="mt-2" />

                                                                            <div className="grid w-full max-w-sm items-center gap-1.5 mt-4">
                                                                                <Label htmlFor="width">End &#40;max {subtitle.end}&#41;</Label>
                                                                                <Input
                                                                                    id="width"
                                                                                    value={endTimeSlider}
                                                                                    onChange={(e) => setEndTimeSlider(parseFloat(e.target.value))}
                                                                                    className="col-span-2 h-8" />
                                                                            </div>
                                                                            <Slider
                                                                                defaultValue={[subtitle.end]}
                                                                                min={subtitle.start}
                                                                                max={subtitle.end}
                                                                                step={0.001}
                                                                                onValueChange={(e) => setEndTimeSlider(e[0])} className="mt-2" />
                                                                            <Button
                                                                                className="mt-8"
                                                                                onClick={() => {
                                                                                    const updatedSubtitles = [...subtitles];
                                                                                    updatedSubtitles[subtitles.indexOf(subtitle)] = {
                                                                                        ...subtitle,
                                                                                        start: startTimeSlider,
                                                                                        end: endTimeSlider,
                                                                                    };
                                                                                    setSubtitles(updatedSubtitles);
                                                                                }}
                                                                            >
                                                                                Save
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                            {focusedSubtitleIndex === index && (
                                                                <div className="flex items-center gap-x-3 text-primary/80">
                                                                    <ListPlus
                                                                        className="w-5 h-5 cursor-pointer rounded-lg hover:text-primary"
                                                                        onClick={() => {
                                                                            const updatedSubtitles = [...subtitles];
                                                                            updatedSubtitles.splice(index + 1, 0, {
                                                                                start: subtitles[subtitles.indexOf(subtitle)].end,
                                                                                end: subtitles[subtitles.indexOf(subtitle) + 1].start,
                                                                                text: "",
                                                                            });
                                                                            setSubtitles(updatedSubtitles);
                                                                        }}
                                                                    />
                                                                    <Trash2
                                                                        className="w-5 h-5 cursor-pointer rounded-lg hover:text-primary"
                                                                        onClick={() => {
                                                                            const updatedSubtitles = subtitles.filter(
                                                                                (_, i) => i !== index
                                                                            );
                                                                            setSubtitles(updatedSubtitles);
                                                                        }}
                                                                    />
                                                                    {/* <Eye
                                                                className="w-6 h-6 ml-1 cursor-pointer rounded-lg"
                                                                onClick={() => {
                                                                    playerRef.current?.seekTo(subtitle.start * metadata.fps!);
                                                                }}
                                                            /> */}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div
                                                            contentEditable={true}
                                                            className="mt-4 mb-2 ml-3"
                                                        >
                                                            {subtitle.text}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>

                                </Tabs>
                            </div>
                        )
                        }
                        <div className="rounded-xl border border-neutral-800 shadow-xl shadow-neutral-800">
                            <Player
                                className="rounded-lg"
                                ref={playerRef}
                                component={MyVideo}
                                durationInFrames={Math.ceil((metadata.duration) * (metadata.fps || 30))}
                                compositionWidth={metadata.width! / 3 > 360 ? metadata.width! / 3 : 360}
                                compositionHeight={metadata.height! / 3 > 640 ? metadata.height! / 3 : 640}
                                fps={metadata.fps || 30}
                                controls
                            />
                        </div>
                    </div >
                )
                }

            </main >
        </div >
    );
};
