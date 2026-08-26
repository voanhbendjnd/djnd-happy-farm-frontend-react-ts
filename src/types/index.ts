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