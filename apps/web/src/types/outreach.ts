export type OutreachType = 'CoverLetter' | 'ColdMessage';
export type OutreachSourceType = 'Upload' | 'Resume' | 'Profile';

export interface AiOutreachRequestDto {
  outreachType: OutreachType;
  sourceType: OutreachSourceType;
  sourceId?: string;
  uploadedCvText?: string;
  jobUrl?: string;
  jobDescription?: string;
  languageCode?: string;
}

export interface AiOutreachResponseDto {
  generatedText: string;
  isCached: boolean;
  scrapedJobTitle?: string;
  scrapedJobDescription?: string;
}
