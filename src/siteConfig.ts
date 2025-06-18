import type {
  SiteConfiguration,
  NavigationLinks,
  SocialLinks,
} from "@/types.ts";

export const SITE: SiteConfiguration = {
  title: "Astro Nathan",
  description:
    "An attempt at using the Barebones theme from SuperWeb Development Inc. with Astro.",
  href: "https://barebones.superwebthemes.com",
  author: "SuperWeb Development Inc.",
  locale: "en-CA",
};

export const NAV_LINKS: NavigationLinks = {
  blog: {
    path: "/blog",
    label: "Blog",
  },
  chararctercounter: {
    path: "/charactercounter",
    label: "Character Counter",
  },
  projects: {
    path: "/projects",
    label: "Projects",
  },
    magnet: {
    path: "/magnet",
    label: "Magnet",
  },
};

export const SOCIAL_LINKS: SocialLinks = {
  email: {
    label: "Email",
    href: "mailto:ttl@trevortylerlee.com",
  },
  github: {
    label: "GitHub",
    href: "https://github.com/trevortylerlee",
  },
  twitter: {
    label: "X (formerly Twitter)",
    href: "https://twitter.com/boogerbuttcheek",
  },
};
