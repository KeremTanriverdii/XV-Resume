import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import '../global.css';
import { Providers } from '../providers';
import { AuthProvider } from '@/providers/AuthProvider';

export const metadata = {
  title: 'Welcome to ResumeXCreator',
  description: 'AI powered resume creator',
}

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
          </Providers>
        </NextIntlClientProvider>
          </AuthProvider>
      </body>
    </html>
  );
}
