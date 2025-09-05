import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { MintsHistoryModal } from './MintsHistoryModal';

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
      {/* View Mints Button - Only show when connected */}
      {connected && (
        <MintsHistoryModal />
      )}
      
      {!connected ? (
        <WalletMultiButton 
          className="!bg-primary hover:!bg-primary/90 !text-primary-foreground !px-6 !py-3 !rounded-xl !flex !items-center !space-x-2 motion-safe:!transition-all motion-safe:!duration-300 motion-reduce:!transition-none !font-medium !shadow-lg hover:!shadow-xl motion-safe:hover:!scale-[1.02] motion-reduce:hover:!scale-100 !border-0 focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2"
          data-testid="button-connect-wallet"
        />
      ) : (
        <div className="wallet-card text-primary-foreground px-6 py-3 rounded-xl shadow-lg hover:shadow-xl motion-safe:transition-all motion-safe:duration-300 motion-reduce:transition-none backdrop-blur-sm border border-white/10 dark:border-white/5 focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2" tabIndex={0} data-testid="wallet-connected">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-foreground/20 dark:bg-primary-foreground/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
              <span className="material-icons text-lg">account_balance_wallet</span>
            </div>
            <div>
              <div className="font-semibold text-sm tracking-wide" data-testid="text-wallet-address">{shortAddress}</div>
              <div className="opacity-90 text-xs font-medium" data-testid="text-wallet-balance">
                {balance !== null ? `${balance.toFixed(3)} SOL` : 'Connected'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
