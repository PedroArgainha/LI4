import type { TipoConta } from '../types/auth';

export const ROLES = {
  PROPRIETARIO:      'PROPRIETARIO',
  FUNC_ADMINISTRATIVO: 'FUNC_ADMINISTRATIVO',
  FUNC_OPERACIONAL:  'FUNC_OPERACIONAL',
  DIRECAO:           'DIRECAO',
  ADMIN:             'ADMIN',
} as const;

// Quem pode aceder ao backoffice
export const isBackoffice = (role?: TipoConta) =>
  role === 'FUNC_ADMINISTRATIVO' ||
  role === 'FUNC_OPERACIONAL' ||
  role === 'DIRECAO' ||
  role === 'ADMIN';

export const isAdmin = (role?: TipoConta) =>
  role === 'ADMIN';

export const isDirecao = (role?: TipoConta) =>
  role === 'DIRECAO' || role === 'ADMIN';

export const isAdminOrDirecao = (role?: TipoConta) =>
  role === 'ADMIN' || role === 'DIRECAO';

export const ROLE_LABELS: Record<TipoConta, string> = {
  PROPRIETARIO:        'Proprietário',
  FUNC_ADMINISTRATIVO: 'Func. Administrativo',
  FUNC_OPERACIONAL:    'Func. Operacional',
  DIRECAO:             'Direção',
  ADMIN:               'Administrador',
};
