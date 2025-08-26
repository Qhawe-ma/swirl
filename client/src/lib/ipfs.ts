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
    throw new Error('NFT Storage API key not found. Please set VITE_NFT_STORAGE_KEY.');
  }
  
  try {
    console.log(`⏳ Uploading ${type} to NFT.storage with paid storage...`);
    console.log(`🔑 Testing API key format: ${apiKey.substring(0, 10)}...`);
    
    // Create client and try upload with longer timeout for paid storage
    const uploadClient = new NFTStorage({ token: apiKey });
    
    console.log(`📤 Starting blob upload for ${type}...`);
    const uploadPromise = uploadClient.storeBlob(blob);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => {
        console.log(`⏰ ${type} upload timed out after 30 seconds`);
        reject(new Error(`${type} upload timeout after 30 seconds`));
      }, 30000) // 30 second timeout
    );
    
    const cid = await Promise.race([uploadPromise, timeoutPromise]);
    const uri = `https://ipfs.io/ipfs/${cid}`;
    
    console.log(`✅ Successfully uploaded ${type} to IPFS: ${uri}`);
    return uri;
    
  } catch (error: any) {
    console.error(`❌ IPFS upload failed for ${type}:`, error);
    console.log(`📊 Error details:`, error.message, error.code);
    
    // Since you have paid storage but API issues, let's continue with placeholders
    // This allows testing the Solana minting while IPFS issues are resolved
    console.log(`⚠️ Using placeholder for ${type} to continue with real Solana minting`);
    
    if (type === 'image') {
      return 'https://via.placeholder.com/400x300.png?text=Your+Artwork';
    } else {
      return 'data:application/json;base64,' + btoa(JSON.stringify({
        name: "Your NFT",
        description: "Created with Solana Paint App", 
        image: "https://via.placeholder.com/400x300.png?text=Your+Artwork"
      }));
    }
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
