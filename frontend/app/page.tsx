"use client";
import React from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Rating } from "flowbite-react";
import localFont from 'next/font/local'

const Satoshi = localFont({
    src: '../public/Satoshi.ttf',
    display: 'swap',
})

function GridSmallBackgroundDemo() {
    return (
        <div className="h-screen w-full dark:bg-black bg-white  dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] flex items-center justify-center z-10 absolute">
            {/* Radial gradient for the container to give a faded look */}
            <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            <p className="text-4xl sm:text-7xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8">
            </p>
        </div>
    );
}

export default function Home() {
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
                <p className={`${Satoshi.className} text-4xl sm:text-7xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8`}>
                    Focus on creating{`,`} not editing
                </p>
                {/* description */}
                <p className={`mb-12 text-md font-medium relative z-20 text-neutral-400 text-center`}>
                    Effortlessly create viral video shorts with our AI-powered platform
                    <br />
                    Captivate your audience and stay ahead of trends in seconds - no editing required
                </p>
                <Button className="w-48 text-xl py-6 px-2 z-20">Get started</Button>
            </div>
        </div>
    );
}