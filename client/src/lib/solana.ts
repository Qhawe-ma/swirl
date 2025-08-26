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

// Metaplex Token Metadata v2 imports for proper NFT creation
import { 
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID 
} from '@metaplex-foundation/mpl-token-metadata';

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
    
    // Add proper NFT metadata instruction using Metaplex v2
    transaction.add(
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint: mint.publicKey,
          mintAuthority: walletAdapter.publicKey,
          payer: walletAdapter.publicKey,
          updateAuthority: walletAdapter.publicKey,
          systemProgram: SystemProgram.programId,
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name: name,
              symbol: 'PAINT',
              uri: metadataUri,
              creators: [
                {
                  address: walletAdapter.publicKey,
                  verified: true,
                  share: 100,
                },
              ],
              sellerFeeBasisPoints: 500, // 5% royalty
              collection: null,
              uses: null,
            },
            isMutable: true,
            collectionDetails: null,
          },
        }
      )
    );
    
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
    
    // Send transaction to REAL SOLANA MAINNET (no simulation)
    console.log('📡 Sending NFT transaction to Solana mainnet...');
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: true, // Skip simulation, send directly to mainnet
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
