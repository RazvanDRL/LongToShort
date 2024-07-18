import { Button } from "@/components/ui/button";
import Image from "next/image";
import Logo from "@/public/longtoshort.svg";
import React from "react";
import Link from "next/link";



export default function Navbar() {
    return (
        <div className="container mx-auto w-full top-0 left-0 right-0 z-50 bg-background">
            <div className="flex justify-between items-center py-10 px-10 bg-background text-black">
                <div>
                    <Image src={Logo} alt="Logo" className="invert w-48 h-auto" />
                </div>

                <div>
                    <Button className="text-md font-semibold bg-black" asChild>
                        <Link href="/dashboard">Login</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}