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


export default function Login() {
  const loginGoogle = async () => {
    'use server';
    const supabase = createClient();
    const origin = headers().get('origin');
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/dashboard`,
      },
    });

    if (error) {
      console.log(error);
    } else {
      return redirect(data.url);
    }
  };

  const loginTwitter = async () => {
    'use server';
    const supabase = createClient();
    const origin = headers().get('origin');
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: `${origin}/dashboard`,
      },
    });

    if (error) {
      console.log(error);
    } else {
      return redirect(data.url);
    }
  };

  const loginGithub = async () => {
    'use server';
    const supabase = createClient();
    const origin = headers().get('origin');
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${origin}/dashboard`,
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
            <Image src="/autosubs.svg" alt="LongtoShort Logo" className=" mx-auto mb-24" width={256} height={256} />
            <form action={loginGoogle}>
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
                Sign in with Google
              </Button>
            </form>
            <form action={loginTwitter}>
              <Button
                variant="outline"
                className='w-full mt-3'
              >
                <div className="flex items-center justify-center mr-2.5">
                  <Image
                    className="h-4 w-4"
                    src={Twitter}
                    alt="Twitter Logo"
                  />
                </div>
                Sign in with Twitter
              </Button>
            </form>
            <form action={loginGithub}>
              <Button
                variant="outline"
                className='w-full mt-3'
              >
                <div className="flex items-center justify-center mr-2.5">
                  <Image
                    className="h-5 w-5"
                    src={Github}
                    alt="Github Logo"
                  />
                </div>
                Sign in with Github
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