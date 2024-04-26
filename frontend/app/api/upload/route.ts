const secretAccessKey = process.env.CLOUDFLARE_AWS_SECRET_ACCESS_KEY!;

const MAX_UPLOAD_SIZE = 52428800; // 50MB


async function executePutRequest(url: string, data: ArrayBuffer, authToken?: string): Promise<Response> {
    const headers = {
        'Content-Type': 'video/mp4', // Set the content type to binary data
        'Authorization': `Bearer ${authToken}` // Set the authorization header
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
        return new Response('File size exceeds the maximum upload limit of 50MB.', {
            status: 413,
        });
    }

    const uploadUrl = process.env.CLOUDFLARE_WORKER_URL!;
    const key = req.url.split('?key=')[1];
    try {
        const response = await executePutRequest(`${uploadUrl}/${key}`, data, secretAccessKey);
        return response;
    } catch (error) {
        console.error('Error uploading file:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
