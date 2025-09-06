import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react';

export function WalletConnection() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (publicKey && connected) {
      connection.getBalance(publicKey).then((lamports) => {
        setBalance(lamports / LAMPORTS_PER_SOL);
      }).catch((error) => {
        console.warn('Failed to fetch balance:', error);
        setBalance(null);
      });
    } else {
      setBalance(null);
    }
  }, [publicKey, connected, connection]);

  const shortAddress = publicKey 
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : '';

  return (
    <div className="flex items-center space-x-3">
      {!connected ? (
        <WalletMultiButton 
          className="!bg-gradient-to-r !from-primary !to-primary/90 hover:!from-primary/90 hover:!to-primary/80 !text-primary-foreground !px-4 !py-2.5 !rounded-lg !flex !items-center !space-x-2 motion-safe:!transition-all motion-safe:!duration-200 motion-reduce:!transition-none !font-semibold !text-sm !shadow-md hover:!shadow-lg motion-safe:hover:!scale-[1.02] motion-reduce:hover:!scale-100 !border-0 focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 !tracking-wide"
          data-testid="button-connect-wallet"
        />
      ) : (
        <div className="flex items-center px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" tabIndex={0} data-testid="wallet-connected">
          <div className="flex flex-col">
            <div className="font-semibold text-sm text-foreground tracking-wide" data-testid="text-wallet-address">
              {shortAddress}
            </div>
            <div className="text-xs text-muted-foreground font-medium" data-testid="text-wallet-balance">
              {balance !== null ? `${balance.toFixed(3)} SOL` : 'Connected'}
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="w-2 h-2 bg-emerald-500 rounded-full ml-3"></div>
        </div>
      )}
    </div>
  );
}
