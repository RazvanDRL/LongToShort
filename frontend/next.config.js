/** @type {import('next').NextConfig} */

// const { withPlausibleProxy } = require('next-plausible')

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },
}

// module.exports = withPlausibleProxy({
//     customDomain: "https://plausible-f48o844.64.23.249.87.sslip.io",
// })({
//     nextConfig
// })

module.exports = nextConfig;