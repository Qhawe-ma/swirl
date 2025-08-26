// Buffer polyfill is handled in main polyfills.ts

import { Connection, PublicKey, Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint
} from '@solana/spl-token';

// Metaplex imports for proper NFT creation
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';

export async function mintNFT(
  connection: Connection,
  walletAdapter: any,
  metadataUri: string,
  name: string
): Promise<string> {
  try {
    console.log('🔍 Checking wallet connection...');
    console.log('Wallet publicKey:', walletAdapter.publicKey?.toBase58());
    console.log('Wallet signTransaction available:', !!walletAdapter.signTransaction);
    
    if (!walletAdapter.publicKey || !walletAdapter.signTransaction) {
      throw new Error('Wallet not properly connected. Please connect your wallet first.');
    }

    // Check wallet balance first
    const balance = await connection.getBalance(walletAdapter.publicKey);
    console.log('Wallet SOL balance:', balance / 1e9, 'SOL');
    
    if (balance < 10000000) { // 0.01 SOL minimum for NFT minting
      throw new Error('Insufficient SOL balance. You need at least 0.01 SOL for NFT transaction fees.');
    }

    console.log('🚀 Starting REAL NFT minting with Metaplex on Solana mainnet...');
    console.log('📋 NFT Name:', name);
    console.log('🔗 Metadata URI:', metadataUri);
    
    // Initialize Metaplex with wallet
    const metaplex = Metaplex.make(connection)
      .use(walletAdapterIdentity(walletAdapter));
    
    console.log('🎨 Creating NFT with Metaplex Token Metadata Program...');
    
    // Create the NFT using Metaplex
    const { nft } = await metaplex.nfts().create({
      uri: metadataUri,
      name: name,
      symbol: 'PAINT',
      sellerFeeBasisPoints: 500, // 5% royalty
      creators: [
        {
          address: walletAdapter.publicKey,
          share: 100,
        },
      ],
      collection: null,
      uses: null,
    });

    console.log('✅ SUCCESS! Real NFT minted with metadata!');
    console.log('🏆 NFT Address:', nft.address.toString());
    console.log('🎯 This NFT will show as a collectible in your wallet!');
    console.log('🖼️ It will display properly on NFT platforms like Magic Eden!');
    
    return nft.address.toString();
    
  } catch (error: any) {
    console.error('💥 Failed to mint NFT:', error);
    throw new Error(`Failed to mint NFT on mainnet: ${error.message || error}. Please ensure you have sufficient SOL (~0.01 SOL) for fees and try again.`);
  }
}
