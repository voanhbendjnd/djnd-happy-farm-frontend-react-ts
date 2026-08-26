import api from './api';

import type {
    Fertilizer,
    FertilizerGrowthStageDTO,
    FertilizerSearchCriteriaDTO,
    PaginatedResponse
} from '../types';

const BASE_URL = '/api/fertilizers';

export const fertilizerService = {
    /**
     * GET /api/fertilizers?name=...&fertilizerType=...&page=...&size=...
     * Backend nhận Pageable + FertilizerSearchCriteriaDTO qua @ModelAttribute,
     * nên tất cả field đều truyền dạng query param phẳng.
     */
    fetchAll: async (
        criteria: FertilizerSearchCriteriaDTO,
        page: number,
        size: number
    ): Promise<PaginatedResponse<Fertilizer>> => {
        const params: Record<string, unknown> = {
            ...criteria,
            page: page - 1, // Spring Pageable là 0-based, UI đang xài 1-based
            size,
        };
        // Loại bỏ field undefined/empty để URL sạch
        Object.keys(params).forEach((key) => {
            const value = params[key];
            if (value === undefined || value === null || value === '') {
                delete params[key];
            }
        });

        const res = await api.get(BASE_URL, { params });
        return res.data.data;
    },

    /**
     * POST /api/fertilizers
     * Không được truyền id, backend sẽ throw 400 nếu dto.id != null
     */
    create: async (dto: Omit<FertilizerGrowthStageDTO, 'id'>): Promise<void> => {
        await api.post(BASE_URL, dto);
    },

    /**
     * PUT /api/fertilizers
     * Bắt buộc phải có id, backend sẽ throw 400 nếu dto.id == null
     */
    update: async (dto: FertilizerGrowthStageDTO): Promise<void> => {
        if (dto.id == null) {
            throw new Error('id is required to update a fertilizer');
        }
        await api.put(BASE_URL, dto);
    },
};