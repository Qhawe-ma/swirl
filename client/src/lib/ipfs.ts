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
    throw new Error('NFT Storage API key not found. Using placeholder URLs for testing.');
  }
  
  // Skip IPFS entirely and use placeholders immediately since storage is exhausted
  console.log(`⚠️ NFT.Storage quota exhausted, using placeholder for ${type} to test Solana minting`);
  
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
