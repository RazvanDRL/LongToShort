"use client"
import { supabase } from "@/lib/supabaseClient";
import { Toaster, toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button";
import { Loader2, ChevronsUpDown, Check, Link } from "lucide-react"

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
import VideoList from "@/components/VideoList";
import { FileUpload } from "@/components/ui/file-upload";

type Video = {
    id: string;
    name: string;
    created_at: string;
    duration: number;
    processed: boolean;
    ext: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [videos, setVideos] = useState<Video[] | null>(null);
    const [shouldRender, setShouldRender] = useState(false);
    const [files, setFiles] = useState<File>();
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
    const [page, setPage] = useState(1);

    const fetchAllVideos = async () => {
        console.log("Fetching all videos...");
        if (user && user.id) {
            const { data, error } = await supabase
                .from('metadata')
                .select("*")
                .order('created_at', { ascending: false })
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
                    ext: file.ext,
                });
            }

            setVideos(fetchedVideos);
        }

        if (!user?.id) {
            console.log("no user id");
        }
    }

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

    function shortenFileNamePhone(name: string) {
        if (name.length > 19) {
            return name.substring(0, 12) + "..." + name.substring(name.length - 4, name.length);
        }
        return name;
    }

    function shortenFileName(name: string) {
        if (name.length > 25) {
            return name.substring(0, 18) + "..." + name.substring(name.length - 4, name.length);
        }
        return name;
    }

    const handleFileUpload = async (uploadedFiles: File[]) => {
        if (!user) return;
        if (uploadState !== "idle") return;
        if (uploadedFiles.length === 0) return;

        const file = uploadedFiles[0];

        if (file.size > 52428800 * 10) {
            toast.error("File size is too big.");
            return;
        }

        if (!file.type.startsWith("video/")) {
            toast.error("Only video files are accepted.");
            return;
        }

        setFiles(file);
        await uploadFile(file);
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
        // let contentType: string = file.type;

        // try {
        //     const thumbnailBlob = await generateThumbnail(file);
        //     const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
        //     setThumbnailUrl(thumbnailUrl);
        // } catch (error) {
        //     console.error('Failed to generate thumbnail:', error);
        //     toast.error('Failed to generate thumbnail');
        // }

        const response = await fetch(`/api/upload?key=${user?.id}/${uuid}.mp4`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'video/mp4',
            },
            body: file,
        });

        if (response.status == 200) {
            setUploadState("done");
            const { duration, height, width } = await getDuration(file);

            const { error } = await supabase
                .from('metadata')
                .insert({ id: uuid, user_id: user?.id, name: `${removeInvalidCharacters(file.name)}`, duration: duration, height: height, width: width, ext: ext });
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
    }

    async function generateThumbnail(file: File): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = function () {
                video.currentTime = 0; // Seek to 1 second
            };
            video.onseeked = function () {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(blob => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to generate thumbnail'));
                    }
                }, 'image/jpeg', 0.7); // JPEG at 70% quality
            };
            video.onerror = function () {
                reject(new Error('Error occurred while loading video'));
            };
            video.src = URL.createObjectURL(file);
        });
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
                ext: file.ext,
            });
        }

        setVideos(fetchedVideos);
    }

    function formatSeconds(seconds: number) {
        let date = new Date(0);
        date.setSeconds(seconds);
        return date.toISOString().substr(14, 5);
    }

    // async function downloadFromUrl(url: string) {
    //     let body = {
    //         video_url: url,
    //     }

    //     const options = {
    //         method: 'POST',
    //         body: JSON.stringify(body),
    //     };

    //     try {
    //         const response = await fetch("/api/download", options);
    //         if (!response.ok) {
    //             toast.error("Error downloading video");
    //             return;
    //         }
    //         const result = await response.json();

    //         console.log(result);

    //         if (result.error) {
    //             toast.error("Error downloading video");
    //             return;
    //         }

    //         let uuid: string = uuidv4();
    //         let ext: string = "mp4";

    //         const { error } = await supabase
    //             .from('metadata')
    //             .insert({ id: uuid, user_id: user?.id, name: `${removeInvalidCharacters(result.title)}`, video_src: result.url, thumbnail: result.thumbnail, duration: result.duration, ext: ext });

    //         if (error) {
    //             toast.error(error.message);
    //             return;
    //         }

    //         const promise = () => new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
    //             router.push(`/video/${uuid}`);
    //         });

    //         toast.promise(promise, {
    //             loading: 'File uploaded successfully. Redirecting...',
    //         })



    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    // function handleVideoUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    //     setVideoUrl(e.target.value);
    // }

    useEffect(() => {
        const runPrecheck = async () => {
            const result = await handleSignedIn();
            await fetchAllVideos();

            if (!result) {
                setShouldRender(true);
            } else {

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
        <div className="container mx-auto">
            <Toaster richColors />

            {user ? <Header user_email={user.email} /> : null}
            <main className="w-full h-screen flex justify-center items-center">
                <div>
                    <div className="flex flex-col items-center max-w-700px min-w-700px">
                        <FileUpload onChange={handleFileUpload} />
                        {uploadState === "uploading" ? (
                            <div>
                                <Button
                                    disabled
                                    className='w-full mt-8'
                                >
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </Button>
                            </div>
                        ) : uploadState === "done" ? (
                            <Button
                                className="w-full mt-8"
                                disabled
                            >
                                <Check className="mr-2 h-4 w-4" />
                                Done
                            </Button>
                        ) : uploadState === "error" ? (
                            <Button
                                className="w-full mt-8"
                                disabled
                            >
                                Error
                            </Button>
                        ) : null}
                    </div>
                    <div className="mt-20 md:mt-28 flex flex-col-1 justify-center items-center w-[70%] mx-auto">
                        <div>
                            {videos !== null && videos.length > 0 ? (
                                <VideoList videos={videos} />
                            ) : null}
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
}