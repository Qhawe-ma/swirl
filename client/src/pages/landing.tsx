import { Link } from 'wouter';
import { useState, useEffect } from 'react';
import { getAllMints, MintRecord } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WalletConnection } from '@/components/wallet/WalletConnection';
import { Palette, Sparkles, Zap, Users, ArrowRight, Play, Check, Twitter, Instagram, MessageCircle, ExternalLink } from 'lucide-react';

// Community Gallery Component
function CommunityGallery() {
  const [mints, setMints] = useState<MintRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupFirebaseListener = async () => {
      console.log('🎯 Community Gallery: Setting up getAllMints subscription');
      
      try {
        unsubscribe = await getAllMints((mintsList) => {
          console.log('📨 Community Gallery: Received mints callback with', mintsList.length, 'mints');
          setMints(mintsList);
          setLoading(false);
        });
      } catch (error) {
        console.error('❌ Failed to setup Firebase listener:', error);
        setLoading(false);
      }
    };

    setupFirebaseListener();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        console.log('🧹 Community Gallery: Cleaning up getAllMints subscription');
        try {
          unsubscribe();
        } catch (error) {
          console.error('❌ Error during unsubscribe:', error);
        }
      }
    };
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="w-full overflow-hidden bg-gradient-to-r from-muted/10 via-background to-muted/10 py-4 border-b border-border/20">
        <div className="relative">
          <div className="flex gap-3 px-4">
            {/* Loading placeholder cards */}
            {[1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-border/20 bg-muted/20 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no mints
  if (mints.length === 0) {
    return null; // Don't show anything if no mints
  }

  // Duplicate the mints array multiple times to ensure seamless loop with no blank spaces
  const duplicatedMints = [...mints, ...mints, ...mints, ...mints, ...mints, ...mints];

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-muted/10 via-background to-muted/10 py-4">
      <div className="relative">
        <div className="flex gap-3 community-gallery-scroll">
          {duplicatedMints.map((mint, index) => (
            <Link 
              href="/gallery" 
              key={`${mint.id}-${index}`}
              className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-border/20 shadow-md hover:shadow-lg transition-all duration-300 bg-white cursor-pointer hover:scale-105"
            >
              <img
                src={mint.imageData}
                alt={mint.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Clean Header with Just Logo */}
      <header className="bg-background flex-shrink-0 relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-4 sm:py-6 lg:py-8">
            {/* Centered Brand Section */}
            <div className="flex items-center gap-4 sm:gap-6">
              <img 
                src="https://res.cloudinary.com/dl8f1ztsy/image/upload/v1757143508/Swirl_Logo_wbpo9t.png" 
                alt="Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"
                data-testid="img-app-icon"
              />
              <span className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground" data-testid="text-app-title">
                Swirl
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Community Gallery */}
      <CommunityGallery />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/10 to-muted/20 py-2 sm:py-3 lg:py-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              {/* Hero Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight tracking-tight mb-12" data-testid="hero-title">
                Turn Your Art Into NFT
              </h1>
              
              {/* Screenshot Image */}
              <div className="mb-8 mt-16 flex justify-center">
                <img 
                  src="https://res.cloudinary.com/dl8f1ztsy/image/upload/v1757186526/Screenshot_2025-09-06_212107_wrnzxk.png" 
                  alt="Swirl NFT Creation Interface" 
                  className="max-w-full h-auto rounded-xl shadow-2xl border border-border/20"
                  data-testid="img-interface-preview"
                />
              </div>
              
              {/* Hero Description */}
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl mx-auto" data-testid="hero-description">
                Create stunning digital artwork with professional drawing tools and mint it as an NFT on Solana. 
                Your creativity, permanently stored on the blockchain.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
                <Link href="/create">
                  <Button 
                    size="lg" 
                    className="group w-full sm:w-auto px-12 py-6 text-lg font-bold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary/95 hover:to-primary text-primary-foreground shadow-2xl hover:shadow-3xl transition-all duration-500 ease-out motion-safe:hover:scale-[1.03] motion-safe:hover:-translate-y-2 rounded-2xl border-0 relative overflow-hidden active:scale-[0.98] active:translate-y-0"
                    data-testid="button-create-now"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                    
                    {/* Click ripple effect */}
                    <div className="absolute inset-0 bg-black/20 rounded-full scale-0 group-active:scale-100 transition-transform duration-300 ease-out origin-center"></div>
                    
                    <span className="relative z-10 flex items-center font-black tracking-wide">
                      CREATE NOW
                      <ArrowRight className="w-6 h-6 ml-4 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110" />
                    </span>
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="group w-full sm:w-auto px-10 py-6 text-lg font-bold border-2 border-foreground/20 hover:border-primary/50 bg-background/80 backdrop-blur-sm hover:bg-primary/5 shadow-lg hover:shadow-xl transition-all duration-400 ease-out motion-safe:hover:scale-[1.02] motion-safe:hover:-translate-y-1 rounded-2xl relative overflow-hidden active:scale-[0.98] active:translate-y-0"
                    data-testid="button-view-gallery"
                  >
                    {/* Subtle shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-600 ease-out"></div>
                    
                    {/* Click effect */}
                    <div className="absolute inset-0 bg-foreground/10 rounded-full scale-0 group-active:scale-100 transition-transform duration-200 ease-out origin-center"></div>
                    
                    <span className="relative z-10 font-black tracking-wide text-foreground group-hover:text-primary transition-colors duration-300">
                      View Gallery
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Create With Friends Section */}
        <section className="py-8 sm:py-12 lg:py-16 bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <button 
                className="group w-full max-w-xl mx-auto px-12 py-8 text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-muted/30 via-muted/40 to-muted/30 hover:from-muted/50 hover:via-muted/60 hover:to-muted/50 border-2 border-muted/40 hover:border-muted/60 shadow-2xl hover:shadow-3xl transition-all duration-500 ease-out motion-safe:hover:scale-[1.02] motion-safe:hover:-translate-y-2 rounded-3xl relative overflow-hidden active:scale-[0.98] active:translate-y-0"
                data-testid="button-create-with-friends"
                disabled
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                
                {/* Click effect */}
                <div className="absolute inset-0 bg-foreground/10 rounded-full scale-0 group-active:scale-100 transition-transform duration-300 ease-out origin-center"></div>
                
                {/* Text that changes on hover */}
                <span className="relative z-10 flex items-center justify-center tracking-wide">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 mr-3 sm:mr-4 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  <span className="transition-all duration-300 group-hover:opacity-0 group-hover:scale-95">
                    Create With Friends
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 text-primary font-black">
                    COMING SOON
                  </span>
                </span>
              </button>
              
              <p className="text-lg text-muted-foreground mt-8 max-w-2xl mx-auto">
                Collaborate on artwork in real-time with friends. Share canvases, work together, and create amazing pieces as a team.
              </p>
            </div>
          </div>
        </section>

        {/* How to Create Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-muted/20 via-background to-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="how-to-title">
                How to Create Your NFT
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="how-to-description">
                Simple 3-step process to turn your creativity into blockchain art
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="text-center" data-testid="step-draw">
                <div className="mx-auto mb-6">
                  <div className="w-32 h-32 bg-gray-400 rounded-2xl mx-auto"></div>
                </div>
                <h3 className="text-lg text-muted-foreground mb-4">Draw & Create</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Use our professional drawing tools to create your masterpiece. 
                  Choose colors, brush sizes, and let your creativity flow.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center" data-testid="step-customize">
                <div className="mx-auto mb-6">
                  <div className="w-32 h-32 bg-gray-400 rounded-2xl mx-auto"></div>
                </div>
                <h3 className="text-lg text-muted-foreground mb-4">Add Details</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Give your artwork a name and description. These details will be 
                  permanently stored with your NFT on the blockchain.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center" data-testid="step-mint">
                <div className="mx-auto mb-6">
                  <div className="w-32 h-32 bg-gray-400 rounded-2xl mx-auto"></div>
                </div>
                <h3 className="text-lg text-muted-foreground mb-4">Mint as NFT</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Connect your Solana wallet and mint your artwork to the blockchain. 
                  Your digital art becomes a permanent, tradeable NFT.
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mt-16">
              <Link href="/create">
                <Button 
                  size="lg" 
                  className="px-8 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 motion-safe:hover:scale-105 rounded-xl border-2 border-white/20"
                  data-testid="button-start-creating"
                >
                  <Play className="w-5 h-5 mr-2" />
                  START CREATING
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                No registration required • Connect any Solana wallet
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background/95 backdrop-blur-sm border-t border-border/10 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16">
            
            {/* Company Info & Description */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-4">
                <img 
                  src="https://res.cloudinary.com/dl8f1ztsy/image/upload/v1757143508/Swirl_Logo_wbpo9t.png" 
                  alt="Swirl Logo" 
                  className="w-10 h-10"
                  data-testid="img-footer-logo"
                />
                <span className="text-2xl font-bold text-foreground tracking-tight" data-testid="text-footer-brand">Swirl</span>
              </div>
              <p className="text-muted-foreground/90 leading-relaxed text-base max-w-sm" data-testid="text-footer-description">
                The most accessible way to bring your art onto the blockchain. Draw, mint and sell your artwork globally across Solana.
              </p>
            </div>

            {/* Follow */}
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide" data-testid="text-follow-title">Follow</h3>
              <ul className="space-y-4">
                <li>
                  <a 
                    href="https://twitter.com/swirlnft" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground/80 hover:text-foreground transition-colors duration-300 text-sm"
                    data-testid="link-twitter"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a 
                    href="https://t.me/swirlnft" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground/80 hover:text-foreground transition-colors duration-300 text-sm"
                    data-testid="link-telegram"
                  >
                    Telegram
                  </a>
                </li>
                <li>
                  <a 
                    href="https://instagram.com/swirlnft" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground/80 hover:text-foreground transition-colors duration-300 text-sm"
                    data-testid="link-instagram"
                  >
                    Instagram
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide" data-testid="text-resources-title">Resources</h3>
              <ul className="space-y-4">
                <li>
                  <a 
                    href="/support" 
                    className="text-muted-foreground/80 hover:text-foreground transition-colors duration-300 text-sm"
                    data-testid="link-support"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a 
                    href="/feature-requests" 
                    className="text-muted-foreground/80 hover:text-foreground transition-colors duration-300 text-sm"
                    data-testid="link-feature-requests"
                  >
                    Feature Requests
                  </a>
                </li>
                <li>
                  <a 
                    href="/trust-safety" 
                    className="text-muted-foreground/80 hover:text-foreground transition-colors duration-300 text-sm"
                    data-testid="link-trust-safety"
                  >
                    Trust & Safety
                  </a>
                </li>
              </ul>
            </div>

            {/* NFT Marketplace & Products */}
            <div className="space-y-8">
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide" data-testid="text-marketplace-title">NFT Marketplace</h3>
                <ul className="space-y-4">
                  <li>
                    <a 
                      href="https://tensor.trade" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground/80 hover:text-foreground transition-colors duration-300 text-sm"
                      data-testid="link-tensor"
                    >
                      Tensor
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://magiceden.io" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground/80 hover:text-foreground transition-colors duration-300 text-sm"
                      data-testid="link-magic-eden"
                    >
                      Magic Eden
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide" data-testid="text-products-title">Products</h3>
                <ul className="space-y-4">
                  <li>
                    <Link href="/create" className="text-muted-foreground/80 hover:text-foreground transition-colors duration-300 text-sm" data-testid="link-nft-paint">
                      NFT Paint
                    </Link>
                  </li>
                  <li>
                    <span className="text-muted-foreground/60 text-sm" data-testid="text-ios-android">
                      Swirl iOS & Android App
                    </span>
                  </li>
                  <li>
                    <span className="text-muted-foreground/60 text-sm" data-testid="text-creator-museum">
                      Creator Museum
                    </span>
                  </li>
                  <li>
                    <span className="text-muted-foreground/60 text-sm" data-testid="text-auction-house">
                      Live Auction House
                    </span>
                  </li>
                  <li>
                    <span className="text-muted-foreground/60 text-sm" data-testid="text-art-streamies">
                      Art Streamies
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border/10 mt-16 pt-8">
            <div className="text-center">
              <p className="text-xs text-muted-foreground/70 font-medium tracking-wide" data-testid="text-copyright">
                ©2025 Swirl Labs. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}