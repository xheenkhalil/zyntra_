import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
}

const SITE_NAME = "ZYNTRA";
const DEFAULT_OG_IMAGE = "https://zyntra.io/vite.svg";
const BASE_URL = "https://zyntra.io";

function setMetaTag(
  attr: "name" | "property",
  key: string,
  content: string
): void {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLinkTag(rel: string, href: string): void {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = "website",
  noindex = false,
  structuredData,
}) => {
  useEffect(() => {
    // Title
    const prevTitle = document.title;
    document.title = `${title} | ${SITE_NAME}`;

    // Meta tags
    setMetaTag("name", "description", description);
    setMetaTag("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

    if (keywords) {
      setMetaTag("name", "keywords", keywords);
    }

    // Canonical
    const canonical = canonicalUrl || `${BASE_URL}${window.location.pathname}`;
    setLinkTag("canonical", canonical);

    // Open Graph
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("property", "og:url", canonical);
    setMetaTag("property", "og:site_name", SITE_NAME);
    setMetaTag("property", "og:image", ogImage || DEFAULT_OG_IMAGE);

    // Twitter Card
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", ogImage || DEFAULT_OG_IMAGE);

    // Structured Data (JSON-LD)
    let scriptEl: HTMLScriptElement | null = null;
    if (structuredData) {
      scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.id = "seo-structured-data";
      scriptEl.textContent = JSON.stringify(structuredData);
      // Remove existing if any
      const existing = document.getElementById("seo-structured-data");
      if (existing) existing.remove();
      document.head.appendChild(scriptEl);
    }

    // Cleanup
    return () => {
      document.title = prevTitle;
      if (scriptEl) scriptEl.remove();
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, noindex, structuredData]);

  return null;
};

export default SEO;
