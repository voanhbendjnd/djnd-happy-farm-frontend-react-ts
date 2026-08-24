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
