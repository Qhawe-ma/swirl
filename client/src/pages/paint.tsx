import { useState } from 'react';
import { WalletConnection } from '@/components/wallet/WalletConnection';
import { PaintCanvas } from '@/components/canvas/PaintCanvas';
import { DrawingToolbar } from '@/components/canvas/DrawingToolbar';
import { NFTMintingForm } from '@/components/nft/NFTMintingForm';
import { MintSuccess } from '@/components/nft/MintSuccess';
import { MintsHistory } from '@/components/wallet/MintsHistory';
import { Card } from '@/components/ui/card';
import { useWallet } from '@solana/wallet-adapter-react';

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
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-icons text-white text-lg">palette</span>
              </div>
              <h1 className="text-xl font-medium text-gray-900">Paint NFT</h1>
            </div>
            
            <WalletConnection />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden bg-gray-200" style={{ background: 'linear-gradient(145deg, #e0e0e0, #c0c0c0)' }}>
        {appState === 'drawing' && (
          <div className="flex h-full gap-1 p-1">
            {/* Drawing Toolbar - MS Paint Style */}
            <div className="w-64 flex-shrink-0">
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
            
            {/* Paint Canvas - MS Paint Style */}
            <div className="flex-1">
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
          <div className="flex justify-center items-center min-h-0 bg-gray-200 p-4" style={{ background: 'linear-gradient(145deg, #e0e0e0, #c0c0c0)' }}>
            <div className="bg-gray-300 border-2 border-gray-400 p-6 max-w-md w-full" style={{ borderStyle: 'outset' }} data-testid="card-minting-progress">
              {/* Header */}
              <div className="bg-gray-200 border-b-2 border-gray-400 px-3 py-2 -m-6 mb-4" style={{ borderStyle: 'outset' }}>
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                  <span className="mr-2">📝</span>
                  Minting Your NFT
                </h3>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent animate-spin" style={{ borderRadius: '0' }}></div>
                <div className="space-y-2 text-sm text-gray-800 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span>🌐</span>
                    <span>Uploading artwork to IPFS...</span>
                  </div>
                  <div className="text-xs text-gray-600">This may take a few moments</div>
                  <div className="text-xs text-gray-600 bg-yellow-100 border border-yellow-400 p-2 mt-2">
                    ⚠️ If it takes too long, try again with higher SOL balance
                  </div>
                </div>
              </div>
            </div>
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
