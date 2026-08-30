import {PlantPartDTO} from "@/types";
import api from './api';
const BASE_URL = '/api/plantParts';

interface ResultPaginationDTO<T> {
    meta: {
        page: number;
        pageSize: number;
        total: number;
    };
    result: T[];
}

export const plantPartService = {
    fetchAll: async (q: string | undefined, page: number, pageSize: number) => {
        const params: Record<string, any> = { page: page - 1, size: pageSize };
        if (q) params.q = q;
        const res = await api.get(BASE_URL, { params });
        return res.data.data;
    },

    create: async (dto: PlantPartDTO) => {
        const res = await api.post(BASE_URL, dto);
        return res.data;
    },

    update: async (dto: PlantPartDTO) => {
        const res = await api.put(BASE_URL, dto);
        return res.data;
    },
};