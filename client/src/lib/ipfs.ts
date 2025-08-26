// Simple and reliable Pinata IPFS upload
export async function uploadToIPFS(blob: Blob, type: 'image' | 'metadata'): Promise<string> {
  console.log(`🚀 STARTING ${type.toUpperCase()} UPLOAD TO PINATA`);
  console.log(`📊 Blob size: ${blob.size} bytes`);
  console.log(`📊 Blob type: ${blob.type}`);
  
  // Hardcoded API key for testing - your JWT token
  const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0ZmNjODdkNi00MDMxLTRjZjItOWQ3Zi04MjQ1NmExYWE4MTIiLCJlbWFpbCI6InFxaGF3ZTIyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxMGM0ZTk5MzNlMTIxMTc3ZWY0YyIsInNjb3BlZEtleVNlY3JldCI6IjMyM2U2MmQ3MGM3MmVkMzYyYmVjNTUzMzlhMGE5MDBkYTdhNjI1YTcxZjcxNWI5MzZmNmZlZmRmMTBiNmE4NTYiLCJleHAiOjE3ODc3Mzk0NzN9.AzNufiaTM6OP_r2Ows0iDnFDjPVq2W-mQeh2GT5da7Y';
  
  try {
    console.log(`🔑 Using hardcoded Pinata JWT token`);
    
    // Create form data
    const formData = new FormData();
    const fileName = `nft-${type}-${Date.now()}.${type === 'image' ? 'png' : 'json'}`;
    formData.append('file', blob, fileName);
    
    console.log(`📤 Making request to Pinata API...`);
    console.log(`📝 File name: ${fileName}`);
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
    });
    
    console.log(`📡 Pinata response status: ${response.status}`);
    console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Pinata API error:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`📦 Pinata response data:`, result);
    
    if (!result.IpfsHash) {
      throw new Error('No IPFS hash in response');
    }
    
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    console.log(`✅ SUCCESS! IPFS URL: ${ipfsUrl}`);
    
    return ipfsUrl;
    
  } catch (error: any) {
    console.error(`💥 UPLOAD FAILED:`, error);
    
    // Simple fallback - just use a mock URL for now to test the rest of the flow
    if (type === 'image') {
      console.log(`🔄 Using placeholder image URL as fallback`);
      return 'https://via.placeholder.com/400x300/0066cc/ffffff?text=NFT+Art';
    } else {
      console.log(`🔄 Creating data URL for metadata as fallback`);
      const text = await blob.text();
      return `data:application/json;base64,${btoa(text)}`;
    }
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
