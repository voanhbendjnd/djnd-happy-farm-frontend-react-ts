import api from './api';
import {PestDisease, PestDiseaseDTO} from "@/types";

export const pestDiseaseService = {
    fetchByPest: async (pestId: number) => {
        const res = await api.get<PestDisease[]>(`/api/pestDiseases/byPest/${pestId}`);
        return res.data;
    },
    create: async (dto: PestDiseaseDTO) => {
        const res = await api.post('/api/pestDiseases', dto);
        return res.data;
    },
    update: async (dto: PestDiseaseDTO) => {
        const res = await api.put('/api/pestDiseases', dto);
        return res.data;
    },
    remove: async (id: number) => {
        const res = await api.delete(`/api/pestDiseases/${id}`);
        return res.data;
    },
};