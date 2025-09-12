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
          className="!bg-blue-600 hover:!bg-transparent !border-2 !border-blue-600 !text-white hover:!text-blue-600 !px-4 !py-2.5 !rounded-lg !font-semibold !text-sm !transition-all !duration-300 !shadow-lg hover:!shadow-xl"
          style={{
            backgroundColor: '#2563eb !important',
            borderColor: '#2563eb !important',
            color: 'white !important'
          }}
          data-testid="button-connect-wallet"
        />
      ) : (
        <div className="flex items-center px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 backdrop-blur-sm" tabIndex={0} data-testid="wallet-connected">
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
