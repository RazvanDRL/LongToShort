"use client";
import React, { useState } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import localFont from 'next/font/local'
import { Player } from "@remotion/player";
import { Landing } from "@/remotion/MyComp/Landing";
import { staticFile } from "remotion";
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { ArrowDown, ArrowRight, CircleCheck, Star } from "lucide-react";
import Footer from "@/components/footer";

const slides = [
    { url: "/videos/1.mp4" },
    { url: "/videos/2.mp4" },
    { url: "/videos/3.mp4" },
    { url: "/videos/4.mp4" },
    { url: "/videos/5.mp4" },
    { url: "/videos/6.mp4" },
];

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
        title: "Starter",
        description: "Starting in content creation",
        paymentLink: "test_6oE5lkfHz0ZGes0000",
        price: 20,
        priceDescription: "One time",
        features: [
            "20 videos per month",
            "5GB of storage",
            "3 minutes / video",
        ]
    },
    {
        title: "Pro",
        description: "For growing businesses",
        paymentLink: "test_6oE5lkfHz0ZGes0000",
        price: 50,
        priceDescription: "One time",
        features: [
            "50 videos per month",
            "10GB of storage",
            "5 minutes / video",
        ]
    },
    {
        title: "Enterprise",
        description: "For large businesses",
        paymentLink: "test_6oE5lkfHz0ZGes0000",
        price: 100,
        priceDescription: "One time",
        features: [
            "100 videos per month",
            "20GB of storage",
            "10 minutes / video",
        ]
    },
]

const Satoshi = localFont({
    src: '../public/fonts/Satoshi.woff2',
    display: 'swap',
})

const Poppins = localFont({
    src: '../public/fonts/Poppins.woff2',
    display: 'swap',
})


