import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "TranscribeX terms of service: rules and conditions for using our free AI transcription and download tools.",
  alternates: { canonical: `${siteUrl}/terms` },
  openGraph: {
    url: `${siteUrl}/terms`,
    title: "Terms of Service | TranscribeX",
  },
};

const lastUpdated = "May 14, 2026";

export default function TermsPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <h1 className="text-4xl font-extrabold text-brand-text-1 mb-3">
        Terms of Service
      </h1>
      <p className="text-sm text-brand-text-3 mb-10">Last updated: {lastUpdated}</p>

      <section className="space-y-6 text-brand-text-2 leading-relaxed">
        <p>
          By accessing or using TranscribeX (&quot;the service&quot;), you
          agree to these terms. If you do not agree, please do not use the
          service.
        </p>

        <div>
          <h2 className="text-2xl font-bold text-brand-text-1 mb-3">
            Acceptable use
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              You must own the content you submit, or have permission to
              process it.
            </li>
            <li>
              Do not use the service to violate any law or infringe the
              rights of others, including copyright and privacy rights.
            </li>
            <li>
              Do not attempt to disrupt the service, abuse our infrastructure,
              or circumvent usage limits.
            </li>
            <li>
              The service is provided for personal and lawful business use.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-text-1 mb-3">
            Your content
          </h2>
          <p>
            You retain ownership of any content you submit. We process it only
            to produce a transcript or perform the requested action, and we
            delete it shortly afterwards. See our{" "}
            <a href="/privacy" className="text-primary-600 hover:underline">
              Privacy Policy
            </a>{" "}
            for details.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-text-1 mb-3">
            YouTube and third-party content
          </h2>
          <p>
            When you submit a YouTube URL or other third-party content, you
            are responsible for ensuring you have the right to download or
            transcribe it. We are not affiliated with YouTube, and your use
            of YouTube content is also subject to YouTube&apos;s Terms of
            Service.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-text-1 mb-3">
            Service availability
          </h2>
          <p>
            We aim for high uptime but the service is provided &quot;as
            is&quot; without warranties of any kind. We may modify, suspend,
            or discontinue the service at any time.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-text-1 mb-3">
            Limitation of liability
          </h2>
          <p>
            To the maximum extent permitted by law, TranscribeX and its
            contributors are not liable for any indirect, incidental, or
            consequential damages arising out of your use of the service.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-text-1 mb-3">
            Changes to these terms
          </h2>
          <p>
            We may update these terms at any time. Continued use of the
            service after updates means you accept the revised terms.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-text-1 mb-3">Contact</h2>
          <p>
            Questions about these terms? Reach us via the{" "}
            <a href="/contact" className="text-primary-600 hover:underline">
              contact page
            </a>
            .
          </p>
        </div>
      </section>
    </article>
  );
}
