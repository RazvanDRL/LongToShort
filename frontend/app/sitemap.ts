import { MetadataRoute } from 'next'

const BASE_URL = "https://longtoshort.tech"

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: `${BASE_URL}/`,
        },
    ]
}