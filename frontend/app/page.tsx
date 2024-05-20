"use client";
import React, { useState } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Rating } from "flowbite-react";
import Image from "next/image";
import localFont from 'next/font/local'
import { Player } from "@remotion/player";
import { Landing } from "@/remotion/MyComp/Landing";
import { staticFile } from "remotion";
import { motion } from 'framer-motion';

// Define the array of slides with numbers
const slides = [
    { url: "/videos/1.mp4" },
    { url: "/videos/2.mp4" },
    { url: "/videos/3.mp4" },
    { url: "/videos/4.mp4" },
    { url: "/videos/5.mp4" },
    { url: "/videos/6.mp4" },
];

const BricolageGrotesque = localFont({
    src: '../public/fonts/BricolageGrotesque.woff2',
    display: 'swap',
})

export default function Home() {
    const [showSubtitles, setShowSubtitles] = useState(false)
    const duplicatedSlides = [...slides, ...slides];
    return (
        <div className="relative w-full bg-black">
            {/* <GridSmallBackgroundDemo /> */}
            <Navbar />
            <div className="flex flex-col items-center justify-start min-h-screen pt-32 z-20">
                {/* grid */}
                <div className="grid grid-cols-3 gap-12">
                    {/* 1st testimonial */}
                    <div className="col-span-1">
                        <div className="text-center mt-4">
                            <div className="flex justify-center">
                                <Rating className="items-center">
                                    <Rating.Star />
                                    <Rating.Star />
                                    <Rating.Star />
                                    <Rating.Star />
                                    <Rating.Star />
                                </Rating>
                            </div>
                            <p className="mt-2 text-md font-medium text-gray-200 dark:text-gray-300">
                                {`"`}No annoying watermarks{`"`}
                            </p>
                        </div>
                    </div>

                    <div className="col-span-1">
                        <div className="text-center mt-4">
                            <div className="flex justify-center">
                                <Rating className="items-center">
                                    <Rating.Star />
                                    <Rating.Star />
                                    <Rating.Star />
                                    <Rating.Star />
                                    <Rating.Star />
                                </Rating>
                            </div>
                            <p className="mt-2 text-md font-medium text-gray-200 dark:text-gray-300">
                                {`"`}Lightning fast transcriptions{`"`}
                            </p>
                        </div>
                    </div>
                    <div className="col-span-1">
                        <div className="text-center mt-4">
                            <div className="flex justify-center">
                                <Rating className="items-center">
                                    <Rating.Star />
                                    <Rating.Star />
                                    <Rating.Star />
                                    <Rating.Star />
                                    <Rating.Star />
                                </Rating>
                            </div>
                            <p className="mt-2 text-md font-medium text-gray-200 dark:text-gray-300">
                                {`"`}98{`%`} accurate transcriptions{`"`}
                            </p>
                        </div>
                    </div>
                </div>
                <p className={`${BricolageGrotesque.className} text-4xl sm:text-7xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-16`}>
                    Focus on creating{`,`} not editing
                </p>
                {/* description */}
                <p className={`mb-12 text-md font-medium relative z-20 text-neutral-400 text-center`}>
                    Effortlessly create viral video shorts with our AI-powered platform
                </p>
                <Button className="w-48 text-xl py-6 px-2 z-20">Get started</Button>
                <div className="mt-8 flex -space-x-1 overflow-hidden">
                    <Image src="/unnamed.png" alt="alisa" className="inline-block rounded-full ring-4 ring-black" height={32} width={32} />
                    <Image src="/unnamed.png" alt="alisa" className="inline-block rounded-full ring-4 ring-black" height={32} width={32} />
                    <Image src="/unnamed.png" alt="alisa" className="inline-block rounded-full ring-4 ring-black" height={32} width={32} />
                    <div className="text-sm flex items-center justify-center bg-green-500 h-8 w-8 rounded-full ring-4 ring-black">
                        +1
                    </div>
                </div>
                {/* Features */}
                {/* <div className="container mt-16 grid grid-cols-2 w-2/3 gap-4">
                    <div className="col-span-1 bg-green-500 p-16">
                        <Image src="/kissing_heart.png" alt="emoji" height={64} width={64} />
                        Negrul meu
                    </div>
                    <div className="col-span-1 bg-white p-16">
                    </div>
                </div> */}
                <div className="container mt-16 grid grid-cols-12 grid-rows-4 w-2/3 gap-8">
                    <div className="rounded-xl col-span-5 row-span-4 bg-transparent border border-neutral-700/80 p-8">
                        <h1 className="text-2xl font-bold text-white">Add subtitles to any video</h1>
                        <p className="mt-2 text-md font-base text-neutral-400/80">
                            Lorem ipsum dolor sit amet, d adipiscing elit. Nulla nec dui vel magna.
                        </p>
                        <div className="flex flex-col items-center justify-center mt-6 rounded-xl">
                            <Player
                                className="rounded-xl"
                                component={Landing}
                                durationInFrames={1000}
                                compositionWidth={1080 / 5}
                                compositionHeight={1920 / 5}
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
                                <Image src="/cursors/hand_pointing.svg" alt="Pointing Hand" className="absolute -bottom-[6px] left-[94%] transform -translate-x-1/2 -mb-2.5" height={24} width={24} />
                                ✨ Generate subtitles
                            </Button>
                        </div>
                    </div>
                    <div className="flex rounded-xl col-span-7 row-span-2 bg-transparent border border-neutral-700/80 p-8 relative overflow-hidden">
                        <div className="w-1/2">
                            <h1 className="text-2xl font-bold text-white">Choose between the most popular styles</h1>
                            <p className="mt-2 text-md font-base text-neutral-400/80">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec dui vel magna.
                            </p>
                        </div>
                        <div className="absolute -right-16 overflow-hidden w-1/2">
                            <Image
                                src="/bento2.png"
                                alt="Bento box"
                                className="w-full"
                                width={2048} // Set the desired width
                                height={2048}
                                priority
                                quality={100}
                            />
                        </div>
                    </div>
                    <div className="rounded-xl col-span-7 row-span-2 bg-transparent border border-neutral-700/80 p-8">
                        <h1 className="text-2xl font-bold text-white w-1/2">Add subtitles to any video</h1>
                        <p className="mt-2 text-md font-base text-neutral-400/80 w-1/2">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec dui vel magna.
                        </p>
                    </div>
                </div>
                {/* Video slider */}
                <div className="container overflow-hidden w-2/3 my-48 rounded-lg py-8 relative">
                    <div className="absolute inset-0 z-20 before:absolute before:left-0 before:top-0 before:w-1/4 before:h-full before:bg-gradient-to-r before:from-black before:to-transparent before:filter before:blur-3 after:absolute after:right-0 after:top-0 after:w-1/4 after:h-full after:bg-gradient-to-l after:from-black after:to-transparent after:filter after:blur-3"></div>
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
                </div>
                {/* Steps to take */}
                {/* Pricing */}
                {/* Footer */}
            </div>
        </div >
    );
}