import api from './api';
import type { LoginResponse, RegisterData } from '../types';

export const authService = {
  // The backend wraps response as: { statusCode, error, message, data: { accessToken, user } }
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/login', { username, password });
    return response.data;
  },

  register: async (userData: RegisterData): Promise<void> => {
    await api.post('/api/register', userData);
  },
};
