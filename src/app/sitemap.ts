import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://www.labfinds.com";

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${siteUrl}/policies`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4
    }
  ];
}