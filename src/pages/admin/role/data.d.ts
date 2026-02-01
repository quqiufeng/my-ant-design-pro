export type RoleItem = {
  id: number;
  name: string;
};

export type RoleListParams = {
  current?: number;
  page?: number;
  pageSize?: number;
  name?: string;
  sorter?: string;
  order?: 'ascend' | 'descend';
};

export type RoleListResponse = {
  success: boolean;
  data: RoleItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type RoleFormData = {
  id?: number;
  name: string;
};
