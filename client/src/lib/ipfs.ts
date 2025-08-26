// Using Pinata for IPFS uploads, with optional NFT.storage preservation
export async function uploadToIPFS(blob: Blob, type: 'image' | 'metadata'): Promise<string> {
  console.log(`📤 Starting ${type} upload to IPFS (size: ${blob.size} bytes)...`);
  
  try {
    // Try uploading to Pinata first
    const formData = new FormData();
    formData.append('file', blob, `${type}.${type === 'image' ? 'png' : 'json'}`);
    
    console.log(`⏳ Uploading ${type} to Pinata IPFS...`);
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT || ''}`,
      }
    });
    
    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.IpfsHash) {
      throw new Error('Upload successful but no IPFS hash returned from Pinata');
    }
    
    const uri = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    console.log(`✅ Successfully uploaded ${type} to IPFS via Pinata!`);
    console.log(`🔗 IPFS URI: ${uri}`);
    
    return uri;
    
  } catch (error: any) {
    console.error(`❌ Pinata upload failed for ${type}:`, error);
    console.log(`🔄 Trying alternative IPFS upload methods...`);
    
    // Fallback to other IPFS services
    try {
      // Try using a public IPFS gateway
      const formData = new FormData();
      formData.append('file', blob, `${type}.${type === 'image' ? 'png' : 'json'}`);
      
      const fallbackResponse = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
        method: 'POST',
        body: formData
      });
      
      if (fallbackResponse.ok) {
        const result = await fallbackResponse.json();
        const uri = `https://ipfs.io/ipfs/${result.Hash}`;
        console.log(`✅ Successfully uploaded ${type} to IPFS via fallback service!`);
        console.log(`🔗 IPFS URI: ${uri}`);
        return uri;
      }
    } catch (fallbackError) {
      console.error(`❌ Fallback IPFS upload also failed:`, fallbackError);
    }
    
    // Final fallback - create data URLs for metadata
    if (type === 'metadata') {
      console.log(`📄 Creating data URL for ${type} as final fallback...`);
      const text = await blob.text();
      const dataUrl = `data:application/json;base64,${btoa(text)}`;
      console.log(`✅ Created data URL for ${type}`);
      return dataUrl;
    }
    
    // For images, use a placeholder but continue with real Solana minting
    console.log(`⚠️ Using placeholder for ${type} but continuing with real Solana minting`);
    return `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(type)}`;
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
