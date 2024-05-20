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

const BricolageGrotesque = localFont({
    src: '../public/BricolageGrotesque.woff2',
    display: 'swap',
})

export default function Home() {
    const [showSubtitles, setShowSubtitles] = useState(false)

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
                <div className="container mt-16 grid grid-cols-10 grid-rows-10 w-2/3 gap-8">
                    <div className="rounded-xl col-span-3 row-span-4 bg-transparent border border-netural-800/80 p-4">
                        <h1 className="text-2xl font-bold text-white">Add subtitles to any video</h1>
                        <p className="mt-2 text-md font-base text-neutral-400/80">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec dui vel magna.
                        </p>
                        <Player
                            className="mt-6 rounded-xl"
                            component={Landing}
                            durationInFrames={1000}
                            compositionWidth={1080 / 5}
                            compositionHeight={1920 / 5}
                            inputProps={{ video: `${staticFile('tristan_slovak.mp4')}`, showSubtitles }}
                            autoPlay
                            loop
                            initiallyMuted
                            clickToPlay
                            fps={30}
                        />
                        <Button
                            className="hover:cursor-pointer mt-6 rounded-lg"
                            onClick={() => setShowSubtitles(true)}
                        >✨ Generate subtitles</Button>
                        <Image src="/cursors/hand_pointing.svg" alt="alisa" className="ml-[145px] -mt-2.5 absolute" height={24} width={24} />
                    </div>
                    <div className="flex rounded-xl col-span-7 row-span-2 bg-transparent border border-netural-800/80 p-4">
                        <div className="w-1/2">
                            <h1 className="text-2xl font-bold text-white">Choose between the most popular styles</h1>
                            <p className="mt-2 text-md font-base text-neutral-400/80">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec dui vel magna.
                            </p>
                        </div>
                        <div className="ml-8 flex overflow-hidden"> {/* Positioned to bottom-left */}
                            <Image
                                src="/bento2.png"
                                alt="Bento box"
                                className="w-full"
                                width={256} // Set the desired width
                                height={1024}
                            />
                        </div>
                    </div>
                    <div className="rounded-xl col-span-7 row-span-2 bg-transparent border border-netural-800/80 p-4">
                        <h1 className="text-2xl font-bold text-white w-1/2">Add subtitles to any video</h1>
                        <p className="mt-2 text-md font-base text-neutral-400/80 w-1/2">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec dui vel magna.
                        </p>
                    </div>
                </div>
                {/* Video slider */}
                {/* Steps to take */}
                {/* Pricing */}
                {/* Footer */}
            </div>
        </div>
    );
}