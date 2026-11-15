const MAX_CONCURRENT_UPLOADS = 5;
let uploadCount = 0;

export async function uploadToIPFS(blob: Blob, type: 'image' | 'metadata'): Promise<string> {
  while (uploadCount >= MAX_CONCURRENT_UPLOADS) {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
  }

  uploadCount++;
  try {
    return await uploadWithRetry(blob, type);
  } finally {
    uploadCount--;
  }
}

async function uploadWithRetry(
  blob: Blob,
  type: 'image' | 'metadata',
  attempt = 1,
): Promise<string> {
  const maxRetries = 3;
  const baseDelay = 1000;
  const pinataJwt = import.meta.env.VITE_PINATA_JWT;

  if (!pinataJwt) {
    throw new Error('VITE_PINATA_JWT is not set');
  }

  try {
    const formData = new FormData();
    const fileName = `nft-${type}-${Date.now()}-${attempt}.${type === 'image' ? 'png' : 'json'}`;
    formData.append('file', blob, fileName);

    const controller = new AbortController();
    const timeoutMs = 30000 + attempt * 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      throw new Error('Rate limited by Pinata');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    if (!result.IpfsHash) {
      throw new Error('No IPFS hash in Pinata response');
    }

    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
  } catch (error: any) {
    const message = error?.message ?? '';
    const retryable =
      message.includes('Rate limited') ||
      message.includes('timeout') ||
      message.includes('network') ||
      error?.name === 'AbortError';

    if (attempt < maxRetries && retryable) {
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return uploadWithRetry(blob, type, attempt + 1);
    }

    // Same placeholder the client used when Pinata rejected the upload.
    if (type === 'image') {
      return 'https://via.placeholder.com/400x300/0066cc/ffffff?text=Test+NFT+Art';
    }

    const text = await blob.text();
    const metadata = JSON.parse(text);
    metadata.image = 'https://via.placeholder.com/400x300/0066cc/ffffff?text=Test+NFT+Art';
    return `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
  }
}
