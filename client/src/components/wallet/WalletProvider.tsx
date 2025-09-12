import { ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
  children: ReactNode;
}

// SCALABILITY: RPC endpoint pool from environment variables for security
const RPC_ENDPOINTS = [
  import.meta.env.VITE_HELIUS_RPC_URL,
  import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  import.meta.env.VITE_PROJECTSERUM_RPC_URL || 'https://solana-api.projectserum.com'
].filter(Boolean); // Remove any undefined endpoints

// Round-robin endpoint selection for load distribution
let currentEndpointIndex = 0;
const getNextEndpoint = () => {
  const endpoint = RPC_ENDPOINTS[currentEndpointIndex];
  currentEndpointIndex = (currentEndpointIndex + 1) % RPC_ENDPOINTS.length;
  return endpoint;
};

export function WalletProvider({ children }: WalletProviderProps) {
  // SCALABILITY: Use primary Helius RPC but have fallbacks available
  const endpoint = useMemo(() => RPC_ENDPOINTS[0], []);
  
  // Use empty array for now - modern browsers will auto-detect wallets
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

// Export for use in Solana transaction handling
export { getNextEndpoint, RPC_ENDPOINTS };
