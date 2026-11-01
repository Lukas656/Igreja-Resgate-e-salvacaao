import type { MetadataRoute } from "next";
import { ministryConfig } from "@/lib/config";
import { safePublicUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  const origin = safePublicUrl(ministryConfig.siteUrl);
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    ...(origin ? { sitemap: `${origin}/sitemap.xml` } : {}),
  };
}
