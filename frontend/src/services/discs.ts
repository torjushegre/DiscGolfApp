import { supabase } from '../lib/supabase';

export interface DiscCreate {
  brand: string;
  model: string;
  disc_type: string;
  speed: number;
  glide: number;
  turn: number;
  fade: number;
  status?: string;
  photo_url?: string | null;
}

export interface Disc {
  id: number;
  brand: string;
  model: string;
  disc_type: string;
  speed: number;
  glide: number;
  turn: number;
  fade: number;
  status: string;
  photo_url: string | null;
  ace_hole: number | null;
  ace_course: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  name: string;
  holes: number[];
}

export const getDiscs = async (status?: string) => {
  let query = supabase.from('discs').select('*');
  if (status) query = query.eq('status', status);
  return query.order('created_at', { ascending: false });
};

export const getBag = async () => {
  return supabase.from('discs').select('*').eq('status', 'bag').order('created_at', { ascending: false });
};

export const getShelf = async () => {
  return supabase.from('discs').select('*').eq('status', 'shelf').order('created_at', { ascending: false });
};

export const getWallOfFame = async () => {
  return supabase.from('discs').select('*').eq('status', 'wall_of_fame').order('created_at', { ascending: false });
};

export const createDisc = async (discData: DiscCreate) => {
  return supabase.from('discs').insert(discData).select().single();
};

export const moveDisc = async (discId: number, status: string, aceHole?: number, aceCourse?: string) => {
  const update: { status: string; ace_hole?: number; ace_course?: string } = { status };
  if (aceHole) update.ace_hole = aceHole;
  if (aceCourse) update.ace_course = aceCourse;
  return supabase.from('discs').update(update).eq('id', discId);
};

export const uploadDiscPhoto = async (discId: number, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${discId}-${Date.now()}.${fileExt}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('disc-photos')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('disc-photos')
    .getPublicUrl(fileName);

  // Update disc with photo_url
  return supabase.from('discs').update({ photo_url: publicUrl }).eq('id', discId);
};

export const getCourses = async () => {
  return supabase.from('courses').select('*');
};
