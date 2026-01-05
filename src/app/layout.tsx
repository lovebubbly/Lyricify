import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lyricify - Apple Music Style Lyric Video Generator',
  description: 'Create stunning lyric videos with Apple Music-inspired aesthetics. Upload your audio, cover art, and lyrics to generate beautiful time-synced videos.',
  keywords: ['lyric video', 'music video', 'apple music', 'lyrics', 'video generator'],
  authors: [{ name: 'Lyricify' }],
  openGraph: {
    title: 'Lyricify - Apple Music Style Lyric Video Generator',
    description: 'Create stunning lyric videos with Apple Music-inspired aesthetics.',
    type: 'website'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
