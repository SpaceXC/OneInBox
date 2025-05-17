import { ref, isRef, watch, onUnmounted } from 'vue';
import type { Ref } from 'vue';

const getMimeTypeFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    ico: 'image/x-icon',
    pdf: 'application/pdf',
    txt: 'text/plain',
    json: 'application/json',
    html: 'text/html',
    csv: 'text/csv',
  };
  return mimeTypes[extension ?? ''] || 'application/octet-stream';
};

export function useBlobUrl(
  bufferSource: ArrayBuffer | null | Ref<ArrayBuffer | null>,
  fileNameSource: string | Ref<string>
) {
  const url = ref<string | null>(null);
  let objectUrl: string | null = null;

  const arrayBufferRef = isRef(bufferSource) ? bufferSource : ref(bufferSource);
  const fileNameRef = isRef(fileNameSource) ? fileNameSource : ref(fileNameSource);

  const createUrl = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }

    const buffer = arrayBufferRef.value;
    const fileName = fileNameRef.value;

    if (buffer) {
      const mimeType = getMimeTypeFromFileName(fileName);
      const blob = new Blob([buffer], { type: mimeType });
      objectUrl = URL.createObjectURL(blob);
      url.value = objectUrl;
    } else {
      url.value = null;
    }
  };

  watch([arrayBufferRef, fileNameRef], createUrl, { immediate: true });

  onUnmounted(() => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  });

  return { url };
}