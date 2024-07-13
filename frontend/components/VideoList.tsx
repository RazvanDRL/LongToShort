import React, { useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination";

interface Video {
    id: string;
    name: string;
    created_at: string;
    duration: number;
    processed: boolean;
    ext: string;
}

interface VideoListProps {
    videos: Video[];
}

const VideoList: React.FC<VideoListProps> = ({ videos }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    const shortenFileName = (name: string) => {
        return name.length > 20 ? name.substring(0, 20) + '...' : name;
    };

    const shortenFileNamePhone = (name: string) => {
        return name.length > 15 ? name.substring(0, 15) + '...' : name;
    };

    const formatSeconds = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getPageVideos = () => {
        if (page === 1) {
            return videos.slice(0, itemsPerPage);
        } else {
            const startIndex = (page - 1) * itemsPerPage - 1;
            return videos.slice(startIndex, startIndex + itemsPerPage);
        }
    };

    const pageVideos = getPageVideos();
    const totalPages = Math.ceil((videos.length - 1) / itemsPerPage);

    if (!videos || videos.length === 0) {
        return null;
    }

    return (
        <>
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="w-[335px] md:w-[400px] space-y-2"
            >
                <div className="flex items-center justify-between space-x-4 mb-0.5 pl-2">
                    <h4 className="text-sm font-semibold">Your Videos</h4>
                    <CollapsibleTrigger asChild className={videos.length > 1 ? "" : "hidden"}>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>
                {!isOpen ? <div className="rounded-md border px-4 py-3 font-mono text-sm mt-2.5 flex justify-between">
                    <a href={videos[0].processed ? `/project/${videos[0].id}` : `/video/${videos[0].id}`} className="">
                        <div className="flex">
                            <div className="flex">
                                {videos[0].processed ? <span className="mr-2">✅</span> : <span className="animate-spin-slow mr-2">⏳</span>}
                            </div>
                            <div className="hover:underline hidden md:block">
                                {shortenFileName(videos[0].name) + "." + videos[0].ext}
                            </div>
                            <div className="hover:underline block md:hidden">
                                {shortenFileNamePhone(videos[0].name) + "." + videos[0].ext}
                            </div>
                        </div>
                    </a>
                    <div>
                        {formatSeconds(Math.round(videos[0].duration))}
                    </div>
                </div> :
                    pageVideos.map((video, index) => (
                        <a key={video.id} href={video.processed ? `/project/${video.id}` : `/video/${video.id}`} className="">
                            <div className="rounded-md border px-4 py-3 font-mono text-sm mt-2.5 flex justify-between">
                                <div className="flex">
                                    <div className="flex">
                                        {video.processed ? <span className="mr-2">✅</span> : <span className="animate-spin-slow mr-2">⏳</span>}
                                    </div>
                                    <div className="hover:underline hidden md:block">
                                        {shortenFileName(video.name) + "." + video.ext}
                                    </div>
                                    <div className="hover:underline block md:hidden">
                                        {shortenFileNamePhone(video.name) + "." + video.ext}
                                    </div>
                                </div>
                                <div>
                                    {formatSeconds(Math.round(video.duration))}
                                </div>
                            </div>
                        </a>
                    ))}
                <CollapsibleContent className="space-y-2">
                    {/* Content is now handled by the main loop above */}
                </CollapsibleContent>
            </Collapsible>
            {isOpen && totalPages > 1 && (
                <Pagination className="mt-4">
                    <PaginationContent>
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <PaginationItem key={index} className="cursor-pointer">
                                <PaginationLink
                                    onClick={() => setPage(index + 1)}
                                    isActive={index + 1 === page}
                                >
                                    {index + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                    </PaginationContent>
                </Pagination>
            )}
        </>
    );
};

export default VideoList;