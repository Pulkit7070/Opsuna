import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import { TamboWrapper } from '@/components/TamboProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Opsuna Tambo - MCP Toolchain Composer',
  description: 'Safe Action UI for DevOps automation powered by Tambo AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <TamboWrapper>
            <div className="min-h-screen bg-background">
              {children}
            </div>
          </TamboWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
