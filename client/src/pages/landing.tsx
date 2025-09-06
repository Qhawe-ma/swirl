import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WalletConnection } from '@/components/wallet/WalletConnection';
import { Palette, Sparkles, Zap, Users, ArrowRight, Play, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Clean Header with Just Logo */}
      <header className="bg-background flex-shrink-0 relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-8 sm:py-12 lg:py-16">
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

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/10 to-muted/20 py-12 sm:py-20 lg:py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              {/* Hero Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full border border-primary/20 mb-6" data-testid="hero-badge">
                <Sparkles className="w-4 h-4" />
                <span>Create & Mint NFT Art</span>
              </div>
              
              {/* Hero Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6" data-testid="hero-title">
                Turn Your Art Into
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                  Blockchain Magic
                </span>
              </h1>
              
              {/* Hero Description */}
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl mx-auto" data-testid="hero-description">
                Create stunning digital artwork with professional drawing tools and mint it as an NFT on Solana. 
                Your creativity, permanently stored on the blockchain.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link href="/create">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 motion-safe:hover:scale-105 rounded-xl border-2 border-white/20"
                    data-testid="button-create-now"
                  >
                    <Palette className="w-5 h-5 mr-2" />
                    CREATE NOW
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto px-8 py-4 text-lg font-semibold border-2 border-border hover:bg-accent hover:border-primary/30 transition-all duration-300 rounded-xl"
                    data-testid="button-view-gallery"
                  >
                    View Gallery
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4" data-testid="features-title">
                Professional Tools, Simple Process
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="features-description">
                Everything you need to create, customize, and mint your digital masterpieces
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 - Professional Tools */}
              <Card className="p-8 bg-card/60 backdrop-blur-xl border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300 motion-safe:hover:scale-105" data-testid="card-professional-tools">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Professional Drawing Tools</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Full-featured canvas with brushes, shapes, colors, and unlimited undo/redo. 
                  Create in square or rectangle formats.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mr-2" />
                    Multiple brush sizes & tools
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mr-2" />
                    Custom color picker
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mr-2" />
                    Shape tools & eraser
                  </li>
                </ul>
              </Card>

              {/* Feature 2 - Blockchain Integration */}
              <Card className="p-8 bg-card/60 backdrop-blur-xl border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300 motion-safe:hover:scale-105" data-testid="card-blockchain">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Instant NFT Minting</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Connect your Solana wallet and mint your artwork directly to the blockchain. 
                  Fast, secure, and permanent.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mr-2" />
                    Solana mainnet integration
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mr-2" />
                    IPFS decentralized storage
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mr-2" />
                    Low transaction fees
                  </li>
                </ul>
              </Card>

              {/* Feature 3 - Coming Soon */}
              <Card className="p-8 bg-card/60 backdrop-blur-xl border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300 motion-safe:hover:scale-105 relative overflow-hidden" data-testid="card-collaboration">
                <div className="absolute top-4 right-4 px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                  Coming Soon
                </div>
                <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Create With Friends</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Collaborate on artwork in real-time with friends. Share canvases, 
                  work together, and create amazing pieces as a team.
                </p>
                <ul className="space-y-2 opacity-60">
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground mr-2" />
                    Real-time collaboration
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground mr-2" />
                    Shared canvas sessions
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground mr-2" />
                    Team NFT ownership
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* How to Create Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-muted/20 via-background to-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4" data-testid="how-to-title">
                How to Create Your NFT
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="how-to-description">
                Simple 3-step process to turn your creativity into blockchain art
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="text-center" data-testid="step-draw">
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border-4 border-primary/20">
                    <Palette className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Draw & Create</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Use our professional drawing tools to create your masterpiece. 
                  Choose colors, brush sizes, and let your creativity flow.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center" data-testid="step-customize">
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border-4 border-primary/20">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Add Details</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Give your artwork a name and description. These details will be 
                  permanently stored with your NFT on the blockchain.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center" data-testid="step-mint">
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border-4 border-primary/20">
                    <Zap className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Mint as NFT</h3>
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
      <footer className="bg-background border-t border-border/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
              <img 
                src="https://res.cloudinary.com/dl8f1ztsy/image/upload/v1757143508/Swirl_Logo_wbpo9t.png" 
                alt="Logo" 
                className="w-6 h-6"
              />
              <span className="text-lg font-bold text-foreground">Swirl</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Create • Mint • Own Forever
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}