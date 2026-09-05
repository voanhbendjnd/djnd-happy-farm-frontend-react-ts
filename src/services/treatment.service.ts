import api from './api';
import {DiseaseDTO, TreatmentDTO} from "@/types";
const BASE_URL = '/api/treatments';



export const treatmentService = {
    fetchAll: async (q: string | undefined, page: number, pageSize: number) => {
        const params: Record<string, any> = { page: page - 1, size: pageSize };
        if (q) params.q = q;
        const res = await api.get(BASE_URL, { params });
        return res.data.data;
    },

    create: async (dto: TreatmentDTO) => {
        const res = await api.post(BASE_URL, dto);
        return res.data;
    },

    update: async (dto: TreatmentDTO) => {
        const res = await api.put(BASE_URL, dto);
        return res.data;
    },
};