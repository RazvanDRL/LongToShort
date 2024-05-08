"use client"
import { supabase } from "@/lib/supabaseClient";
import { Toaster, toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button";
import { Loader2, ChevronsUpDown } from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
    XCircle
} from "lucide-react"

import React, { useEffect, useState } from 'react';
import Header from "@/components/header"
import type { User } from "../../types/constants";

type Video = {
    id: string;
    name: string;
    created_at: string;
    duration: number;
    processed: boolean;
}

export default function Dashboard() {
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [videos, setVideos] = useState<Video[] | null>(null);
    const [shouldRender, setShouldRender] = useState(false);
    const [files, setFiles] = useState<File>();
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

    const fetchAllVideos = async () => {
        if (user && user.id) {
            const { data, error } = await supabase
                .from('metadata')
                .select("*")
                .eq('user_id', user.id);

            if (error) {
                console.log(error);
                return;
            }

            if (!data) {
                console.log("no data");
                return;
            }

            const fetchedVideos: Video[] = [];

            for (let i = 0; i < data.length; i++) {
                const file = data[i];
                fetchedVideos.push({
                    id: file.id,
                    name: file.name || '',
                    created_at: file.created_at,
                    duration: file.duration,
                    processed: file.processed,
                });
            }

            setVideos(fetchedVideos);
        }

        if (!user?.id) {
            console.log("no user id");
        }
    }

    async function handleSignedIn() {
        const userFetch = (await supabase.auth.getUser()).data?.user;
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        if (userFetch) {
            setUser({
                id: userFetch.id,
                email: userFetch.email || "",
                aud: userFetch.aud,
                access_token: token!,
            });
            if (userFetch.aud !== 'authenticated') {
                router.replace('/login');
                return true;
            }
            else
                return false;
        }
        else {
            router.replace('/login');
            return true;
        }
    }

    const shortenFileName = (fileName: string) => {
        if (fileName.length <= 30) {
            return fileName;
        }
        const fileExt = fileName.split(".").pop();
        const fileNameWithoutExt = fileName.replace(`.${fileExt}`, "");
        const shortenedFileName = fileNameWithoutExt.substring(0, 24) + "..." + fileNameWithoutExt.substring(fileNameWithoutExt.length - 3);

        return shortenedFileName + "." + fileExt;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !e.target.files[0].size || !e.target.files[0].type) return;
        if (uploadState !== "idle") return;

        if (e.target.files[0].size > 52428800) {
            toast.error("File size is too big.");
            e.target.value = "";
            return;
        }

        if (e.target.files[0].type !== "video/mp4") {
            toast.error("File type is not mp4.");
            e.target.value = "";
            return;
        }

        setFiles(e.target.files[0]);
    };

    const handleSubmitFile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user) return;
        if (!files) return;
        if (uploadState !== "idle") return;

        if (files) {
            await uploadFile(files);
        }

        const { data: file } = await supabase.storage
            .from("videos")
            .list(`${user?.id}`);
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!e.dataTransfer.files) return;
        if (uploadState !== "idle") return;

        const droppedFiles = e.dataTransfer.files;

        if (droppedFiles.length > 0) {
            const file = droppedFiles[0];

            if (file.size > 52428800) {
                toast.error("File size is too big.");
                return;
            }

            if (file.type !== "video/mp4") {
                toast.error("File type is not mp4.");
                return;
            }

            setFiles(file);
        }
    };

    function removeInvalidCharacters(input: string): string {
        // Define the regular expression pattern for valid characters
        const validCharsRegex = /^(\w|\/|!|-|\.|\*|'|\(|\)| |&|\$|@|=|;|:|\+|,|\?)*$/;

        // Remove the file extension
        const fileNameWithoutExtension = input.replace(/\.[^.]+$/, '');

        // Use the RegExp test method to filter out invalid characters
        const validCharacters = Array.from(fileNameWithoutExtension).filter(char => validCharsRegex.test(char));

        // Join the valid characters back into a string
        const sanitizedString = validCharacters.join('');

        return sanitizedString;
    }

    async function getDuration(file: File): Promise<{ duration: number, width: number, height: number }> {
        return new Promise(async (resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = URL.createObjectURL(file);
            video.onloadedmetadata = async function () {
                window.URL.revokeObjectURL(video.src);
                const duration = video.duration;
                const width = video.videoWidth;
                const height = video.videoHeight;
                resolve({ duration, width, height });
            }
            video.onerror = function (error) {
                reject(error);
            }
        });
    }

    function getFileExtension(filename: string): string {
        return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
    }

    async function uploadFile(file: File) {
        if (!user) return;
        if (uploadState !== "idle") return;

        setUploadState("uploading");

        let uuid: string = uuidv4();
        let ext: string = getFileExtension(file.name);
        const response = await fetch(`/api/upload?key=${user?.id}/${uuid}.${ext}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'video/mp4',
            },
            body: file,
        });

        if (response.status == 200) {
            setUploadState("done");
            const { duration, width, height } = await getDuration(file);

            const { error } = await supabase
                .from('metadata')
                .insert({ id: uuid, user_id: user?.id, name: `${removeInvalidCharacters(file.name)}`, duration: duration, width: width, height: height, ext: ext });
            if (error) {
                toast.error(error.message);
                return;
            }

            const promise = () => new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
                router.push(`/video/${uuid}`);
            });

            toast.promise(promise, {
                loading: 'File uploaded successfully. Redirecting...',
            })
        }

        if (response.status != 200) {
            toast.error(await response.text());
            setUploadState("error");
        }

        setUploadState("idle");
    }

    async function handleRemoveVideo(video_id: string) {
        if (!user) return;

        const { error } = await supabase
            .from('metadata')
            .delete()
            .eq('id', video_id);

        if (error) {
            console.log(error);
            return;
        }
        const { data: delete_storage } = await supabase.storage
            .from("processed_videos")
            .remove([`${user.id}/${video_id}.mp4`]);

        const { data, error: error2 } = await supabase
            .from('metadata')
            .select("*")
            .eq('user_id', user.id);

        if (error2) {
            console.log(error2);
            return;
        }

        if (!data) {
            console.log("no data");
            return;
        }

        const fetchedVideos: Video[] = [];

        for (let i = 0; i < data.length; i++) {
            const file = data[i];
            fetchedVideos.push({
                id: file.id,
                name: file.name || '',
                created_at: file.created_at,
                duration: file.duration,
                processed: file.processed,
            });
        }

        setVideos(fetchedVideos);
    }

    useEffect(() => {
        const fetchData = async () => {
            if (user)
                await fetchAllVideos();
        };

        fetchData();
    }, [user]);

    useEffect(() => {
        const runPrecheck = async () => {
            const result = await handleSignedIn();

            if (!result) {
                setShouldRender(true);
            } else {

            }
        };
        runPrecheck();
    }, []);

    if (!shouldRender) {
        return <div className="bg-[#ec2626] z-50 w-screen h-screen"></div>;
    }

    return (
        <div className="container mx-auto">
            <Toaster richColors />

            {user ? <Header user_email={user.email} page={"/dashboard/"} /> : null}
            <main className="mt-20 md:mt-36 justify-center items-center">
                <div className="flex flex-col items-center max-w-700px min-w-700px"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <form className="px-4 mt-8" onSubmit={handleSubmitFile}>
                        <label
                            htmlFor="fileInput"
                            className="relative flex justify-center items-center cursor-pointer font-medium text-white/65 border border-white/65 border-dashed py-5 px-20 rounded-lg overflow-hidden"
                        >
                            {!files?.name ? "Choose a file (MP4), or drag it here" : shortenFileName(files?.name)}
                            <div className="absolute right-8 text-white opacity-65">
                                {files?.name ?
                                    <span
                                        className="cursor-pointer"
                                        onClick={() => {
                                            if (uploadState === "uploading") return;
                                            setFiles(undefined)
                                        }}>
                                        <XCircle />
                                    </span>
                                    :
                                    ""}
                            </div>
                        </label>

                        <input
                            id="fileInput"
                            className="hidden"
                            type="file"
                            onChange={handleFileChange}
                            accept="video/mp4"
                            disabled={uploadState === "uploading"}
                        />
                        {uploadState === "uploading" ?
                            <div>
                                <Button
                                    disabled
                                    className='w-full mt-8'
                                >
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </Button>
                            </div>
                            :
                            <Button
                                type="submit"
                                className="w-full mt-8"
                                disabled={!files}
                            >
                                Upload
                            </Button>
                        }
                    </form>

                </div>
                <div className="mt-20 md:mt-28 flex flex-col-1 justify-center items-center w-[70%] mx-auto">
                    <div>
                        {videos !== null && videos.length > 0 ? (
                            <Collapsible
                                open={isOpen}
                                onOpenChange={setIsOpen}
                                className="w-[335px] md:w-[400px] space-y-2"
                            >
                                <div className="flex items-center justify-between space-x-4 mb-0.5 pl-2">
                                    <h4 className="text-sm font-semibold">
                                        Your Videos
                                    </h4>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm" className="w-9 p-0">
                                            <ChevronsUpDown className="h-4 w-4" />
                                            <span className="sr-only">Toggle</span>
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                                <a href={`/video/${videos[0].id}`} className="hover:underline">
                                    <div className="rounded-md border px-4 py-3 font-mono text-sm">
                                        {shortenFileName(videos[0].name)}
                                    </div>
                                </a>
                                <CollapsibleContent className="space-y-2">
                                    {videos?.slice(1, videos.length).map((video) => (
                                        <a key={video.id} href={video.processed ? `/project/${video.id}` : `/video/${video.id}`} className="hover:underline">
                                            <div className="rounded-md border px-4 py-3 font-mono text-sm mt-2.5">
                                                {shortenFileName(video.name)}
                                            </div>
                                        </a>
                                    ))}
                                </CollapsibleContent>

                            </Collapsible>
                        ) : null
                        }
                    </div>
                </div>
            </main >
        </div >
    );
}