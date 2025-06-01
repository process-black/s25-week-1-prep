import { getDocContent, parseMarkdown } from "@/lib/docs";
import { notFound } from "next/navigation";

export default function DocPage({ params }: { params: { slug?: string[] } }) {
  const slug = params.slug ?? [];
  if (slug.length === 0) {
    return <p>Select a document from the navigation.</p>;
  }
  const content = getDocContent(slug);
  if (content === null) {
    notFound();
  }
  const html = parseMarkdown(content!);
  return <article dangerouslySetInnerHTML={{ __html: html }} />;
}
