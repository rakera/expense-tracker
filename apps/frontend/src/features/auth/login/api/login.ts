import type { AuthResponse, LoginDto } from '@expense-tracker/shared';

import { apiClient } from '@/shared/api';

export const login = (dto: LoginDto): Promise<AuthResponse> =>
  apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
