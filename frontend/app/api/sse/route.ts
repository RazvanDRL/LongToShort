import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    return new Response(
        new ReadableStream({
            async start(controller) {
                const sendEvent = (data: any) => {
                    controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
                };

                const channel = supabaseAdmin
                    .channel('metadata-update-channel')
                    .on(
                        'postgres_changes',
                        { event: 'UPDATE', schema: 'public', table: 'metadata' },
                        (payload: any) => {
                            if (payload.new.id === id && payload.new.processed) {
                                sendEvent({ type: 'video-processed', videoId: id });
                            }
                        }
                    )
                    .subscribe();

                request.signal.addEventListener('abort', () => {
                    channel.unsubscribe();
                    controller.close();
                });
            }
        }),
        {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            }
        }
    );
}
