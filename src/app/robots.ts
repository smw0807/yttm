import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yttm.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/about', '/privacy', '/share/', '/en', '/en/login', '/en/about', '/en/privacy', '/en/share/'],
        disallow: ['/dashboard', '/videos', '/collections', '/api/', '/en/dashboard', '/en/videos', '/en/collections'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
