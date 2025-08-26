import { NFTStorage } from 'nft.storage';

const client = new NFTStorage({ 
  token: import.meta.env.VITE_NFT_STORAGE_KEY || process.env.REACT_APP_NFT_STORAGE_KEY || ''
});

export async function uploadToIPFS(blob: Blob, type: 'image' | 'metadata'): Promise<string> {
  try {
    const cid = await client.storeBlob(blob);
    return `https://ipfs.io/ipfs/${cid}`;
  } catch (error) {
    console.error(`Failed to upload ${type} to IPFS:`, error);
    throw new Error(`Failed to upload ${type} to IPFS. Please check your API key and try again.`);
  }
}
