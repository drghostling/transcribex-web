"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Waveform,
  List,
  X,
  CaretDown,
  MicrophoneStage,
  FilmStrip,
  MusicNote,
  VideoCamera,
  SpeakerHigh,
  Equalizer,
  Headphones,
  YoutubeLogo,
  DownloadSimple,
  ArrowCircleDown,
} from "@phosphor-icons/react";

const audioTools = [
  { href: "/audio-to-text-converter", label: "Audio to Text", Icon: Waveform },
  { href: "/mp3-to-text", label: "MP3 to Text", Icon: MusicNote },
  { href: "/wav-to-text", label: "WAV to Text", Icon: Equalizer },
  { href: "/m4a-to-text", label: "M4A to Text", Icon: SpeakerHigh },
  { href: "/flac-to-text", label: "FLAC to Text", Icon: Headphones },
];

const videoTools = [
  { href: "/video-to-text-converter", label: "Video to Text", Icon: FilmStrip },
  { href: "/mp4-to-text", label: "MP4 to Text", Icon: VideoCamera },
  { href: "/youtube-to-text", label: "YouTube to Text", Icon: YoutubeLogo },
];

const downloadTools = [
  { href: "/youtube-to-mp4", label: "YouTube to MP4", Icon: DownloadSimple },
  { href: "/youtube-downloader", label: "YouTube Downloader", Icon: ArrowCircleDown },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleDropdown = (name: string) =>
    setActiveDropdown((prev) => (prev === name ? null : name));

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-[0_1px_0_#e6e8f4,0_4px_12px_rgba(13,15,26,0.06)]" : "border-b border-brand-border"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-brand-text-1 shrink-0">
            <span className="icon-gradient w-8 h-8">
              <MicrophoneStage size={18} weight="fill" />
            </span>
            <span>
              Transcribe<span className="text-gradient">X</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" role="menubar">
            {/* Audio dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-brand-text-2 hover:text-brand-text-1 rounded-lg hover:bg-brand-bg-2 transition-colors"
                onClick={() => toggleDropdown("audio")}
                aria-expanded={activeDropdown === "audio"}
              >
                Audio Tools <CaretDown size={14} className={`transition-transform ${activeDropdown === "audio" ? "rotate-180" : ""}`} />
              </button>
              {activeDropdown === "audio" && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-card border border-brand-border p-1 z-50">
                  {audioTools.map(({ href, label, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-brand-text-2 hover:text-brand-text-1 hover:bg-brand-bg-2 rounded-lg transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <Icon size={16} className="text-primary-500 shrink-0" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Video dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-brand-text-2 hover:text-brand-text-1 rounded-lg hover:bg-brand-bg-2 transition-colors"
                onClick={() => toggleDropdown("video")}
                aria-expanded={activeDropdown === "video"}
              >
                Video Tools <CaretDown size={14} className={`transition-transform ${activeDropdown === "video" ? "rotate-180" : ""}`} />
              </button>
              {activeDropdown === "video" && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-card border border-brand-border p-1 z-50">
                  {videoTools.map(({ href, label, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-brand-text-2 hover:text-brand-text-1 hover:bg-brand-bg-2 rounded-lg transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <Icon size={16} className="text-primary-500 shrink-0" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Downloader dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-brand-text-2 hover:text-brand-text-1 rounded-lg hover:bg-brand-bg-2 transition-colors"
                onClick={() => toggleDropdown("download")}
                aria-expanded={activeDropdown === "download"}
              >
                Downloader <CaretDown size={14} className={`transition-transform ${activeDropdown === "download" ? "rotate-180" : ""}`} />
              </button>
              {activeDropdown === "download" && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-card border border-brand-border p-1 z-50">
                  {downloadTools.map(({ href, label, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-brand-text-2 hover:text-brand-text-1 hover:bg-brand-bg-2 rounded-lg transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <Icon size={16} className="text-primary-500 shrink-0" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/youtube-to-text"
              className="btn-gradient px-4 py-2 text-sm"
            >
              Try Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg text-brand-text-2 hover:bg-brand-bg-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-brand-border bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            <p className="px-3 py-1 text-xs font-semibold text-brand-text-3 uppercase tracking-wider">Audio Tools</p>
            {audioTools.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-brand-text-2 hover:bg-brand-bg-2 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={16} className="text-primary-500" />
                {label}
              </Link>
            ))}
            <p className="px-3 py-1 mt-2 text-xs font-semibold text-brand-text-3 uppercase tracking-wider">Video Tools</p>
            {videoTools.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-brand-text-2 hover:bg-brand-bg-2 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={16} className="text-primary-500" />
                {label}
              </Link>
            ))}
            <p className="px-3 py-1 mt-2 text-xs font-semibold text-brand-text-3 uppercase tracking-wider">Downloader</p>
            {downloadTools.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-brand-text-2 hover:bg-brand-bg-2 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={16} className="text-primary-500" />
                {label}
              </Link>
            ))}
            <div className="pt-2 pb-1">
              <Link
                href="/youtube-to-text"
                className="btn-gradient block text-center px-4 py-2.5 text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Try Free
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Click-outside to close dropdowns */}
      {activeDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
      )}
    </header>
  );
}
