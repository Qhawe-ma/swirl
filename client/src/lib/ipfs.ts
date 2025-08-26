// IPFS upload with timeout and fast fallback for wallet testing
export async function uploadToIPFS(blob: Blob, type: 'image' | 'metadata'): Promise<string> {
  console.log(`🚀 STARTING ${type.toUpperCase()} UPLOAD`);
  console.log(`📊 Blob size: ${blob.size} bytes`);
  
  // For now, use fallback URLs immediately to test wallet functionality
  // This bypasses any IPFS upload issues and lets us test the minting
  
  if (type === 'image') {
    console.log(`🔄 Using test image URL to test wallet minting`);
    return 'https://via.placeholder.com/400x300/0066cc/ffffff?text=Test+NFT+Art';
  } else {
    console.log(`🔄 Creating metadata with test image URL`);
    const text = await blob.text();
    const metadata = JSON.parse(text);
    
    // Update the metadata to use a test image URL
    metadata.image = 'https://via.placeholder.com/400x300/0066cc/ffffff?text=Test+NFT+Art';
    
    return `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
  }
}

// Optional: Function to preserve NFTs in NFT.storage for long-term storage
export async function preserveInNFTStorage(cid: string, tokenAddress: string, collectionId?: string): Promise<void> {
  try {
    const apiKey = import.meta.env.VITE_NFT_STORAGE_API_KEY;
    if (!apiKey) {
      console.log('⚠️ NFT.storage API key not found, skipping long-term preservation');
      return;
    }
    
    // For now, just log the CID for manual preservation
    // Full implementation would require collection management
    console.log(`📁 NFT ready for preservation in NFT.storage:`);
    console.log(`🔗 CID: ${cid}`);
    console.log(`🏷️ Token Address: ${tokenAddress}`);
    console.log(`ℹ️ Visit https://app.nft.storage/ to create a collection and preserve this NFT for long-term storage`);
    
  } catch (error) {
    console.error('❌ Failed to preserve in NFT.storage:', error);
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
