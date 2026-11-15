import { ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
  children: ReactNode;
}

// First defined URL wins. The public mainnet endpoint is always present, so
// the Project Serum URL is only reached if that default is removed.
const RPC_ENDPOINTS = [
  import.meta.env.VITE_HELIUS_RPC_URL,
  import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  import.meta.env.VITE_PROJECTSERUM_RPC_URL || 'https://solana-api.projectserum.com',
].filter(Boolean);

export function WalletProvider({ children }: WalletProviderProps) {
  const endpoint = useMemo(() => RPC_ENDPOINTS[0], []);
  // Empty on purpose: Wallet Standard injects whatever the browser has installed.
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
