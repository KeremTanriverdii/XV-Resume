import React from 'react';
import { OutreachGeneratorClient } from '@/components/clientpages/OutreachGeneratorClient';

export const metadata = {
  title: 'Cold Message & Cover Letter Generator | XV Resume',
  description: 'Generate high-converting Cold Messages and Cover Letters for job applications with AI and cost-reducing caching.',
};

export default function OutreachPage() {
  return <OutreachGeneratorClient defaultMode="CoverLetter" />;
}
