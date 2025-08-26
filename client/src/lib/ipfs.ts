import { NFTStorage } from 'nft.storage';

export async function uploadToIPFS(blob: Blob, type: 'image' | 'metadata'): Promise<string> {
  console.log(`📤 Starting ${type} upload to IPFS (size: ${blob.size} bytes)...`);
  
  // Check if we have a valid API key
  const apiKey = import.meta.env.VITE_NFT_STORAGE_KEY || process.env.REACT_APP_NFT_STORAGE_KEY;
  console.log(`🔑 API key found: ${apiKey ? 'YES' : 'NO'}`);
  console.log(`🔑 API key format: ${apiKey ? apiKey.substring(0, 10) + '...' : 'NONE'}`);
  
  if (!apiKey) {
    throw new Error('NFT Storage API key not found. Please set VITE_NFT_STORAGE_KEY.');
  }
  
  console.log(`⏳ Creating NFTStorage client with your paid account...`);
  
  try {
    // Create a fresh client with the API key
    const client = new NFTStorage({ token: apiKey });
    
    console.log(`📤 Starting ${type} upload to NFT.storage...`);
    console.log(`📊 Blob size: ${blob.size} bytes, type: ${blob.type}`);
    
    // Use the client's storeBlob method with proper error handling
    const cid = await client.storeBlob(blob);
    
    if (!cid) {
      throw new Error('Upload returned no CID');
    }
    
    const uri = `https://ipfs.io/ipfs/${cid}`;
    console.log(`✅ Successfully uploaded ${type} to IPFS!`);
    console.log(`🔗 IPFS URI: ${uri}`);
    
    return uri;
    
  } catch (error: any) {
    console.error(`❌ IPFS upload failed for ${type}:`, error);
    console.log(`📊 Full error object:`, error);
    console.log(`📊 Error name: ${error.name}`);
    console.log(`📊 Error message: ${error.message}`);
    console.log(`📊 Error stack:`, error.stack);
    
    // Re-throw the error to be handled by the calling function
    throw new Error(`Failed to upload ${type} to IPFS: ${error.message}`);
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
