import http from './http';
import type { LoginRequest, LoginResponse, RegistoRequest } from '../types/auth';

export const authApi = {
  login: (data: LoginRequest) =>
    http.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  registar: (data: RegistoRequest) =>
    http.post<LoginResponse>('/auth/registar', data).then((r) => r.data),
};
