import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, Paintbrush } from "lucide-react";

interface CaveArtPiece {
  id: string;
  title: string;
  description: string;
  imageData: string;
  artist: string;
  likes: number;
  views: number;
  category: string;
}

interface CaveArtGalleryProps {
  onSelectArt: (imageData: string) => void;
}

// Cave art templates with primitive/ancient art styles
const caveArtPieces: CaveArtPiece[] = [
  {
    id: 'cave-1',
    title: 'Ancient Hunter',
    description: 'Primitive cave painting depicting a hunter with spear',
    artist: 'Prehistoric',
    likes: 124,
    views: 567,
    category: 'figure',
    imageData: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#8B4513"/>
        <g stroke="#D2691E" stroke-width="8" fill="none">
          <path d="M100 250 L120 200 L140 250 M120 200 L100 180 M120 200 L140 180"/>
          <path d="M120 250 L120 300 M120 300 L100 350 M120 300 L140 350"/>
          <path d="M140 220 L200 210"/>
          <circle cx="120" cy="180" r="15" stroke="#D2691E" stroke-width="6"/>
        </g>
      </svg>
    `)}`
  },
  {
    id: 'cave-2', 
    title: 'Mammoth Drawing',
    description: 'Ancient depiction of a woolly mammoth',
    artist: 'Prehistoric',
    likes: 89,
    views: 234,
    category: 'animal',
    imageData: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#8B4513"/>
        <g stroke="#D2691E" stroke-width="6" fill="none">
          <ellipse cx="200" cy="250" rx="80" ry="50"/>
          <path d="M140 230 Q100 200 80 220"/>
          <path d="M150 240 Q110 240 100 260"/>
          <path d="M180 300 L170 350 M200 300 L200 350 M220 300 L220 350 M240 300 L250 350"/>
          <circle cx="160" cy="230" r="4"/>
        </g>
      </svg>
    `)}`
  },
  {
    id: 'cave-3',
    title: 'Hand Prints',
    description: 'Ancient hand stencils on cave wall',
    artist: 'Prehistoric',
    likes: 156,
    views: 432,
    category: 'abstract',
    imageData: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#8B4513"/>
        <g stroke="#D2691E" stroke-width="4" fill="#D2691E" opacity="0.7">
          <path d="M100 150 L120 140 L140 160 L135 200 L125 210 L115 210 L105 200 L100 180 Z"/>
          <path d="M250 200 L270 190 L290 210 L285 250 L275 260 L265 260 L255 250 L250 230 Z"/>
          <circle cx="180" cy="300" r="25"/>
        </g>
      </svg>
    `)}`
  },
  {
    id: 'cave-4',
    title: 'Bison Herd',
    description: 'Group of bison in cave art style',
    artist: 'Prehistoric', 
    likes: 203,
    views: 678,
    category: 'animal',
    imageData: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#8B4513"/>
        <g stroke="#D2691E" stroke-width="5" fill="none">
          <ellipse cx="150" cy="200" rx="40" ry="25"/>
          <ellipse cx="250" cy="220" rx="35" ry="20"/>
          <path d="M130 180 Q120 160 125 150"/>
          <path d="M230 200 Q220 180 225 170"/>
          <path d="M130 225 L125 260 M150 225 L150 260 M170 225 L175 260"/>
          <path d="M230 240 L225 270 M250 240 L250 270 M270 240 L275 270"/>
        </g>
      </svg>
    `)}`
  },
  {
    id: 'cave-5',
    title: 'Sun Symbol',
    description: 'Ancient solar symbol with rays',
    artist: 'Prehistoric',
    likes: 91,
    views: 298,
    category: 'symbol',
    imageData: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#8B4513"/>
        <g stroke="#D2691E" stroke-width="6" fill="none">
          <circle cx="200" cy="200" r="50"/>
          <path d="M200 100 L200 120 M300 200 L280 200 M200 300 L200 280 M100 200 L120 200"/>
          <path d="M265 135 L253 147 M265 265 L253 253 M135 135 L147 147 M135 265 L147 253"/>
        </g>
      </svg>
    `)}`
  },
  {
    id: 'cave-6',
    title: 'Tribal Dance',
    description: 'Figures performing ritual dance',
    artist: 'Prehistoric',
    likes: 167,
    views: 445,
    category: 'figure', 
    imageData: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#8B4513"/>
        <g stroke="#D2691E" stroke-width="6" fill="none">
          <path d="M80 250 L100 200 L120 250 M100 200 L80 180 M100 200 L120 180"/>
          <path d="M200 240 L220 190 L240 240 M220 190 L200 170 M220 190 L240 170"/>
          <path d="M320 250 L300 200 L280 250 M300 200 L320 180 M300 200 L280 180"/>
          <circle cx="100" cy="180" r="12"/>
          <circle cx="220" cy="170" r="12"/>
          <circle cx="300" cy="180" r="12"/>
        </g>
      </svg>
    `)}`
  }
];

