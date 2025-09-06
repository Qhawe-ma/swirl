import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MintSuccessProps {
  mintAddress: string;
  onCreateAnother: () => void;
}

export function MintSuccess({ mintAddress, onCreateAnother }: MintSuccessProps) {
  const solscanUrl = `https://solscan.io/token/${mintAddress}`;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="bg-card border border-border" data-testid="card-mint-success">
        <div className="p-6">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                NFT Successfully Minted!
              </h2>
              <p className="text-muted-foreground">
                Your artwork is now permanently on the blockchain
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Contract Address</div>
              <div 
                className="font-mono text-sm bg-muted/30 border rounded-lg px-3 py-2 break-all select-all"
                data-testid="text-mint-address"
              >
                {mintAddress}
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button
                asChild
                size="sm"
                data-testid="link-view-solscan"
              >
                <a 
                  href={solscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Explorer
                </a>
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={onCreateAnother}
                data-testid="button-create-another"
              >
                Create Another
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}