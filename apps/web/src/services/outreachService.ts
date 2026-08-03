import { api } from './apiClient';
import { AiOutreachRequestDto, AiOutreachResponseDto } from '@/types/outreach';

/**
 * Generate Cover Letter or Cold Message with multi-source candidate data & caching support.
 */
export const generateOutreachText = async (
  data: AiOutreachRequestDto,
  token: string | undefined
): Promise<AiOutreachResponseDto | null> => {
  if (!token) return null;
  return api.post<AiOutreachResponseDto>('/outreach/generate', data, token).catch((err) => {
    console.error('Failed to generate outreach text:', err);
    throw err;
  });
};
