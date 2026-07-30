import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import '../global.css';
import { Providers } from '../providers';
import { AuthProvider } from '@/providers/AuthProvider';

import type { Metadata } from 'next';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: {
    default: 'XV Resume — AI Uyumlu Özgeçmiş Oluşturucu',
    template: '%s | XV Resume',
  },
  description: 'Yapay zeka ile her iş ilanına %100 ATS uyumlu, profesyonel ve etkileyici özgeçmişler (CV) oluşturun.',
  keywords: [
    'CV Oluşturucu',
    'AI Resume Creator',
    'ATS Uyumlu CV',
    'Yapay Zeka Özgeçmiş',
    'İş Başvurusu CV Hazırlama',
    'Resume Builder',
  ],
  authors: [{ name: 'XV Resume Team' }],
  openGraph: {
    title: 'XV Resume — AI Uyumlu Özgeçmiş Oluşturucu',
    description: 'Yapay zeka desteğiyle hedef iş ilanına özel ATS optimizasyonlu CV oluşturun.',
    url: 'https://resumexcreator.com',
    siteName: 'XV Resume',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XV Resume — AI Powered Resume Builder',
    description: 'Create ATS-optimized resumes tailored to job postings instantly using AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
          <AuthProvider>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <Toaster position="bottom-right" richColors closeButton />
          </Providers>
        </NextIntlClientProvider>
          </AuthProvider>
      </body>
    </html>
  );
}
