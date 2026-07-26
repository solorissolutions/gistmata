import Link from "next/link";
import { BreadcrumbSchema } from "./StructuredData";

interface Crumb {
  label: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <BreadcrumbSchema items={[{ label: "Home", href: "/" }, ...items]} />
      <nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          {items.map((item, i) => (
            <li key={item.href} className="flex items-center gap-2">
              <span className="text-muted">/</span>
              {i === items.length - 1 ? (
                <span className="text-foreground">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
