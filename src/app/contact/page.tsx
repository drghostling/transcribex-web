import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the TranscribeX team for support, feedback, or business inquiries.",
  alternates: { canonical: `${siteUrl}/contact` },
  openGraph: {
    url: `${siteUrl}/contact`,
    title: "Contact | TranscribeX",
  },
};

export default function ContactPage() {
  return (
    <article className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <h1 className="text-4xl font-extrabold text-brand-text-1 mb-4">
        Contact us
      </h1>
      <p className="text-brand-text-3 text-lg leading-relaxed mb-10">
        Have a question, feedback, or a partnership idea? We&apos;d love to
        hear from you.
      </p>

      <div className="space-y-6 text-brand-text-2 leading-relaxed">
        <div className="card-gradient-border p-6">
          <h2 className="text-xl font-bold text-brand-text-1 mb-2">
            General &amp; support
          </h2>
          <p>
            Email:{" "}
            <a
              href="mailto:hello@transcribex.co"
              className="text-primary-600 hover:underline font-medium"
            >
              hello@transcribex.co
            </a>
          </p>
          <p className="text-sm text-brand-text-3 mt-2">
            We aim to reply within 2 business days.
          </p>
        </div>

        <div className="card-gradient-border p-6">
          <h2 className="text-xl font-bold text-brand-text-1 mb-2">
            Legal &amp; privacy
          </h2>
          <p>
            See our{" "}
            <a href="/privacy" className="text-primary-600 hover:underline">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="/terms" className="text-primary-600 hover:underline">
              Terms of Service
            </a>
            . For DMCA or copyright notices, please email the address above
            with &quot;DMCA&quot; in the subject line.
          </p>
        </div>
      </div>
    </article>
  );
}
