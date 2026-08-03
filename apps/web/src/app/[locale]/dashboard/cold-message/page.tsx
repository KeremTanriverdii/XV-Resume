import React from 'react';
import { OutreachGeneratorClient } from '@/components/clientpages/OutreachGeneratorClient';

export const metadata = {
  title: 'Cold Message Generator | XV Resume',
  description: 'Generate high-converting LinkedIn and email cold outreach messages for recruiters and hiring managers.',
};

export default function ColdMessagePage() {
  return <OutreachGeneratorClient defaultMode="ColdMessage" />;
}
