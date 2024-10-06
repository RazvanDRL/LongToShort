"use client";
import Header from "@/components/header";

export default function Contact() {
    return (
        <>
            <Header />
            <div className="mt-16 max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
                <p className="mb-6">Have a question or feedback? We'd love to hear from you!</p>
                <p className="text-lg">
                    Please contact us at:{" "}
                    <a
                        href="mailto:contact@autosubs.io"
                        className="text-blue-600 hover:underline"
                    >
                        contact@autosubs.io
                    </a>
                </p>
            </div>
        </>
    );
}
