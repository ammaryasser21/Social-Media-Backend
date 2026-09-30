export enum UPLOAD_WAY {
  SINGLE="single",
  ARRAY="array",
  FIELDS= "fields",
  ANY= "any",
  NONE= "none",
} ;

// ─────────────────────────────────────────────
// MIME TYPES
// ─────────────────────────────────────────────

export const MIME_TYPES = {
  IMAGE: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ],

  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],

  EXCEL: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],

  VIDEO: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
  ],

  AUDIO: [
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
  ],
} as const;

export type MimeType =
  (typeof MIME_TYPES)[keyof typeof MIME_TYPES][number];


// ─────────────────────────────────────────────
// FILE EXTENSIONS
// ─────────────────────────────────────────────

export const FILE_TYPES = {
  IMAGE: ["jpg", "jpeg", "png", "gif", "webp"],
  DOCUMENT: ["pdf", "doc", "docx"],
  EXCEL: ["xls", "xlsx"],
  VIDEO: ["mp4", "mov", "avi", "mkv"],
  AUDIO: ["mp3", "wav"],
} as const;

export type FileExtension =
  (typeof FILE_TYPES)[keyof typeof FILE_TYPES][number];


// ─────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────

export enum STORAGE_TYPES {
  DISK= "disk",
  MEMORY= "memory",
};
