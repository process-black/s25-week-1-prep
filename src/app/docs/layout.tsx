import type { ReactNode } from "react";
import Link from "next/link";
import { getDocsTree, NavItem } from "@/lib/docs";
import "../globals.css";

function NavList({ items }: { items: NavItem[] }) {
    if (!items.length) return null;
    return (
        <ul className="pl-4">
            {items.map((item) => (
                <li key={item.path} className="mb-1">
                    {item.children ? (
                        <>
                            <span className="font-semibold">{item.title}</span>
                            <NavList items={item.children} />
                        </>
                    ) : (
                        <Link href={`/docs/${item.path}`}>{item.title}</Link>
                    )}
                </li>
            ))}
        </ul>
    );
}

export default function DocsLayout({ children }: { children: ReactNode }) {
    const nav = getDocsTree();
    return (
        <div className="flex min-h-screen">
            <aside className="w-60 border-r p-4 overflow-y-auto">
                <NavList items={nav} />
            </aside>
            <main className="flex-1 p-4 overflow-y-auto">{children}</main>
        </div>
    );
}
