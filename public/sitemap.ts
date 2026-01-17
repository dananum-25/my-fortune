// app/sitemap.ts (Next.js)
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://my-fortune-lake.vercel.app",
      lastModified: new Date(),
    },
    {
      url: "https://my-fortune-lake.vercel.app/운세", // 필요하다면 추가 경로
      lastModified: new Date(),
    },
  ];
}
