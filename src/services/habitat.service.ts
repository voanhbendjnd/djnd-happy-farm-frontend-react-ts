import api from './api';
import type { PaginatedResponse, Habitat } from '../types';

export const habitatService = {
  fetchAll: async (
    q = '',
    page = 1,
    size = 10,
    sort = 'name,asc'
  ): Promise<PaginatedResponse<Habitat>> => {
    const response = await api.get<PaginatedResponse<Habitat>>('/api/habitats', {
      params: { q, page, size, sort },
    });
    // Unwrap nested data if API wraps in ApiResponse envelope
    const payload = (response.data as any)?.data ?? response.data;
    return payload;
  },

  create: async (habitat: Habitat): Promise<void> => {
    await api.post('/api/habitats', habitat);
  },

  update: async (habitat: Partial<Habitat> & { name: string }): Promise<void> => {
    await api.patch('/api/habitats', habitat);
  },
};
