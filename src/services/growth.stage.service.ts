import api from './api';

import type {
    GrowthStage
} from '../types';

const BASE_URL = '/api/growthStages';

export const growthStageService = {
        fetchAll: async (): Promise<GrowthStage[]> => {
            const response = await api.get<GrowthStage[]>(`${BASE_URL}`);
            return  (response.data as any)?.data ?? response.data;
        },
};