export function CaveArtGallery({ onSelectArt }: CaveArtGalleryProps) {
  const [filter, setFilter] = useState<string>('all');
  const [selectedPiece, setSelectedPiece] = useState<CaveArtPiece | null>(null);

  const categories = ['all', 'figure', 'animal', 'abstract', 'symbol'];
  
  const filteredPieces = filter === 'all' 
    ? caveArtPieces 
    : caveArtPieces.filter(piece => piece.category === filter);

  const handleSelectPiece = (piece: CaveArtPiece) => {
    onSelectArt(piece.imageData);
    setSelectedPiece(null);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center space-x-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
          data-testid="button-cave-art"
        >
          <Paintbrush className="w-4 h-4" />
          <span>Cave Art</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Paintbrush className="w-6 h-6 text-amber-600" />
            <span>Cave Art Gallery</span>
          </DialogTitle>
          <p className="text-muted-foreground">Choose from ancient art styles to start your creation</p>
        </DialogHeader>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 py-4 border-b">
          {categories.map((category) => (
            <Button
              key={category}
              variant={filter === category ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(category)}
              className="capitalize"
              data-testid={`filter-${category}`}
            >
              {category}
            </Button>
          ))}
        </div>
        
        {/* Art Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[60vh] p-1">
          {filteredPieces.map((piece) => (
            <Card 
              key={piece.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800"
              onClick={() => setSelectedPiece(piece)}
              data-testid={`art-piece-${piece.id}`}
            >
              <div className="p-4">
                <div className="aspect-square bg-amber-100 dark:bg-amber-900/20 rounded-lg mb-3 overflow-hidden">
                  <img 
                    src={piece.imageData} 
                    alt={piece.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-amber-900 dark:text-amber-100">{piece.title}</h3>
                    <Badge variant="secondary" className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                      {piece.category}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-amber-700 dark:text-amber-300 line-clamp-2">{piece.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{piece.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{piece.views}</span>
                      </div>
                    </div>
                    <span className="text-amber-700 dark:text-amber-300 font-medium">{piece.artist}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Detail Modal */}
        {selectedPiece && (
          <Dialog open={!!selectedPiece} onOpenChange={() => setSelectedPiece(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedPiece.title}</DialogTitle>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={selectedPiece.imageData} 
                    alt={selectedPiece.title}
                    className="w-full aspect-square object-cover rounded-lg bg-amber-100 dark:bg-amber-900/20"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground text-sm">{selectedPiece.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Artist:</span>
                      <p className="text-muted-foreground">{selectedPiece.artist}</p>
                    </div>
                    <div>
                      <span className="font-medium">Category:</span>
                      <p className="text-muted-foreground capitalize">{selectedPiece.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{selectedPiece.likes} likes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{selectedPiece.views} views</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleSelectPiece(selectedPiece)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    data-testid="button-use-template"
                  >
                    Use This Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}