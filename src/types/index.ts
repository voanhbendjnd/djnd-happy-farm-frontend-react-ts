// DTO types matching the backend

export interface UserLogin {
  id: number;
  email: string;
  name: string;
  authorities: string[];
  login: string;
  loginType: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  error: string | null;
  message: string;
  data: T;
}

export interface LoginResponseData {
  accessToken: string;
  user: UserLogin;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  statusCode?: number;
  data?: {
    result: T[];
    meta: PaginationMeta;
  };
  result?: T[];
  meta?: PaginationMeta;
}

export interface Habitat {
  name: string;
  description?: string;
}

export interface Taxonomy {
  id: number;
  kingdom?: string;
  family: string;
  genus?: string;
  species?: string;
}

export interface GbifMatchResult {
  usageKey?: number;
  scientificName?: string;
  canonicalName?: string;
  rank?: string;
  status?: string;
  kingdom?: string;
  family?: string;
  genus?: string;
  species?: string;
}

export interface RegisterData {
  login: string;
  name: string;
  email: string;
  password: string;
  langKey: string;
}

// export interface GrowthStage {
//   id: number;
//   name: string;
// }

export interface Fertilizer {
  id: number;
  name: string;
  description?: string;
  descriptionJson?: Record<string, unknown> | null; // Tiptap JSONContent

  type?: string;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  growthStages?: GrowthStage[];
}

export interface FertilizerGrowthStageDTO {
  id?: number | null;
  name: string;
  description?: string;
  descriptionJson?: Record<string, unknown> | null;
  type?: string;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  growthStageIds?: number[];
}

export interface FertilizerSearchCriteriaDTO {
  name?: string;
  fertilizerType?: string;
  minNitrogen?: number;
  maxNitrogen?: number;
  minPhosphorus?: number;
  maxPhosphorus?: number;
  minPotassium?: number;
  maxPotassium?: number;
  growthStageId?: number;
}


export interface GrowthStage{
  id:number;
  name:string;
  code:string;
  description:string;

}
export interface PlantPartDTO {
  id: number;
  name: string;
  description?: string;
}


export interface PestSymptom {
  id: number;
  name: string;
  description?: string;
}

export interface PestSymptomDTO {
  id?: number | null;
  name: string;
  description?: string;
}
export interface Pest {
  id: number;
  name: string;
  description?: string;
  pestSymptoms?: PestSymptomDTO[];
}

export interface PestDTO {
  id?: number | null;
  name: string;
  description?: string;
  pestSymptoms: { id: number }[];
}

export type DiseaseSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; // chỉnh lại đúng theo enum thật

export interface Disease {
  id: number;
  name: string;
  description?: string;
  severity: DiseaseSeverity;
}

export interface DiseaseDTO {
  id?: number | null;
  name: string;
  description?: string;
  severity: DiseaseSeverity | string;
}

export interface Treatment {
  id: number;
  method: string;
  description?: string;
}

export interface TreatmentDTO {
  id?: number | null;
  method: string;
  description?: string;
}

export interface PestDisease {
  id: number;
  pestId: number;
  diseaseId: number;
  description?: string;
  transmissionRole?: string;
  diseaseName?: string;
  diseaseSeverity?: string;
}

export interface PestDiseaseDTO {
  id?: number | null;
  pestId: number;
  diseaseId: number;
  description?: string;
  transmissionRole?: string;
}