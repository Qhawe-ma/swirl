import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAllMints, getUserMints, MintRecord } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, ExternalLink, Copy, Search, X } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

function NFTDetailModal({ mint }: { mint: MintRecord }) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">{mint.name}</DialogTitle>
      </DialogHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NFT Image */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border-2 border-border">
            <img 
              src={mint.imageData} 
              alt={mint.name}
              className="w-full h-full object-contain bg-muted"
              data-testid={`modal-img-${mint.id}`}
            />
          </div>
        </div>
        
        {/* NFT Details */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Token Name</h3>
              <p className="text-lg font-semibold" data-testid={`modal-name-${mint.id}`}>{mint.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
              <p className="text-sm" data-testid={`modal-date-${mint.id}`}>{formatDate(mint.timestamp)}</p>
            </div>
          </div>
          
          {/* Creator Info */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <h3 className="text-sm font-medium text-muted-foreground">Creator</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono" data-testid={`modal-creator-${mint.id}`}>
                {formatAddress(mint.walletAddress)}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(mint.walletAddress)}
                aria-label="Copy creator address"
                data-testid={`modal-copy-creator-${mint.id}`}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
          
          {/* Mint Address */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <h3 className="text-sm font-medium text-muted-foreground">Mint Address</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono break-all" data-testid={`modal-mint-address-${mint.id}`}>
                {formatAddress(mint.mintAddress)}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(mint.mintAddress)}
                aria-label="Copy mint address"
                data-testid={`modal-copy-mint-${mint.id}`}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <Button 
              asChild
              className="w-full"
              data-testid={`modal-view-transaction-${mint.id}`}
            >
              <a 
                href={`https://solscan.io/tx/${mint.transactionSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View transaction on Solscan"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Solscan
              </a>
            </Button>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => copyToClipboard(mint.metadataUri)}
              data-testid={`modal-copy-metadata-${mint.id}`}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Metadata URI
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border animate-pulse">
            <div className="aspect-square bg-muted rounded-t-lg"></div>
            <div className="p-2 space-y-1">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-2 bg-muted rounded w-3/4"></div>
              <div className="h-2 bg-muted rounded w-1/2"></div>
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
      {mints.map((mint) => (
        <Dialog key={mint.id}>
          <DialogTrigger asChild>
            <div 
              className="bg-card rounded-lg border hover:shadow-lg hover:shadow-primary/20 hover:border-primary/30 transition-all duration-200 group cursor-pointer relative"
              data-testid={`mint-card-${mint.id}`}
            >
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none"></div>
              
              {/* NFT Image */}
              <div className="aspect-square overflow-hidden rounded-t-lg relative">
                <img 
                  src={mint.imageData} 
                  alt={mint.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                  decoding="async"
                  data-testid={`img-mint-${mint.id}`}
                />
                {/* Hover indicator */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                    <Search className="h-4 w-4 text-gray-700" />
                  </div>
                </div>
              </div>
          
              {/* Mint Info */}
              <div className="p-2">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-xs truncate flex-1" data-testid={`text-mint-name-${mint.id}`}>
                    {mint.name}
                  </h3>
                  <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">
                    NFT
                  </Badge>
                </div>
                
                {/* Creator Address */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">Creator:</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] font-mono" data-testid={`text-creator-${mint.id}`}>
                      {formatAddress(mint.walletAddress)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 hover:bg-muted"
                      onClick={() => copyToClipboard(mint.walletAddress)}
                      aria-label="Copy creator address"
                      data-testid={`button-copy-creator-${mint.id}`}
                    >
                      <Copy className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>
                
                {/* Date */}
                <div className="text-[10px] text-muted-foreground mb-2" data-testid={`text-mint-date-${mint.id}`}>
                  {formatDate(mint.timestamp)}
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-[10px]"
                    onClick={() => copyToClipboard(mint.mintAddress)}
                    aria-label="Copy mint address"
                    data-testid={`button-copy-address-${mint.id}`}
                  >
                    <Copy className="h-2.5 w-2.5 mr-1" />
                    Copy
                  </Button>
                  
                  <a 
                    href={`https://solscan.io/tx/${mint.transactionSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[10px] text-primary hover:text-primary/80 transition-colors"
                    aria-label="View transaction on Solscan"
                    data-testid={`link-transaction-${mint.id}`}
                  >
                    <ExternalLink className="h-2.5 w-2.5 mr-1" />
                    View
                  </a>
                </div>
              </div>
            </div>
          </DialogTrigger>
          <NFTDetailModal mint={mint} />
        </Dialog>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAllMints, setFilteredAllMints] = useState<MintRecord[]>([]);
  const [filteredUserMints, setFilteredUserMints] = useState<MintRecord[]>([]);

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

  // Filter mints based on search query
  useEffect(() => {
    const filterMints = (mints: MintRecord[]) => {
      if (!searchQuery.trim()) return mints;
      const query = searchQuery.toLowerCase();
      return mints.filter(mint => 
        mint.name.toLowerCase().includes(query) ||
        mint.walletAddress.toLowerCase().includes(query)
      );
    };

    setFilteredAllMints(filterMints(allMints));
    setFilteredUserMints(filterMints(userMints));
  }, [searchQuery, allMints, userMints]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild data-testid="button-back-to-create">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
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
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="all" data-testid="tab-all-mints">
              All Mints ({filteredAllMints.length})
            </TabsTrigger>
            <TabsTrigger value="my" data-testid="tab-my-mints">
              My Mints ({filteredUserMints.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4" data-testid="text-all-mints-title">
                All Community Creations
              </h2>
              <MintGrid mints={filteredAllMints} loading={loadingAll} />
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
                <MintGrid mints={filteredUserMints} loading={loadingUser} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}