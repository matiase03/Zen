/**
 * Robust downloader utility for Zenonia 3 PortMaster packages
 * Handles iframe restrictions, blob conversions, and progress
 */

export interface DownloadProgress {
  status: 'idle' | 'downloading' | 'ready' | 'error';
  progress: number;
  message?: string;
  error?: string;
}

export async function downloadZipPackage(
  onProgress?: (p: DownloadProgress) => void
): Promise<boolean> {
  if (onProgress) {
    onProgress({ status: 'downloading', progress: 10, message: 'Iniciando descarga del paquete...' });
  }

  try {
    // Attempt download via /api/download first, fallback to /zenonia3_r36s_portmaster.zip
    const urls = ['/api/download', '/zenonia3_r36s_portmaster.zip'];
    let response: Response | null = null;

    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          response = res;
          break;
        }
      } catch {
        // try next
      }
    }

    if (!response || !response.ok) {
      throw new Error('No se pudo conectar con el servidor de archivos.');
    }

    if (onProgress) {
      onProgress({ status: 'downloading', progress: 45, message: 'Recibiendo datos binarios (11.2 MB)...' });
    }

    const arrayBuffer = await response.arrayBuffer();

    // Verify it is a valid ZIP header (starts with PK\x03\x04 = 0x50, 0x4B, 0x03, 0x04)
    const uint8 = new Uint8Array(arrayBuffer);
    if (uint8.length < 4 || uint8[0] !== 0x50 || uint8[1] !== 0x4B) {
      console.warn('Zip signature warning, proceeding with binary blob anyway');
    }

    if (onProgress) {
      onProgress({ status: 'downloading', progress: 85, message: 'Creando archivo ZIP seguro...' });
    }

    const blob = new Blob([arrayBuffer], { type: 'application/zip' });
    const blobUrl = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    anchor.href = blobUrl;
    anchor.download = 'zenonia3_r36s_portmaster.zip';
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(blobUrl);
    }, 2500);

    if (onProgress) {
      onProgress({ status: 'ready', progress: 100, message: '¡Archivo descargado correctamente!' });
    }

    return true;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error al procesar la descarga';
    console.error('Download error:', err);
    if (onProgress) {
      onProgress({ 
        status: 'error', 
        progress: 0, 
        error: errorMsg 
      });
    }

    // Direct fallback navigation
    try {
      window.location.href = '/api/download';
    } catch {
      // ignore
    }

    return false;
  }
}

export function downloadTextFile(filename: string, content: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 1000);
}

export async function downloadOverlayPackage(
  onProgress?: (p: DownloadProgress) => void
): Promise<boolean> {
  if (onProgress) {
    onProgress({ status: 'downloading', progress: 15, message: 'Iniciando descarga del binario...' });
  }

  try {
    const urls = ['/api/download-overlay', '/zenonia3-r36s-overlay.zip'];
    let response: Response | null = null;

    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          response = res;
          break;
        }
      } catch {
        // try next
      }
    }

    if (!response || !response.ok) {
      throw new Error('No se pudo conectar con el servidor.');
    }

    if (onProgress) {
      onProgress({ status: 'downloading', progress: 60, message: 'Descargando binario y stubs ARM...' });
    }

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'application/zip' });
    const blobUrl = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    anchor.href = blobUrl;
    anchor.download = 'zenonia3-r36s-overlay.zip';
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(blobUrl);
    }, 2500);

    if (onProgress) {
      onProgress({ status: 'ready', progress: 100, message: '¡Binario descargado correctamente!' });
    }

    return true;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error al procesar la descarga';
    if (onProgress) {
      onProgress({ status: 'error', progress: 0, error: errorMsg });
    }
    return false;
  }
}
