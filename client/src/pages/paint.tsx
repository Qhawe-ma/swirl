import { useState } from 'react';
import { WalletConnection } from '@/components/wallet/WalletConnection';
import { PaintCanvas } from '@/components/canvas/PaintCanvas';
import { DrawingToolbar } from '@/components/canvas/DrawingToolbar';
import { ThreeStepMinting } from '@/components/nft/ThreeStepMinting';
import { MintSuccess } from '@/components/nft/MintSuccess';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Palette, ChevronLeft, ChevronRight, Brush, Eraser, Undo2, Redo2 } from 'lucide-react';

type AppState = 'drawing' | 'minting-form' | 'success';

export default function PaintPage() {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(15);
  const [drawingMode, setDrawingMode] = useState<'brush' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'fill'>('brush');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [shouldUndo, setShouldUndo] = useState(false);
  const [shouldRedo, setShouldRedo] = useState(false);
  const [shouldClear, setShouldClear] = useState(false);
  
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
      <header className="bg-background/95 backdrop-blur-2xl border-b border-border/30 flex-shrink-0 relative shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-primary/3 pointer-events-none"></div>
        
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-50" data-testid="logo-corner">
          <Link href="/" className="relative group cursor-pointer" data-testid="app-logo">
            <div className="flex items-center gap-0">
              <img 
                src="https://res.cloudinary.com/dl8f1ztsy/image/upload/v1757143508/Swirl_Logo_wbpo9t.png" 
                alt="Logo" 
                className="w-8 h-8 sm:w-12 sm:h-12"
                data-testid="img-app-icon"
              />
              
              <span className="text-xl sm:text-3xl font-bold text-foreground -ml-3" data-testid="text-app-title">
                Swirl
              </span>
            </div>
          </Link>
        </div>
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-50" data-testid="wallet-corner">
          <WalletConnection />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18 relative">

            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
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

              <nav className="flex lg:hidden items-center space-x-1">
                <Link href="/" className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer" data-testid="link-home-mobile">
                  Home
                </Link>
                <Link href="/gallery" className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer" data-testid="link-gallery-mobile">
                  Gallery
                </Link>
              </nav>
            </div>

          </div>
        </div>
      </header>

      <main className="flex-1 bg-gradient-to-br from-background via-muted/10 to-muted/20 min-h-0">
        {appState === 'drawing' && (
          <div className="h-full flex flex-col lg:flex-row gap-16 p-1 min-h-0 relative">
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

            <div className={`relative transition-all duration-500 ease-in-out flex-shrink-0 lg:h-auto ${
              sidebarCollapsed 
                ? 'lg:w-16 h-auto' 
                : 'lg:w-80 h-auto'
            }`}>
              <div className="h-full lg:h-full relative rounded-lg">
                
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
                
                {sidebarCollapsed && (
                  <div className="hidden lg:flex absolute top-20 left-0 right-0 bottom-0 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 flex-col items-center justify-start pt-4 pb-4 gap-2 overflow-y-auto">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-lg flex items-center justify-center ring-1 ring-primary/20">
                      <Palette className="h-3 w-3 text-primary" />
                    </div>
                    
                    <div 
                      className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 ring-1 ring-slate-900/10 dark:ring-white/10"
                      style={{ backgroundColor: selectedColor }}
                      title="Current color"
                    />
                    
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
            
            <div className="flex-1 min-h-0 min-w-0 lg:min-w-0">
              <div className="bg-card/60 backdrop-blur-xl rounded-xl shadow-xl p-1 h-full">
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
