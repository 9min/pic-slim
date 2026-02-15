import { invoke, Channel } from "@tauri-apps/api/core";
import type {
  ImageFileInfo,
  CompressionSettings,
  CompressionResult,
  CompressionEvent,
} from "../types";

export async function loadImages(paths: string[]): Promise<ImageFileInfo[]> {
  return invoke<ImageFileInfo[]>("load_images", { paths });
}

export async function compressImages(
  images: ImageFileInfo[],
  settings: CompressionSettings,
  onEvent: (event: CompressionEvent) => void,
): Promise<CompressionResult[]> {
  const channel = new Channel<CompressionEvent>();
  channel.onmessage = onEvent;
  return invoke<CompressionResult[]>("compress_images", {
    images,
    settings,
    onEvent: channel,
  });
}

export async function openOutputFolder(path: string): Promise<void> {
  return invoke("open_output_folder", { path });
}

export async function getDefaultOutputDir(): Promise<string> {
  return invoke<string>("get_default_output_dir");
}

export async function getImagePreview(path: string): Promise<string> {
  return invoke<string>("get_image_preview", { path });
}
