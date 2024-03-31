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
    CreditCard,
    LogOut,
    Settings,
    User,
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from 'next/navigation'



export default function Header({ user_email }: { user_email: string }) {
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace('/login');
    };

    return (
        <header>
            <div className="sticky flex justify-end items-center p-8">
                <div>
                    <Button className="mr-8">Add more credits</Button>
                </div>
                <div className="flex items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <a className="cursor-pointer grayscale">
                                <Avvvatars value={user_email} shadow={true} size={40} />
                            </a>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 mr-8 mt-2">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    <span>Billing</span>
                                    <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => handleSignOut()}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}