import { useState } from 'react';
import { WalletConnection } from '@/components/wallet/WalletConnection';
import { PaintCanvas } from '@/components/canvas/PaintCanvas';
import { DrawingToolbar } from '@/components/canvas/DrawingToolbar';
import { ThreeStepMinting } from '@/components/nft/ThreeStepMinting';
import { MintSuccess } from '@/components/nft/MintSuccess';
import { MintsHistory } from '@/components/wallet/MintsHistory';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { Link } from 'wouter';
import { FileText, Globe, Palette, AlertTriangle, ChevronLeft, ChevronRight, Menu, Brush, Eraser, Undo2, Redo2, Square, RectangleHorizontal } from 'lucide-react';

type AppState = 'drawing' | 'minting-form' | 'minting' | 'success';

export default function PaintPage() {
  const { connected } = useWallet();
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(15);
  const [drawingMode, setDrawingMode] = useState<'brush' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'fill'>('brush');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [shouldUndo, setShouldUndo] = useState(false);
  const [shouldRedo, setShouldRedo] = useState(false);
  const [shouldClear, setShouldClear] = useState(false);
  
  // Collapsible sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [canvasFormat, setCanvasFormat] = useState<'square' | 'rectangle'>('square');
  
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

  const handleBackToDrawing = () => {
    setAppState('drawing');
  };


  return (
    <div className="h-screen bg-background font-sans flex flex-col">
      {/* Professional Header - NFT Marketplace Style */}
      <header className="bg-background/95 backdrop-blur-2xl border-b border-border/30 flex-shrink-0 relative shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-primary/3 pointer-events-none"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16 lg:h-18 relative">
            {/* Centered Compact Navigation */}
            <div className="flex items-center">
              {/* Navigation Items - Desktop */}
              <nav className="hidden lg:flex items-center space-x-1">
                <Link href="/" className="px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer" data-testid="link-home">
                  Home
                </Link>
                <div className="px-2 py-1 text-sm font-medium text-primary bg-primary/5 rounded-md border border-primary/20">
                  Create
                </div>
                <Link href="/gallery" className="px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer" data-testid="link-gallery">
                  Gallery
                </Link>
                <div className="relative group">
                  <div className="px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer" data-testid="link-create-with-friends">
                    <span className="group-hover:hidden">Create With Friends</span>
                    <span className="hidden group-hover:inline">Coming Soon</span>
                  </div>
                </div>
              </nav>

              {/* Mobile Navigation */}
              <nav className="flex lg:hidden items-center space-x-1">
                <Link href="/" className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer" data-testid="link-home-mobile">
                  Home
                </Link>
                <Link href="/gallery" className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer" data-testid="link-gallery-mobile">
                  Gallery
                </Link>
              </nav>
            </div>

            {/* Swirl Logo - Positioned absolutely in top left corner */}
            <div className="fixed top-2 left-2 z-50">
              <Link href="/" className="relative group cursor-pointer" data-testid="app-logo">
                <div className="flex items-center gap-2">
                  <img 
                    src="https://res.cloudinary.com/dl8f1ztsy/image/upload/v1757143508/Swirl_Logo_wbpo9t.png" 
                    alt="Logo" 
                    className="w-8 h-8 sm:w-12 sm:h-12"
                    data-testid="img-app-icon"
                  />
                  
                  {/* Brand Name */}
                  <span className="text-xl sm:text-3xl font-bold text-foreground -ml-1" data-testid="text-app-title">
                    Swirl
                  </span>
                </div>
              </Link>
            </div>

            {/* Wallet Connection - Positioned absolutely in top right corner */}
            <div className="fixed top-2 right-2 z-50">
              <WalletConnection />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gradient-to-br from-background via-muted/10 to-muted/20 min-h-0">
        {appState === 'drawing' && (
          <div className="h-full flex flex-col lg:flex-row gap-16 p-1 min-h-0 relative">
            {/* Sidebar Toggle Button - Positioned between sidebar and canvas */}
            <Button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`hidden lg:block absolute top-4 z-20 w-12 h-12 p-0 m-0 bg-[#5EBAFF] hover:bg-[#4A9CE5] text-white shadow-xl hover:shadow-2xl transition-all duration-300 motion-safe:hover:scale-105 rounded-xl border-2 border-white/30 ${
                sidebarCollapsed 
                  ? 'left-[4.5rem]' // Positioned right of collapsed sidebar
                  : 'left-[21rem]' // Positioned right of expanded sidebar
              }`}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              data-testid="button-toggle-sidebar"
            >
              <div className="w-full h-full flex items-center justify-center">
                {sidebarCollapsed ? (
                  <ChevronRight className="h-8 w-8" strokeWidth={4} />
                ) : (
                  <ChevronLeft className="h-8 w-8" strokeWidth={4} />
                )}
              </div>
            </Button>

            {/* Mobile Toolbar - Top on mobile, sidebar on desktop */}
            <div className={`relative transition-all duration-500 ease-in-out flex-shrink-0 lg:h-auto ${
              sidebarCollapsed 
                ? 'lg:w-16 h-auto' 
                : 'lg:w-80 h-auto'
            }`}>
              <div className="h-full lg:h-full relative border border-border/40 rounded-lg">
                
                {/* Mobile Toolbar - Always visible on mobile */}
                <div className="lg:hidden w-full">
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
                    isCollapsed={false}
                  />
                </div>

                {/* Desktop Sidebar Content */}
                <div className={`hidden lg:block transition-all duration-500 ease-in-out overflow-hidden ${
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
                
                {/* Collapsed Mini Toolbar - Desktop only */}
                {sidebarCollapsed && (
                  <div className="hidden lg:flex absolute top-20 left-0 right-0 bottom-0 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 flex-col items-center justify-start pt-4 pb-4 gap-2 overflow-y-auto">
                    {/* Mini Mode Indicator */}
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-lg flex items-center justify-center ring-1 ring-primary/20">
                      <Palette className="h-3 w-3 text-primary" />
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
                      className="w-8 h-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-600"
                      title={`Switch to ${drawingMode === 'brush' ? 'eraser' : 'brush'}`}
                    >
                      {drawingMode === 'brush' ? (
                        <Brush className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                      ) : (
                        <Eraser className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                      )}
                    </button>

                    {/* Action Buttons */}
                    <button
                      onClick={handleUndo}
                      disabled={!canUndo}
                      className="w-8 h-6 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-md flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-600"
                      title="Undo"
                    >
                      <Undo2 className="h-2.5 w-2.5 text-slate-600 dark:text-slate-400" />
                    </button>
                    
                    <button
                      onClick={handleRedo}
                      disabled={!canRedo}
                      className="w-8 h-6 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-md flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-600"
                      title="Redo"
                    >
                      <Redo2 className="h-2.5 w-2.5 text-slate-600 dark:text-slate-400" />
                    </button>

                    <button
                      onClick={handleClear}
                      className="w-8 h-6 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md border border-red-200 dark:border-red-800"
                      title="Clear Canvas"
                    >
                      <svg className="h-2.5 w-2.5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Main Canvas Area - Full canvas display */}
            <div className="flex-1 min-h-0 min-w-0 lg:min-w-0">
              <div className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-xl shadow-xl p-1 h-full">
                <div className="h-full rounded-lg overflow-hidden">
                  <PaintCanvas
                    selectedColor={selectedColor}
                    brushSize={brushSize}
                    drawingMode={drawingMode}
                    canvasFormat={canvasFormat}
                    setCanvasFormat={setCanvasFormat}
                    initialImageData={savedImageData}
                    onSave={handleSaveImage}
                    onUndoRedoChange={handleUndoRedoChange}
                    shouldUndo={shouldUndo}
                    shouldRedo={shouldRedo}
                    shouldClear={shouldClear}
                    onActionComplete={handleActionComplete}
                    onModeChange={setDrawingMode}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {appState === 'minting-form' && (
          <ThreeStepMinting
            imageData={savedImageData}
            onMintSuccess={handleMintSuccess}
            onBack={handleBackToDrawing}
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
