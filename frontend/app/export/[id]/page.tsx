"use client"
import { supabase } from "@/lib/supabaseClient";
import { Toaster, toast } from 'sonner';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import Header from "@/components/header";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import {
    Download,
    Share2,
    User,
    Captions,
    ThumbsDown,
    Heart,
} from "lucide-react"

import React, { useEffect, useState } from 'react';
import Link from "next/link";

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

const predefinedReasons = [
    'Rather not say',
    'Poor video quality',
    'Inaccurate subtitles',
    'Long wait times',
    'Too expensive',
    'Technical issues',
    'Other',
];

export default function Export({ params }: { params: { id: string } }) {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [video, setVideo] = useState<string | null>(null);
    const [subtitles, setSubtitles] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [shouldRender, setShouldRender] = useState<boolean>(false);
    const [positiveClicked, setPositiveClicked] = useState(false);
    const [negativeClicked, setNegativeClicked] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedReasons, setSelectedReasons] = useState<string[] | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handlePositiveClick = async () => {
        if (!positiveClicked) {
            await addRating('positive');
            setPositiveClicked(true);
            setNegativeClicked(false); // Unscale the thumbs down button
        }
    };

    const handleNegativeClick = () => {
        if (!negativeClicked) {
            setNegativeClicked(true);
            setPositiveClicked(false);
            setIsDialogOpen(true);
        }
    };

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
                processed: data.processed,
            });
        }

        return data;
    }

    async function fetchVideo() {
        try {
            const response = await fetch(`/api/generate-signed-url?key=${user?.id}/${params.id}.mp4?bucket=output-bucket`, {
                method: 'POST'
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

    async function fetchSubtitles() {
        try {
            const response = await fetch(`/api/generate-signed-url?key=${user?.id}/${params.id}.srt?bucket=subtitles`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch signed URL');
            }

            const data = await response.json();
            console.log(data.url);
            setSubtitles(data.url);
        } catch (error) {
            console.error('Error fetching video:', error);
        }
    }

    async function fetchRating() {
        const { data, error } = await supabase
            .from('rating')
            .select('*')
            .eq('video_id', params.id)
            .eq('user_id', user?.id)
            .single();

        if (error) {
            toast.error(error.message);
            return;
        }
        if (!data) {
            return;
        }

        if (data) {
            if (data.rating === 'positive') {
                setPositiveClicked(true);
            }
            if (data.rating === 'negative') {
                setNegativeClicked(true);
            }
        }
    }

    async function addRating(rating: string, reason?: string) {
        if (rating === 'positive' || rating === 'negative') {
            if (rating === 'positive') reason = "";
            const { data, error } = await supabase
                .from('rating')
                .insert([
                    { user_id: user?.id, video_id: params.id, rating: rating, reason: reason }
                ]);

            if (error?.message.toString().includes('duplicate key value violates unique constraint "rating_video_id_key"')) {
                const { data, error } = await supabase
                    .from('rating')
                    .update([
                        { rating: rating, reason: reason }
                    ])
                    .eq('video_id', params.id)
                if (error) {
                    toast.error(error.message);
                    return;
                }
                if (!error) {
                    toast.success('Rating updated');
                }
            }
            else if (error) {
                toast.error(error.message);
                return;
            }
            else if (!error) {
                toast.success('Rating added');
            }
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
                        await fetchRating();
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

    return (
        <div>
            <Toaster richColors />

            {user ? <Header user_email={user.email} /> : null}
            <main className="flex justify-center items-center mt-24">
                <div className="flex justify-center items-center flex-col">
                    {shouldRender && video && (
                        <div>
                            <div>
                                <div className="flex justify-between">
                                    <div>
                                        <div className="rounded-lg bg-gray-800/50 p-2">
                                            <video
                                                src={video}
                                                controls
                                                className="max-h-[500px] rounded-lg"
                                            />
                                        </div>
                                        <Button asChild className="w-full mt-6">
                                            <Link href={video}>
                                                <Download className="mr-2 h-4 w-4" /> Download Video
                                            </Link>
                                        </Button>
                                        <div className="mt-4 w-full flex justify-between">
                                            {/*
                                            <Button
                                                onClick={() => {
                                                    // Create a Blob from the video URL
                                                    fetch(subtitles)
                                                        .then(response => response.blob())
                                                        .then(blob => {
                                                            // Create a temporary URL for the Blob
                                                            const blobUrl = URL.createObjectURL(blob);
                                                            // Create a temporary anchor element
                                                            const link = document.createElement('a');
                                                            link.href = blobUrl;
                                                            // process metadata.name to remove.mp4 extenison
                                                            const fileName = metadata?.name.replace('.mp4', '.srt');
                                                            link.download = `${fileName}`; // Set the default download filename
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            // Remove the temporary URL and anchor element
                                                            URL.revokeObjectURL(blobUrl);
                                                            document.body.removeChild(link);
                                                            toast.success('Subtitles downloaded');
                                                        })
                                                        .catch(error => {
                                                            console.error('Error downloading subtitles:', error);
                                                            toast.error('Error downloading subtitles');
                                                        });
                                                }}
                                                className="w-[48%]" // Adjust width to your preference
                                            >
                                                <Captions className="mr-2 h-4 w-4" /> Subtitles
                                            </Button>
                                            */}
                                            <div className="w-4" /> {/* Spacer */}
                                            <Button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(video);
                                                    toast.success('Link copied - available for 24 hours');
                                                }}
                                                className="w-[48%]" // Adjust width to your preference
                                            >
                                                <Share2 className="mr-2 h-4 w-4" /> Copy link
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Rating */}
                            <div className="flex gap-3">
                                <Heart
                                    className={`cursor-pointer mt-4 h-8 w-8 ${positiveClicked ? 'text-red-600 scale-110' : 'text-red-700 hover:text-red-600 hover:scale-110'
                                        }`}
                                    onClick={handlePositiveClick}
                                />
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger>
                                        <ThumbsDown
                                            className={`cursor-pointer mt-4 h-8 w-8 ${negativeClicked ? 'text-gray-600 scale-110' : 'text-gray-700 hover:text-gray-600 hover:scale-110'}`}
                                            onClick={handleNegativeClick}
                                        />
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Provide a reason</DialogTitle>
                                            <DialogDescription>
                                                Please select a reason for your negative rating.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            {predefinedReasons.map((reason, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`reason-${index}`}
                                                        checked={selectedReasons?.includes(reason) ?? false}
                                                        onCheckedChange={(checked: boolean) => {
                                                            setSelectedReasons((prevReasons) =>
                                                                checked
                                                                    ? [...(prevReasons ?? []), reason]
                                                                    : (prevReasons ?? []).filter((r) => r !== reason)
                                                            );
                                                        }}
                                                    />
                                                    <Label htmlFor={`reason-${index}`}>{reason}</Label>
                                                </div>
                                            ))}
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                onClick={async () => {
                                                    if (selectedReasons && selectedReasons.length > 0) {
                                                        const reason = selectedReasons.join(', ');
                                                        await addRating('negative', reason);
                                                        setIsDialogOpen(false);
                                                    } else {
                                                        toast.error('Please select at least one reason.');
                                                    }
                                                }}
                                            >
                                                Submit
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    )}
                </div>
            </main >
        </div >
    );
}