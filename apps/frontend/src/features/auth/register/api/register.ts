import type { AuthResponse, RegisterDto } from '@expense-tracker/shared';

import { apiClient } from '@/shared/api';

export const register = (dto: RegisterDto): Promise<AuthResponse> =>
  apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
