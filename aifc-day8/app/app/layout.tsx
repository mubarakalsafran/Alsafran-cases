import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kuwait Orders Data Lab',
  description:
    'From messy data to meaningful decisions — 195 raw rows audited, cleaned to 189, and turned into a story. AIFC Day 8.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
