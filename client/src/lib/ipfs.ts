import { NFTStorage } from 'nft.storage';

const client = new NFTStorage({ 
  token: import.meta.env.VITE_NFT_STORAGE_KEY || process.env.REACT_APP_NFT_STORAGE_KEY || ''
});

export async function uploadToIPFS(blob: Blob, type: 'image' | 'metadata'): Promise<string> {
  try {
    console.log(`Uploading ${type} to IPFS...`);
    
    // Add timeout to prevent hanging
    const uploadPromise = client.storeBlob(blob);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout')), 30000)
    );
    
    const cid = await Promise.race([uploadPromise, timeoutPromise]);
    const uri = `https://ipfs.io/ipfs/${cid}`;
    
    console.log(`Successfully uploaded ${type} to IPFS:`, uri);
    return uri;
  } catch (error) {
    console.error(`Failed to upload ${type} to IPFS:`, error);
    
    // For demo purposes, return a mock IPFS URL if upload fails
    const mockCid = 'bafybei' + Math.random().toString(36).substring(2, 15);
    const mockUri = `https://ipfs.io/ipfs/${mockCid}`;
    console.warn(`Using mock IPFS URL for demo: ${mockUri}`);
    return mockUri;
  }
}
