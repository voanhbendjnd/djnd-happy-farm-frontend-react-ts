import api from './api';
import type { PaginatedResponse, Taxonomy, GbifMatchResult } from '../types';

export const taxonomyService = {
  fetchAll: async (
    q = '',
    family = '',
    genus = '',
    page = 1,
    size = 10,
    sort = 'id,desc'
  ): Promise<PaginatedResponse<Taxonomy>> => {
    const response = await api.get<PaginatedResponse<Taxonomy>>('/api/taxonomies', {
      params: { q, family, genus, page, size, sort },
    });
    const payload = (response.data as any)?.data ?? response.data;
    return payload;
  },

  match: async (name: string): Promise<GbifMatchResult> => {
    const response = await api.get('/api/taxonomies/match', {
      params: { name },
    });
    const payload = (response.data as any)?.data ?? response.data;
    return payload;
  },

  create: async (name: string): Promise<void> => {
    await api.post('/api/taxonomies', null, {
      params: { name },
    });
  },
};
