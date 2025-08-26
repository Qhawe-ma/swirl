import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react';

export function useWallet() {
  const wallet = useSolanaWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (wallet.publicKey && wallet.connected) {
      connection.getBalance(wallet.publicKey).then((lamports) => {
        setBalance(lamports / LAMPORTS_PER_SOL);
      });
    } else {
      setBalance(null);
    }
  }, [wallet.publicKey, wallet.connected, connection]);

  return {
    ...wallet,
    balance,
    shortAddress: wallet.publicKey 
      ? `${wallet.publicKey.toBase58().slice(0, 4)}...${wallet.publicKey.toBase58().slice(-4)}`
      : null,
  };
}
