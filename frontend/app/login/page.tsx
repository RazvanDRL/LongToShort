"use client"

import { useState, useEffect } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabaseClient'
import { Toaster, toast } from 'sonner'

// components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

// icons
import { ArrowLeft } from 'lucide-react';
import { Loader2 } from "lucide-react"
import Google from '@/public/google_logo.svg'
import Twitter from '@/public/twitter-logo.svg'


export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shouldRender, setShouldRender] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignedIn() {
    const auth = (await supabase.auth.getUser()).data.user?.aud;
    if (auth === 'authenticated') {
      router.replace('/dashboard');
      return true;
    }
    else
      return false;
  }

  useEffect(() => {
    const runPrecheck = async () => {
      const result = await handleSignedIn();

      if (!result) {
        setShouldRender(true);
      } else {

      }
    };
    runPrecheck();
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value.toLowerCase());
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };


  const loginGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/dashboard'
      }
    })

    if (error) {
      toast.error(error.message);
    }
  };

  const loginTwitter = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: 'http://localhost:3000/dashboard'
      }
    })

    if (error) {
      toast.error(error.message);
    }
  };

  function validateEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validatePassword(password: string) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,32})/;
    return regex.test(password);
  }

  const loginEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (password.length > 32) {
      toast.error('Password must be less than 32 characters long.');
      return;
    }

    if (!email || !validateEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (!password || validatePassword(password)) {
      toast.error('Please enter a valid password.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else if (data) {
      router.replace('/dashboard');
    }
  };

  if (!shouldRender) {
    return <div className="bg-[#ec2626] z-50 w-screen h-screen"></div>;
  }

  return (
    <main>
      <Toaster richColors />

      <div className='flex justify-center items-center h-screen'>
        <div className="absolute top-0 left-0 m-7">
          <Button variant="link" onClick={() => router.replace("/")}>
            <ArrowLeft className="w-4 mr-1" aria-hidden="true" />
            Home
          </Button>
        </div>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <div className="space-y-6">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Email"
                  required
                  disabled={loading}
                  onChange={(e) => handleEmailChange(e)} />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Password</Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="Password"
                  required
                  disabled={loading}
                  onChange={(e) => handlePasswordChange(e)} />
              </div>

              {!loading ?
                <Button
                  variant="default"
                  className='w-full'
                  onClick={(e) => {
                    loginEmail(e)
                  }}
                >
                  Sign in
                </Button>
                :
                <Button
                  disabled
                  className='w-full'
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </Button>
              }
            </div>
            <Separator className="mt-6 mb-6" />

            <Button
              variant="outline"
              className='w-full'
              onClick={() => loginGoogle()}
            >
              <div className="flex items-center justify-center mr-2.5">
                <Image
                  className="h-5 w-5"
                  src={Google}
                  alt="Google Logo"
                />
              </div>
              Sign in with Google
            </Button>

            <Button
              variant="outline"
              className='w-full mt-3'
              onClick={() => loginTwitter()}
            >
              <div className="flex items-center justify-center mr-2.5">
                <Image
                  className="h-4 w-4 fill-black"
                  src={Twitter}
                  alt="Twitter Logo"
                />
              </div>
              Sign in with Twitter
            </Button>

            <p className="mt-10 text-left text-xs text-gray-400">
              By signing in, you agree to our <span className='hover:underline text-sky-500'>Terms of Service</span> and <span className="hover:underline text-sky-500">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div >
    </main>
  )
}