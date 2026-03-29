import { supabase } from '../lib/supabase';

export type DiscType = 'distance_driver' | 'fairway_driver' | 'midrange' | 'approach' | 'putter';
export type DiscStatus = 'bag' | 'shelf';

const VALID_DISC_TYPES: DiscType[] = ['distance_driver', 'fairway_driver', 'midrange', 'approach', 'putter'];
const VALID_STATUSES: DiscStatus[] = ['bag', 'shelf'];
const MAX_TEXT_LENGTH = 200;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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

// ---- Input sanitization ----

function truncate(value: string | undefined, max = MAX_TEXT_LENGTH): string | undefined {
  if (!value) return value;
  return value.slice(0, max);
}

function sanitizeDiscData(data: DiscCreate): DiscCreate {
  return {
    ...data,
    brand: truncate(data.brand, MAX_TEXT_LENGTH)!,
    model: truncate(data.model, MAX_TEXT_LENGTH)!,
    comment: truncate(data.comment, 500),
    ace_course: truncate(data.ace_course, MAX_TEXT_LENGTH),
    color: truncate(data.color, 20),
    disc_type: VALID_DISC_TYPES.includes(data.disc_type) ? data.disc_type : 'midrange',
    status: data.status && VALID_STATUSES.includes(data.status) ? data.status : 'shelf',
    speed: clampInt(data.speed, 0, 15),
    glide: clampInt(data.glide, 0, 7),
    turn: clampInt(data.turn, -5, 5),
    fade: clampInt(data.fade, 0, 5),
    ace_hole: data.ace_hole != null ? clampInt(data.ace_hole, 1, 99) : undefined,
    zone: data.zone != null ? clampInt(data.zone, 0, 20) : undefined,
    ace_rank: data.ace_rank != null ? clampInt(data.ace_rank, 1, 3) : null,
  };
}

function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

// ---- Allowed fields for partial updates ----

const UPDATABLE_FIELDS = new Set([
  'brand', 'model', 'disc_type', 'speed', 'glide', 'turn', 'fade',
  'status', 'color', 'comment', 'is_ace', 'ace_course', 'ace_hole',
  'ace_rank', 'zone', 'sort_order', 'photo_url',
]);

function pickAllowedFields(fields: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (UPDATABLE_FIELDS.has(key)) {
      clean[key] = value;
    }
  }
  return clean;
}

// ---- API functions ----

export const getDiscs = async (status?: DiscStatus) => {
  let query = supabase.from('discs').select('*');
  if (status && VALID_STATUSES.includes(status)) query = query.eq('status', status);
  return query.order('zone', { ascending: true }).order('sort_order', { ascending: true });
};

export const getAces = async () => {
  return supabase.from('discs').select('*').eq('is_ace', true).order('ace_rank', { ascending: true, nullsFirst: false }).order('sort_order', { ascending: true });
};

export const createDisc = async (discData: DiscCreate) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const sanitized = sanitizeDiscData(discData);
  return supabase.from('discs').insert({ ...sanitized, user_id: user.id }).select().single();
};

export const moveDisc = async (discId: number, status: DiscStatus) => {
  if (!VALID_STATUSES.includes(status)) throw new Error('Invalid status');
  return supabase.from('discs').update({ status }).eq('id', discId);
};

export const updateDiscFields = async (discId: number, fields: Record<string, unknown>) => {
  const clean = pickAllowedFields(fields);
  if (Object.keys(clean).length === 0) return;
  return supabase.from('discs').update(clean).eq('id', discId);
};

export const toggleAce = async (discId: number, isAce: boolean, aceHole?: number, aceCourse?: string) => {
  const update: { is_ace: boolean; ace_hole?: number | null; ace_course?: string | null; ace_rank?: number | null } = { is_ace: isAce };
  if (isAce) {
    update.ace_hole = aceHole != null ? clampInt(aceHole, 1, 99) : null;
    update.ace_course = truncate(aceCourse, MAX_TEXT_LENGTH) ?? null;
  } else {
    update.ace_hole = null;
    update.ace_course = null;
    update.ace_rank = null;
  }
  return supabase.from('discs').update(update).eq('id', discId);
};

export const uploadDiscPhoto = async (discId: number, file: File) => {
  // Validate file type (MIME, not just extension)
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Ugyldig filtype: ${file.type}. Kun JPG, PNG, WebP og GIF er tillatt.`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Filen er for stor. Maks 10 MB.');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  const fileExt = extMap[file.type] || 'jpg';
  const fileName = `${user.id}/${discId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('disc-photos')
    .upload(fileName, file, { contentType: file.type });

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
  const clean = pickAllowedFields(discData as Record<string, unknown>);
  return supabase.from('discs').update(clean).eq('id', discId).select().single();
};

export const reorderDiscs = async (updates: { id: number; sort_order: number; status?: DiscStatus; zone?: number }[]) => {
  return Promise.all(
    updates.map(({ id, sort_order, status, zone }) => {
      const data: Record<string, unknown> = { sort_order: clampInt(sort_order, 0, 9999) };
      if (status !== undefined && VALID_STATUSES.includes(status)) data.status = status;
      if (zone !== undefined) data.zone = clampInt(zone, 0, 20);
      return supabase.from('discs').update(data).eq('id', id);
    }),
  );
};

export const deleteDisc = async (discId: number) => {
  const { data: disc } = await supabase.from('discs').select('photo_url').eq('id', discId).single();

  if (disc?.photo_url) {
    try {
      const url = new URL(disc.photo_url);
      const parts = url.pathname.split('/disc-photos/');
      if (parts[1]) {
        await supabase.storage.from('disc-photos').remove([decodeURIComponent(parts[1])]);
      }
    } catch {
      // Invalid URL — skip storage cleanup
    }
  }

  return supabase.from('discs').delete().eq('id', discId);
};
