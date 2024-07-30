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
    "AI Video Subtitles",
    "No Watermark",
    "Custom Branding",
    "Custom Templates",
    "Custom Fonts",
    "Custom Colors",
    "Custom Music",
]

const plans = [
    {
        title: "Solo 🙂",
        description: "Starting in content creation",
        paymentLink: "test_6oE5lkfHz0ZGes0000",
        price: 20,
        priceDescription: "One time",
        features: [
            "20 videos per month",
            "5GB of storage",
            "3 minutes / video",
        ],
        cta: "Seems good"
    },
    {
        title: "Creator 🤩",
        description: "For growing businesses",
        paymentLink: "test_6oE5lkfHz0ZGes0000",
        price: 50,
        priceDescription: "One time",
        features: [
            "50 videos per month",
            "10GB of storage",
            "5 minutes / video",
        ],
        cta: "That's better",
        popular: true
    },
    {
        title: "Teams 🚀",
        description: "For large businesses",
        paymentLink: "test_6oE5lkfHz0ZGes0000",
        price: 100,
        priceDescription: "One time",
        features: [
            "100 videos per month",
            "20GB of storage",
            "10 minutes / video",
        ],
        cta: "Best value"
    },
]

export default function Home() {

    return (
        <div className="container mx-auto bg-background">
            <Navbar />
            <div className="flex flex-col items-center justify-start min-h-screen pt-32 z-20">
                {/* Hero */}
                <div className="sticky z-0 top-0 flex flex-col gap-16 items-center">
                    <h1 className={`text-left leading-none text-[36px] sm:text-[48px] md:text-[60px] ${Satoshi.className} font-black`}>
                        How Creators make&nbsp;
                        <br />
                        <span className="underline underline-offset-8 decoration-primary decoration-dashed">
                            viral shorts
                        </span>
                        &nbsp;using AI
                    </h1>
                    <p className={`text-center text-[16px] ${Poppins.className} font-[400] leading-relaxed max-w-[450px]`}>
                        Easily generate <span className="font-bold">subtitles</span> for your videos in seconds. Just upload your video and we&apos;ll do the rest.
                    </p>
                    <div>
                        <Button className="transition-transform duration-300 ease-in-out hover:scale-95 bg-primary rounded-xl w-min font-semibold text-lg px-5 py-6">
                            <Link href="/dashboard">
                                Go Viral Today
                            </Link>
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        {/* <div className="mt-6 flex justify-left gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </div> */}
                    </div>
                </div>
                <section className="relative mt-60 w-screen bg-primary rounded-t-[60px] z-50">
                    <div className="max-w-6xl mx-auto py-16 md:py-32 items-center text-center">
                        <div className="py-16">
                            <h2 className={`mb-32 text-center leading-none text-[48px] ${Satoshi.className} font-black text-white`}>
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
                            <Button className="bg-white text-primary rounded-xl w-min font-semibold text-lg px-5 py-6 mt-28 transition-transform duration-300 ease-in-out hover:scale-95 hover:bg-background    ">
                                <Link href="/dashboard">
                                    Gain 60% more views
                                </Link>
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                </section>
                <section className="bg-background w-screen z-50">
                    <div className="max-w-6xl mx-auto pt-16 md:pt-32 items-center text-center">
                        <h2 className={`text-center leading-none text-[48px] ${Satoshi.className} font-black text-black`}>
                            Unlock Viral Potential in Seconds 🚀
                        </h2>
                        <p className="mt-4 mb-10 text-black/50 text-[20px]">
                            Transform your content from overlooked to overperforming. Here's how we skyrocket your success:
                        </p>
                        <div className="grid grid-row-2 grid-cols-2 gap-8 text-black text-left">
                            <div className="border border-neutral-100 p-8 col-span-1 row-span-1 bg-background rounded-xl flex items-center drop-shadow-xl">
                                <div className="text-6xl mr-6">
                                    🎯
                                </div>
                                <div>
                                    <h3 className="text-[24px] font-[800] mb-2">
                                        Spot-On Accuracy
                                    </h3>
                                    <p className="text-black/50 text-[16px]">
                                        Get subtitles you can trust. Our advanced system delivers precise transcriptions, so your message comes across clearly every time.                                    </p>
                                </div>
                            </div>
                            <div className="border border-neutral-100 p-8 col-span-1 row-span-1 bg-background rounded-xl flex items-center drop-shadow-xl">
                                <div className="text-6xl mr-6">
                                    🚀
                                </div>
                                <div>
                                    <h3 className="text-[24px] font-[800] mb-2">
                                        Lightning-Fast Transcription
                                    </h3>
                                    <p className="text-black/50 text-[16px]">
                                        We value your time. Get your subtitles in minutes, not hours. Keep your content flowing and your audience engaged.
                                    </p>
                                </div>
                            </div>
                            <div className="border border-neutral-100 p-8 col-span-1 row-span-1 bg-background rounded-xl flex items-center drop-shadow-xl">
                                <div className="text-6xl mr-6">
                                    🎨
                                </div>
                                <div>
                                    <h3 className="text-[24px] font-[800] mb-2">
                                        Customization Options
                                    </h3>
                                    <p className="text-black/50 text-[16px]">
                                        Make your subtitles pop. Easily adjust font, color, size, and position to match your style and boost viewer engagement.
                                    </p>
                                </div>
                            </div>
                            <div className="border border-neutral-100 p-8 col-span-1 row-span-1 bg-background rounded-xl flex items-center drop-shadow-xl">
                                <div className="text-6xl mr-6">
                                    🙂
                                </div>
                                <div>
                                    <h3 className="text-[24px] font-[800] mb-2">
                                        Clean Content Guarantee
                                    </h3>
                                    <p className="text-black/50 text-[16px]">
                                        Our smart filter catches bad words, avoid takedowns due to inappropriate language and keep your videos up and earning.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button className="bg-primary rounded-xl w-min font-semibold text-lg px-5 py-6 mt-16">
                            <Link href="/dashboard">
                                Boost views now
                            </Link>
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </section>
                <section className="bg-background w-screen z-50">
                    <div className="max-w-fit px-2 mx-auto md:py-32 items-center text-center">
                        <h3 className={`mb-4 text-center leading-none text-[48px] ${Satoshi.className} font-black text-black`}>
                            Post like the <span className="underline underline-offset-8 decoration-primary decoration-dashed text-primary">best influencers</span>
                        </h3>
                        <p className="mt-4 mb-10 text-black/50 text-[20px]">
                            Dominate your niche with AI-crafted shorts, crush it with influencer-level impact.
                        </p>
                        <div className="grid grid-cols-4 gap-5">
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
                        <Button className="bg-primary rounded-xl w-min font-semibold text-lg px-5 py-6 mt-16">
                            <Link href="/dashboard">
                                Post now
                            </Link>
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </section>
                <section className="bg-background w-screen z-50">
                    <div className="flex flex-col items-center justify-center min-h-screen">
                        <h1 className="text-[32px] md:text-[36px] lg:text-[48px] font-bold text-center mb-4 mt-24    lg:mt-0 leading-tight">
                            Start making <span className="text-primary underline underline-offset-8 decoration-primary decoration-dashed">amazing videos, today.</span>
                        </h1>
                        <p className="text-[18px] text-black/50 text-center mb-8">
                            No hidden fees. Videos never expire.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                            {plans.map((plan, index) => (
                                <Card key={index} className={`w-full ${plan.popular ? "border-primary/80 border-2 relative" : ""}`}>
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                                            Most Popular
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="mb-1 text-xl">{plan.title}</CardTitle>
                                        <CardDescription className="mb-4">{plan.description}</CardDescription>
                                        <span className="text-4xl font-bold">${plan.price}</span>
                                        <CardDescription className="mb-4">{plan.priceDescription}</CardDescription>
                                        <Button className="w-full rounded-xl transition-transform duration-300 ease-in-out hover:scale-95" asChild>
                                            <Link href={`https://buy.stripe.com/${plan.paymentLink}`}>
                                                {plan.cta}
                                            </Link>
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid w-full items-center gap-2 text-sm">
                                            {plan.features.map((feature, index) => (
                                                <span key={index} className="flex items-center">
                                                    <CircleCheck className="mr-2 w-4 h-4 text-green-400 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <Separator className="w-[90%] mx-auto mb-4" />
                                    <CardFooter className="flex flex-col items-start">
                                        <Label className="text-lg mb-4">Features</Label>
                                        <div className="grid w-full items-start gap-2 text-sm">
                                            {features.map((feature, index) => (
                                                <span key={index} className="flex items-center">
                                                    <CircleCheck className="mr-2 w-4 h-4 text-green-400 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div >
    );
}