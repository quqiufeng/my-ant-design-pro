import { request } from '@umijs/max';
import type {
  AdminFormData,
  AdminItem,
  AdminListParams,
  AdminListResponse,
} from './data';

export async function queryAdminList(params: AdminListParams) {
  return request<AdminListResponse>('/api/admin', {
    method: 'GET',
    params,
  });
}

export async function getAdminDetail(id: number) {
  return request<{ success: boolean; data: AdminItem }>(`/api/admin/${id}`, {
    method: 'GET',
  });
}

export async function createAdmin(data: AdminFormData) {
  return request<{ success: boolean; message: string }>('/api/admin', {
    method: 'POST',
    data,
  });
}

export async function updateAdmin(id: number, data: AdminFormData) {
  return request<{ success: boolean; message: string }>(`/api/admin/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteAdmin(id: number) {
  return request<{ success: boolean; message: string }>(`/api/admin/${id}`, {
    method: 'DELETE',
  });
}
 // 角色ID 下拉选项
 export async function getRole_idOptions() {
   return request<{ data: { name: string; id: number }[] }>('/api/role', {
     method: 'GET',
   });
 }
