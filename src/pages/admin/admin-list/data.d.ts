export type AdminItem = {
  id: number;
  username: string;
  phone: string?;
  password: string;
  login_time: string?;
  role_id: number;
};

export type AdminListParams = {
  current?: number;
  page?: number;
  pageSize?: number;
  name?: string;
  sorter?: string;
  order?: 'ascend' | 'descend';
};

export type AdminListResponse = {
  success: boolean;
  data: AdminItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminFormData = {
  id?: number;
  username: string;
  password: string;
  phone: string;
  role_id: number;
};
