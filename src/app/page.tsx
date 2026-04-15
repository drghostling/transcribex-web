import type { Metadata } from "next";
import Link from "next/link";
import {
  Waveform,
  FilmStrip,
  MusicNote,
  VideoCamera,
  SpeakerHigh,
  Equalizer,
  Headphones,
  YoutubeLogo,
  DownloadSimple,
  ArrowCircleDown,
  Star,
  CheckCircle,
  Subtitles,
  Translate,
  Lightning,
  ShieldCheck,
  Globe,
  Users,
  Briefcase,
  Student,
  Microphone,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import FAQ from "@/components/ui/FAQ";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://transcribex.co";

export const metadata: Metadata = {
  title: "TranscribeX — Free AI Transcription Tools for Audio & Video",
  description:
    "Convert audio, video, and YouTube content to text with 99.8% AI accuracy. Free online transcription supporting 50+ languages, speaker detection, and SRT subtitle export.",
  alternates: { canonical: siteUrl },
  openGraph: {
    url: siteUrl,
    title: "TranscribeX — Free AI Transcription Tools for Audio & Video",
    description: "Convert audio, video, and YouTube content to text with 99.8% AI accuracy.",
  },
};

const allTools = [
  { href: "/audio-to-text-converter", label: "Audio to Text", desc: "All audio formats", Icon: Waveform },
  { href: "/video-to-text-converter", label: "Video to Text", desc: "All video formats", Icon: FilmStrip },
  { href: "/mp3-to-text", label: "MP3 to Text", desc: "Fast MP3 transcription", Icon: MusicNote },
  { href: "/mp4-to-text", label: "MP4 to Text", desc: "Video file transcription", Icon: VideoCamera },
  { href: "/m4a-to-text", label: "M4A to Text", desc: "Apple audio support", Icon: SpeakerHigh },
  { href: "/wav-to-text", label: "WAV to Text", desc: "Lossless audio", Icon: Equalizer },
  { href: "/flac-to-text", label: "FLAC to Text", desc: "Studio quality audio", Icon: Headphones },
  { href: "/youtube-to-text", label: "YouTube to Text", desc: "Paste any YouTube URL", Icon: YoutubeLogo },
  { href: "/youtube-to-mp4", label: "YouTube to MP4", desc: "Download up to 4K", Icon: DownloadSimple },
  { href: "/youtube-downloader", label: "YouTube Downloader", desc: "MP4, MP3, WEBM & more", Icon: ArrowCircleDown },
];

const features = [
  {
    label: "Transcription",
    title: "Accurate transcription in seconds",
    desc: "Our AI engine delivers 99.8% accuracy across 50+ languages. Upload any audio or video file, or paste a YouTube URL, and get a complete transcript in under a minute.",
    points: ["99.8% word accuracy", "50+ languages supported", "MP3, WAV, MP4, FLAC, M4A and more"],
    icon: Microphone,
    reverse: false,
  },
  {
    label: "Subtitles",
    title: "Download SRT subtitles instantly",
    desc: "Export your transcripts as professional SRT subtitle files ready for YouTube, TikTok, Premiere Pro, or any video editor. Timestamped automatically.",
    points: ["SRT & TXT export", "Auto-timestamped", "Works with any video editor"],
    icon: Subtitles,
    reverse: true,
  },
  {
    label: "Translation",
    title: "Transcribe in any language",
    desc: "Select from 50+ languages before transcribing. Our AI handles accents, background noise, and multiple speakers with ease.",
    points: ["50+ languages", "Accent-aware AI", "Multi-speaker detection"],
    icon: Translate,
    reverse: false,
  },
  {
    label: "Privacy",
    title: "Your files, your data",
    desc: "Files are processed securely and never stored permanently. Your transcripts belong only to you.",
    points: ["No permanent storage", "Secure processing", "No account required"],
    icon: ShieldCheck,
    reverse: true,
  },
];

const userTypes = [
  { Icon: Briefcase, title: "Business Teams", desc: "Transcribe meetings, calls, and webinars. Turn hours of audio into searchable text." },
  { Icon: Globe, title: "Content Creators", desc: "Generate subtitles and captions for YouTube, TikTok, and social media videos." },
  { Icon: Student, title: "Students & Researchers", desc: "Convert lectures, interviews, and podcasts into notes you can search and highlight." },
  { Icon: Users, title: "Journalists", desc: "Transcribe interviews and press conferences instantly. Quote with confidence." },
];

const testimonials = [
  { name: "Sarah K.", role: "Podcast Producer", text: "TranscribeX saves me hours every week. The accuracy is incredible and the SRT export is perfect for YouTube uploads.", stars: 5 },
  { name: "Marco R.", role: "Journalist", text: "I transcribe 3–4 hours of interviews per week. This tool handles everything from accents to crosstalk flawlessly.", stars: 5 },
  { name: "Aisha T.", role: "PhD Student", text: "I use it for lecture recordings and research interviews. The multi-speaker detection works really well.", stars: 5 },
];

const faqs = [
  { question: "Is TranscribeX free to use?", answer: "Yes! TranscribeX offers free AI-powered transcription for all audio and video formats. No registration required — just upload your file or paste a YouTube URL." },
  { question: "What file formats are supported?", answer: "We support all major audio formats (MP3, WAV, M4A, FLAC, OGG, AAC) and video formats (MP4, MOV, AVI, MKV, WEBM). You can also paste any YouTube URL to transcribe directly." },
  { question: "How accurate is the transcription?", answer: "Our AI achieves 99.8% accuracy on clear audio in major languages. Accuracy may vary with heavy background noise, strong accents, or low-quality recordings." },
  { question: "How many languages are supported?", answer: "TranscribeX supports 50+ languages including English, Spanish, French, German, Portuguese, Japanese, Korean, Chinese, Arabic, Turkish, and many more." },
  { question: "Can I export subtitles?", answer: "Yes. Every transcript can be exported as a plain TXT file or as SRT subtitles with automatic timestamps — ready for YouTube, TikTok, or any video editor." },
  { question: "Is my data private?", answer: "Absolutely. Files are processed securely and deleted immediately after transcription. We never store your audio, video, or transcripts." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#webapp`,
      name: "TranscribeX",
      url: siteUrl,
      description: "AI-powered transcription tools for audio, video, and YouTube content.",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "2148" },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#org`,
      name: "TranscribeX",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white pt-20 pb-16 sm:pt-28 sm:pb-24">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary-50 opacity-60 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-violet-100 opacity-40 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label mb-6">
            <Lightning size={12} weight="fill" />
            AI-Powered Transcription
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-text-1 leading-tight mb-5">
            Transcribe audio & video{" "}
            <span className="text-gradient">to text in seconds</span>
          </h1>
          <p className="text-lg sm:text-xl text-brand-text-3 max-w-2xl mx-auto mb-8 leading-relaxed">
            Free AI transcription with 99.8% accuracy. Supports 50+ languages, speaker detection, and SRT export. No signup required.
          </p>

          {/* Quick tool links */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Link href="/youtube-to-text" className="btn-gradient px-6 py-3 text-sm inline-flex items-center gap-2">
              <YoutubeLogo size={18} weight="fill" />
              YouTube to Text
            </Link>
            <Link href="/audio-to-text-converter" className="btn-outline px-6 py-3 text-sm inline-flex items-center gap-2">
              <Waveform size={18} />
              Audio to Text
            </Link>
            <Link href="/mp4-to-text" className="btn-ghost px-6 py-3 text-sm inline-flex items-center gap-2">
              <VideoCamera size={18} />
              MP4 to Text
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
            {[
              { value: "99.8%", label: "Accuracy" },
              { value: "500MB", label: "Max file size" },
              { value: "50+", label: "Languages" },
              { value: "2M+", label: "Users worldwide" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-extrabold text-gradient">{value}</p>
                <p className="text-xs text-brand-text-3 mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-brand-bg-2 border-y border-brand-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-brand-text-3">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} size={16} weight="fill" className="text-yellow-400" />
            ))}
            <span className="ml-1 font-semibold text-brand-text-2">4.9/5</span>
            <span>from 2,100+ reviews</span>
          </div>
          <span className="hidden sm:block w-px h-4 bg-brand-border" />
          <span className="flex items-center gap-1.5">
            <CheckCircle size={16} weight="fill" className="text-green-500" />
            Trusted by 2 million+ users
          </span>
          <span className="hidden sm:block w-px h-4 bg-brand-border" />
          <span className="flex items-center gap-1.5">
            <Lightning size={16} weight="fill" className="text-primary-500" />
            No credit card required
          </span>
        </div>
      </section>

      {/* Feature sections */}
      {features.map(({ label, title, desc, points, icon: Icon, reverse }) => (
        <section key={label} className={`py-16 sm:py-24 ${reverse ? "bg-brand-bg-2" : "bg-white"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`flex flex-col lg:flex-row items-center gap-12 ${reverse ? "lg:flex-row-reverse" : ""}`}>
              {/* Illustration side */}
              <div className="flex-1 flex justify-center">
                <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-primary-50 to-violet-100 flex items-center justify-center shadow-brand">
                  <div className="icon-gradient w-24 h-24 rounded-2xl">
                    <Icon size={48} weight="duotone" />
                  </div>
                </div>
              </div>
              {/* Content side */}
              <div className="flex-1 max-w-lg">
                <span className="section-label mb-4">{label}</span>
                <h2 className="text-3xl font-bold text-brand-text-1 mb-4">{title}</h2>
                <p className="text-brand-text-3 leading-relaxed mb-6">{desc}</p>
                <ul className="space-y-3">
                  {points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-brand-text-2">
                      <CheckCircle size={18} weight="fill" className="text-primary-500 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Built for section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label mb-4">Who Uses It</span>
            <h2 className="text-3xl font-bold text-brand-text-1">Built for every workflow</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {userTypes.map(({ Icon, title, desc }) => (
              <div key={title} className="card-gradient-border p-6">
                <div className="icon-gradient w-11 h-11 rounded-xl mb-4">
                  <Icon size={22} weight="duotone" />
                </div>
                <h3 className="font-bold text-brand-text-1 mb-2">{title}</h3>
                <p className="text-sm text-brand-text-3 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Tools */}
      <section className="py-16 sm:py-24 bg-brand-bg-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label mb-4">Tools</span>
            <h2 className="text-3xl font-bold text-brand-text-1">All transcription tools</h2>
            <p className="text-brand-text-3 mt-3">One platform. Every format. Completely free.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {allTools.map(({ href, label, desc, Icon }) => (
              <Link
                key={href}
                href={href}
                className="card-gradient-border p-5 flex items-start gap-4 group"
              >
                <div className="icon-gradient w-10 h-10 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                  <Icon size={20} weight="duotone" />
                </div>
                <div>
                  <p className="font-semibold text-brand-text-1 text-sm mb-0.5">{label}</p>
                  <p className="text-xs text-brand-text-3">{desc}</p>
                </div>
                <ArrowRight size={14} className="text-brand-text-3 shrink-0 ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label mb-4">Reviews</span>
            <h2 className="text-3xl font-bold text-brand-text-1">Loved by 2 million+ users</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name} className="card-gradient-border p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} size={14} weight="fill" className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-brand-text-2 leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="text-sm font-semibold text-brand-text-1">{name}</p>
                  <p className="text-xs text-brand-text-3">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-brand-bg-2">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-label mb-4">FAQ</span>
            <h2 className="text-3xl font-bold text-brand-text-1">Frequently asked questions</h2>
          </div>
          <FAQ items={faqs} />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary-500 to-violet-500">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Start transcribing for free
          </h2>
          <p className="text-white/80 text-lg mb-8">
            No signup. No credit card. Just accurate transcription in seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/youtube-to-text"
              className="bg-white text-primary-600 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-brand-lg text-sm"
            >
              Transcribe YouTube video
            </Link>
            <Link
              href="/audio-to-text-converter"
              className="bg-white/15 text-white font-bold px-8 py-3.5 rounded-xl border border-white/30 hover:bg-white/25 transition-colors text-sm"
            >
              Upload audio file
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
