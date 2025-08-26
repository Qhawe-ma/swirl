import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MintRecord, getUserMints } from '@/lib/firebase';
import { useWallet } from '@solana/wallet-adapter-react';

export function MintsHistory() {
  const { publicKey } = useWallet();
  const [mints, setMints] = useState<MintRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) {
      setMints([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const walletAddress = publicKey.toBase58();
    
    // Subscribe to mints for this wallet
    const unsubscribe = getUserMints(walletAddress, (mintRecords) => {
      setMints(mintRecords);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [publicKey]);

  if (!publicKey) {
    return (
      <Card className="p-6 text-center" data-testid="card-connect-wallet">
        <div className="text-gray-500">
          <span className="material-icons text-4xl mb-2 block">account_balance_wallet</span>
          <p className="text-lg font-medium mb-2">Connect Your Wallet</p>
          <p className="text-sm">Connect your wallet to view your NFT mint history</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6" data-testid="card-loading-mints">
        <div className="text-center">
          <span className="material-icons animate-spin text-2xl mb-2 block">refresh</span>
          <p className="text-gray-500">Loading your mints...</p>
        </div>
      </Card>
    );
  }

  if (mints.length === 0) {
    return (
      <Card className="p-6 text-center" data-testid="card-no-mints">
        <div className="text-gray-500">
          <span className="material-icons text-4xl mb-2 block">palette</span>
          <p className="text-lg font-medium mb-2">No NFTs Minted Yet</p>
          <p className="text-sm">Create your first artwork and mint it as an NFT to see it here!</p>
        </div>
      </Card>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="p-6" data-testid="card-mints-history">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <span className="material-icons mr-2">history</span>
          Your NFT Mints
        </h2>
        <Badge variant="secondary" data-testid="badge-mint-count">
          {mints.length} {mints.length === 1 ? 'NFT' : 'NFTs'}
        </Badge>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {mints.map((mint) => (
          <div 
            key={mint.id} 
            className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            data-testid={`mint-record-${mint.id}`}
          >
            {/* NFT Image */}
            <div className="flex-shrink-0">
              <img 
                src={mint.imageData} 
                alt={mint.name}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                data-testid={`img-mint-${mint.id}`}
              />
            </div>
            
            {/* Mint Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 truncate" data-testid={`text-mint-name-${mint.id}`}>
                    {mint.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1" data-testid={`text-mint-date-${mint.id}`}>
                    {formatDate(mint.timestamp)}
                  </p>
                </div>
                <Badge variant="outline" className="ml-2">
                  NFT
                </Badge>
              </div>
              
              {/* Mint Address */}
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Mint Address:</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-1 text-xs"
                    onClick={() => copyToClipboard(mint.mintAddress)}
                    data-testid={`button-copy-address-${mint.id}`}
                  >
                    <span className="material-icons text-sm mr-1">content_copy</span>
                    Copy
                  </Button>
                </div>
                <p className="text-xs font-mono text-gray-600 truncate" data-testid={`text-mint-address-${mint.id}`}>
                  {mint.mintAddress}
                </p>
              </div>
              
              {/* Transaction Link */}
              <div className="mt-2">
                <a 
                  href={`https://solscan.io/tx/${mint.transactionSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  data-testid={`link-transaction-${mint.id}`}
                >
                  <span className="material-icons text-sm mr-1">open_in_new</span>
                  View on Solscan
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}