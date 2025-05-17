export function bufferToBlobUrl(arrayBuffer: ArrayBuffer, fileName: string): string {
    const mimeType = getMimeTypeFromFileName(fileName);
    const blob = new Blob([arrayBuffer], { type: mimeType });
    return URL.createObjectURL(blob);
};

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

        // 你也可以添加其他类型
        pdf: 'application/pdf',
        txt: 'text/plain',
        json: 'application/json',
        html: 'text/html',
        csv: 'text/csv',
    };

    return mimeTypes[extension ?? ''] || 'application/octet-stream';
};