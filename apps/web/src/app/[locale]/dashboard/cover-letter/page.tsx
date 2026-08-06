import React from 'react';
import { OutreachGeneratorClient } from '@/components/clientpages/OutreachGeneratorClient';

export const metadata = {
  title: 'Cover Letter Generator | XV Resume',
  description: 'Generate tailored AI cover letters for job applications with cost-optimized caching.',
};

export default function CoverLetterPage() {
  return <OutreachGeneratorClient defaultMode="CoverLetter" />;
}
