import Link from "next/link";
import { MicrophoneStage, GithubLogo, TwitterLogo } from "@phosphor-icons/react/dist/ssr";

const audioLinks = [
  { href: "/audio-to-text-converter", label: "Audio to Text" },
  { href: "/mp3-to-text", label: "MP3 to Text" },
  { href: "/wav-to-text", label: "WAV to Text" },
  { href: "/m4a-to-text", label: "M4A to Text" },
  { href: "/flac-to-text", label: "FLAC to Text" },
];

const videoLinks = [
  { href: "/video-to-text-converter", label: "Video to Text" },
  { href: "/mp4-to-text", label: "MP4 to Text" },
  { href: "/youtube-to-text", label: "YouTube to Text" },
  { href: "/youtube-to-mp4", label: "YouTube to MP4" },
  { href: "/youtube-downloader", label: "YouTube Downloader" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-text-1 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <span className="icon-gradient w-8 h-8">
                <MicrophoneStage size={18} weight="fill" />
              </span>
              <span>TranscribeX</span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              AI-powered transcription tools for audio, video, and YouTube content. Free, fast, and accurate.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Twitter"
              >
                <TwitterLogo size={16} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="GitHub"
              >
                <GithubLogo size={16} />
              </a>
            </div>
          </div>

          {/* Audio Tools */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Audio Tools</p>
            <ul className="space-y-2.5">
              {audioLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Video & YouTube */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Video & YouTube</p>
            <ul className="space-y-2.5">
              {videoLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Company</p>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">Home</Link></li>
              <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} TranscribeX. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Powered by Claude AI &bull; transcribex.co
          </p>
        </div>
      </div>
    </footer>
  );
}
