export interface MediaListItem {
  readonly id: string;
  readonly originalFilename: string;
  readonly mimeType: string;
  readonly extension: string;
  readonly fileSize: number;
  readonly width: number | null;
  readonly height: number | null;
  readonly altUk: string | null;
  readonly altEn: string | null;
  readonly usageCount: number;
  readonly publicUrl: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface MediaDetail {
  readonly id: string;
  readonly storageBucket: string;
  readonly storagePath: string;
  readonly originalFilename: string;
  readonly generatedFilename: string;
  readonly extension: string;
  readonly mimeType: string;
  readonly fileSize: number;
  readonly width: number | null;
  readonly height: number | null;
  readonly altUk: string | null;
  readonly altEn: string | null;
  readonly titleUk: string | null;
  readonly titleEn: string | null;
  readonly captionUk: string | null;
  readonly captionEn: string | null;
  readonly copyright: string | null;
  readonly photographer: string | null;
  readonly license: string | null;
  readonly isPublic: boolean;
  readonly isOptimized: boolean;
  readonly hasWebp: boolean;
  readonly usageCount: number;
  readonly publicUrl: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface MediaListFilters {
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string | undefined;
  readonly mimeType?: string | undefined;
  readonly filter?: "all" | "unused" | undefined;
}

export interface MediaMetadataInput {
  readonly altUk: string | null;
  readonly altEn: string | null;
  readonly titleUk: string | null;
  readonly titleEn: string | null;
  readonly captionUk: string | null;
  readonly captionEn: string | null;
  readonly copyright: string | null;
  readonly photographer: string | null;
  readonly license: string | null;
  readonly isPublic: boolean;
}
