import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";

type Heading = {
  depth: number;
  text: string;
};

export type ParsedMarkdownDocument = {
  frontmatter: Record<string, unknown>;
  headings: Heading[];
  internalLinks: string[];
};

type MdastNode = {
  type: string;
  depth?: number;
  url?: string;
  value?: string;
  children?: MdastNode[];
};

const extractText = (node: MdastNode): string => {
  if (typeof node.value === "string") {
    return node.value;
  }

  return (node.children ?? []).map((child) => extractText(child)).join("").trim();
};

const isInternalLink = (url: string): boolean => {
  return url.startsWith("#") || (!url.includes("://") && !url.startsWith("mailto:"));
};

export const parseMarkdownDocument = (source: string): ParsedMarkdownDocument => {
  const parsed = matter(source);
  const tree = unified().use(remarkParse).parse(parsed.content) as MdastNode;
  const headings: Heading[] = [];
  const internalLinks: string[] = [];

  visit(tree, (node: MdastNode) => {
    if (node.type === "heading" && typeof node.depth === "number") {
      headings.push({
        depth: node.depth,
        text: extractText(node),
      });
    }

    if (node.type === "link" && typeof node.url === "string" && isInternalLink(node.url)) {
      internalLinks.push(node.url);
    }
  });

  return {
    frontmatter: parsed.data,
    headings,
    internalLinks,
  };
};