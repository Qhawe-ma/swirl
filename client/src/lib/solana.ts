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
    
    if (balance < 5000000) { // 0.005 SOL minimum
      throw new Error('Insufficient SOL balance. You need at least 0.005 SOL for transaction fees.');
    }

    console.log('🚀 Starting real NFT minting on Solana mainnet...');
    
    // Generate new mint keypair
    const mint = Keypair.generate();
    console.log('Generated mint address:', mint.publicKey.toBase58());
    
    // Get associated token account
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      walletAdapter.publicKey
    );
    
    // Get minimum lamports for mint account
    const mintRent = await getMinimumBalanceForRentExemptMint(connection);
    
    // Create transaction
    const transaction = new Transaction();
    
    // Add instruction to create mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: walletAdapter.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports: mintRent,
        programId: TOKEN_PROGRAM_ID,
      })
    );
    
    // Add instruction to initialize mint
    transaction.add(
      createInitializeMintInstruction(
        mint.publicKey,
        0, // decimals
        walletAdapter.publicKey, // mint authority
        walletAdapter.publicKey  // freeze authority
      )
    );
    
    // Add instruction to create associated token account
    transaction.add(
      createAssociatedTokenAccountInstruction(
        walletAdapter.publicKey, // payer
        associatedTokenAccount,   // associated token account
        walletAdapter.publicKey, // owner
        mint.publicKey           // mint
      )
    );
    
    // Add instruction to mint token
    transaction.add(
      createMintToInstruction(
        mint.publicKey,           // mint
        associatedTokenAccount,   // destination
        walletAdapter.publicKey, // authority
        1                        // amount (1 for NFT)
      )
    );
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletAdapter.publicKey;
    
    // Sign with mint keypair
    transaction.partialSign(mint);
    
    // Request wallet signature
    console.log('🖊️ Requesting wallet signature...');
    console.log('💰 Transaction will cost approximately 0.005 SOL in fees');
    
    const signedTransaction = await walletAdapter.signTransaction(transaction);
    console.log('✅ Transaction signed by wallet');
    
    // Send transaction
    console.log('📡 Sending transaction to Solana mainnet...');
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    });
    console.log('🔗 Transaction signature:', signature);
    
    // Confirm transaction
    console.log('⏳ Confirming transaction on blockchain...');
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }
    
    console.log('NFT successfully minted! Mint address:', mint.publicKey.toBase58());
    
    return mint.publicKey.toBase58();
    
  } catch (error) {
    console.error('Failed to mint NFT:', error);
    throw new Error('Failed to mint NFT on mainnet. Please ensure you have sufficient SOL (~0.005 SOL) for fees and try again.');
  }
}
