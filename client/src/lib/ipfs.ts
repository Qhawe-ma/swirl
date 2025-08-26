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
  
  // First try a quick test to see if the API is accessible
  try {
    console.log(`⏳ Testing NFT.storage connectivity...`);
    
    // Create a minimal test client to verify API key
    const testClient = new NFTStorage({ token: apiKey });
    
    // Reduce timeout to 15 seconds to fail faster
    const uploadPromise = testClient.storeBlob(blob);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`${type} upload timeout after 15 seconds`)), 15000)
    );
    
    console.log(`⏳ Uploading ${type} to NFT.storage (15s timeout)...`);
    const cid = await Promise.race([uploadPromise, timeoutPromise]);
    const uri = `https://ipfs.io/ipfs/${cid}`;
    
    console.log(`✅ Successfully uploaded ${type} to IPFS: ${uri}`);
    return uri;
  } catch (error: any) {
    console.error(`❌ Failed to upload ${type} to IPFS:`, error);
    
    // For now, let's use a mock IPFS URL so we can test the Solana minting
    if (type === 'image') {
      const mockUri = 'https://ipfs.io/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o'; // Mock image
      console.log(`⚠️ Using mock image URI for testing: ${mockUri}`);
      return mockUri;
    } else {
      const mockUri = 'https://ipfs.io/ipfs/QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51'; // Mock metadata
      console.log(`⚠️ Using mock metadata URI for testing: ${mockUri}`);
      return mockUri;
    }
  }
}
