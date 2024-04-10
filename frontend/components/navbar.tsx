import { Button } from "@/components/ui/button";
import Image from "next/image";
import Logo from "@/public/longtoshort.svg";
import React from "react";
import Link from "next/link"

export default function Navbar() {
    const navItems = [
        { name: "Home", link: "/" },
        { name: "About", link: "/about" },
        { name: "Contact", link: "/contact" },
    ];

    return (
        <div className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-900">
            <div className="flex justify-between items-center py-4 px-8 bg-transparent text-white max-w-screen-lg mx-auto">
                <div>
                    <Image src={Logo} alt="Logo" className="w-48 h-auto" />
                </div>
                <div>
                    <ul className="flex space-x-12">
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <a href={item.link}>{item.name}</a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <Button asChild>
                        <Link href="/dashboard">Dashboard</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}