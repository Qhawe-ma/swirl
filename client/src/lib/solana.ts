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

// Token Metadata Program ID (hardcoded)
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

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

    console.log('🚀 Starting REAL NFT minting with Token Metadata on Solana mainnet...');
    console.log('📋 NFT Name:', name);
    console.log('🔗 Metadata URI:', metadataUri);
    
    // Generate new mint keypair
    const mint = Keypair.generate();
    console.log('Generated mint address:', mint.publicKey.toBase58());
    
    // Get associated token account
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      walletAdapter.publicKey
    );
    
    // Calculate metadata PDA
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
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
    
    // Add instruction to initialize mint (0 decimals for NFT)
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
    
    // Add instruction to mint 1 token
    transaction.add(
      createMintToInstruction(
        mint.publicKey,           // mint
        associatedTokenAccount,   // destination
        walletAdapter.publicKey, // authority
        1                        // amount (1 for NFT)
      )
    );
    
    // Create metadata instruction manually
    const metadataInstruction = {
      programId: TOKEN_METADATA_PROGRAM_ID,
      keys: [
        { pubkey: metadataPDA, isSigner: false, isWritable: true },
        { pubkey: mint.publicKey, isSigner: false, isWritable: false },
        { pubkey: walletAdapter.publicKey, isSigner: true, isWritable: false },
        { pubkey: walletAdapter.publicKey, isSigner: true, isWritable: true },
        { pubkey: walletAdapter.publicKey, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([
        Buffer.from([33]), // CreateMetadataAccountV3 instruction discriminator
        Buffer.from(name.padEnd(32, '\0'), 'utf8').slice(0, 32),
        Buffer.from('PAINT'.padEnd(10, '\0'), 'utf8').slice(0, 10),
        Buffer.from(metadataUri.padEnd(200, '\0'), 'utf8').slice(0, 200),
        Buffer.from([1]), // has creators
        Buffer.from([1]), // creator count
        walletAdapter.publicKey.toBuffer(),
        Buffer.from([1]), // verified
        Buffer.from([100]), // share
        Buffer.from([244, 1]), // seller fee basis points (500)
        Buffer.from([1]), // is mutable
      ]),
    };
    
    transaction.add(metadataInstruction);
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletAdapter.publicKey;
    
    // Sign with mint keypair
    transaction.partialSign(mint);
    
    // Request wallet signature
    console.log('🖊️ Requesting wallet signature for REAL NFT...');
    console.log('💰 Transaction will cost approximately 0.01 SOL in fees');
    
    const signedTransaction = await walletAdapter.signTransaction(transaction);
    console.log('✅ Transaction signed by wallet');
    
    // Send transaction
    console.log('📡 Sending NFT transaction to Solana mainnet...');
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    });
    console.log('🔗 Transaction signature:', signature);
    
    // Confirm transaction
    console.log('⏳ Confirming NFT transaction on blockchain...');
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    console.log('✅ SUCCESS! Real NFT minted with metadata!');
    console.log('🏆 NFT Mint Address:', mint.publicKey.toBase58());
    console.log('🎯 This NFT will show as a collectible in your wallet!');
    console.log('🖼️ It will display properly on NFT platforms like Magic Eden!');
    console.log('📱 Check your wallet\'s "Collectibles" section!');
    
    return mint.publicKey.toBase58();
    
  } catch (error: any) {
    console.error('💥 Failed to mint NFT:', error);
    throw new Error(`Failed to mint NFT on mainnet: ${error.message || error}. Please ensure you have sufficient SOL (~0.01 SOL) for fees and try again.`);
  }
}
