import api from "@/services/api.ts";
import {PropagationDTO} from "@/types";
const BASE_URL = '/api/propagations';

interface ResultPaginationDTO<T> {
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    };
    result: T[];
}

export const propagationService = {
    fetchAll: async (method: string | undefined, difficulty: string | undefined, page: number, pageSize: number) => {
        const params: Record<string, any> = { page: page - 1, size: pageSize };
        if (method) params.method = method;
        if (difficulty) params.difficulty = difficulty;
        const res = await api.get(BASE_URL, { params });
        return res.data.data;
    },

    create: async (dto: PropagationDTO) => {
        const res = await api.post('/api/propagations', dto);
        return res.data;
    },

    update: async (dto: PropagationDTO) => {
        const res = await api.put('/api/propagations', dto);
        return res.data;
    },
};