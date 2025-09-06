import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAllMints, getUserMints, MintRecord } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Copy } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

function MintGrid({ mints, loading }: { mints: MintRecord[], loading: boolean }) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border animate-pulse">
            <div className="aspect-square bg-muted rounded-t-lg"></div>
            <div className="p-3 space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (mints.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg">No mints found</div>
        <p className="text-sm text-muted-foreground mt-2">
          Be the first to create an NFT!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {mints.map((mint) => (
        <div 
          key={mint.id} 
          className="bg-card rounded-lg border hover:shadow-lg transition-all duration-200 group"
          data-testid={`mint-card-${mint.id}`}
        >
          {/* NFT Image */}
          <div className="aspect-square overflow-hidden rounded-t-lg">
            <img 
              src={mint.imageData} 
              alt={mint.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              decoding="async"
              data-testid={`img-mint-${mint.id}`}
            />
          </div>
          
          {/* Mint Info */}
          <div className="p-3">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm truncate flex-1" data-testid={`text-mint-name-${mint.id}`}>
                {mint.name}
              </h3>
              <Badge variant="outline" className="ml-2 text-xs">
                NFT
              </Badge>
            </div>
            
            {/* Creator Address */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Creator:</span>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-mono" data-testid={`text-creator-${mint.id}`}>
                  {formatAddress(mint.walletAddress)}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0 hover:bg-muted"
                  onClick={() => copyToClipboard(mint.walletAddress)}
                  aria-label="Copy creator address"
                  data-testid={`button-copy-creator-${mint.id}`}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Date */}
            <div className="text-xs text-muted-foreground mb-3" data-testid={`text-mint-date-${mint.id}`}>
              {formatDate(mint.timestamp)}
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={() => copyToClipboard(mint.mintAddress)}
                aria-label="Copy mint address"
                data-testid={`button-copy-address-${mint.id}`}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              
              <a 
                href={`https://solscan.io/tx/${mint.transactionSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-primary hover:text-primary/80 transition-colors"
                aria-label="View transaction on Solscan"
                data-testid={`link-transaction-${mint.id}`}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GalleryPage() {
  const { publicKey } = useWallet();
  const [allMints, setAllMints] = useState<MintRecord[]>([]);
  const [userMints, setUserMints] = useState<MintRecord[]>([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  // Set page title for SEO
  useEffect(() => {
    document.title = "NFT Gallery | PaintNFT Studio";
    return () => {
      document.title = "PaintNFT Studio"; // Reset on unmount
    };
  }, []);

  useEffect(() => {
    // Subscribe to all mints
    const unsubscribeAll = getAllMints((mints) => {
      setAllMints(mints);
      setLoadingAll(false);
    });

    return () => {
      unsubscribeAll();
    };
  }, []);

  useEffect(() => {
    if (!publicKey) {
      setUserMints([]);
      setLoadingUser(false);
      return;
    }

    setLoadingUser(true);
    const walletAddress = publicKey.toBase58();
    
    // Subscribe to user mints
    const unsubscribeUser = getUserMints(walletAddress, (mints) => {
      setUserMints(mints);
      setLoadingUser(false);
    });

    return () => {
      unsubscribeUser();
    };
  }, [publicKey]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild data-testid="button-back-to-create">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Create
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-gallery-title">
                  NFT Gallery
                </h1>
                <p className="text-sm text-muted-foreground" data-testid="text-gallery-subtitle">
                  Discover amazing digital artwork created by our community
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="all" data-testid="tab-all-mints">
              All Mints ({allMints.length})
            </TabsTrigger>
            <TabsTrigger value="my" data-testid="tab-my-mints">
              My Mints ({userMints.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4" data-testid="text-all-mints-title">
                All Community Creations
              </h2>
              <MintGrid mints={allMints} loading={loadingAll} />
            </div>
          </TabsContent>
          
          <TabsContent value="my" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4" data-testid="text-my-mints-title">
                Your NFT Collection
              </h2>
              {!publicKey ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground text-lg">Connect your wallet</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Connect your wallet to view your minted NFTs
                  </p>
                </div>
              ) : (
                <MintGrid mints={userMints} loading={loadingUser} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}