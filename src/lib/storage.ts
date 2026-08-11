/**
 * Receipt & Storage Utilities
 */

export const isPdfUrl = (url?: string): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.startsWith('data:application/pdf') ||
    lower.endsWith('.pdf') ||
    lower.includes('.pdf?') ||
    lower.includes('/pdf')
  );
};

export const openReceiptUrl = (url?: string) => {
  if (!url) return;

  // If base64 PDF data URL, convert to Blob URL for clean browser tab rendering
  if (url.startsWith('data:application/pdf')) {
    try {
      const arr = url.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      return;
    } catch (err) {
      console.error('Error opening base64 PDF as blob:', err);
    }
  }

  // Standard URL or relative path
  window.open(url, '_blank');
};
