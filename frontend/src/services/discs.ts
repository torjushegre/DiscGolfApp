import { supabase } from '../lib/supabase';

export type DiscType = 'distance_driver' | 'fairway_driver' | 'midrange' | 'approach' | 'putter';
export type DiscStatus = 'bag' | 'shelf';

export const DISC_TYPE_LABELS: Record<DiscType, string> = {
  distance_driver: 'Distance Driver',
  fairway_driver: 'Fairway Driver',
  midrange: 'Midrange',
  approach: 'Approach',
  putter: 'Putter',
};

export const DISC_COLORS = [
  { name: 'Red', hex: '#e74c3c' },
  { name: 'Blue', hex: '#3498db' },
  { name: 'Yellow', hex: '#f1c40f' },
  { name: 'Green', hex: '#2ecc71' },
  { name: 'Orange', hex: '#e67e22' },
  { name: 'Pink', hex: '#e91e8a' },
  { name: 'Purple', hex: '#9b59b6' },
  { name: 'White', hex: '#ecf0f1' },
  { name: 'Black', hex: '#2c3e50' },
  { name: 'Teal', hex: '#1abc9c' },
];

export interface DiscCreate {
  brand: string;
  model: string;
  disc_type: DiscType;
  speed: number;
  glide: number;
  turn: number;
  fade: number;
  status?: DiscStatus;
  photo_url?: string | null;
  is_ace?: boolean;
  ace_course?: string;
  ace_hole?: number;
  ace_rank?: number | null;
  color?: string;
  comment?: string;
  zone?: number;
}

export interface Disc {
  id: number;
  brand: string;
  model: string;
  disc_type: DiscType;
  speed: number;
  glide: number;
  turn: number;
  fade: number;
  status: DiscStatus;
  photo_url: string | null;
  is_ace: boolean;
  ace_hole: number | null;
  ace_course: string | null;
  ace_rank: number | null;
  color: string;
  comment: string | null;
  sort_order: number;
  zone: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  name: string;
  holes: number[];
}

export const getDiscs = async (status?: DiscStatus) => {
  let query = supabase.from('discs').select('*');
  if (status) query = query.eq('status', status);
  return query.order('zone', { ascending: true }).order('sort_order', { ascending: true });
};

export const getAces = async () => {
  return supabase.from('discs').select('*').eq('is_ace', true).order('ace_rank', { ascending: true, nullsFirst: false }).order('sort_order', { ascending: true });
};

export const createDisc = async (discData: DiscCreate) => {
  const { data: { user } } = await supabase.auth.getUser();
  return supabase.from('discs').insert({ ...discData, user_id: user?.id }).select().single();
};

export const moveDisc = async (discId: number, status: DiscStatus) => {
  return supabase.from('discs').update({ status }).eq('id', discId);
};

export const updateDiscFields = async (discId: number, fields: Record<string, unknown>) => {
  return supabase.from('discs').update(fields).eq('id', discId);
};

export const toggleAce = async (discId: number, isAce: boolean, aceHole?: number, aceCourse?: string) => {
  const update: { is_ace: boolean; ace_hole?: number | null; ace_course?: string | null; ace_rank?: number | null } = { is_ace: isAce };
  if (isAce) {
    update.ace_hole = aceHole ?? null;
    update.ace_course = aceCourse ?? null;
  } else {
    update.ace_hole = null;
    update.ace_course = null;
    update.ace_rank = null;
  }
  return supabase.from('discs').update(update).eq('id', discId);
};

export const uploadDiscPhoto = async (discId: number, file: File) => {
  const { data: { user } } = await supabase.auth.getUser();
  const fileExt = file.name.split('.').pop();
  const fileName = `${user?.id}/${discId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('disc-photos')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('disc-photos')
    .getPublicUrl(fileName);

  return supabase.from('discs').update({ photo_url: publicUrl }).eq('id', discId);
};

export const getCourses = async () => {
  return supabase.from('courses').select('*');
};

export const updateDisc = async (discId: number, discData: Partial<DiscCreate>) => {
  return supabase.from('discs').update(discData).eq('id', discId).select().single();
};

export const reorderDiscs = async (updates: { id: number; sort_order: number; status?: DiscStatus; zone?: number }[]) => {
  return Promise.all(
    updates.map(({ id, sort_order, status, zone }) => {
      const data: Record<string, unknown> = { sort_order };
      if (status !== undefined) data.status = status;
      if (zone !== undefined) data.zone = zone;
      return supabase.from('discs').update(data).eq('id', id);
    }),
  );
};

export const deleteDisc = async (discId: number) => {
  const { data: disc } = await supabase.from('discs').select('photo_url').eq('id', discId).single();

  if (disc?.photo_url) {
    const fileName = disc.photo_url.split('/').pop();
    if (fileName) {
      await supabase.storage.from('disc-photos').remove([fileName]);
    }
  }

  return supabase.from('discs').delete().eq('id', discId);
};
