import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

const pages = [
  { path: "", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/audio-to-text-converter", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/video-to-text-converter", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/mp3-to-text", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/mp4-to-text", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/m4a-to-text", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/wav-to-text", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/flac-to-text", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/youtube-to-text", priority: 0.95, changeFrequency: "weekly" as const },
  { path: "/youtube-to-mp4", priority: 0.85, changeFrequency: "monthly" as const },
  { path: "/youtube-downloader", priority: 0.85, changeFrequency: "monthly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
