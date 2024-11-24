"use client"
import { supabase } from "@/lib/supabaseClient";
import { Toaster, toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react';

import { Button } from "@/components/ui/button";
import { Loader2, Check, Upload } from "lucide-react"
import React, { useEffect } from 'react';
import Header from "@/components/header"
import type { User } from "../../types/constants";
import VideoList from "@/components/VideoList";
import { FileUpload } from "@/components/ui/file-upload";
import axios from "axios";
import sanitize from 'sanitize-filename';

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
    const [user, setUser] = useState<User | null>(null);
    const [videos, setVideos] = useState<Video[] | null>(null);
    const [shouldRender, setShouldRender] = useState(false);
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);

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

    async function uploadFile(file: File) {
        if (!user) return;
        if (uploadState !== "idle") return;

        setUploadState("uploading");
        setUploadProgress(0);

        let uuid: string = uuidv4() as string;
        let ext: string = getFileExtension(file.name) as string;

        try {
            // Step 1: Get a signed URL for uploading
            const getUrlResponse = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: `${uuid}.mp4`,
                    fileSize: file.size,
                    fileType: file.type
                })
            });

            if (!getUrlResponse.ok) {
                throw new Error('Failed to get upload URL');
            }

            const { url } = await getUrlResponse.json();

            // Step 2: Upload the file to the signed URL
            const uploadResponse = await axios.put(url, file, {
                headers: {
                    'Content-Type': file.type,
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / file.size);
                    setUploadProgress(progress);
                }
            });

            if (uploadResponse.status !== 200) {
                throw new Error('Failed to upload file');
            }

            setUploadState("done");
            const { duration, height, width } = await getDuration(file);

            const sanitizedName = sanitize(file.name);
            const nameWithoutExtension = sanitizedName.replace(/\.[^.]+$/, '');

            const { error } = await supabase
                .from('metadata')
                .insert({ id: uuid, user_id: user.id, name: nameWithoutExtension, duration, height, width, ext });
            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success('File uploaded successfully. Redirecting...');
            setTimeout(() => {
                router.push(`/video/${uuid}`);
            }, 2000);

            await fetchAllVideos(); // Refresh the video list
        } catch (error: any) {
            console.error('Error uploading file:', error);
            toast.error('An error occurred while uploading the file');
            setUploadState("error");
        }
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

    const handleFileUpload = useCallback(async (uploadedFiles: File[]) => {
        if (!user) return;
        if (uploadState !== "idle") return;
        if (uploadedFiles.length === 0) return;

        const file = uploadedFiles[0];

        if (file.size > 1 * 1024 ** 3) {
            toast.error("File size is too big. Max size is 1GB.");
            return;
        }

        if (file.type !== "video/mp4") {
            toast.error("File type is not accepted. Only .mp4 files are accepted. Contact support if you need to upload other file types.");
            return;
        }

        await uploadFile(file);
    }, [user, uploadState]);

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

            {user ? <Header /> : null}
            <main className="w-full h-screen flex justify-center items-center">
                <div>
                    <div className="flex flex-col items-center max-w-700px min-w-700px">
                        <FileUpload onChange={handleFileUpload} />
                        {uploadState === "uploading" ? (
                            <Button
                                disabled
                                className='w-[24rem] mt-8'
                            >
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading... {uploadProgress}%
                            </Button>
                        ) : uploadState === "done" ? (
                            <Button
                                className="w-[24rem] mt-8"
                                disabled
                            >
                                <Check className="mr-2 h-4 w-4" />
                                Done
                            </Button>
                        ) : uploadState === "error" ? (
                            <Button
                                className="w-[24rem] mt-8"
                                disabled
                            >
                                <Upload className="mr-2 h-4 w-4" />
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
            </main>
        </div>
    );
}