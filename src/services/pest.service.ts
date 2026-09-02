import {PestDTO} from "@/types";
const BASE_URL = '/api/pests';
import api from './api';

interface ResultPaginationDTO<T> {
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    };
    result: T[];
}

export const pestService = {
    fetchAll: async (q: string | undefined, page: number, pageSize: number) => {
        const params: Record<string, any> = { page: page - 1, size: pageSize };
        if (q) params.q = q;
        const res = await api.get(BASE_URL, { params });
        return res.data.data;
    },

    create: async (dto: PestDTO) => {
        const res = await api.post('/api/pests', dto);
        return res.data;
    },

    update: async (dto: PestDTO) => {
        const res = await api.put('/api/pests', dto);
        return res.data;
    },
};