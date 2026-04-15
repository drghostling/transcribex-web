export interface ToolConfig {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  iconName: string;
  acceptedFormats?: string[];
  isYouTube?: boolean;
  isDownloader?: boolean;
  relatedTools: string[];
}

export const tools: ToolConfig[] = [
  {
    id: "audio-to-text",
    slug: "audio-to-text-converter",
    title: "Audio to Text Converter",
    shortTitle: "Audio to Text",
    description: "Convert any audio file to accurate text transcripts powered by AI. Supports all major audio formats.",
    metaTitle: "Free Audio to Text Converter — AI Transcription | TranscribeX",
    metaDescription: "Convert audio files to text instantly with AI accuracy. Supports MP3, WAV, M4A, FLAC and more. Free online audio transcription tool.",
    iconName: "Waveform",
    acceptedFormats: ["MP3", "WAV", "M4A", "FLAC", "OGG", "AAC", "OPUS"],
    relatedTools: ["mp3-to-text", "wav-to-text", "m4a-to-text", "flac-to-text"],
  },
  {
    id: "video-to-text",
    slug: "video-to-text-converter",
    title: "Video to Text Converter",
    shortTitle: "Video to Text",
    description: "Transcribe video files to text with speaker detection and subtitle export. Fast, accurate AI transcription.",
    metaTitle: "Free Video to Text Converter — AI Video Transcription | TranscribeX",
    metaDescription: "Convert video files to text transcripts with AI. Supports MP4, MOV, AVI, MKV and more. Get accurate captions and subtitles instantly.",
    iconName: "FilmStrip",
    acceptedFormats: ["MP4", "MOV", "AVI", "MKV", "WEBM", "FLV"],
    relatedTools: ["mp4-to-text", "audio-to-text-converter", "youtube-to-text"],
  },
  {
    id: "mp3-to-text",
    slug: "mp3-to-text",
    title: "MP3 to Text Converter",
    shortTitle: "MP3 to Text",
    description: "Convert MP3 audio files to accurate text transcripts in seconds. Free AI-powered MP3 transcription.",
    metaTitle: "MP3 to Text Converter — Free AI Transcription | TranscribeX",
    metaDescription: "Convert MP3 files to text online for free. AI-powered transcription with 99.8% accuracy, 50+ languages, speaker detection.",
    iconName: "MusicNote",
    acceptedFormats: ["MP3"],
    relatedTools: ["audio-to-text-converter", "wav-to-text", "m4a-to-text", "flac-to-text"],
  },
  {
    id: "mp4-to-text",
    slug: "mp4-to-text",
    title: "MP4 to Text Converter",
    shortTitle: "MP4 to Text",
    description: "Transcribe MP4 video files to text with AI precision. Export as TXT or SRT subtitles.",
    metaTitle: "MP4 to Text Converter — Free Video Transcription | TranscribeX",
    metaDescription: "Convert MP4 video to text online for free. AI transcription with speaker detection, 50+ languages, SRT subtitle export.",
    iconName: "VideoCamera",
    acceptedFormats: ["MP4"],
    relatedTools: ["video-to-text-converter", "youtube-to-text", "mp3-to-text"],
  },
  {
    id: "m4a-to-text",
    slug: "m4a-to-text",
    title: "M4A to Text Converter",
    shortTitle: "M4A to Text",
    description: "Convert M4A audio files to text transcripts instantly. Perfect for Apple Voice Memos and podcast recordings.",
    metaTitle: "M4A to Text Converter — Free AI Transcription | TranscribeX",
    metaDescription: "Convert M4A files to text online for free. Supports Apple Voice Memos, iTunes audio, podcast exports with 99.8% AI accuracy.",
    iconName: "SpeakerHigh",
    acceptedFormats: ["M4A"],
    relatedTools: ["audio-to-text-converter", "mp3-to-text", "wav-to-text"],
  },
  {
    id: "wav-to-text",
    slug: "wav-to-text",
    title: "WAV to Text Converter",
    shortTitle: "WAV to Text",
    description: "Transcribe WAV audio files to text with high accuracy. Ideal for recordings, interviews, and meetings.",
    metaTitle: "WAV to Text Converter — Free AI Transcription | TranscribeX",
    metaDescription: "Convert WAV files to text online for free. High-accuracy AI transcription for interviews, meetings, lectures and more.",
    iconName: "Equalizer",
    acceptedFormats: ["WAV"],
    relatedTools: ["audio-to-text-converter", "mp3-to-text", "m4a-to-text", "flac-to-text"],
  },
  {
    id: "flac-to-text",
    slug: "flac-to-text",
    title: "FLAC to Text Converter",
    shortTitle: "FLAC to Text",
    description: "Convert lossless FLAC audio files to text. Best quality transcription for studio recordings.",
    metaTitle: "FLAC to Text Converter — Free AI Transcription | TranscribeX",
    metaDescription: "Convert FLAC audio to text online for free. Lossless audio transcription with 99.8% AI accuracy and SRT export.",
    iconName: "Headphones",
    acceptedFormats: ["FLAC"],
    relatedTools: ["audio-to-text-converter", "wav-to-text", "mp3-to-text"],
  },
  {
    id: "youtube-to-text",
    slug: "youtube-to-text",
    title: "YouTube to Text Converter",
    shortTitle: "YouTube to Text",
    description: "Transcribe any YouTube video to text by pasting the URL. Get full transcripts, summaries, and subtitles.",
    metaTitle: "YouTube to Text Converter — Free Transcript Generator | TranscribeX",
    metaDescription: "Get YouTube video transcripts instantly. Paste any YouTube URL and get accurate text, summaries, and SRT subtitles for free.",
    iconName: "YoutubeLogo",
    isYouTube: true,
    relatedTools: ["youtube-to-mp4", "youtube-downloader", "video-to-text-converter"],
  },
  {
    id: "youtube-to-mp4",
    slug: "youtube-to-mp4",
    title: "YouTube to MP4 Converter",
    shortTitle: "YouTube to MP4",
    description: "Download YouTube videos as MP4 in up to 4K quality. Fast, free, no watermark.",
    metaTitle: "YouTube to MP4 Converter — Download YouTube Videos | TranscribeX",
    metaDescription: "Download YouTube videos as MP4 for free. Choose from 4K, 1080p, 720p or 480p quality. No watermark, no registration.",
    iconName: "DownloadSimple",
    isDownloader: true,
    relatedTools: ["youtube-downloader", "youtube-to-text", "mp4-to-text"],
  },
  {
    id: "youtube-downloader",
    slug: "youtube-downloader",
    title: "YouTube Downloader",
    shortTitle: "YouTube Downloader",
    description: "Download YouTube videos in MP4, MP3, WEBM, M4A and OGG formats. Free, fast, and unlimited.",
    metaTitle: "YouTube Downloader — Download MP4, MP3, WEBM | TranscribeX",
    metaDescription: "Download YouTube videos in any format — MP4, MP3, WEBM, M4A, OGG. Free YouTube downloader with no limits.",
    iconName: "ArrowCircleDown",
    isDownloader: true,
    relatedTools: ["youtube-to-mp4", "youtube-to-text", "mp3-to-text"],
  },
];

export const toolsBySlug = Object.fromEntries(tools.map((t) => [t.slug, t]));
export const toolsById = Object.fromEntries(tools.map((t) => [t.id, t]));

export function getRelatedTools(slugs: string[]): ToolConfig[] {
  return slugs.map((s) => toolsBySlug[s] || toolsById[s]).filter(Boolean);
}
