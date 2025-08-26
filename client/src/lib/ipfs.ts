import { NFTStorage } from 'nft.storage';

const client = new NFTStorage({ 
  token: import.meta.env.VITE_NFT_STORAGE_KEY || process.env.REACT_APP_NFT_STORAGE_KEY || ''
});

export async function uploadToIPFS(blob: Blob, type: 'image' | 'metadata'): Promise<string> {
  console.log(`📤 Starting ${type} upload to IPFS (size: ${blob.size} bytes)...`);
  
  // Check if we have a valid API key
  const apiKey = import.meta.env.VITE_NFT_STORAGE_KEY || process.env.REACT_APP_NFT_STORAGE_KEY;
  if (!apiKey) {
    throw new Error('NFT Storage API key not found. Please set VITE_NFT_STORAGE_KEY.');
  }
  
  try {
    console.log(`⏳ Uploading ${type} to NFT.storage...`);
    
    // Use the client with the real API key
    const uploadPromise = client.storeBlob(blob);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`${type} upload timeout after 30 seconds`)), 30000)
    );
    
    const cid = await Promise.race([uploadPromise, timeoutPromise]);
    const uri = `https://ipfs.io/ipfs/${cid}`;
    
    console.log(`✅ Successfully uploaded ${type} to IPFS: ${uri}`);
    return uri;
  } catch (error: any) {
    console.error(`❌ Failed to upload ${type} to IPFS:`, error);
    
    if (error.message?.includes('timeout')) {
      throw new Error(`${type} upload timed out. Please try again.`);
    } else if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
      throw new Error('Invalid NFT Storage API key. Please check your configuration.');
    } else if (error.message?.includes('network')) {
      throw new Error('Network error during upload. Please check your connection and try again.');
    } else {
      throw new Error(`Failed to upload ${type}: ${error.message || 'Unknown error'}`);
    }
  }
}
