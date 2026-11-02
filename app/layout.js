import './globals.css';

export const metadata = {
  title: 'TeraBox Player',
  description: 'Download & Play TeraBox video online',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
