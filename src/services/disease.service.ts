import api from './api';
import {DiseaseDTO} from "@/types";
const BASE_URL = '/api/diseases';

interface ResultPaginationDTO<T> {
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    };
    result: T[];
}

export const diseaseService = {
    fetchAll: async (q: string | undefined, severity: string | undefined, page: number, pageSize: number) => {
        const params: Record<string, any> = { page: page - 1, size: pageSize };
        if (q) params.q = q;
        if (severity) params.severity = severity;
        const res = await api.get(BASE_URL, { params });
        return res.data.data;
    },

    create: async (dto: DiseaseDTO) => {
        const res = await api.post('/api/diseases', dto);
        return res.data;
    },

    update: async (dto: DiseaseDTO) => {
        const res = await api.put('/api/diseases', dto);
        return res.data;
    },
    fetchLikeName: async (name: string | undefined, page: number, pageSize: number) => {
        const params: Record<string, any> = { page: page - 1, size: pageSize };
        if (name) params.name = name;
        const res = await api.get(BASE_URL + "/name", { params });
        return res.data.data;
    },
};