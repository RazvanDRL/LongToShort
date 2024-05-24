const secretAccessKey = process.env.CLOUDFLARE_AWS_SECRET_ACCESS_KEY!;

const MAX_UPLOAD_SIZE = 52428800 * 10; // 500MB


async function executePutRequest(url: string, data: ArrayBuffer, authToken?: string): Promise<Response> {
    const headers = {
        'Content-Type': 'video/mp4',
        'Authorization': `Bearer ${authToken}`,
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
    };

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: data,
        });

        return response;
    } catch (error) {
        console.error('Error executing PUT request:', error);
        throw error;
    }
}

export async function PUT(req: Request): Promise<Response> {
    const data = await req.arrayBuffer();
    const dataSize = data.byteLength;

    if (dataSize > MAX_UPLOAD_SIZE) {
        return new Response('File size exceeds the maximum upload limit of 500MB.', {
            status: 413,
            headers: {
                'Content-Security-Policy': "default-src 'self'",
            },
        });
    }

    const uploadUrl = process.env.CLOUDFLARE_WORKER_URL!;
    const key = req.url.split('?key=')[1];
    try {
        const response = await executePutRequest(`${uploadUrl}/${key}`, data, secretAccessKey);
        if (response.status !== 200) {
            const errorMessage = await response.text();
            return new Response(`Error uploading file: ${errorMessage}`, { status: response.status });
        }
        return response;
    } catch (error) {
        console.error('Error uploading file:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
