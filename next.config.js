/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'example.com',
      'utfs.io',  // para UploadThing
      'img.clerk.com',  // para imagens do Clerk
      'images.clerk.dev',
      'uploadthing.com',
      'placehold.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      }
    ]
  }
}

module.exports = nextConfig
