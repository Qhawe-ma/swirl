import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MintsHistory } from './MintsHistory';
import { useWallet } from '@solana/wallet-adapter-react';

export function MintsHistoryModal() {
  const { connected } = useWallet();

  if (!connected) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-sm bg-white hover:bg-gray-50 text-gray-700 border-gray-300 flex items-center space-x-2"
          data-testid="button-view-mints"
        >
          <span className="material-icons text-sm">history</span>
          <span>View Mints</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="material-icons">history</span>
            <span>Your NFT Mints</span>
          </DialogTitle>
        </DialogHeader>
        <MintsHistory />
      </DialogContent>
    </Dialog>
  );
}