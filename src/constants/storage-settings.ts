export const STORAGE_PROVIDERS = ["supabase"] as const;

export type StorageProvider = (typeof STORAGE_PROVIDERS)[number];

export const STORAGE_PROVIDER_LABELS: Record<StorageProvider, string> = {
  supabase: "Supabase Storage",
};

export const UPLOAD_SIZE_LIMITS = {
  minMb: 1,
  maxMb: 500,
  defaultMb: 25,
} as const;

export const IMAGE_COMPRESSION_QUALITY_LIMITS = {
  min: 40,
  max: 100,
  default: 80,
} as const;
