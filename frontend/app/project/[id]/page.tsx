"use client";
import { Player, PlayerRef } from "@remotion/player";
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
import { Check, FileVideo, ListPlus, Save, Server, Trash2 } from "lucide-react";
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar"
import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ColorPicker, Space } from 'antd';
import localFont from 'next/font/local'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    CompositionProps,
    defaultMyCompProps,
    COMP_NAME,
} from "../../../types/constants";
import { Main } from "../../../remotion/MyComp/Main";
import { z } from "zod";
import { useRendering } from "../../../helpers/use-rendering";
import { Loader2 } from "lucide-react";
import type { Metadata, User } from "../../../types/constants";
import { preloadVideo } from "@remotion/preload";
import Link from "next/link";
import { censor } from "@/app/utils/checkCensor";

type Subtitle = {
    start: number;
    end: number;
    text: string;
    filteredWord?: string;
};

const Komika = localFont({
    src: '../../../public/fonts/Komika.woff2',
    display: 'swap',
})

const Montserrat = localFont({
    src: '../../../public/fonts/Montserrat.woff2',
    display: 'swap',
})

const TheBoldFont = localFont({
    src: '../../../public/fonts/TheBoldFont.woff2',
    display: 'swap',
})

const Bangers = localFont({
    src: '../../../public/fonts/Bangers.woff2',
    display: 'swap',
})

const Geist = localFont({
    src: '../../../public/fonts/Geist.woff2',
    display: 'swap',
})

const Helvetica = localFont({
    src: '../../../public/fonts/Helvetica.woff2',
    display: 'swap',
})

type Font = {
    textColor: string;
    fontSize: number;
    fontFamily: string;
    fontName: string;
    fontWeight: number;
    verticalPosition: number;
    uppercase: boolean;
    punctuation: boolean;
    stroke: {
        strokeWidth: string,
        strokeColor: string,
    };
    shadow: string;
    letterSpacing: number;
}

type StrokeSize = 'None' | 'S' | 'M' | 'L' | 'XL';
type ShadowSize = 'None' | 'S' | 'M' | 'L' | 'XL';

const strokeSizes: Record<StrokeSize, string> = {
    None: "",
    S: "0.1em",
    M: "0.15em",
    L: "0.2em",
    XL: "0.25em",
};

const shadowSizes: Record<ShadowSize, string> = {
    None: "",
    S: "0 0 2px #000, 0 0 3px #000, 0 0 4px #000, 0 0 5px #000, 0 0 6px #000, 0 0 7px #000, 0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000",
    M: "0 0 4px #000, 0 0 5px #000, 0 0 6px #000, 0 0 7px #000, 0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000, 0 0 12px #000, 0 0 13px #000",
    L: "0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000, 0 0 12px #000, 0 0 13px #000, 0 0 14px #000, 0 0 15px #000, 0 0 16px #000, 0 0 17px #000",
    XL: "0 0 12px #000, 0 0 13px #000, 0 0 14px #000, 0 0 15px #000, 0 0 16px #000, 0 0 17px #000, 0 0 18px #000, 0 0 19px #000, 0 0 20px #000, 0 0 21px #000",
};

