
import { Connection, PublicKey, Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint
} from '@solana/spl-token';

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
    
    
    if (!walletAdapter.publicKey || !walletAdapter.signTransaction) {
      console.error('❌ Wallet connection failed - missing publicKey or signTransaction');
      throw new Error('Wallet not properly connected. Please connect your wallet first.');
    }
    

    const balance = await connection.getBalance(walletAdapter.publicKey);
    const minMintRent = await getMinimumBalanceForRentExemptMint(connection);
    const platformFeeSol = parseFloat(import.meta.env.VITE_PLATFORM_FEE_SOL || '0.01');
    const platformFeeLamports = Math.floor(platformFeeSol * 1_000_000_000);

    // ATA, metadata, and edition rents are approximate. This is not a simulation.
    const estimatedTotalRequired = minMintRent + 2500000 + 5600000 + 2900000 + platformFeeLamports + 5000;
    const requiredSOL = estimatedTotalRequired / 1e9;
    
    
    if (balance < estimatedTotalRequired) {
      console.error('❌ INSUFFICIENT BALANCE:');
      console.error('  Required:', estimatedTotalRequired, 'lamports (', requiredSOL.toFixed(6), 'SOL)');
      console.error('  Available:', balance, 'lamports (', (balance / 1e9).toFixed(6), 'SOL)');
      console.error('  Shortfall:', estimatedTotalRequired - balance, 'lamports (', ((estimatedTotalRequired - balance) / 1e9).toFixed(6), 'SOL)');
      throw new Error(`Insufficient SOL balance. You need at least ${requiredSOL.toFixed(3)} SOL for minting (${platformFeeSol} SOL platform fee + ~${(requiredSOL - platformFeeSol).toFixed(3)} SOL for accounts and fees).`);
    }

    
    const mint = Keypair.generate();
    
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      walletAdapter.publicKey
    );
    
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    
    const [masterEditionPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
        Buffer.from('edition'),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    
    const mintRent = await getMinimumBalanceForRentExemptMint(connection);
    
    const transaction = new Transaction();

    // First instruction so the wallet preview shows the fee as a SOL transfer.
    const platformFeeAddress = new PublicKey(
      import.meta.env.VITE_PLATFORM_FEE_ADDRESS || 'ERmtka1UKXWvgxNaVgM8hwhhhJBRy21MHRApHN1Q3M9L',
    );
    
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: walletAdapter.publicKey,
        toPubkey: platformFeeAddress,
        lamports: platformFeeLamports,
      })
    );
    
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: walletAdapter.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports: mintRent,
        programId: TOKEN_PROGRAM_ID,
      })
    );
    
    transaction.add(
      createInitializeMintInstruction(
        mint.publicKey,
        0, // decimals
        walletAdapter.publicKey, // mint authority
        walletAdapter.publicKey  // freeze authority
      )
    );
    
    transaction.add(
      createAssociatedTokenAccountInstruction(
        walletAdapter.publicKey, // payer
        associatedTokenAccount,   // associated token account
        walletAdapter.publicKey, // owner
        mint.publicKey           // mint
      )
    );
    
    transaction.add(
      createMintToInstruction(
        mint.publicKey,           // mint
        associatedTokenAccount,   // destination
        walletAdapter.publicKey, // authority
        1                        // amount (1 for NFT)
      )
    );
    
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
              name: name.substring(0, 32),
              symbol: name.toUpperCase().replace(/\s+/g, '').substring(0, 6),
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
            maxSupply: 0, // no printed editions; creating the edition revokes mint authority
          },
        }
      )
    );
    
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletAdapter.publicKey;
    
    transaction.partialSign(mint);
    
    
    const signedTransaction = await walletAdapter.signTransaction(transaction);
    
    let signature: string;
    
    try {
      signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false, // Enable preflight to catch errors early
        preflightCommitment: 'confirmed',
        maxRetries: 3
      });
    } catch (sendError: any) {
      console.error('❌ Failed to send transaction:', sendError);
      
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
      } catch {
        attempts++;
        
        try {
          const txStatus = await connection.getSignatureStatus(signature);
          if (txStatus.value?.confirmationStatus === 'confirmed' || txStatus.value?.confirmationStatus === 'finalized') {
            confirmed = true;
            break;
          } else if (txStatus.value?.err) {
            throw new Error(`Transaction failed: ${JSON.stringify(txStatus.value.err)}`);
          }
        } catch {
          // getSignatureStatus can throw before the transaction is visible.
        }
        
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before next attempt
        }
      }
    }
    
    if (!confirmed) {
      throw new Error(`Transaction confirmation timeout after ${maxAttempts} seconds. Signature: ${signature}. Please check Solana Explorer and contact support if your funds were deducted.`);
    }
    
    try {
      const tokenAccountInfo = await connection.getTokenAccountBalance(associatedTokenAccount);
      
      if (!tokenAccountInfo || !tokenAccountInfo.value || tokenAccountInfo.value.uiAmount !== 1) {
        throw new Error('NFT was not properly minted to your wallet. The transaction may have failed partially.');
      }
      
      
      const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
      if (!accountInfo) {
        throw new Error('NFT token account was not created properly.');
      }
      
      
      const mintAccountInfo = await connection.getAccountInfo(mint.publicKey);
      if (!mintAccountInfo) {
        throw new Error('NFT mint account was not created properly.');
      }
      
      
      const mintInfo = await connection.getTokenSupply(mint.publicKey);
      if (!mintInfo || !mintInfo.value || mintInfo.value.uiAmount !== 1) {
        throw new Error('NFT supply verification failed. Expected supply of 1.');
      }
      
      
    } catch {
      // A confirmed signature is enough. A follow-up account read should not fail the mint.
    }

    
    return {
      mintAddress: mint.publicKey.toBase58(),
      transactionSignature: signature
    };
    
  } catch (error: any) {
    console.error('💥 Failed to mint NFT:', error);
    throw new Error(`Failed to mint NFT on mainnet: ${error.message || error}. Please ensure you have sufficient SOL (~0.01 SOL) for fees and try again.`);
  }
}
