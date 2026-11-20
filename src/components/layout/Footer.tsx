import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { CATEGORIES } from "@/types";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/equipment", label: "All Equipment" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

const SOCIAL_LINKS = [
  { href: "https://facebook.com", label: "Facebook", Icon: FaFacebookF },
  { href: "https://x.com", label: "X", Icon: FaXTwitter },
  { href: "https://instagram.com", label: "Instagram", Icon: FaInstagram },
  { href: "https://linkedin.com", label: "LinkedIn", Icon: FaLinkedinIn },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-secondary">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/gearloop-icon.svg"
              alt="GearLoop"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">
              Gear<span className="text-primary">Loop</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Rent the gear you need. Loop it back. GearLoop connects equipment
            owners with people who need the right tools for the job.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2.5">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
            Categories
          </h3>
          <ul className="mt-4 space-y-2.5">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/equipment?category=${encodeURIComponent(category.name)}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
            Get in Touch
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh</span>
            </li>
            <li className="flex items-center gap-2.5">
              <PhoneIcon className="size-4 shrink-0 text-primary" />
              <a href="tel:+8801700000000" className="hover:text-primary">
                +880 1700 000 000
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MailIcon className="size-4 shrink-0 text-primary" />
              <a href="mailto:hello@gearloop.com" className="hover:text-primary">
                hello@gearloop.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} GearLoop. All rights reserved.</p>
          <p>Rent the gear you need. Loop it back.</p>
        </div>
      </div>
    </footer>
  );
}
