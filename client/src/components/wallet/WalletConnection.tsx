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
    <div className="flex items-center space-x-4">
      <div className="hidden sm:block text-sm text-gray-600">
        <span className="material-icons text-sm align-middle mr-1">info</span>
        Mainnet • Real SOL Required
      </div>
      
      {!connected ? (
        <WalletMultiButton 
          className="!bg-primary hover:!bg-blue-700 !text-white !px-4 !py-2 !rounded-lg !flex !items-center !space-x-2 !transition-colors !font-roboto"
          data-testid="button-connect-wallet"
        />
      ) : (
        <div className="wallet-card text-white px-4 py-2 rounded-lg" data-testid="wallet-connected">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="material-icons text-sm">account_balance_wallet</span>
            </div>
            <div className="text-sm">
              <div className="font-medium" data-testid="text-wallet-address">{shortAddress}</div>
              <div className="opacity-90" data-testid="text-wallet-balance">
                {balance !== null ? `${balance.toFixed(3)} SOL` : 'Connected'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
