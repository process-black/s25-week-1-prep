import fs from "fs";
import path from "path";

export const DOCS_ROOT = path.join(process.cwd(), "docs");

export type NavItem = {
  title: string;
  path: string; // path relative to docs root without extension
  children?: NavItem[];
};

export function getDocTitle(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const match = content.match(/^#\s+(.*)/);
    if (match) {
      return match[1].trim();
    }
  } catch {
    // ignore
  }
  return path.basename(filePath).replace(/\.mdx?$/, "");
}

export function getDocsTree(dir: string = DOCS_ROOT, base = ""): NavItem[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  const items: NavItem[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(base, entry.name);
    if (entry.isDirectory()) {
      const children = getDocsTree(fullPath, relPath);
      items.push({ title: entry.name, path: relPath, children });
    } else if (/\.mdx?$/.test(entry.name)) {
      const title = getDocTitle(fullPath);
      items.push({
        title,
        path: relPath.replace(/\.mdx?$/, ""),
      });
    }
  }
  return items;
}

export function getDocContent(slug: string[]): string | null {
  const basePath = path.join(DOCS_ROOT, ...slug);
  const mdPath = `${basePath}.md`;
  const mdxPath = `${basePath}.mdx`;
  if (fs.existsSync(mdPath)) {
    return fs.readFileSync(mdPath, "utf8");
  }
  if (fs.existsSync(mdxPath)) {
    return fs.readFileSync(mdxPath, "utf8");
  }
  return null;
}

export function parseMarkdown(md: string): string {
  const escapeHtml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = md.split(/\r?\n/);
  let html = "";
  let inList = false;

  for (const line of lines) {
    if (/^###\s+/.test(line)) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<h3>${escapeHtml(line.replace(/^###\s+/, ""))}</h3>`;
    } else if (/^##\s+/.test(line)) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<h2>${escapeHtml(line.replace(/^##\s+/, ""))}</h2>`;
    } else if (/^#\s+/.test(line)) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<h1>${escapeHtml(line.replace(/^#\s+/, ""))}</h1>`;
    } else if (/^-\s+/.test(line)) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${escapeHtml(line.replace(/^-\s+/, ""))}</li>`;
    } else if (line.trim() === "") {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<p>${escapeHtml(line)}</p>`;
    }
  }
  if (inList) {
    html += "</ul>";
  }
  return html;
}
