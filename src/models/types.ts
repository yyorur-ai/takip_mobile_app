export type Role = 'admin' | 'assistant' | 'member' | string;

export type User = {
  id: number;
  username: string;
  role: Role;
};

export type Project = {
  id: number;
  project_no: string;
  project_date: string;
  target_shipment_date?: string | null;
  shipment_date?: string | null;
  company_name: string;
  project_name: string;
  status: string;
  vehicle_note?: string | null;
  total_sqm?: number | string | null;
  total_weight_kg?: number | string | null;
};

export type Panel = { id: number; name: string };
export type Consumable = { id: number; name: string };

export type ProjectPanelItem = {
  id?: number;
  project_id?: number;
  panel_id: number;
  panel_name?: string;
  name?: string;
  qty: number;
  width_cm: number;
  height_cm: number;
  sqm: number;
  weight_kg: number;
};

export type ProjectConsumableItem = {
  id?: number;
  project_id?: number;
  consumable_id: number;
  consumable_name?: string;
  name?: string;
  qty: number;
};

export type ImageItem = {
  id: number;
  project_id?: number;
  sample_id?: number;
  category: string;
  image_path: string;
  original_name?: string;
  created_at?: string;
};

export type Sample = {
  id: number;
  sample_no: string;
  sample_date: string;
  sample_name: string;
  status: string;
  note?: string | null;
};
