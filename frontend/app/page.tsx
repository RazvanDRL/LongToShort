"use client";
import React from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import localFont from 'next/font/local'
import { ArrowRight, CircleCheck } from "lucide-react";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Footer } from "@/components/footer";
import { FAQ } from "@/components/faq";
import { Pricing } from "@/components/pricing";

const Satoshi = localFont({
    src: '../public/fonts/Satoshi.woff2',
    display: 'swap',
})

const Poppins = localFont({
    src: '../public/fonts/Poppins.woff2',
    display: 'swap',
})

const videos = [
    {
        src: "/videos/video1.mp4",
        caption: "Andrew Huberman",
        username: "@hubermanlab",
        avatar: "/avatars/huberman.jpg",
    },
    {
        src: "/videos/video2.mp4",
        caption: "MrBeast",
        username: "@mrbeast",
        avatar: "/avatars/mrbeast.png",
    },
    {
        src: "/videos/video3.mp4",
        caption: "Iman Gadzhi",
        username: "@imangadzhi",
        avatar: "/avatars/gadzhi.jpg",
    },
    {
        src: "/videos/video4.mp4",
        caption: "Alex Hormozi",
        username: "@hormozi",
        avatar: "/avatars/hormozi.jpg",
    },
]

const features = [
    {
        emoji: "🎯",
        title: "Spot-On Accuracy",
        description: "Get subtitles you can trust. Our advanced system delivers precise transcriptions, so your message comes across clearly every time.",
    },
    {
        emoji: "🚀",
        title: "Lightning-Fast Transcription",
        description: "We value your time. Get your subtitles in minutes, not hours. Keep your content flowing and your audience engaged.",
    },
    {
        emoji: "🎨",
        title: "Customization Options",
        description: "Make your subtitles pop. Easily adjust font, color, size, and position to match your style and boost viewer engagement.",
    },
    {
        emoji: "🙂",
        title: "Clean Content Guarantee",
        description: "Our smart filter catches bad words, avoid takedowns due to inappropriate language and keep your videos up and earning.",
    },
]


