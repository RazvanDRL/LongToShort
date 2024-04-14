"use client";
import React from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Rating } from "flowbite-react";

import Stars from "@/public/stars.svg";
import Image from "next/image";

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
        <div className="relative w-full">
            {/* <GridSmallBackgroundDemo /> */}
            <Navbar />
            <div className="flex flex-col items-center justify-start min-h-screen pt-32 z-20">
                <p className="text-4xl sm:text-7xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8">
                    Create viral shorts in seconds with AI
                </p>
                <p className="text-lg sm:text-2xl font-semibold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8">
                    Create viral shorts in seconds with AI
                </p>
                <Button className="w-48 text-xl py-6 px-2 z-20">Get started</Button>
                <div className="text-gray-300/50 z-20">(No credit card required)</div>
                {/* add stars review svg */}
                <Rating>
                    <Rating.Star />
                    <Rating.Star />
                    <Rating.Star />
                    <Rating.Star />
                    <Rating.Star />
                    <p className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">4.8 out of 5</p>
                </Rating>
                <span className="text-gray-300/50 mt-2 z-20">(loved by 100+ creators)</span>
            </div>
        </div>
    );
}