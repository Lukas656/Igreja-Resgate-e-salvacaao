import type { MetadataRoute } from "next";
import { ministryConfig } from "@/lib/config";
import { safePublicUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = safePublicUrl(ministryConfig.siteUrl);
  if (!origin) return [];
  return [{ url: origin, changeFrequency: "monthly", priority: 1 }];
}
