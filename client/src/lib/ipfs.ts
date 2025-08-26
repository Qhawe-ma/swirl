import { NFTStorage } from 'nft.storage';

const client = new NFTStorage({ 
  token: import.meta.env.VITE_NFT_STORAGE_KEY || process.env.REACT_APP_NFT_STORAGE_KEY || ''
});

export async function uploadToIPFS(blob: Blob, type: 'image' | 'metadata'): Promise<string> {
  console.log(`📤 Starting ${type} upload to IPFS (size: ${blob.size} bytes)...`);
  
  // Check if we have a valid API key
  const apiKey = import.meta.env.VITE_NFT_STORAGE_KEY || process.env.REACT_APP_NFT_STORAGE_KEY;
  console.log(`🔑 Using API key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'NOT FOUND'}`);
  
  if (!apiKey) {
    console.log(`❌ No API key found, using placeholder for ${type}`);
    return getPlaceholderUrl(type);
  }
  
  try {
    console.log(`⏳ Attempting upload to NFT.storage...`);
    
    // Create client and try upload
    const uploadClient = new NFTStorage({ token: apiKey });
    const uploadPromise = uploadClient.storeBlob(blob);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout')), 5000)
    );
    
    const cid = await Promise.race([uploadPromise, timeoutPromise]);
    const uri = `https://ipfs.io/ipfs/${cid}`;
    
    console.log(`✅ Successfully uploaded ${type} to IPFS: ${uri}`);
    return uri;
    
  } catch (error: any) {
    console.error(`❌ IPFS upload failed for ${type}:`, error);
    console.log(`⚠️ Using placeholder URL for ${type} to continue with Solana minting`);
    return getPlaceholderUrl(type);
  }
}

function getPlaceholderUrl(type: 'image' | 'metadata'): string {
  if (type === 'image') {
    return 'https://via.placeholder.com/400x300.png?text=Test+Artwork';
  } else {
    // For metadata, create a simple JSON structure  
    return 'data:application/json;base64,' + btoa(JSON.stringify({
      name: "Test NFT",
      description: "Test artwork from Solana Paint App", 
      image: "https://via.placeholder.com/400x300.png?text=Test+Artwork"
    }));
  }
}
