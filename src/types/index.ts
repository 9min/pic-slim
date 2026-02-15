export type ImageFormat = "Jpeg" | "Png" | "Gif";

export type ImageStatus = "pending" | "compressing" | "done" | "error";

export interface ImageFileInfo {
  id: string;
  path: string;
  name: string;
  size: number;
  size_display: string;
  format: ImageFormat;
  thumbnail: string;
}

export interface ImageItem extends ImageFileInfo {
  status: ImageStatus;
  compressed_size?: number;
  compressed_size_display?: string;
  output_path?: string;
  error?: string;
  ratio?: number; // compression ratio percentage (e.g., -32 means 32% smaller)
}

export interface CompressionSettings {
  quality: number;
  output_dir: string;
}

export interface CompressionResult {
  success: boolean;
  original_size: number;
  compressed_size: number;
  output_path: string;
  error: string | null;
}

export interface CompressionEvent {
  event_type: "start" | "complete" | "error";
  image_id: string;
  result: CompressionResult | null;
}

export type AppState = "empty" | "ready" | "compressing" | "done";
