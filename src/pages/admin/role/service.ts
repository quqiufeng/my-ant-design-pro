import { request } from '@umijs/max';
import type {
  RoleFormData,
  RoleItem,
  RoleListParams,
  RoleListResponse,
} from './data';

export async function queryRoleList(params: RoleListParams) {
  return request<RoleListResponse>('/api/role', {
    method: 'GET',
    params,
  });
}

export async function getRoleDetail(id: number) {
  return request<{ success: boolean; data: RoleItem }>(`/api/role/${id}`, {
    method: 'GET',
  });
}

export async function createRole(data: RoleFormData) {
  return request<{ success: boolean; message: string }>('/api/role', {
    method: 'POST',
    data,
  });
}

export async function updateRole(id: number, data: RoleFormData) {
  return request<{ success: boolean; message: string }>(`/api/role/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteRole(id: number) {
  return request<{ success: boolean; message: string }>(`/api/role/${id}`, {
    method: 'DELETE',
  });
}