export default function Home() {

    return (
        <div className="container mx-auto bg-background">
            <Navbar />
            <div className="flex flex-col items-center justify-start min-h-screen pt-16 md:pt-32 z-20">
                {/* Hero */}
                <div className="sticky z-0 top-0 flex flex-col gap-8 md:gap-16 items-center px-4 md:px-0">
                    <h1 className={`text-center md:text-left leading-tight text-[32px] sm:text-[48px] md:text-[60px] ${Satoshi.className} font-black`}>
                        How Creators make&nbsp;
                        <br className="hidden md:inline" />
                        <span className="underline underline-offset-8 decoration-primary decoration-dashed">
                            viral shorts
                        </span>
                        &nbsp;using AI
                    </h1>
                    <p className={`text-center text-[16px] ${Poppins.className} font-[400] leading-relaxed max-w-[450px]`}>
                        Easily generate <span className="font-bold">subtitles</span> for your videos in seconds. Just upload your video and we&apos;ll do the rest.
                    </p>
                    <div>
                        <Button className="transition-transform duration-300 ease-in-out hover:scale-95 bg-primary rounded-xl w-full sm:w-auto font-semibold text-lg px-5 py-6">
                            <Link href="/dashboard">
                                Go Viral Today
                            </Link>
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
                <section className="relative mt-32 md:mt-60 w-screen h-screen bg-primary rounded-t-[30px] md:rounded-t-[60px] z-50 overflow-hidden">
                    <div className="max-w-6xl mx-auto py-16 md:py-32 px-4 md:px-0 items-center text-center">
                        <div className="py-8 md:py-16">
                            <h2 className={`mb-16 md:mb-32 text-center leading-tight text-[36px] md:text-[48px] ${Satoshi.className} font-black text-white`}>
                                60% of potential views
                                <br />
                                are lost&nbsp;🤬&nbsp;
                                <br />
                                <span className="underline underline-offset-8 decoration-dashed decoration-white/80">
                                    without subtitles
                                </span>
                            </h2>
                            <div className="text-white flex flex-col md:flex-row justify-center items-center md:items-start gap-6">
                                <div className="w-full md:w-48 flex flex-col gap-2 items-center justify-center">
                                    <span className="text-4xl">🤩</span>
                                    <h3 className="font-bold">Manual subtitles</h3>
                                </div>
                                <svg className="shrink-0 w-12 fill-white opacity-70 max-md:-scale-x-100 md:-rotate-90" viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path fillRule="evenodd" d="M72.9644 5.31431C98.8774 43.8211 83.3812 88.048 54.9567 120.735C54.4696 121.298 54.5274 122.151 55.0896 122.639C55.6518 123.126 56.5051 123.068 56.9922 122.506C86.2147 88.9044 101.84 43.3918 75.2003 3.80657C74.7866 3.18904 73.9486 3.02602 73.3287 3.44222C72.7113 3.85613 72.5484 4.69426 72.9644 5.31431Z"></path><path fillRule="evenodd" d="M56.5084 121.007C56.9835 118.685 57.6119 115.777 57.6736 115.445C59.3456 106.446 59.5323 97.67 58.4433 88.5628C58.3558 87.8236 57.6824 87.2948 56.9433 87.3824C56.2042 87.4699 55.6756 88.1435 55.7631 88.8828C56.8219 97.7138 56.6432 106.225 55.0203 114.954C54.926 115.463 53.5093 121.999 53.3221 123.342C53.2427 123.893 53.3688 124.229 53.4061 124.305C53.5887 124.719 53.8782 124.911 54.1287 125.015C54.4123 125.13 54.9267 125.205 55.5376 124.926C56.1758 124.631 57.3434 123.699 57.6571 123.487C62.3995 120.309 67.4155 116.348 72.791 113.634C77.9171 111.045 83.3769 109.588 89.255 111.269C89.9704 111.475 90.7181 111.057 90.9235 110.342C91.1288 109.626 90.7117 108.878 89.9963 108.673C83.424 106.794 77.3049 108.33 71.5763 111.223C66.2328 113.922 61.2322 117.814 56.5084 121.007Z"></path></g></svg>
                                <div className="w-full md:w-48 flex flex-col gap-2 items-center justify-center">
                                    <span className="text-4xl">😐</span>
                                    <h3 className="font-bold">Time-consuming</h3>
                                </div>
                                <svg className="shrink-0 w-12 fill-white opacity-70 md:-scale-x-100 md:-rotate-90" viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path fillRule="evenodd" d="M72.9644 5.31431C98.8774 43.8211 83.3812 88.048 54.9567 120.735C54.4696 121.298 54.5274 122.151 55.0896 122.639C55.6518 123.126 56.5051 123.068 56.9922 122.506C86.2147 88.9044 101.84 43.3918 75.2003 3.80657C74.7866 3.18904 73.9486 3.02602 73.3287 3.44222C72.7113 3.85613 72.5484 4.69426 72.9644 5.31431Z"></path><path fillRule="evenodd" d="M56.5084 121.007C56.9835 118.685 57.6119 115.777 57.6736 115.445C59.3456 106.446 59.5323 97.67 58.4433 88.5628C58.3558 87.8236 57.6824 87.2948 56.9433 87.3824C56.2042 87.4699 55.6756 88.1435 55.7631 88.8828C56.8219 97.7138 56.6432 106.225 55.0203 114.954C54.926 115.463 53.5093 121.999 53.3221 123.342C53.2427 123.893 53.3688 124.229 53.4061 124.305C53.5887 124.719 53.8782 124.911 54.1287 125.015C54.4123 125.13 54.9267 125.205 55.5376 124.926C56.1758 124.631 57.3434 123.699 57.6571 123.487C62.3995 120.309 67.4155 116.348 72.791 113.634C77.9171 111.045 83.3769 109.588 89.255 111.269C89.9704 111.475 90.7181 111.057 90.9235 110.342C91.1288 109.626 90.7117 108.878 89.9963 108.673C83.424 106.794 77.3049 108.33 71.5763 111.223C66.2328 113.922 61.2322 117.814 56.5084 121.007Z"></path></g></svg>
                                <div className="w-full md:w-48 flex flex-col gap-2 items-center justify-center">
                                    <span className="text-4xl">😔</span>
                                    <h3 className="font-bold">Inconsistency</h3>
                                </div>
                            </div>
                            <Button className="bg-white text-primary rounded-xl w-full sm:w-auto font-semibold text-lg px-5 py-6 mt-16 md:mt-28 transition-transform duration-300 ease-in-out hover:scale-95 hover:bg-background">
                                <Link href="/dashboard">
                                    Gain 60% more views
                                </Link>
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                </section>
                <section className="bg-background w-full z-50">
                    <div className="max-w-6xl mx-auto pt-16 md:pt-32 px-4 md:px-0 items-center text-center">
                        <h2 className={`text-center leading-tight text-[36px] md:text-[48px] ${Satoshi.className} font-black text-black`}>
                            Unlock Viral Potential in Seconds 🚀
                        </h2>
                        <p className="mt-4 mb-10 text-black/50 text-[18px] md:text-[20px]">
                            Transform your content from overlooked to overperforming. Here&apos;s how we skyrocket your success:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-black text-left">
                            {features.map((feature, index) => (
                                <div key={index} className="border border-neutral-100 p-6 md:p-8 bg-background rounded-xl flex flex-col md:flex-row items-start md:items-center drop-shadow-xl">
                                    <div className="text-5xl md:text-6xl mb-4 md:mb-0 md:mr-6">
                                        {feature.emoji}
                                    </div>
                                    <div>
                                        <h3 className="text-[20px] md:text-[24px] font-[800] mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-black/50 text-[14px] md:text-[16px]">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button className="bg-primary rounded-xl w-full sm:w-auto font-semibold text-lg px-5 py-6 mt-16">
                            <Link href="/dashboard">
                                Boost views now
                            </Link>
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </section>
                <section className="bg-background w-full z-50">
                    <div className="max-w-6xl px-4 mx-auto py-16 md:py-32 items-center text-center">
                        <h3 className={`mb-4 text-center leading-tight text-[36px] md:text-[48px] ${Satoshi.className} font-black text-black`}>
                            Post like the <span className="underline underline-offset-8 decoration-primary decoration-dashed text-primary">best influencers</span>
                        </h3>
                        <p className="mt-4 mb-10 text-black/50 text-[18px] md:text-[20px]">
                            Dominate your niche with AI-crafted shorts, crush it with influencer-level impact.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {videos.map((video, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    <div className="flex items-center mb-4">
                                        <Image
                                            src={video.avatar}
                                            className="rounded-full"
                                            width={50}
                                            height={50}
                                            loading="lazy"
                                            alt={`${video.caption} avatar`}
                                        />
                                        <div className="ml-3 text-left">
                                            <div className="font-semibold">{video.caption}</div>
                                            <div className="text-gray-500">{video.username}</div>
                                        </div>
                                    </div>
                                    <video
                                        src={video.src}
                                        className="rounded-[1.5rem] w-full max-w-[270px] h-auto drop-shadow-lg"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                    />
                                </div>
                            ))}
                        </div>
                        <Button className="bg-primary rounded-xl w-full sm:w-auto font-semibold text-lg px-5 py-6 mt-16">
                            <Link href="/dashboard">
                                Post now
                            </Link>
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </section>
                <section className="bg-background w-full z-50">
                    <Pricing className="max-w-6xl mx-auto py-16 md:py-32 px-4" />
                </section>
                <section className="bg-background w-full z-50">
                    <FAQ className="max-w-6xl mx-auto py-16 md:py-32 px-4" />
                </section>
            </div>
            <Footer />
        </div>
    );
}