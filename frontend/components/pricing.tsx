"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, X } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { type User } from "@/types/constants"
import { usePathname } from 'next/navigation'

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
        title: "Solo",
        emoji: "🙂",
        description: "Starting in content creation",
        paymentLink: "test_6oE5lkfHz0ZGes0000",
        price: 20,
        features: [
            "20 videos",
            "5GB of storage",
            "3 minutes / video",
        ],
        cta: "Get Started",
    },
    {
        title: "Creator",
        emoji: "🤩",
        description: "For growing businesses",
        paymentLink: "test_6oE5lkfHz0ZGes0000",
        price: 50,
        features: [
            "50 videos",
            "10GB of storage",
            "5 minutes / video",
        ],
        cta: "Upgrade to Creator",
        popular: true,
    },
    {
        title: "Teams",
        emoji: "🚀",
        description: "For large businesses",
        paymentLink: "test_6oE5lkfHz0ZGes0000",
        price: 100,
        features: [
            "100 videos",
            "20GB of storage",
            "10 minutes / video",
        ],
        cta: "Contact Sales",
    },
]

export function Pricing({ className, user }: { className?: string; user?: User | null }) {
    const pathname = usePathname()
    const showComparePlans = pathname === '/add-credits'

    return (
        <div className={`${className} py-16 px-4 sm:px-6 lg:px-8`}>
            <div className="max-w-7xl mx-auto mt-16">
                <h1 className="text-4xl sm:text-5xl font-extrabold mb-8">
                    Start making <span className="text-primary">amazing videos</span>, today.
                </h1>
                <p className="text-xl text-muted-foreground text-center mb-12">
                    No hidden fees. <span className="decoration underline decoration-dashed underline-offset-4">One-time</span> payment. Choose the plan that&apos;s right for you.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <Card key={index} className={`flex flex-col ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}>
                            <CardHeader>
                                <div className="flex justify-between items-center mb-4">
                                    <CardTitle className="text-2xl font-bold">{plan.title}</CardTitle>
                                    <span className="text-3xl">{plan.emoji}</span>
                                </div>
                                <CardDescription className="text-lg mb-4">{plan.description}</CardDescription>
                                <div className="text-4xl font-bold mb-2">
                                    ${plan.price}
                                    <span className="text-lg font-normal text-muted-foreground"> one-time</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center">
                                            <Check className="mr-2 h-5 w-5 text-primary" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full text-lg py-6" variant={plan.popular ? "default" : "outline"} asChild>
                                    <Link href={`https://buy.stripe.com/${plan.paymentLink}?prefilled_email=${user?.email}&client_reference_id=${user?.id}`}>
                                        {plan.cta}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {showComparePlans && (
                    <>
                        <Separator className="my-16" />

                        <h2 className="text-3xl font-bold text-center mb-8">Compare Plans</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-4 px-6 text-left">Feature</th>
                                        {plans.map((plan, index) => (
                                            <th key={index} className="py-4 px-6 text-center">{plan.title}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {features.map((feature, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="py-4 px-6">{feature}</td>
                                            {plans.map((plan, planIndex) => (
                                                <td key={planIndex} className="py-4 px-6 text-center">
                                                    {planIndex === 0 && feature !== "Custom Music" ? (
                                                        <Check className="mx-auto h-5 w-5 text-primary" />
                                                    ) : planIndex === 1 && feature !== "Custom Music" ? (
                                                        <Check className="mx-auto h-5 w-5 text-primary" />
                                                    ) : planIndex === 2 ? (
                                                        <Check className="mx-auto h-5 w-5 text-primary" />
                                                    ) : (
                                                        <X className="mx-auto h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}