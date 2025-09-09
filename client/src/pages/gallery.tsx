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
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-2 shadow-2xl mx-2 sm:mx-auto">
      <DialogHeader>
        <DialogTitle className="text-lg sm:text-xl font-bold pr-8">{mint.name}</DialogTitle>
      </DialogHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* NFT Image */}
        <div className="space-y-3 sm:space-y-4">
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
        <div className="space-y-4 sm:space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Token Name</h3>
              <p className="text-base sm:text-lg font-semibold" data-testid={`modal-name-${mint.id}`}>{mint.name}</p>
            </div>
            
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Created</h3>
              <p className="text-sm" data-testid={`modal-date-${mint.id}`}>{formatDate(mint.timestamp)}</p>
            </div>
          </div>
          
          {/* Creator Info */}
          <div className="space-y-3 p-3 sm:p-4 bg-muted/30 rounded-lg">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Creator</h3>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-mono break-all" data-testid={`modal-creator-${mint.id}`}>
                {formatAddress(mint.walletAddress)}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(mint.walletAddress)}
                aria-label="Copy creator address"
                data-testid={`modal-copy-creator-${mint.id}`}
                className="flex-shrink-0"
              >
                <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
          </div>
          
          {/* Mint Address */}
          <div className="space-y-3 p-3 sm:p-4 bg-muted/30 rounded-lg">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Mint Address</h3>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-mono break-all" data-testid={`modal-mint-address-${mint.id}`}>
                {formatAddress(mint.mintAddress)}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(mint.mintAddress)}
                aria-label="Copy mint address"
                data-testid={`modal-copy-mint-${mint.id}`}
                className="flex-shrink-0"
              >
                <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <Button 
              asChild
              className="w-full h-10 sm:h-11 text-sm"
              data-testid={`modal-view-transaction-${mint.id}`}
            >
              <a 
                href={`https://solscan.io/tx/${mint.transactionSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View transaction on Solscan"
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                View on Solscan
              </a>
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
      <div className="text-center py-6 sm:py-8 px-4">
        <div className="text-muted-foreground text-sm sm:text-base">Loading NFTs...</div>
      </div>
    );
  }

  if (mints.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="text-muted-foreground text-base sm:text-lg">No mints found</div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          Be the first to create an NFT!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 px-2 sm:px-0">
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
              <div className="p-1.5 sm:p-2">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-[10px] sm:text-xs truncate flex-1" data-testid={`text-mint-name-${mint.id}`}>
                    {mint.name}
                  </h3>
                  <Badge variant="outline" className="ml-1 text-[8px] sm:text-[10px] px-1 py-0">
                    NFT
                  </Badge>
                </div>
                
                {/* Creator Address - Hidden on very small screens */}
                <div className="hidden sm:flex items-center justify-between mb-1">
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
                <div className="text-[8px] sm:text-[10px] text-muted-foreground mb-1 sm:mb-2" data-testid={`text-mint-date-${mint.id}`}>
                  {formatDate(mint.timestamp)}
                </div>
                
                {/* Actions - Simplified for mobile */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 sm:h-6 px-1 sm:px-2 text-[8px] sm:text-[10px]"
                    onClick={() => copyToClipboard(mint.mintAddress)}
                    aria-label="Copy mint address"
                    data-testid={`button-copy-address-${mint.id}`}
                  >
                    <Copy className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                    <span className="hidden sm:inline">Copy</span>
                  </Button>
                  
                  <a 
                    href={`https://solscan.io/tx/${mint.transactionSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[8px] sm:text-[10px] text-primary hover:text-primary/80 transition-colors"
                    aria-label="View transaction on Solscan"
                    data-testid={`link-transaction-${mint.id}`}
                  >
                    <ExternalLink className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5 sm:mr-1" />
                    <span className="hidden sm:inline">View</span>
                    <span className="sm:hidden">Tx</span>
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
    document.title = "NFT Gallery | Swirl";
    return () => {
      document.title = "Swirl"; // Reset on unmount
    };
  }, []);

  useEffect(() => {
    console.log('🎯 Gallery useEffect: Setting up getAllMints subscription');
    
    let unsubscribeAll: (() => void) | null = null;
    
    // Subscribe to all mints (async)
    getAllMints((mints) => {
      console.log('📨 Gallery: Received mints callback with', mints.length, 'mints');
      setAllMints(mints);
      setLoadingAll(false);
    }).then(unsubscribe => {
      unsubscribeAll = unsubscribe;
    }).catch(error => {
      console.error('❌ Failed to setup getAllMints subscription:', error);
      setLoadingAll(false);
    });

    // Fallback timeout in case Firebase is slow or stuck
    const timeout = setTimeout(() => {
      console.log('⏰ Gallery: Timeout reached, setting loading to false');
      setLoadingAll(false);
    }, 10000); // 10 second timeout

    return () => {
      console.log('🧹 Gallery: Cleaning up getAllMints subscription');
      clearTimeout(timeout);
      if (unsubscribeAll) {
        unsubscribeAll();
      }
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
    
    let unsubscribeUser: (() => void) | null = null;
    
    // Subscribe to user mints (async)
    getUserMints(walletAddress, (mints) => {
      setUserMints(mints);
      setLoadingUser(false);
    }).then(unsubscribe => {
      unsubscribeUser = unsubscribe;
    }).catch(error => {
      console.error('❌ Failed to setup getUserMints subscription:', error);
      setLoadingUser(false);
    });

    return () => {
      if (unsubscribeUser) {
        unsubscribeUser();
      }
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
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="sm" asChild data-testid="button-back-to-create">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-foreground" data-testid="text-gallery-title">
                  NFT Gallery
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block" data-testid="text-gallery-subtitle">
                  Discover amazing digital artwork created by our community
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-4 sm:mb-8 px-2 sm:px-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
              data-testid="input-search"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-4 sm:mb-8">
            <TabsTrigger value="all" data-testid="tab-all-mints" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">All Mints ({filteredAllMints.length})</span>
              <span className="sm:hidden">All ({filteredAllMints.length})</span>
            </TabsTrigger>
            <TabsTrigger value="my" data-testid="tab-my-mints" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">My Mints ({filteredUserMints.length})</span>
              <span className="sm:hidden">Mine ({filteredUserMints.length})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 px-2 sm:px-0" data-testid="text-all-mints-title">
                All Community Creations
              </h2>
              <MintGrid mints={filteredAllMints} loading={loadingAll} />
            </div>
          </TabsContent>
          
          <TabsContent value="my" className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 px-2 sm:px-0" data-testid="text-my-mints-title">
                Your NFT Collection
              </h2>
              {!publicKey ? (
                <div className="text-center py-8 sm:py-12 px-4">
                  <div className="text-muted-foreground text-base sm:text-lg">Connect your wallet</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
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