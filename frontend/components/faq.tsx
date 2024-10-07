import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
    {
        question: "How does the AI subtitle generation work?",
        answer: "Our AI uses advanced speech recognition and natural language processing to automatically generate accurate subtitles for your videos. Simply upload your video, and our system will process it to create subtitles in minutes."
    },
    {
        question: "Can I edit the generated subtitles?",
        answer: "Yes, you can easily edit the generated subtitles through our user-friendly interface. This allows you to make any necessary adjustments or corrections to ensure perfect accuracy."
    },
    {
        question: "What video formats are supported?",
        answer: "We support a wide range of video formats including MP4, AVI, MOV, and more. If you have a specific format not listed, please contact our support team for assistance."
    },
    {
        question: "How long does it take to process a video?",
        answer: "Processing time depends on the length and complexity of your video. Most videos are processed within minutes, but longer videos may take up to an hour. You'll be notified as soon as your subtitles are ready."
    },
    {
        question: "Is my content secure?",
        answer: "Yes, we take data security very seriously. All uploaded content is encrypted and processed on secure servers. We do not share or use your content for any purpose other than generating subtitles."
    },
    {
        question: "Do you offer support for multiple languages?",
        answer: "Yes, our AI can generate subtitles in multiple languages. We currently support over 50 languages, with more being added regularly. You can also translate existing subtitles to other languages."
    }
];

export function FAQ({ className }: { className?: string }) {
    return (
        <div className={className}>
            <h2 className={`mb-12 text-center text-[28px] sm:text-[36px] font-black`}>
                Frequently Asked Questions
            </h2>
            <div className="w-full max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                    {faqData.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index + 1}`}>
                            <AccordionTrigger>{item.question}</AccordionTrigger>
                            <AccordionContent>{item.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}