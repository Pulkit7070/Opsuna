export type DocsNavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type DocsNavSection = {
  title: string;
  items: DocsNavItem[];
};

export const docsNavigation: DocsNavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Architecture", href: "/docs/architecture" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { title: "Agents", href: "/docs/agents" },
      { title: "Workflows", href: "/docs/workflows" },
      { title: "Tools", href: "/docs/tools" },
      { title: "Memory", href: "/docs/memory" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Building an Agent", href: "/docs/building-agent" },
      { title: "Custom Tools", href: "/docs/custom-tools" },
      { title: "Deployment", href: "/docs/deployment" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "Client SDK", href: "/docs/sdk" },
      { title: "REST API", href: "/docs/api" },
    ],
  },
];
