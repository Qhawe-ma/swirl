import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, ExternalLink, Plus, Info } from "lucide-react";

interface MintSuccessProps {
  mintAddress: string;
  onCreateAnother: () => void;
}

export function MintSuccess({ mintAddress, onCreateAnother }: MintSuccessProps) {
  const solscanUrl = `https://solscan.io/token/${mintAddress}`;

  return (
    <div className="flex justify-center items-center min-h-0 bg-gradient-to-br from-muted/20 via-transparent to-muted/30 p-6">
      <Card className="bg-card/90 backdrop-blur-xl border border-border/50 max-w-4xl w-full shadow-2xl" data-testid="card-mint-success">
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-b border-border/30 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center tracking-wide">
            <CheckCircle className="mr-3 w-6 h-6 text-emerald-500" aria-hidden="true" />
            NFT Minted Successfully!
          </h2>
        </div>

        <div className="p-8">
          <div className="text-center">
            {/* Modern Success Icon with Animation */}
            <div className="relative mx-auto mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-500/80 rounded-full flex items-center justify-center shadow-lg mx-auto">
                <CheckCircle className="w-10 h-10 text-white" aria-hidden="true" />
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-500/80 rounded-full motion-safe:animate-ping opacity-20 mx-auto"></div>
            </div>
            
            <h3 className="text-2xl font-bold text-foreground mb-6">Your artwork is now a verified NFT on Solana mainnet</h3>
            
            {/* Modern Mint Address Section */}
            <div className="bg-muted/30 border border-border/50 rounded-xl p-6 mb-8">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Mint Address</div>
              <div 
                className="font-mono text-sm bg-card border border-border/50 rounded-lg px-4 py-3 break-all select-all shadow-sm hover:shadow-md transition-shadow"
                data-testid="text-mint-address"
              >
                {mintAddress}
              </div>
            </div>
            
            {/* Modern Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 motion-safe:hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                data-testid="link-view-solscan"
              >
                <a 
                  href={solscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  <span>View on Solscan</span>
                </a>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-2 hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-300 motion-safe:hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={onCreateAnother}
                data-testid="button-create-another"
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Create Another</span>
              </Button>
            </div>
            
            {/* Modern Info Section */}
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <AlertDescription className="text-blue-800 dark:text-blue-200 flex items-center justify-center space-x-2">
                <Info className="w-5 h-5" aria-hidden="true" />
                <span>Your NFT will appear in Phantom wallet and can be listed on Magic Eden</span>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </Card>
    </div>
  );
}
