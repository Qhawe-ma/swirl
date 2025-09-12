// Buffer polyfill is handled in main polyfills.ts

import { Connection, PublicKey, Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint
} from '@solana/spl-token';

// Metaplex Token Metadata v2 imports for proper NFT creation
import { 
  createCreateMetadataAccountV3Instruction,
  createCreateMasterEditionV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID 
} from '@metaplex-foundation/mpl-token-metadata';

export async function mintNFT(
  connection: Connection,
  walletAdapter: any,
  metadataUri: string,
  name: string
): Promise<{ mintAddress: string; transactionSignature: string }> {
  try {
    console.log('🔍 Checking wallet connection...');
    console.log('Wallet publicKey:', walletAdapter.publicKey?.toBase58());
    console.log('Wallet signTransaction available:', !!walletAdapter.signTransaction);
    
    if (!walletAdapter.publicKey || !walletAdapter.signTransaction) {
      throw new Error('Wallet not properly connected. Please connect your wallet first.');
    }

    // Check wallet balance first
    const balance = await connection.getBalance(walletAdapter.publicKey);
    console.log('🔍 Wallet SOL balance:', balance / 1e9, 'SOL');
    console.log('🔍 Wallet balance in lamports:', balance);
    
    // Calculate required amounts for all operations
    const minMintRent = await getMinimumBalanceForRentExemptMint(connection);
    const platformFeeSOL_check = parseFloat(import.meta.env.VITE_PLATFORM_FEE_SOL || '0.01');
    const platformFeeLamports_check = Math.floor(platformFeeSOL_check * 1000000000);
    
    console.log('📊 Cost breakdown:');
    console.log('  - Mint rent:', minMintRent, 'lamports (', (minMintRent / 1e9).toFixed(6), 'SOL)');
    console.log('  - ATA rent: 2500000 lamports (0.0025 SOL)');
    console.log('  - Metadata rent: 5600000 lamports (0.0056 SOL)');
    console.log('  - Master edition rent: 2900000 lamports (0.0029 SOL)');
    console.log('  - Platform fee:', platformFeeLamports_check, 'lamports (', platformFeeSOL_check, 'SOL)');
    console.log('  - Network fees: 5000 lamports (0.000005 SOL)');
    
    // Estimate total required: mint rent + ATA rent + metadata rent + master edition rent + platform fee + network fees
    const estimatedTotalRequired = minMintRent + 2500000 + 5600000 + 2900000 + platformFeeLamports_check + 5000;
    const requiredSOL = estimatedTotalRequired / 1e9;
    
    console.log('💰 Required SOL for minting:', requiredSOL.toFixed(6), 'SOL');
    console.log('💰 Available SOL:', (balance / 1e9).toFixed(6), 'SOL');
    console.log('💰 Required lamports:', estimatedTotalRequired);
    console.log('💰 Available lamports:', balance);
    console.log('✅ Balance sufficient?', balance >= estimatedTotalRequired);
    
    if (balance < estimatedTotalRequired) {
      console.error('❌ INSUFFICIENT BALANCE:');
      console.error('  Required:', estimatedTotalRequired, 'lamports (', requiredSOL.toFixed(6), 'SOL)');
      console.error('  Available:', balance, 'lamports (', (balance / 1e9).toFixed(6), 'SOL)');
      console.error('  Shortfall:', estimatedTotalRequired - balance, 'lamports (', ((estimatedTotalRequired - balance) / 1e9).toFixed(6), 'SOL)');
      throw new Error(`Insufficient SOL balance. You need at least ${requiredSOL.toFixed(3)} SOL for minting (${platformFeeSOL_check} SOL platform fee + ~${(requiredSOL - platformFeeSOL_check).toFixed(3)} SOL for accounts and fees).`);
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
    
    // Calculate master edition PDA for proper NFT standard compliance
    const [masterEditionPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
        Buffer.from('edition'),
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
              symbol: name.toUpperCase().replace(/\s+/g, ''),
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
    
    // Add Master Edition instruction for proper NFT standard compliance
    // This ensures wallets recognize it as an NFT collectible
    transaction.add(
      createCreateMasterEditionV3Instruction(
        {
          edition: masterEditionPDA,
          mint: mint.publicKey,
          updateAuthority: walletAdapter.publicKey,
          mintAuthority: walletAdapter.publicKey,
          payer: walletAdapter.publicKey,
          metadata: metadataPDA,
        },
        {
          createMasterEditionArgs: {
            maxSupply: 0, // 0 means unlimited, but since we'll revoke mint authority, it's effectively 1
          },
        }
      )
    );
    
    // Revoke mint authority to cap supply at 1 (true NFT standard)
    transaction.add(
      createSetAuthorityInstruction(
        mint.publicKey, // account
        walletAdapter.publicKey, // current authority
        AuthorityType.MintTokens, // authority type
        null // new authority (null = revoke)
      )
    );
    
    // Add platform fee transfer (configurable, defaults to 0.01 SOL)
    const platformFeeSOL = parseFloat(import.meta.env.VITE_PLATFORM_FEE_SOL || '0.01');
    const platformFeeAddress = new PublicKey(import.meta.env.VITE_PLATFORM_FEE_ADDRESS || 'ERmtka1UKXWvgxNaVgM8hwhhhJBRy21MHRApHN1Q3M9L');
    const platformFeeLamports = Math.floor(platformFeeSOL * 1000000000); // Convert SOL to lamports
    
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: walletAdapter.publicKey,
        toPubkey: platformFeeAddress,
        lamports: platformFeeLamports,
      })
    );
    
    // Get recent blockhash and capture both values for consistent confirmation
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletAdapter.publicKey;
    
    // Sign with mint keypair
    transaction.partialSign(mint);
    
    // Request wallet signature
    console.log('🖊️ Requesting wallet signature for REAL NFT...');
    console.log(`💰 Transaction will cost approximately 0.01-0.02 SOL in fees + ${platformFeeSOL} SOL platform fee`);
    
    const signedTransaction = await walletAdapter.signTransaction(transaction);
    console.log('✅ Transaction signed by wallet');
    
    // Send transaction to REAL SOLANA MAINNET with proper error handling
    console.log('📡 Sending NFT transaction to Solana mainnet...');
    let signature: string;
    
    try {
      signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false, // Enable preflight to catch errors early
        preflightCommitment: 'confirmed',
        maxRetries: 3
      });
      console.log('🔗 Transaction signature:', signature);
    } catch (sendError: any) {
      console.error('❌ Failed to send transaction:', sendError);
      
      // Parse common Solana errors and provide helpful messages
      if (sendError.message?.includes('insufficient funds')) {
        throw new Error('Insufficient SOL balance for transaction fees. Please add more SOL to your wallet and try again.');
      } else if (sendError.message?.includes('blockhash not found')) {
        throw new Error('Transaction expired. Please try minting again.');
      } else if (sendError.message?.includes('already in use')) {
        throw new Error('A conflicting transaction is in progress. Please wait a moment and try again.');
      } else {
        throw new Error(`Failed to send transaction: ${sendError.message || sendError}. Please try again.`);
      }
    }
    
    // Confirm transaction with robust verification
    console.log('⏳ Confirming NFT transaction on blockchain...');
    let confirmed = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts with 1 second intervals = 30 seconds max wait
    
    while (!confirmed && attempts < maxAttempts) {
      try {
        const confirmation = await connection.confirmTransaction({
          signature: signature,
          blockhash: blockhash,
          lastValidBlockHeight: lastValidBlockHeight
        }, 'finalized');
        
        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
        }
        
        confirmed = true;
        console.log('✅ Transaction confirmed on blockchain');
      } catch (confirmError: any) {
        attempts++;
        console.log(`⏳ Confirmation attempt ${attempts}/${maxAttempts}...`);
        
        // Check transaction status
        try {
          const txStatus = await connection.getSignatureStatus(signature);
          if (txStatus.value?.confirmationStatus === 'confirmed' || txStatus.value?.confirmationStatus === 'finalized') {
            confirmed = true;
            console.log('✅ Transaction confirmed via status check');
            break;
          } else if (txStatus.value?.err) {
            throw new Error(`Transaction failed: ${JSON.stringify(txStatus.value.err)}`);
          }
        } catch (statusError) {
          // Continue with next attempt if status check fails
        }
        
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before next attempt
        }
      }
    }
    
    if (!confirmed) {
      throw new Error(`Transaction confirmation timeout after ${maxAttempts} seconds. Signature: ${signature}. Please check Solana Explorer and contact support if your funds were deducted.`);
    }
    
    // CRITICAL: Verify NFT actually exists in user's account
    console.log('🔍 Verifying NFT was properly minted to your wallet...');
    try {
      // Check if the associated token account exists and has the NFT
      const tokenAccountInfo = await connection.getTokenAccountBalance(associatedTokenAccount);
      
      if (!tokenAccountInfo || !tokenAccountInfo.value || tokenAccountInfo.value.uiAmount !== 1) {
        throw new Error('NFT was not properly minted to your wallet. The transaction may have failed partially.');
      }
      
      console.log('✅ VERIFIED: NFT exists in your wallet with balance of 1');
      
      // Double-check by getting account info
      const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
      if (!accountInfo) {
        throw new Error('NFT token account was not created properly.');
      }
      
      console.log('✅ VERIFIED: NFT token account is properly created');
      
      // Additional verification: Check that the mint account has correct properties
      const mintAccountInfo = await connection.getAccountInfo(mint.publicKey);
      if (!mintAccountInfo) {
        throw new Error('NFT mint account was not created properly.');
      }
      
      console.log('✅ VERIFIED: NFT mint account is properly created');
      
      // Final verification: Check token supply is exactly 1 (NFT standard)
      const mintInfo = await connection.getTokenSupply(mint.publicKey);
      if (!mintInfo || !mintInfo.value || mintInfo.value.uiAmount !== 1) {
        throw new Error('NFT supply verification failed. Expected supply of 1.');
      }
      
      console.log('✅ VERIFIED: NFT has correct supply of 1 token');
      
      // Verify that mint authority was successfully revoked (supply cannot be increased)
      const parsedMintInfo = await connection.getParsedAccountInfo(mint.publicKey);
      if (parsedMintInfo.value?.data && 'parsed' in parsedMintInfo.value.data) {
        const mintData = parsedMintInfo.value.data.parsed.info;
        if (mintData.mintAuthority !== null) {
          throw new Error('Mint authority was not properly revoked. NFT supply might not be capped at 1.');
        }
        console.log('✅ VERIFIED: Mint authority properly revoked - NFT supply is permanently capped at 1');
      }
      
    } catch (verificationError: any) {
      console.error('❌ NFT verification failed:', verificationError);
      throw new Error(`CRITICAL ERROR: NFT minting verification failed - ${verificationError.message}. Your transaction was processed (${signature}) but the NFT may not have been properly created. Please contact support immediately.`);
    }

    console.log('✅ SUCCESS! Real NFT minted with metadata!');
    console.log('🏆 NFT Mint Address:', mint.publicKey.toBase58());
    console.log('🔗 Transaction Signature:', signature);
    console.log('🎯 This NFT will show as a collectible in your wallet!');
    console.log('🖼️ It will display properly on NFT platforms like Magic Eden!');
    console.log('📱 Check your wallet\'s "Collectibles" section!');
    
    return {
      mintAddress: mint.publicKey.toBase58(),
      transactionSignature: signature
    };
    
  } catch (error: any) {
    console.error('💥 Failed to mint NFT:', error);
    throw new Error(`Failed to mint NFT on mainnet: ${error.message || error}. Please ensure you have sufficient SOL (~0.01 SOL) for fees and try again.`);
  }
}
