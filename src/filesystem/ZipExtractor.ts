import { ZipReader, BlobReader, BlobWriter } from '@zip.js/zip.js';
import { GameFileSystem } from './GameFileSystem';

export async function extractZipToVFS(gameId: string, zipBlob: Blob, onProgress?: (progress: number, currentFile: string) => void): Promise<string[]> {
  const zipFileReader = new BlobReader(zipBlob);
  const zipReader = new ZipReader(zipFileReader);
  const entries = await zipReader.getEntries();
  
  const extractedPaths: string[] = [];
  let processed = 0;
  let lastReportedProgress = -1;

  let batch: { gameId: string, filePath: string, data: Blob, mimeType: string }[] = [];

  for (const entry of entries) {
    if (!entry.directory && entry.getData) {
      // By using BlobWriter here, we only keep the current file in memory
      const blob = await entry.getData(new BlobWriter());
      
      const mimeType = 'application/octet-stream'; // SW handles real mimetype
      
      batch.push({ gameId, filePath: entry.filename, data: blob, mimeType });
      extractedPaths.push(entry.filename);

      // Save to IDB in small batches to allow GC to clean up the Blobs
      if (batch.length >= 50) {
        await GameFileSystem.writeFiles(batch);
        batch = [];
      }
    }
    
    processed++;
    const currentProgress = Math.round((processed / entries.length) * 100);
    if (currentProgress > lastReportedProgress) {
      lastReportedProgress = currentProgress;
      if (onProgress) {
        onProgress(currentProgress, entry.filename);
      }
    }
  }

  if (batch.length > 0) {
    await GameFileSystem.writeFiles(batch);
  }

  await zipReader.close();
  return extractedPaths;
}
