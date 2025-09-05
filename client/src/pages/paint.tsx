import { useState } from 'react';
import { WalletConnection } from '@/components/wallet/WalletConnection';
import { PaintCanvas } from '@/components/canvas/PaintCanvas';
import { DrawingToolbar } from '@/components/canvas/DrawingToolbar';
import { NFTMintingForm } from '@/components/nft/NFTMintingForm';
import { MintSuccess } from '@/components/nft/MintSuccess';
import { MintsHistory } from '@/components/wallet/MintsHistory';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { FileText, Globe, Palette, AlertTriangle, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

type AppState = 'drawing' | 'minting-form' | 'minting' | 'success';

export default function PaintPage() {
  const { connected } = useWallet();
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(15);
  const [drawingMode, setDrawingMode] = useState<'brush' | 'eraser'>('brush');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [shouldUndo, setShouldUndo] = useState(false);
  const [shouldRedo, setShouldRedo] = useState(false);
  const [shouldClear, setShouldClear] = useState(false);
  
  // Collapsible sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [appState, setAppState] = useState<AppState>('drawing');
  const [savedImageData, setSavedImageData] = useState<string>('');
  const [mintAddress, setMintAddress] = useState<string>('');

  const handleUndo = () => setShouldUndo(true);
  const handleRedo = () => setShouldRedo(true);
  const handleClear = () => setShouldClear(true);

  const handleActionComplete = () => {
    setShouldUndo(false);
    setShouldRedo(false);
    setShouldClear(false);
  };

  const handleUndoRedoChange = (undo: boolean, redo: boolean) => {
    setCanUndo(undo);
    setCanRedo(redo);
  };

  const handleSaveImage = (imageData: string) => {
    setSavedImageData(imageData);
    setAppState('minting-form');
  };

  const handleMintStart = () => {
    setAppState('minting');
  };

  const handleMintSuccess = (address: string) => {
    setMintAddress(address);
    setAppState('success');
  };

  const handleCreateAnother = () => {
    setAppState('drawing');
    setSavedImageData('');
    setMintAddress('');
  };

  return (
    <div className="h-screen bg-background font-sans flex flex-col">
      {/* Professional Header - NFT Marketplace Style */}
      <header className="bg-background/95 backdrop-blur-2xl border-b border-border/30 flex-shrink-0 relative shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-primary/3 pointer-events-none"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            {/* Left: Brand Section */}
            <div className="flex items-center space-x-6">
              {/* Professional Logo */}
              <div className="relative group cursor-pointer" data-testid="app-logo">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary/25 transition-all duration-300 motion-safe:group-hover:scale-105">
                      <Palette className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 blur transition-all duration-300 pointer-events-none"></div>
                  </div>
                  
                  {/* Brand Name */}
                  <div className="hidden sm:block">
                    <div className="flex items-baseline space-x-2">
                      <h1 className="text-xl font-bold text-foreground tracking-tight" data-testid="text-app-title">
                        Paint<span className="text-primary">NFT</span>
                      </h1>
                      <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full tracking-wide">
                        Studio
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium tracking-wider mt-0.5" data-testid="text-app-subtitle">
                      Professional NFT Creation
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Navigation Items - Desktop */}
              <nav className="hidden lg:flex items-center space-x-1">
                <div className="px-3 py-2 text-sm font-medium text-primary bg-primary/5 rounded-lg border border-primary/20">
                  Create
                </div>
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-not-allowed opacity-60">
                  Gallery
                </div>
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-not-allowed opacity-60">
                  Analytics
                </div>
              </nav>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center space-x-4">
              {/* Network Status */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 tracking-wide">
                  Solana Mainnet
                </span>
              </div>
              
              <WalletConnection />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden bg-gradient-to-br from-background via-muted/10 to-muted/20">
        {appState === 'drawing' && (
          <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-6 p-6 relative">
            {/* Collapsible Professional Sidebar - Tools Panel */}
            <div className={`relative transition-all duration-500 ease-in-out flex-shrink-0 order-2 lg:order-1 ${
              sidebarCollapsed 
                ? 'w-16 lg:w-16' 
                : 'w-full lg:w-80'
            }`}>
              <div className="h-full max-h-[calc(100vh-8rem)] lg:sticky lg:top-6 relative">
                {/* Sidebar Toggle Button */}
                <Button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`absolute top-4 z-20 w-10 h-10 p-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 motion-safe:hover:scale-105 rounded-xl border-2 border-white/20 ${
                    sidebarCollapsed ? 'right-2' : '-right-5'
                  }`}
                  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  data-testid="button-toggle-sidebar"
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
                
                {/* Sidebar Content */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}>
                  <DrawingToolbar
                    selectedColor={selectedColor}
                    onColorChange={setSelectedColor}
                    brushSize={brushSize}
                    onBrushSizeChange={setBrushSize}
                    drawingMode={drawingMode}
                    onModeChange={setDrawingMode}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onClear={handleClear}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    isCollapsed={sidebarCollapsed}
                  />
                </div>
                
                {/* Collapsed Mini Toolbar */}
                {sidebarCollapsed && (
                  <div className="w-12 h-full bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 flex flex-col items-center py-6 space-y-4">
                    {/* Mini Mode Indicator */}
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl flex items-center justify-center ring-1 ring-primary/20">
                      <Palette className="h-4 w-4 text-primary" />
                    </div>
                    
                    {/* Current Color */}
                    <div 
                      className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 ring-1 ring-slate-900/10 dark:ring-white/10"
                      style={{ backgroundColor: selectedColor }}
                      title="Current color"
                    />
                    
                    {/* Quick Mode Toggle */}
                    <button
                      onClick={() => setDrawingMode(drawingMode === 'brush' ? 'eraser' : 'brush')}
                      className="w-8 h-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                      title={`Switch to ${drawingMode === 'brush' ? 'eraser' : 'brush'}`}
                    >
                      {drawingMode === 'brush' ? (
                        <span className="text-sm">🖌️</span>
                      ) : (
                        <span className="text-sm">🧹</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Main Canvas Area - Professional Layout with Dynamic Width */}
            <div className="flex-1 order-1 lg:order-2 min-h-0 flex flex-col">
              <div className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl shadow-xl p-1 h-full">
                <div className="h-full rounded-xl overflow-hidden">
                  <PaintCanvas
                    selectedColor={selectedColor}
                    brushSize={brushSize}
                    drawingMode={drawingMode}
                    onSave={handleSaveImage}
                    onUndoRedoChange={handleUndoRedoChange}
                    shouldUndo={shouldUndo}
                    shouldRedo={shouldRedo}
                    shouldClear={shouldClear}
                    onActionComplete={handleActionComplete}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {appState === 'minting-form' && (
          <NFTMintingForm
            imageData={savedImageData}
            onMintSuccess={handleMintSuccess}
            onMintStart={handleMintStart}
          />
        )}

        {appState === 'minting' && (
          <div className="max-w-7xl mx-auto p-6 min-h-0 flex items-center justify-center">
            <Card className="bg-card/95 backdrop-blur-2xl border border-border/30 p-8 max-w-lg w-full shadow-2xl" data-testid="card-minting-progress" role="status" aria-live="polite">
              {/* Professional Progress Header */}
              <div className="bg-gradient-to-r from-primary/8 via-primary/4 to-transparent border-b border-border/20 px-6 py-4 -mx-8 -mt-8 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground tracking-tight">
                        Minting NFT
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        Creating your digital asset...
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-lg">
                    Step 3/3
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-8">
                {/* Professional Loading Animation */}
                <div className="relative">
                  {/* Main spinner */}
                  <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  
                  {/* Inner glow */}
                  <div className="absolute inset-2 w-16 h-16 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-full animate-pulse"></div>
                  
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🎨</span>
                    </div>
                  </div>
                  
                  {/* Floating dots */}
                  <div className="absolute -top-2 left-1/2 w-2 h-2 bg-primary rounded-full animate-bounce transform -translate-x-1/2"></div>
                  <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce transform -translate-y-1/2" style={{animationDelay: '0.3s'}}></div>
                  <div className="absolute -bottom-2 left-1/2 w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce transform -translate-x-1/2" style={{animationDelay: '0.6s'}}></div>
                </div>
                
                {/* Progress Steps */}
                <div className="space-y-6 text-center w-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Globe className="w-4 h-4 text-primary" aria-hidden="true" />
                      </div>
                      <span className="text-foreground font-semibold">Uploading to IPFS</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Securing your artwork on the decentralized web</div>
                  </div>
                  
                  {/* Professional Progress Bar */}
                  <div className="w-full max-w-sm mx-auto">
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full animate-pulse" style={{width: '75%'}}></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Uploading...</span>
                      <span>75%</span>
                    </div>
                  </div>
                  
                  {/* Professional Tip */}
                  <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-blue-500/20 rounded-lg flex items-center justify-center mt-0.5">
                        <AlertTriangle className="w-3 h-3 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                      </div>
                      <div className="text-sm text-blue-800 dark:text-blue-200 text-left">
                        <div className="font-semibold mb-1">Pro Tip</div>
                        <div>Keep sufficient SOL for network fees. Process may take 30-60 seconds for optimal confirmation.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {appState === 'success' && (
          <MintSuccess
            mintAddress={mintAddress}
            onCreateAnother={handleCreateAnother}
          />
        )}
      </main>
    </div>
  );
}
