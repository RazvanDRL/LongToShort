import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAdminKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabaseAdmin = createBrowserClient(supabaseUrl, supabaseAdminKey);