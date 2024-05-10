"use client";
import React from "react";
import { Button } from "@/components/ui/button";
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
import { CircleCheck } from "lucide-react";

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
        price: 100,
        priceDescription: "One time",
        features: [
            "100 videos per month",
            "20GB of storage",
            "10 minutes / video",
        ]
    },
]

export default function Home() {

    return (
        <div className="relative w-full h-screen bg-black flex justify-center items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                    <Card key={index} className={`w-[350px] ${plan.title === plans[1].title ? "border-blue-500/50" : ""}`}>
                        <CardHeader>
                            <CardTitle className="mb-1">{plan.title}</CardTitle>
                            <CardDescription className="mb-8">{plan.description}</CardDescription>
                            <span className="pt-3 text-5xl font-bold">${plan.price}</span>
                            <CardDescription className="pb-2">{plan.priceDescription}</CardDescription>
                            <Button className="rounded-xl">Get Started</Button>
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
        </div>
    );
}