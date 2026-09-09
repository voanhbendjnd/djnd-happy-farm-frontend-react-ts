import {PestSymptomDTO, PestSymptomProjection} from "@/types";
import api from './api';
const BASE_URL = '/api/pestSymptoms';

interface ResultPaginationDTO<T> {
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    };
    result: T[];
}

export const pestSymptomService = {
    fetchAll: async (q: string | undefined, page: number, pageSize: number) => {
        const params: Record<string, any> = { page: page - 1, size: pageSize };
        if (q) params.q = q;
        const res = await api.get(BASE_URL, { params });
        return res.data.data;
    },

    create: async (dto: PestSymptomDTO) => {
        const res = await api.post('/api/pestSymptoms', dto);
        return res.data;
    },

    update: async (dto: PestSymptomDTO) => {
        const res = await api.put('/api/pestSymptoms/name', dto);
        return res.data;
    },
    fetchLikeName: async (q: string | undefined, page: number, pageSize: number) => {
        const params: Record<string, any> = { page: page - 1, size: pageSize };
        if (q) params.q = q;
        const res = await api.get(BASE_URL, { params });
        return res.data.data;
    },
};