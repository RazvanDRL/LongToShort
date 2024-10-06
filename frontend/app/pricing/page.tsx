"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
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
import { CircleCheck, Loader2 } from "lucide-react";
import { type User } from "@/types/constants";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Link from "next/link";

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

export default function Pricing() {
    const router = useRouter();
    const [shouldRender, setShouldRender] = useState(false);
    const [user, setUser] = useState<User | null>(null);

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

    useEffect(() => {
        const runPrecheck = async () => {
            const result = await handleSignedIn();
            if (!result) {
                if (!user) return;
                setShouldRender(true);
            }
        };
        runPrecheck();
    }, [user?.id]);

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
            {user ? <Header /> : null}
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
                                    <Link href={`https://buy.stripe.com/${plan.paymentLink}?prefilled_email=${user?.email}&client_reference_id=${user?.id}`}>
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
        </div>
    );
}