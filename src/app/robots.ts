import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://www.labfinds.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/my-listings",
        "/verify-seller",
        "/reset-password"
      ]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}