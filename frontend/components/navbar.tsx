import { Button } from "@/components/ui/button";
import Image from "next/image";
import Logo from "@/public/autosubs.svg";
import React from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";



export default function Navbar() {
    return (
        <div className="md:container md:mx-auto w-full top-0 left-0 right-0 z-50 bg-background">
            <div className="flex justify-between items-center md:py-10 md:px-10 pt-4 bg-background text-black">
                <div>
                    <Image src={Logo} alt="Logo" className=" w-48 h-auto" />
                </div>

                <div>
                    <Button className="text-md font-semibold bg-black" asChild>
                        <Link href="/dashboard">
                            <LogIn className="w-4 h-4 mr-2" />
                            Login
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}