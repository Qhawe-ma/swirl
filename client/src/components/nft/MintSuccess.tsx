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
    <div className="max-w-7xl mx-auto p-6 min-h-0">
      <Card className="bg-card/95 backdrop-blur-2xl border border-border/30 max-w-4xl mx-auto shadow-2xl" data-testid="card-mint-success">
        {/* Celebration Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-400/8 to-emerald-500/10 border-b border-border/20 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  🎉 NFT Successfully Minted!
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  Your artwork is now permanently on the blockchain
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 text-sm font-semibold rounded-lg">
              Success
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="text-center space-y-8">
            {/* Professional Success Animation */}
            <div className="relative mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 via-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="text-4xl">🎨</div>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-emerald-500/30 to-emerald-400/30 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              
              {/* Floating particles */}
              <div className="absolute -top-2 -left-2 w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
              <div className="absolute -top-4 right-0 w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-emerald-300 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">Congratulations!</h3>
              <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">Your artwork has been successfully minted as an NFT and is now permanently stored on the Solana blockchain</p>
            </div>
            
            {/* Professional NFT Details Section */}
            <div className="bg-muted/20 border border-border/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-foreground uppercase tracking-wider">NFT Details</div>
                <div className="flex items-center space-x-2 text-emerald-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs font-medium">Verified on Mainnet</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground font-medium mb-2">Contract Address</div>
                  <div className="relative group">
                    <div 
                      className="font-mono text-sm bg-card/60 border border-border/40 rounded-xl px-4 py-3 break-all select-all shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 cursor-text"
                      data-testid="text-mint-address"
                    >
                      {mintAddress}
                    </div>
                    <div className="absolute inset-y-0 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-muted-foreground bg-card/90 px-2 py-1 rounded">Click to copy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Professional Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 motion-safe:hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl h-12"
                data-testid="link-view-solscan"
              >
                <a 
                  href={solscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  <span className="font-semibold">View on Explorer</span>
                </a>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 motion-safe:hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl h-12"
                onClick={onCreateAnother}
                data-testid="button-create-another"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span className="font-semibold">Create Another</span>
                </div>
              </Button>
            </div>
            
            {/* Professional Next Steps */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 text-left">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="material-icons text-blue-600 text-sm">account_balance_wallet</span>
                </div>
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <div className="font-semibold mb-1">In Your Wallet</div>
                  <div className="text-xs">NFT will appear in Phantom & Solflare</div>
                </AlertDescription>
              </Alert>
              
              <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950 text-left">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="material-icons text-purple-600 text-sm">storefront</span>
                </div>
                <AlertDescription className="text-purple-800 dark:text-purple-200">
                  <div className="font-semibold mb-1">Ready to Trade</div>
                  <div className="text-xs">List on Magic Eden & other markets</div>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
