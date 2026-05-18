import imageCompression from 'browser-image-compression';

export interface CompressImageOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  initialQuality?: number;
  useWebWorker?: boolean;
}

/**
 * Smart Image Compression using browser-image-compression.
 * 
 * Target size is around 800KB - 1MB to preserve detail without bloating storage.
 * Target dimension is 1920px (Full HD) to keep images sharp enough for textual/evaluative evidence.
 * 
 * @param file The original image file from input
 * @param customOptions Optional configuration to override defaults
 * @returns A Promise resolving to a compressed File/Blob
 */
export const compressImageBlob = async (
  file: File, 
  customOptions?: CompressImageOptions
): Promise<File | Blob> => {
  const options = {
    // 1MB ensures the file is small enough but retains important details (not heavily fragmented)
    maxSizeMB: customOptions?.maxSizeMB || 1, 
    // 1920px is Full HD, sweet spot for readable text/details without consuming huge memory
    maxWidthOrHeight: customOptions?.maxWidthOrHeight || 1920, 
    // WebWorker speeds up compression by offloading it from the main UI thread
    useWebWorker: customOptions?.useWebWorker ?? true,
    // 80% quality retains sharpness for evidence validation while stripping out bloat
    initialQuality: customOptions?.initialQuality || 0.8, 
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Error compressing image:", error);
    // If it fails, fallback to the original file to avoid data loss
    return file;
  }
};
