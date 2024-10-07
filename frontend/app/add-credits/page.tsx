"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import { type User } from "@/types/constants";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { Pricing } from "@/components/pricing";
import { Footer } from "@/components/footer";

export default function AddCredits() {
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
            <Pricing className="flex flex-col items-center justify-center min-h-screen" user={user} />
            <Footer />
        </div>
    );
}