import { useState } from 'react';
import { WalletConnection } from '@/components/wallet/WalletConnection';
import { PaintCanvas } from '@/components/canvas/PaintCanvas';
import { DrawingToolbar } from '@/components/canvas/DrawingToolbar';
import { NFTMintingForm } from '@/components/nft/NFTMintingForm';
import { MintSuccess } from '@/components/nft/MintSuccess';
import { MintsHistory } from '@/components/wallet/MintsHistory';
import { Card } from '@/components/ui/card';
import { useWallet } from '@solana/wallet-adapter-react';
import { FileText, Globe, Palette, AlertTriangle } from 'lucide-react';

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
      {/* Modern Header with Glassmorphism */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 flex-shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Modern Logo with Gradient */}
              <div className="relative group" data-testid="app-logo">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl motion-safe:transition-all motion-safe:duration-300 motion-reduce:transition-none motion-safe:group-hover:scale-105 motion-reduce:group-hover:scale-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" tabIndex={0}>
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" aria-hidden="true" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-20 blur motion-safe:transition-all motion-safe:duration-300 motion-reduce:transition-none pointer-events-none"></div>
              </div>
              
              {/* Modern Typography - Responsive */}
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight" data-testid="text-app-title">Paint NFT</h1>
                <p className="text-xs text-muted-foreground font-medium tracking-wide hidden sm:block" data-testid="text-app-subtitle">Create • Mint • Own</p>
              </div>
            </div>
            
            <WalletConnection />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden bg-muted/30" style={{ background: 'linear-gradient(145deg, hsl(var(--muted)/0.3), hsl(var(--muted)/0.5))' }}>
        {appState === 'drawing' && (
          <div className="flex flex-col lg:flex-row h-full gap-2 p-2 lg:gap-1 lg:p-1">
            {/* Drawing Toolbar - Responsive Design */}
            <div className="w-full lg:w-64 flex-shrink-0 order-2 lg:order-1">
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
              />
            </div>
            
            {/* Paint Canvas - Responsive Design */}
            <div className="flex-1 order-1 lg:order-2 min-h-0">
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
        )}

        {appState === 'minting-form' && (
          <NFTMintingForm
            imageData={savedImageData}
            onMintSuccess={handleMintSuccess}
            onMintStart={handleMintStart}
          />
        )}

        {appState === 'minting' && (
          <div className="flex justify-center items-center min-h-0 bg-gradient-to-br from-muted/20 via-transparent to-muted/30 p-4 sm:p-6">
            <Card className="bg-card/90 backdrop-blur-xl border border-border/50 p-6 sm:p-8 max-w-lg w-full shadow-2xl" data-testid="card-minting-progress" role="status" aria-live="polite">
              {/* Modern Header */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/30 px-4 sm:px-6 py-4 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center tracking-wide">
                  <FileText className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  Minting Your NFT
                </h3>
              </div>
              
              <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                {/* Modern Loading Spinner - Responsive */}
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 border-3 sm:border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-3 sm:border-4 border-primary border-t-transparent rounded-full motion-safe:animate-spin"></div>
                  <div className="absolute inset-1 sm:inset-2 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-transparent rounded-full"></div>
                </div>
                
                <div className="space-y-4 text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <Globe className="w-5 h-5" aria-hidden="true" />
                    <span className="text-foreground font-medium">Uploading artwork to IPFS...</span>
                  </div>
                  <div className="text-sm text-muted-foreground">This may take a few moments</div>
                  
                  {/* Modern Info Alert */}
                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                      <div className="text-sm text-amber-800 dark:text-amber-200">
                        If the process takes too long, try again with a higher SOL balance for faster confirmation
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
