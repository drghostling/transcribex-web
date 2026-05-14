import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "TranscribeX privacy policy: how we collect, use, and protect your data when you use our free AI transcription tools.",
  alternates: { canonical: `${siteUrl}/privacy` },
  openGraph: {
    url: `${siteUrl}/privacy`,
    title: "Privacy Policy | TranscribeX",
  },
};

const lastUpdated = "May 14, 2026";

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 prose-content">
      <h1 className="text-4xl font-extrabold text-brand-text-1 mb-3">
        Privacy Policy
      </h1>
      <p className="text-sm text-brand-text-3 mb-10">Last updated: {lastUpdated}</p>

      <section className="space-y-6 text-brand-text-2 leading-relaxed">
        <p>
          TranscribeX (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) provides
          free AI-powered transcription tools for audio, video, and YouTube
          content. This policy explains what information we collect, how we
          use it, and the choices you have.
        </p>

        <div>
          <h2 className="text-2xl font-bold text-brand-text-1 mb-3">
            Information we collect
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Files you upload</strong> are sent to our transcription
              providers only to produce a transcript and are deleted shortly
              after processing. We do not store your audio or video files.
            </li>
            <li>
              <strong>YouTube URLs</strong> you submit are used solely to fetch
              the public content for transcription.
            </li>
            <li>
              <strong>Basic usage data</strong> (such as IP address, browser
              type, and pages visited) is collected via standard server logs
              and analytics to keep the service running and improve quality.
            </li>
            <li>
              <strong>Cookies</strong> may be set by us or by third-party
              services (for example Google AdSense, Google Analytics, Vercel)
              for ads, analytics, and basic site functionality.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-text-1 mb-3">
            How we use information
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Generate transcripts from the files or URLs you submit.</li>
            <li>Operate, maintain, and improve the service.</li>
            <li>Protect against abuse, fraud, and security issues.</li>
            <li>Comply with legal obligations where applicable.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-text-1 mb-3">
            Third-party services
          </h2>
          <p>
            We rely on third parties for hosting (Vercel), transcription
            (AssemblyAI), media fetching (Cobalt), analytics, and advertising
            (Google AdSense). These providers process data on our behalf under
            their own privacy policies. Google may use cookies to serve ads
            based on prior visits to this and other websites; you can opt out
            of personalised advertising at{" "}
            <a
              href="https://www.google.com/settings/ads"
              className="text-primary-600 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Google Ads Settings
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-text-1 mb-3">
            Data retention
          </h2>
          <p>
            Uploaded files and generated transcripts are deleted shortly after
            processing. Server logs are retained only as long as necessary for
            operational and security purposes.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-text-1 mb-3">
            Your rights
          </h2>
          <p>
            Depending on your location, you may have the right to access,
            correct, or delete personal data we hold about you. To exercise
            these rights, contact us at the address below.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-text-1 mb-3">
            Children
          </h2>
          <p>
            TranscribeX is not directed at children under 13 and we do not
            knowingly collect data from them.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-text-1 mb-3">
            Changes to this policy
          </h2>
          <p>
            We may update this policy from time to time. Material changes will
            be reflected by updating the &quot;Last updated&quot; date above.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-text-1 mb-3">Contact</h2>
          <p>
            Questions about this policy? Reach us via the{" "}
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
