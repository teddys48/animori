/**
 * SEO & Social Metadata helper for client-side single page applications.
 * Safely updates document title, meta description, Open Graph tags, and canonical link.
 */

export interface MetaOptions {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}

const DEFAULT_TITLE = 'Animori — Anime Discovery & Information';
const DEFAULT_DESCRIPTION =
  'Discover trending anime, track airing schedules, and explore top-rated Japanese animation with modern glassmorphism aesthetics.';

function setMetaTag(nameOrProperty: string, content?: string): void {
  if (typeof document === 'undefined') return;

  const isProperty = nameOrProperty.startsWith('og:') || nameOrProperty.startsWith('twitter:');
  const selector = isProperty
    ? `meta[property="${nameOrProperty}"]`
    : `meta[name="${nameOrProperty}"]`;

  let element = document.querySelector(selector) as HTMLMetaElement | null;

  if (!content) {
    if (element) element.remove();
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    if (isProperty) {
      element.setAttribute('property', nameOrProperty);
    } else {
      element.setAttribute('name', nameOrProperty);
    }
    document.head.appendChild(element);
  }

  element.content = content;
}

function setCanonicalLink(href?: string): void {
  if (typeof document === 'undefined') return;

  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!href) {
    if (link) link.remove();
    return;
  }

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}

/**
 * Apply dynamic metadata. Returns a restore function that reverts to defaults.
 */
export function setDocumentMeta({
  title,
  description,
  image,
  url
}: MetaOptions): () => void {
  if (typeof document === 'undefined') return () => {};

  const prevTitle = document.title;
  document.title = title ? `${title} — Animori` : DEFAULT_TITLE;

  const desc = description ? description.substring(0, 160).replace(/\s+/g, ' ').trim() : DEFAULT_DESCRIPTION;

  setMetaTag('description', desc);
  setMetaTag('og:title', title || DEFAULT_TITLE);
  setMetaTag('og:description', desc);
  setMetaTag('og:type', 'video.tv_show');
  if (image) setMetaTag('og:image', image);
  if (url) {
    setMetaTag('og:url', url);
    setCanonicalLink(url);
  }

  return () => {
    document.title = prevTitle || DEFAULT_TITLE;
    setMetaTag('description', DEFAULT_DESCRIPTION);
    setMetaTag('og:title', DEFAULT_TITLE);
    setMetaTag('og:description', DEFAULT_DESCRIPTION);
    setMetaTag('og:type', 'website');
    setMetaTag('og:image', undefined);
    setMetaTag('og:url', undefined);
    setCanonicalLink(undefined);
  };
}
