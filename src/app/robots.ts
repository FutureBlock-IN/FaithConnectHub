import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin-panel",
          "/admin-worship-panel",
          "/admin-secret-xyz789",
          "/profile",
          "/profile/",
          "/settings",
          "/favorites",
          "/dashboard",
          "/signin",
          "/signup",
          "/forgot-password",
          "/api/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
