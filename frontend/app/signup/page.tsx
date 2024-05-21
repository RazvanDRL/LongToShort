import Image from 'next/image'
import { Toaster } from 'sonner'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react';
import Google from '@/public/google_logo.svg'
import Twitter from '@/public/x_logo.svg'
import Github from '@/public/github_logo.svg'
import Link from 'next/link'
import { createClient } from '@/app/utils/supabase';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';


export default function SignUp() {
  const signupGoogle = async () => {
    'use server';
    const supabase = createClient();
    const origin = headers().get('origin');
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      console.log(error);
    } else {
      return redirect(data.url);
    }
  };

  const signupTwitter = async () => {
    'use server';
    const supabase = createClient();
    const origin = headers().get('origin');
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      console.log(error);
    } else {
      return redirect(data.url);
    }
  };

  const signupGithub = async () => {
    'use server';
    const supabase = createClient();
    const origin = headers().get('origin');
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      console.log(error);
    } else {
      return redirect(data.url);
    }
  }


  return (
    <main>
      <Toaster richColors />

      <div className='flex justify-center items-center h-screen'>
        <div className="absolute top-0 left-0 m-7">
          <Button variant="link" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 mr-1" aria-hidden="true" />
              Home
            </Link>
          </Button>
        </div>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form action={signupGoogle}>
              <Button
                variant="outline"
                className='w-full'
              >
                <div className="flex items-center justify-center mr-2.5">
                  <Image
                    className="h-5 w-5"
                    src={Google}
                    alt="Google Logo"
                  />
                </div>
                Sign up with Google
              </Button>
            </form>
            <form action={signupTwitter}>
              <Button
                variant="outline"
                className='w-full mt-3'
              >
                <div className="flex items-center justify-center mr-2.5">
                  <Image
                    className="h-4 w-4 fill-black"
                    src={Twitter}
                    alt="Twitter Logo"
                  />
                </div>
                Sign up with Twitter
              </Button>
            </form>
            <form action={signupGithub}>
              <Button
                variant="outline"
                className='w-full mt-3'
              >
                <div className="flex items-center justify-center mr-2.5">
                  <Image
                    className="h-5 w-5 dark:invert"
                    src={Github}
                    alt="Github Logo"
                  />
                </div>
                Sign up with Github
              </Button>
            </form>

            <p className="mt-10 text-left text-xs text-gray-400">
              By signing in, you agree to our <span className='hover:underline text-sky-500'>Terms of Service</span> and <span className="hover:underline text-sky-500">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div >
    </main >
  )
}