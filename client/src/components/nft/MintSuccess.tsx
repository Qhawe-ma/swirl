interface MintSuccessProps {
  mintAddress: string;
  onCreateAnother: () => void;
}

export function MintSuccess({ mintAddress, onCreateAnother }: MintSuccessProps) {
  const solscanUrl = `https://solscan.io/token/${mintAddress}`;

  return (
    <div className="flex justify-center items-center min-h-0 bg-gray-200 p-4" style={{ background: 'linear-gradient(145deg, #e0e0e0, #c0c0c0)' }}>
      <div className="bg-gray-300 border-2 border-gray-400 max-w-3xl w-full" style={{ borderStyle: 'outset' }} data-testid="card-mint-success">
        {/* Header */}
        <div className="bg-gray-200 border-b-2 border-gray-400 px-3 py-2" style={{ borderStyle: 'outset' }}>
          <h2 className="text-sm font-bold text-gray-800 flex items-center">
            <span className="mr-2">✅</span>
            NFT Minted Successfully!
          </h2>
        </div>

        <div className="p-6">
          <div className="text-center">
            {/* Success Icon - MS Paint Style */}
            <div className="w-16 h-16 bg-green-400 border-2 border-green-600 flex items-center justify-center mx-auto mb-4" style={{ borderStyle: 'outset' }}>
              <span className="text-black text-2xl font-bold">✓</span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-2">Your artwork is now a verified NFT on Solana mainnet</h3>
            
            {/* Mint Address Section - MS Paint Style */}
            <div className="bg-white border-2 border-gray-400 p-4 mb-6" style={{ borderStyle: 'inset' }}>
              <div className="text-sm font-bold text-gray-800 mb-2">Mint Address</div>
              <div 
                className="font-mono text-xs bg-gray-100 border border-gray-400 px-3 py-2 break-all select-all"
                style={{ borderStyle: 'inset' }}
                data-testid="text-mint-address"
              >
                {mintAddress}
              </div>
            </div>
            
            {/* Buttons - MS Paint Style */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <a 
                href={solscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-400 hover:bg-blue-300 active:bg-blue-500 border-2 border-blue-600 text-black font-bold px-6 py-2 flex items-center justify-center space-x-2"
                style={{ borderStyle: 'outset', borderRadius: '0' }}
                data-testid="link-view-solscan"
              >
                <span>🔗</span>
                <span>View on Solscan</span>
              </a>
              
              <button
                className="bg-green-400 hover:bg-green-300 active:bg-green-500 border-2 border-green-600 text-black font-bold px-6 py-2 flex items-center justify-center space-x-2"
                style={{ borderStyle: 'outset', borderRadius: '0' }}
                onClick={onCreateAnother}
                data-testid="button-create-another"
              >
                <span>➕</span>
                <span>Create Another</span>
              </button>
            </div>
            
            {/* Info Section - MS Paint Style */}
            <div className="bg-yellow-100 border-2 border-yellow-400 p-3 text-sm text-gray-800" style={{ borderStyle: 'inset' }}>
              <div className="flex items-center justify-center space-x-2">
                <span>ℹ️</span>
                <span>Your NFT will appear in Phantom wallet and can be listed on Magic Eden</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