export default function Project({ params }: { params: { id: string } }) {
    const storedSubtitles = typeof window !== 'undefined' ? localStorage.getItem(`subtitles_${params.id}`) : null;
    const storedFont = typeof window !== 'undefined' ? localStorage.getItem(`font_${params.id}`) : null;
    const initialSubtitles = storedSubtitles ? JSON.parse(storedSubtitles) : [];
    const initialFont = storedFont ? JSON.parse(storedFont) : {
        textColor: "#fff",
        fontSize: 30,
        fontFamily: Montserrat.style.fontFamily,
        fontName: "Montserrat",
        fontWeight: 700,
        verticalPosition: 50,
        uppercase: true,
        punctuation: false,
        stroke: {
            strokeWidth: strokeSizes.M,
            strokeColor: "#000",
        },
        shadow: shadowSizes.M,
        letterSpacing: 0,
    };

    const playerRef = useRef<PlayerRef>(null);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [compressedVideo, setCompressedVideo] = useState<string | null>(null);
    const [video, setVideo] = useState<string | null>(null);
    const [shouldRender, setShouldRender] = useState(false);
    const [subtitles, setSubtitles] = useState<Subtitle[]>(initialSubtitles);
    const [startTimeSlider, setStartTimeSlider] = useState(0);
    const [endTimeSlider, setEndTimeSlider] = useState(0);
    const [focusedSubtitleIndex, setFocusedSubtitleIndex] = useState<number | null>(null);
    const [font, setFont] = useState<Font>(initialFont);
    const [censorOption, setCensorOption] = useState<boolean>(true);
    const [words, setWords] = useState<number>(1);
    const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
        return {
            subtitles,
            font,
            video: video!,
            video_id: params.id,
            user_id: user?.id!,
            video_height: metadata?.height!,
            video_width: metadata?.width!,
            video_duration: metadata?.duration!,
            video_fps: metadata?.fps!,
            words: words,
        };
    }, [subtitles, font, video, metadata, user]);

    const { renderMedia, state } = useRendering(COMP_NAME, inputProps, user?.access_token!);

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
                ext: data.ext,
            });
        }

        return data;
    }

    async function fetchVideo(metadata: Metadata | null) {
        try {
            const responseCompressed = await fetch(`/api/generate-signed-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.access_token}`,
                },
                body: JSON.stringify({ key: `${params.id}-compressed.${metadata!.ext}`, bucket: 'upload-bucket' }),
            });

            if (!responseCompressed.ok) {
                setCompressedVideo(null);
                console.error('Failed to fetch compressed video');
            } else {
                const dataCompressed = await responseCompressed.json();
                const unpreload = preloadVideo(dataCompressed.url);
                setCompressedVideo(dataCompressed.url);
            }
            const response = await fetch(`/api/generate-signed-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.access_token}`,
                },
                body: JSON.stringify({ key: `${params.id}.${metadata!.ext}`, bucket: 'upload-bucket' }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch signed URL');
            }

            const data = await response.json();
            setVideo(data.url);
            console.log(data.url);
        } catch (error) {
            console.error('Error fetching video:', error);
        }
    }

    async function fetchSubtitles() {
        if (initialSubtitles.length != 0) {
            return;
        }
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
                    // const censored = await censor(word);
                    const censored = word;
                    newSubtitles.push({ start: startTime, end: endTime, text: word, filteredWord: censored });
                }
            }
            setSubtitles(newSubtitles);
        } else {
            toast.error("Subtitles not found");
        }
    }

    async function saveSettings() {
        localStorage.setItem(`font_${params.id}`, JSON.stringify(font));
        localStorage.setItem(`subtitles_${params.id}`, JSON.stringify(subtitles));
        toast.success("Settings saved");
    }

    const handleSetStrokeSize = (size: StrokeSize) => {
        setFont((prevFont) => ({
            ...prevFont,
            stroke: {
                ...prevFont.stroke,
                strokeWidth: strokeSizes[size],
            },
        }));
    };

    const handleSetShadowSize = (size: ShadowSize) => {
        setFont((prevFont) => ({
            ...prevFont,
            shadow: shadowSizes[size],
        }));
    }

    function TextColorPickerComponent() {
        return (
            <Space direction="vertical">
                <ColorPicker
                    className="bg-background border border-[#E2E8F0] rounded-md w-32 h-10"
                    value={font.textColor}
                    onChangeComplete={(c) => {
                        setFont((prevFont) => ({
                            ...prevFont,
                            textColor: c.toHexString(),
                        }))
                    }}
                    showText={(color) => <span>{color.toHexString().toUpperCase()}</span>}
                />
            </Space>
        );
    }

    function StrokeColorPickerComponent() {
        return (
            <Space direction="vertical">
                <ColorPicker
                    className="bg-background border border-[#E2E8F0] rounded-md w-32 h-10 px-2"
                    value={font.stroke.strokeColor}
                    onChangeComplete={(c) => {
                        setFont((prevFont) => ({
                            ...prevFont,
                            stroke: {
                                ...prevFont.stroke,
                                strokeColor: c.toHexString(),
                            }
                        }))
                    }}
                    showText={(color) => <span>{color.toHexString().toUpperCase()}</span>}
                />
            </Space>
        );
    }

    function aspectRatio(width: number, height: number) {
        const ratio = width / height;
        switch (ratio) {
            case 16 / 9:
                return { width: 640, height: 360 };
            case 4 / 3:
                return { width: 640, height: 480 };
            case 5 / 4:
                return { width: 640, height: 512 };
            case 1:
                return { width: 640, height: 640 };
            case 4 / 5:
                return { width: 512, height: 640 };
            case 9 / 16:
                return { width: 360, height: 640 };
            case 3 / 4:
                return { width: 480, height: 640 };
            default:
                return { width: 360, height: 640 };
        }
    }

    const handleSubtitleTextChange = (index: number, newText: string) => {
        setSubtitles(prevSubtitles =>
            prevSubtitles.map((subtitle, i) =>
                i === index ? { ...subtitle, text: newText } : subtitle
            )
        );
    };

    useEffect(() => {
        if (state.status === "done") {
            const promise = () => new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
                router.push(`/export/${params.id}`);
            });

            toast.promise(promise, {
                loading: 'File rendered successfully. Redirecting...',
            })
        }
        if (state.status === "error") {
            console.error(state.error.message);
        }
    }, [state.status]);

    useEffect(() => {
        const runPrecheck = async () => {
            const result = await handleSignedIn();
            if (!result) {
                if (!user) return;
                try {
                    let metadata = await fetchMetadata();
                    if (metadata.processed === true) {
                        setShouldRender(true);
                        await fetchVideo(metadata);
                        await fetchSubtitles();
                        setFocusedSubtitleIndex(0);
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
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="z-50 w-16 h-16 flex justify-center items-center">
                    <Loader2 className="relative animate-spin w-16 h-16 text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <Toaster />
            {user ? <Header user_email={user.email} /> : null}
            <main className="w-full h-screen flex justify-center items-center">
                {metadata && (
                    <div className="flex justify-center items-center flex-col-reverse md:flex-row">
                        <div className="rounded-xl bg-transparent md:pr-2 md:mr-8 w-[500px] h-[698px] flex flex-col">
                            <Tabs defaultValue="style" className="w-full">
                                <TabsList className="mb-2.5">
                                    <TabsTrigger value="style">Style</TabsTrigger>
                                    <TabsTrigger value="captions">Captions</TabsTrigger>
                                </TabsList>
                                <Button
                                    onClick={() => {
                                        saveSettings();
                                    }}
                                    variant={"ghost"}
                                    className="ml-4"
                                >
                                    Save settings
                                </Button>
                                <TabsContent value="style">
                                    <ScrollArea style={{ height: '640px' }} className="rounded-xl shadow-xl">
                                        {/* Themes */}
                                        <div className="p-6">
                                            <h3 className="mb-4">Fonts</h3>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="flex flex-col items-center">
                                                    <Button
                                                        className={`cursor-pointer p-2 h-12 w-32 rounded-sm border border-[#E2E8F0] ${font.fontFamily === TheBoldFont.style.fontFamily ? 'bg-blue-400/50' : 'bg-white'}`} onClick={() => {
                                                            setFont((prevFont) => ({
                                                                ...prevFont,
                                                                fontFamily: TheBoldFont.style.fontFamily,
                                                                fontName: "TheBoldFont",
                                                            }))
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                color: "#fff",
                                                                fontSize: 18,
                                                                fontWeight: 700,
                                                                textShadow: "0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000, 0 0 12px #000, 0 0 13px #000 ",
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
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <Button
                                                        className={`cursor-pointer p-2 h-12 w-32 rounded-sm border border-[#E2E8F0] ${font.fontFamily === Komika.style.fontFamily ? 'bg-blue-400/50' : 'bg-white'}`}
                                                        onClick={() => {
                                                            setFont((prevFont) => ({
                                                                ...prevFont,
                                                                fontFamily: Komika.style.fontFamily,
                                                                fontName: "Komika",
                                                            }))
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                color: "#fff",
                                                                fontSize: 18,
                                                                fontWeight: 700,
                                                                textShadow: "0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000, 0 0 12px #000, 0 0 13px #000 ",
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
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <Button
                                                        className={`cursor-pointer p-2 h-12 w-32 rounded-sm border border-[#E2E8F0] ${font.fontFamily === Montserrat.style.fontFamily ? 'bg-blue-400/50' : 'bg-white'}`}
                                                        onClick={() => {
                                                            setFont((prevFont) => ({
                                                                ...prevFont,
                                                                fontFamily: Montserrat.style.fontFamily,
                                                                fontName: "Montserrat",
                                                            }))
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                color: "#fff",
                                                                fontSize: 16,
                                                                fontWeight: 700,
                                                                textShadow: "0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000, 0 0 12px #000, 0 0 13px #000 ",
                                                                position: "relative",
                                                                textAlign: "center",
                                                                lineHeight: 1
                                                            }}
                                                            className={`${Montserrat.className} antialiased`}
                                                        >
                                                            Montserrat
                                                        </div>
                                                    </Button>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <Button
                                                        className={`cursor-pointer p-2 h-12 w-32 rounded-sm border border-[#E2E8F0] ${font.fontFamily === Bangers.style.fontFamily ? 'bg-blue-400/50' : 'bg-white'}`}
                                                        onClick={() => {
                                                            setFont((prevFont) => ({
                                                                ...prevFont,
                                                                fontFamily: Bangers.style.fontFamily,
                                                                fontName: "Bangers",
                                                                fontWeight: 400,
                                                            }))
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                color: "#fff",
                                                                fontSize: 22,
                                                                fontWeight: 700,
                                                                textShadow: "0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000, 0 0 12px #000, 0 0 13px #000 ",
                                                                position: "relative",
                                                                textAlign: "center",
                                                                lineHeight: 1
                                                            }}
                                                            className={`${Bangers.className} antialiased`}
                                                        >
                                                            Bangers
                                                        </div>
                                                    </Button>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <Button
                                                        className={`cursor-pointer p-2 h-12 w-32 rounded-sm border border-[#E2E8F0] ${font.fontFamily === Geist.style.fontFamily ? 'bg-blue-400/50' : 'bg-white'}`}
                                                        onClick={() => {
                                                            setFont((prevFont) => ({
                                                                ...prevFont,
                                                                fontFamily: Geist.style.fontFamily,
                                                                fontName: "Geist",
                                                            }))
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                color: "#fff",
                                                                fontSize: 20,
                                                                fontWeight: 700,
                                                                textShadow: "0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000, 0 0 12px #000, 0 0 13px #000 ",
                                                                position: "relative",
                                                                textAlign: "center",
                                                                lineHeight: 1
                                                            }}
                                                            className={`${Geist.className} antialiased`}
                                                        >
                                                            Geist
                                                        </div>
                                                    </Button>
                                                </div>
                                                {/* Helvetica - not variable */}
                                                {/* <div className="flex flex-col items-center">
                                                    <Button
                                                        className={`cursor-pointer p-2 h-12 w-32 rounded-sm border border-[#E2E8F0] ${font.fontFamily === Helvetica.style.fontFamily ? 'bg-blue-400/50' : 'bg-white'}`}
                                                        onClick={() => {
                                                            setFont((prevFont) => ({
                                                                ...prevFont,
                                                                fontFamily: Helvetica.style.fontFamily,
                                                                fontName: "Helvetica",
                                                            }))
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                color: "#fff",
                                                                fontSize: 18,
                                                                fontWeight: 700,
                                                                textShadow: "0 0 8px #000, 0 0 9px #000, 0 0 10px #000, 0 0 11px #000, 0 0 12px #000, 0 0 13px #000 ",
                                                                position: "relative",
                                                                textAlign: "center",
                                                                lineHeight: 1
                                                            }}
                                                            className={`${Helvetica.className} antialiased`}
                                                        >
                                                            Helvetica
                                                        </div>
                                                    </Button>
                                                </div> */}
                                            </div>
                                            <h3 className="mb-4 mt-8">Font settings</h3>
                                            <div className="grid grid-cols-3 gap-3">
                                                {/* 1st row */}
                                                <div className="flex flex-col items-center">
                                                    <Label className="mb-1.5 ml-3 w-full" htmlFor="size">Font color</Label>
                                                    <TextColorPickerComponent />
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <Label className="mb-1.5 ml-3 w-full" htmlFor="size">Font size (px)</Label>
                                                    <Input
                                                        className="w-32 h-10"
                                                        type="number"
                                                        id="size"
                                                        min={0}
                                                        max={100}
                                                        placeholder={font.fontSize.toString() + "px"}
                                                        value={font.fontSize}
                                                        onChange={(e) => {
                                                            const newValue = e.target.value === '' ? 0 : Number(e.target.value);
                                                            setFont((prevFont) => ({ ...prevFont, fontSize: newValue }));
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <Label className="mb-1.5 ml-3 w-full" htmlFor="weight">Font weight</Label>
                                                    <Input
                                                        className="w-32 h-10"
                                                        disabled={font.fontFamily === Bangers.style.fontFamily}
                                                        type="number"
                                                        id="weight"
                                                        min={100}
                                                        step={100}
                                                        max={900}
                                                        placeholder={font.fontWeight.toString()}
                                                        value={font.fontWeight}
                                                        onChange={(e) => {
                                                            const newValue = e.target.value === '' ? 0 : Number(e.target.value);
                                                            setFont((prevFont) => ({ ...prevFont, fontWeight: newValue }));
                                                        }}
                                                    />
                                                    <Slider
                                                        className="w-32 mt-3"
                                                        value={[font.fontWeight]}
                                                        disabled={font.fontFamily === Bangers.style.fontFamily}
                                                        id="size"
                                                        min={100}
                                                        step={100}
                                                        max={900}
                                                        onValueChange={(e) =>
                                                            setFont((prevFont) => ({
                                                                ...prevFont,
                                                                fontWeight: e[0],
                                                            }))
                                                        }
                                                    />
                                                </div>
                                                {/* 2nd row */}
                                                <div className="flex flex-col items-center">
                                                    <Label className="mb-1.5 ml-3 w-full">Stroke color</Label>
                                                    <StrokeColorPickerComponent />
                                                </div>
                                                <div className="flex flex-col col-span-2 px-1.5 items-center">
                                                    <Label className="mb-1.5 w-full">Stroke</Label>
                                                    <Menubar className="h-10 w-full px-2 justify-between" id="stroke">
                                                        <MenubarMenu>
                                                            <MenubarTrigger
                                                                className="cursor-pointer"
                                                                data-state={font.stroke.strokeWidth === strokeSizes.None ? 'open' : 'closed'}
                                                                onClick={() => handleSetStrokeSize('None')}
                                                            >
                                                                None
                                                            </MenubarTrigger>
                                                        </MenubarMenu>
                                                        <MenubarMenu>
                                                            <MenubarTrigger
                                                                className="cursor-pointer"
                                                                data-state={font.stroke.strokeWidth === strokeSizes.S ? 'open' : 'closed'}
                                                                onClick={() => handleSetStrokeSize('S')}
                                                            >
                                                                S
                                                            </MenubarTrigger>
                                                        </MenubarMenu>
                                                        <MenubarMenu>
                                                            <MenubarTrigger
                                                                className="cursor-pointer"
                                                                data-state={font.stroke.strokeWidth === strokeSizes.M ? 'open' : 'closed'}
                                                                onClick={() => handleSetStrokeSize('M')}
                                                            >
                                                                M
                                                            </MenubarTrigger>
                                                        </MenubarMenu>
                                                        <MenubarMenu>
                                                            <MenubarTrigger
                                                                className="cursor-pointer"
                                                                data-state={font.stroke.strokeWidth === strokeSizes.L ? 'open' : 'closed'}
                                                                onClick={() => handleSetStrokeSize('L')}
                                                            >
                                                                L
                                                            </MenubarTrigger>
                                                        </MenubarMenu>
                                                        <MenubarMenu>
                                                            <MenubarTrigger
                                                                className="cursor-pointer"
                                                                data-state={font.stroke.strokeWidth === strokeSizes.XL ? 'open' : 'closed'}
                                                                onClick={() => handleSetStrokeSize('XL')}
                                                            >
                                                                XL
                                                            </MenubarTrigger>
                                                        </MenubarMenu>
                                                    </Menubar>
                                                </div>
                                                {/* 3rd row */}
                                                <div className="flex flex-col items-center mt-3">
                                                    <Label className="mb-1.5 ml-3 w-full" htmlFor="size">Vertical position (%)</Label>
                                                    <Input
                                                        className="h-10 w-32"
                                                        id="size"
                                                        type="number"
                                                        value={font.verticalPosition}
                                                        min={0}
                                                        max={100}
                                                        onChangeCapture={(e: any) =>
                                                            setFont((prevFont) => ({
                                                                ...prevFont,
                                                                verticalPosition: e.target.value === '' ? 0 : Number(e.target.value),
                                                            }))
                                                        }
                                                    />
                                                    <Slider
                                                        className="w-32 mt-3"
                                                        value={[font.verticalPosition]}
                                                        step={1}
                                                        id="size"
                                                        min={0}
                                                        max={100}
                                                        onValueChange={(e) =>
                                                            setFont((prevFont) => ({
                                                                ...prevFont,
                                                                verticalPosition: e[0],
                                                            }))
                                                        }
                                                    />
                                                </div>
                                                <div className="flex flex-col col-span-2 px-1.5 items-center mt-3">
                                                    <Label className="mb-1.5 w-full" htmlFor="shadow">Shadow</Label>
                                                    <Menubar className="h-10 w-full px-2 justify-between" id="shadow">
                                                        <MenubarMenu>
                                                            <MenubarTrigger
                                                                className="cursor-pointer"
                                                                data-state={font.shadow === shadowSizes.None ? 'open' : 'closed'}
                                                                onClick={() => handleSetShadowSize('None')}
                                                            >
                                                                None
                                                            </MenubarTrigger>
                                                        </MenubarMenu>
                                                        <MenubarMenu>
                                                            <MenubarTrigger
                                                                className="cursor-pointer"
                                                                data-state={font.shadow === shadowSizes.S ? 'open' : 'closed'}
                                                                onClick={() => handleSetShadowSize('S')}
                                                            >
                                                                S
                                                            </MenubarTrigger>
                                                        </MenubarMenu>
                                                        <MenubarMenu>
                                                            <MenubarTrigger
                                                                className="cursor-pointer"
                                                                data-state={font.shadow === shadowSizes.M ? 'open' : 'closed'}
                                                                onClick={() => handleSetShadowSize('M')}
                                                            >
                                                                M
                                                            </MenubarTrigger>
                                                        </MenubarMenu>
                                                        <MenubarMenu>
                                                            <MenubarTrigger
                                                                className="cursor-pointer"
                                                                data-state={font.shadow === shadowSizes.L ? 'open' : 'closed'}
                                                                onClick={() => handleSetShadowSize('L')}
                                                            >
                                                                L
                                                            </MenubarTrigger>
                                                        </MenubarMenu>
                                                        <MenubarMenu>
                                                            <MenubarTrigger
                                                                className="cursor-pointer"
                                                                data-state={font.shadow === shadowSizes.XL ? 'open' : 'closed'}
                                                                onClick={() => handleSetShadowSize('XL')}
                                                            >
                                                                XL
                                                            </MenubarTrigger>
                                                        </MenubarMenu>
                                                    </Menubar>
                                                </div>
                                            </div>
                                            {/* 4th row */}
                                            <div className="grid grid-cols-5 gap-3 mt-6">
                                                <div className="flex flex-col items-center mt-3">
                                                    <Label className="mb-1.5 items-center" htmlFor="size">Uppercase</Label>
                                                    <Switch defaultChecked onCheckedChange={(checked) => {
                                                        setFont((prevFont) => ({
                                                            ...prevFont,
                                                            uppercase: checked,
                                                        }))
                                                    }} />
                                                </div>
                                                <div className="flex flex-col items-center mt-3">
                                                    <Label className="mb-1.5 items-center" htmlFor="size">Punctuation</Label>
                                                    <Switch onCheckedChange={(checked) => {
                                                        setFont((prevFont) => ({
                                                            ...prevFont,
                                                            punctuation: checked,
                                                        }))
                                                    }} />
                                                </div>
                                                {/* censored option */}
                                                {/* <div className="flex flex-col items-center mt-3">
                                                    <Label className="mb-1.5 items-center" htmlFor="size">Censor</Label>
                                                    <Switch onCheckedChange={(checked) => {
                                                        setCensorOption(checked);
                                                    }} />
                                                </div> */}
                                                {/* letter spacing */}
                                                {/* <div className="flex col-span-2 flex-col items-left mt-3">
                                                    <Label className="mb-1.5 text-left" htmlFor="size">Letter spacing</Label>
                                                    <Input
                                                        className="h-10 w-32"
                                                        id="size"
                                                        type="number"
                                                        value={font.letterSpacing}
                                                        min={-50}
                                                        max={50}
                                                        onChangeCapture={(e: any) =>
                                                            setFont((prevFont) => ({
                                                                ...prevFont,
                                                                letterSpacing: e.target.value === '' ? 0 : Number(e.target.value),
                                                            }))
                                                        }
                                                    />
                                                    <Slider className="w-32 mt-3" value={[font.letterSpacing]} step={1} id="size" min={-50} max={50} onValueChange={(e) => setFont((prevFont) => ({ ...prevFont, letterSpacing: e[0] }))} />
                                                </div> */}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                                {subtitles.length > 0 && (
                                    <TabsContent value="captions">
                                        <ScrollArea style={{ height: '640px' }} className="rounded-xl shadow-xl">
                                            <div className="px-4 mt-6 mx-3 mb-3 flex shrink-0 flex-col justify-center text-sm md:text-base">
                                                <h3 className="mb-1 flex gap-1 font-bold">
                                                    <span>AutoSubs AI</span>
                                                </h3>
                                                {/* Experimental feature */}
                                                {/* <Label className="mb-4 mt-8 font-semibold">Words - {words}</Label>
                                                <Slider
                                                    className="w-1/2"
                                                    value={[words]}
                                                    min={1}
                                                    max={6}
                                                    onValueChange={(e) => setWords(e[0])}
                                                /> */}
                                            </div>
                                            <div className="px-6 py-4">
                                                {subtitles.map((subtitle, index) => (
                                                    <div
                                                        key={index}
                                                        className={`rounded-xl py-2 px-2 mb-2 flex flex-col cursor-pointer ${focusedSubtitleIndex === index ? 'bg-gray-100' : 'bg-transparent'} hover:bg-gray-100`} onFocus={() => setFocusedSubtitleIndex(index)}
                                                        onClick={() => {
                                                            playerRef.current?.pause();
                                                            playerRef.current?.seekTo(subtitle.start * metadata.fps!);
                                                        }}
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
                                                                                onValueChange={(e) => setStartTimeSlider(e[0])} className="mt-2"
                                                                            />

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
                                                                                onValueChange={(e) => setEndTimeSlider(e[0])} className="mt-2"
                                                                            />
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
                                                                </div>
                                                            )}
                                                        </div>
                                                        <input
                                                            value={subtitle.text}
                                                            onChange={(e) => handleSubtitleTextChange(index, e.target.value)}
                                                            className="mt-4 mb-2 ml-3 bg-transparent w-fit"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>
                                )}
                            </Tabs>
                        </div>
                        <div className="flex flex-col items-center">
                            <Dialog>
                                <DialogTrigger className="ml-auto" asChild>
                                    {state.status === "rendering" ?
                                        <Button className="mb-4" variant="outline">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Rendering
                                        </Button>
                                        :
                                        <Button className="mb-4" variant="outline">
                                            <FileVideo className="mr-2 h-4 w-4" />
                                            Export video
                                        </Button>
                                    }
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Render video
                                        </DialogTitle>
                                        <DialogDescription>
                                            In order to download you video, we need to render it first.
                                            Click the button below to start rendering.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">

                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <div>
                                            {state.status === "init" ||
                                                state.status === "invoking" ||
                                                state.status === "error" ||
                                                state.status === "done" ? (
                                                <>
                                                    {state.status === "invoking" ?
                                                        (
                                                            <Button disabled>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Please wait
                                                            </Button>

                                                        ) :
                                                        (
                                                            state.status === "done" ?
                                                                <Button
                                                                    asChild
                                                                >
                                                                    <Link href={`/export/${params.id}`}>
                                                                        <Check className="mr-2 h-4 w-4" />
                                                                        Done rendering
                                                                    </Link>
                                                                </Button>
                                                                :
                                                                <Button
                                                                    onClick={() => {
                                                                        saveSettings().then(() => {
                                                                            renderMedia();
                                                                        });
                                                                    }}
                                                                >
                                                                    <Server className="mr-2 h-4 w-4" />
                                                                    Render video
                                                                </Button>
                                                        )
                                                    }
                                                </>
                                            ) : null}
                                            {
                                                state.status === "rendering" ? (
                                                    <Button disabled>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Rendering&nbsp;{Math.ceil(state.progress * 100)}%
                                                    </Button>
                                                ) : null
                                            }
                                        </div>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            {video ?
                                <Player
                                    ref={playerRef}
                                    className="rounded-xl shadow-xl z-50"
                                    component={Main}
                                    style={{
                                        height: aspectRatio(metadata.width!, metadata.height!).height,
                                        width: aspectRatio(metadata.width!, metadata.height!).width,
                                    }}
                                    inputProps={{
                                        subtitles: subtitles,
                                        font: font,
                                        video: compressedVideo !== null ? compressedVideo : video,
                                        video_fps: metadata.fps!,
                                        words: words,
                                    }}
                                    durationInFrames={Math.ceil((metadata.duration) * (metadata.fps || 30))}
                                    compositionWidth={metadata.width!}
                                    compositionHeight={metadata.height!}
                                    fps={metadata.fps || 30}
                                    controls
                                />
                                :
                                <div className="rounded-xl shadow-xl">
                                    <div
                                        className="rounded-xl flex justify-center items-center"
                                        style={{
                                            width: aspectRatio(metadata.width!, metadata.height!).width,
                                            height: aspectRatio(metadata.width!, metadata.height!).height,
                                        }}
                                    >
                                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                )}
            </main >
        </div >
    );
};