export default function Home() {
    const [showSubtitles, setShowSubtitles] = useState(false)
    const duplicatedSlides = [...slides, ...slides];

    return (
        <div className="container mx-auto bg-background">
            <Navbar />
            <div className="flex flex-col items-center justify-start min-h-screen pt-32 z-20">
                {/* testimonials */}
                {/* <div className="grid grid-cols-3 gap-12">
                    <div className="col-span-1">
                        <div className="text-center mt-4">
                            <div className="flex justify-center">
                                <div className="flex justify-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                </div>
                            </div>
                            <p className="mt-2 text-md font-medium text-neutral-700">
                                {`"`}No annoying watermarks{`"`}
                            </p>
                        </div>
                    </div>
                    <div className="col-span-1">
                        <div className="text-center mt-4">
                            <div className="flex justify-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </div>
                            <p className="mt-2 text-md font-medium text-neutral-700">
                                {`"`}Lightning fast transcriptions{`"`}
                            </p>
                        </div>
                    </div>
                    <div className="col-span-1">
                        <div className="text-center mt-4">
                            <div className="flex justify-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </div>
                            <p className="mt-2 text-md font-medium text-neutral-700">
                                {`"`}Viral templates{`"`}
                            </p>
                        </div>
                    </div>
                </div> */}

                {/* video demo */}

                {/* <div className="">
                    <Player
                        className="rounded-xl"
                        component={Landing}
                        durationInFrames={1000}
                        compositionWidth={1080 / 6}
                        compositionHeight={1920 / 6}
                        inputProps={{ video: `${staticFile('/videos/tristan_slovak.mp4')}`, showSubtitles }}
                        autoPlay
                        loop
                        initiallyMuted
                        clickToPlay
                        fps={30}
                    />
                    <Button
                        className="hover:cursor-pointer mt-6 rounded-lg relative"
                        onClick={() => setShowSubtitles(true)}
                    >
                        <Image src="/cursors/hand_pointing.svg" alt="Pointing Hand" className="animate-bounce absolute -bottom-[7px] left-[90%] transform -translate-x-1/2 -mb-2.5" height={24} width={24} />
                        ✨ Generate subtitles
                    </Button>
                </div> */}
                {/* Hero */}
                <div className="sticky z-0 top-0 flex flex-col gap-16 items-center">
                    <h1 className={`text-left leading-none text-[60px] ${Satoshi.className} font-black`}>
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
                        <Button className="bg-primary rounded-xl w-min font-semibold text-lg px-5 py-6">
                            <Link href="/login">
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

                <section className="relative mt-96 w-screen bg-primary rounded-t-[60px] z-10">
                    <div className="max-w-7xl mx-auto px-8 py-16 md:py-32 items-center text-center">
                        <div className="py-32">
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
                        </div>
                    </div>


                </section>
                <section className="bg-white w-screen z-10 py-16">
                    <div className="max-w-7xl mx-auto px-8 py-16 md:py-32 items-center text-center">
                        <h2 className={`text-center leading-none text-[48px] ${Satoshi.className} font-black text-black`}>
                            The #1 Views Booster 🚀
                        </h2>
                        <p className="mt-4 mb-16 text-black/50 text-[20px]">
                            Boost views, engagement, and retention of your videos with one magical click.
                        </p>
                        <div className="grid grid-row-2 grid-cols-2 gap-8 text-black text-left">
                            <div className="border border-neutral-100 p-8 col-span-1 row-span-1 bg-background rounded-xl flex items-center drop-shadow-xl">
                                <div className="text-7xl mr-6">
                                    😉
                                </div>
                                <div>
                                    <h3 className="text-[24px] font-[800] mb-2">
                                        Trendy Captions & Emojis
                                    </h3>
                                    <p className="text-black/50 text-[16px]">
                                        LongToShort&apos;s AI creates stylish video captions in 48 languages, making your content stand out.
                                    </p>
                                </div>
                            </div>
                            <div className="border border-neutral-100 p-8 col-span-1 row-span-1 bg-background rounded-xl flex items-center drop-shadow-xl">
                                <div className="text-7xl mr-6">
                                    ✍️
                                </div>
                                <div>
                                    <h3 className="text-[24px] font-[800] mb-2">
                                        Trendy Captions & Emojis
                                    </h3>
                                    <p className="text-black/50 text-[16px]">
                                        LongToShort&apos;s AI creates stylish video captions in 48 languages, making your content stand out.
                                    </p>
                                </div>
                            </div>
                            <div className="border border-neutral-100 p-8 col-span-1 row-span-1 bg-background rounded-xl flex items-center drop-shadow-xl">
                                <div className="text-7xl mr-6">
                                    ✨
                                </div>
                                <div>
                                    <h3 className="text-[24px] font-[800] mb-2">
                                        Trendy Captions & Emojis
                                    </h3>
                                    <p className="text-black/50 text-[16px]">
                                        LongToShort&apos;s AI creates stylish video captions in 48 languages, making your content stand out.
                                    </p>
                                </div>
                            </div>
                            <div className="border border-neutral-100 p-8 col-span-1 row-span-1 bg-background rounded-xl flex items-center drop-shadow-xl">
                                <div className="text-7xl mr-6">
                                    🏆
                                </div>
                                <div>
                                    <h3 className="text-[24px] font-[800] mb-2">
                                        Trendy Captions & Emojis
                                    </h3>
                                    <p className="text-black/50 text-[16px]">
                                        LongToShort&apos;s AI creates stylish video captions in 48 languages, making your content stand out.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="bg-neutral-800 w-screen z-10">
                    <div className="max-w-7xl mx-auto px-8 py-16 md:py-32 items-center text-center">
                        <h3 className={`mb-32 text-center leading-none text-[32px] ${Satoshi.className} font-black text-white`}>
                            Be like the top 1%
                        </h3>
                        <div className="container overflow-hidden w-full rounded-lg relative">
                            <div className="absolute inset-0 z-20 before:absolute before:left-0 before:top-0 before:w-1/4 before:h-full before:bg-gradient-to-r before:from-neutral-800 before:to-transparent before:filter before:blur-3 after:absolute after:right-0 after:top-0 after:w-1/4 after:h-full after:bg-gradient-to-l after:from-neutral-800 after:to-transparent after:filter after:blur-3"></div>
                            <motion.div
                                className="flex"
                                animate={{
                                    x: ['-100%', '0%'],
                                    transition: {
                                        ease: 'linear',
                                        duration: 20,
                                        repeat: Infinity,
                                    }
                                }}
                            >
                                {duplicatedSlides.map((slide, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex-shrink-0 px-8 relative"
                                        style={{ width: `${100 / slides.length * 1.5}%` }}
                                    >
                                        <motion.video
                                            className="rounded-lg"
                                            src={slide.url}
                                            autoPlay
                                            loop
                                            muted
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Video slider */}
                {/* <div className="container overflow-hidden w-3/4 my-48 rounded-lg py-8 relative">
                    <div className="absolute inset-0 z-20 before:absolute before:left-0 before:top-0 before:w-1/4 before:h-full before:bg-gradient-to-r before:from-background before:to-transparent before:filter before:blur-3 after:absolute after:right-0 after:top-0 after:w-1/4 after:h-full after:bg-gradient-to-l after:from-background after:to-transparent after:filter after:blur-3"></div>
                    <motion.div
                        className="flex"
                        animate={{
                            x: ['-100%', '0%'],
                            transition: {
                                ease: 'linear',
                                duration: 20,
                                repeat: Infinity,
                            }
                        }}
                    >
                        {duplicatedSlides.map((slide, index) => (
                            <motion.div
                                key={index}
                                className="flex-shrink-0 px-8 relative"
                                style={{ width: `${100 / slides.length * 1.5}%` }}
                            >
                                <motion.video
                                    className="rounded-lg"
                                    src={slide.url}
                                    autoPlay
                                    loop
                                    muted
                                    whileHover={{
                                        scale: 1.1,
                                    }}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </div> */}

                {/* Pricing */}
                {/* <div className="w-full h-screen flex justify-center items-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => (
                            <Card key={index} className={`w-[350px] ${plan.title === plans[1].title ? "border-blue-500/50" : ""}`}>
                                <CardHeader>
                                    <CardTitle className="mb-1">{plan.title}</CardTitle>
                                    <CardDescription className="mb-8">{plan.description}</CardDescription>
                                    <span className="pt-3 text-5xl font-bold">${plan.price}</span>
                                    <CardDescription className="pb-2">{plan.priceDescription}</CardDescription>
                                    <Button className="rounded-xl" asChild>
                                        <Link href="/pricing">
                                            Get Started
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid w-full items-center gap-4 text-sm">
                                        {plan.features.map((feature, index) => (
                                            <span key={index}>
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                                <Separator className="w-[90%] mx-auto mb-4" />
                                <CardFooter className="grid">
                                    <Label className="text-lg mb-4">Features</Label>
                                    <div className="grid w-full items-center gap-4 text-sm">
                                        {features.map((feature, index) => (
                                            <span key={index} className="flex items-center">
                                                <CircleCheck className="mr-2 w-6 h-6 text-green-400" />
                                                <span>{feature}</span>
                                            </span>
                                        ))}
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div> */}
                {/* Footer */}
                {/* <Footer /> */}
            </div>
        </div >
    );
}