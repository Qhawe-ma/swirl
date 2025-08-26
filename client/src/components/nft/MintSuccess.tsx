import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MintSuccessProps {
  mintAddress: string;
  onCreateAnother: () => void;
}

export function MintSuccess({ mintAddress, onCreateAnother }: MintSuccessProps) {
  const solscanUrl = `https://solscan.io/token/${mintAddress}`;

  return (
    <Card className="p-6 border-green-200" data-testid="card-mint-success">
      <div className="text-center">
        <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-icons text-white text-2xl">check</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">NFT Minted Successfully!</h3>
        <p className="text-gray-600 mb-6">Your artwork is now a verified NFT on Solana mainnet</p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-700 mb-2">Mint Address</div>
          <div 
            className="font-mono text-xs bg-white px-3 py-2 rounded border break-all"
            data-testid="text-mint-address"
          >
            {mintAddress}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a 
            href={solscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            data-testid="link-view-solscan"
          >
            <span className="material-icons text-sm">open_in_new</span>
            <span>View on Solscan</span>
          </a>
          <Button 
            variant="outline"
            className="px-6 py-3 flex items-center justify-center space-x-2"
            onClick={onCreateAnother}
            data-testid="button-create-another"
          >
            <span className="material-icons text-sm">add</span>
            <span>Create Another</span>
          </Button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <span className="material-icons text-sm align-middle mr-1">info</span>
          Your NFT will appear in Phantom wallet and can be listed on Magic Eden
        </div>
      </div>
    </Card>
  );
}
