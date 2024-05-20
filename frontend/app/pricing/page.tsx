"use client";
import { useState, useEffect } from "react";
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

export default function Home() {
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
            router.push("/login");
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
                <div className="bg-[#0a0a0a] z-50 w-16 h-16 flex justify-center items-center">
                    <Loader2 className="relative animate-spin w-16 h-16 text-primary" />
                </div>
            </div>
        );
    }


    return (
        <div className="container">
            {user ? <Header user_email={user.email} /> : null}
            <div className="w-full h-screen flex justify-center items-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <Card key={index} className={`w-[350px] ${plan.title === plans[1].title ? "border-blue-500/50" : ""}`}>
                            <CardHeader>
                                <CardTitle className="mb-1">{plan.title}</CardTitle>
                                <CardDescription className="mb-8">{plan.description}</CardDescription>
                                <span className="pt-3 text-5xl font-bold">${plan.price}</span>
                                <CardDescription className="pb-2">{plan.priceDescription}</CardDescription>
                                <Button className="rounded-xl" asChild>
                                    <Link href={`https://buy.stripe.com/${plan.paymentLink}?prefilled_email=${user?.email}&client_reference_id=${user?.id}`}>
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
            </div>
        </div>
    );
}