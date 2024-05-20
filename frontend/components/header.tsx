import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import Avvvatars from "avvvatars-react";
import {
    Banknote,
    CreditCard,
    Gift,
    LogOut,
    Settings,
    User,
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from 'next/navigation';
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect, useState } from "react"
import { toast } from "sonner";
import { usePathname } from 'next/navigation';
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link";
import Image from "next/image";
import local from "next/font/local";

export default function Header({ user_email }: { user_email: string }) {
    const router = useRouter();
    const [feedbackText, setFeedbackText] = useState("");
    const [credits, setCredits] = useState(0);
    const [avatar, setAvatar] = useState(localStorage.getItem(`avatar_${user_email}`) || "");
    const pathname = usePathname();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace('/login');
    };

    async function sendFeedback() {
        if (feedbackText.trim().length < 3 || feedbackText.trim().length > 150) {
            toast.error('Feedback text must be between 3 and 150 characters.');
            return;
        }

        if (/<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([^>]+)>/i.test(feedbackText)) {
            toast.error('Feedback text cannot contain HTML tags.');
            return;
        }

        const user_id = (await supabase.auth.getUser()).data?.user?.id;

        const { data, error } = await supabase
            .from('feedback')
            .insert([
                {
                    user_id: user_id,
                    feedback: feedbackText,
                    page: pathname,
                    email: user_email
                }
            ]);

        if (error) {
            toast.error('An error occurred while sending feedback.');
        }
        else {
            toast.success('Feedback sent successfully. Thank you!');
        }

        setFeedbackText("");
    }

    async function getCredits() {
        const id = (await supabase.auth.getUser()).data?.user?.id;
        const { data, error } = await supabase
            .from('profiles')
            .select('credits,avatar')
            .eq('id', id);

        if (error) {
            toast.error(error.message);
        }

        if (data && data.length > 0) {
            if (data[0].avatar) {
                setAvatar(data[0].avatar);
                localStorage.setItem(`avatar_${user_email}`, data[0].avatar);
            }
            if (data[0].credits)
                setCredits(Number(data[0].credits));
        }
    }

    useEffect(() => {
        getCredits();
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-10 container">
            <div className="sticky flex justify-between items-center py-8 sm:px-6 md:px-8">
                <div className="flex justify-start items-center">
                    {pathname.split('/').length > 2 &&
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/dashboard">dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{pathname.split('/')[1]}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    }
                </div>
                <div className="flex justify-end items-center">
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="mr-4 md:mr-8">Feedback</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                    <Label>Feedback</Label>
                                    <Textarea
                                        placeholder="Ideas on how to improve"
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        value={feedbackText}
                                    />
                                    <Button
                                        variant={"outline"}
                                        onClick={async () => await sendFeedback()}
                                    >
                                        Send feedback
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Button className="mr-6 md:mr-8" variant={"outline"} asChild>
                            <Link href="/pricing">
                                Add more videos
                            </Link>
                        </Button>
                    </div>
                    <div className="flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <a className="cursor-pointer">
                                    {avatar !== "" ?
                                        <Image src={avatar} alt="avatar" width={40} height={40} className="rounded-full w-[40px] h-[40px]" priority />
                                        :
                                        <Avvvatars value={user_email} shadow={true} size={40} />
                                    }
                                </a>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 mr-8 mt-2">
                                <DropdownMenuLabel>{user_email}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <Banknote className="mr-2 h-4 w-4" />
                                        <span>{credits} videos</span>
                                        {/* <DropdownMenuShortcut>⌘B</DropdownMenuShortcut> */}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Gift className="mr-2 h-4 w-4" />
                                        <span>Get $10 free</span>
                                        {/* <DropdownMenuShortcut>⌘B</DropdownMenuShortcut> */}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                        {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        <span>Billing</span>
                                        {/* <DropdownMenuShortcut>⌘B</DropdownMenuShortcut> */}
                                    </DropdownMenuItem>
                                    {/* <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                                </DropdownMenuItem> */}
                                </DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => handleSignOut()}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                    {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </nav>
    );
}