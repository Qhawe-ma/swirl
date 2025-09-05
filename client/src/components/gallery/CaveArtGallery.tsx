import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, Download, ExternalLink } from "lucide-react";

interface ArtPiece {
  id: string;
  title: string;
  description: string;
  imageData: string;
  artist: string;
  likes: number;
  views: number;
  category: string;
}

// Example cave art pieces (using generated patterns that resemble cave art)
const caveArtPieces: ArtPiece[] = [
  {
    id: "1",
    title: "Ancient Bison",
    description: "A prehistoric cave painting depicting a powerful bison, recreated in digital form",
    imageData: "data:image/svg+xml;base64," + btoa(`
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#8B4513"/>
        <path d="M50 120 Q80 100 120 120 Q150 130 180 120 Q200 110 220 120 L240 140 Q220 150 180 140 Q150 150 120 140 Q80 150 50 140 Z" fill="#4A4A4A"/>
        <circle cx="180" cy="115" r="3" fill="#2F2F2F"/>
        <path d="M220 120 L240 115 L235 125 Z" fill="#2F2F2F"/>
        <path d="M50 140 L45 150 L55 150 L60 155 L70 150 L80 155 L90 150 L100 155 L110 150 L120 155" stroke="#2F2F2F" stroke-width="2" fill="none"/>
      </svg>
    `),
    artist: "Cave Painter",
    likes: 234,
    views: 1200,
    category: "Animals"
  },
  {
    id: "2", 
    title: "Hand Prints",
    description: "Ancient hand stencils found in caves around the world",
    imageData: "data:image/svg+xml;base64," + btoa(`
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#A0522D"/>
        <g transform="translate(80,50)">
          <path d="M0 40 L5 20 L10 25 L15 20 L20 25 L25 20 L30 40 L25 60 L20 55 L15 65 L10 55 L5 60 Z" fill="#8B0000" opacity="0.7"/>
        </g>
        <g transform="translate(150,80)">
          <path d="M0 40 L5 20 L10 25 L15 20 L20 25 L25 20 L30 40 L25 60 L20 55 L15 65 L10 55 L5 60 Z" fill="#8B0000" opacity="0.6"/>
        </g>
        <g transform="translate(200,40)">
          <path d="M0 40 L5 20 L10 25 L15 20 L20 25 L25 20 L30 40 L25 60 L20 55 L15 65 L10 55 L5 60 Z" fill="#8B0000" opacity="0.8"/>
        </g>
      </svg>
    `),
    artist: "Ancient Hands",
    likes: 189,
    views: 890,
    category: "Symbols"
  },
  {
    id: "3",
    title: "Horse Gallop",
    description: "Dynamic depiction of horses in motion, showcasing prehistoric artistic skill",
    imageData: "data:image/svg+xml;base64," + btoa(`
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#D2B48C"/>
        <path d="M50 100 Q70 80 100 90 Q120 85 140 95 L160 100 Q180 95 200 100 Q220 105 240 100" stroke="#654321" stroke-width="3" fill="none"/>
        <path d="M70 90 Q90 70 120 80 Q140 75 160 85 L180 90 Q200 85 220 90" stroke="#654321" stroke-width="2" fill="none"/>
        <circle cx="80" cy="85" r="2" fill="#654321"/>
        <circle cx="130" cy="75" r="2" fill="#654321"/>
        <circle cx="180" cy="85" r="2" fill="#654321"/>
        <path d="M50 120 L60 125 M90 115 L100 120 M140 120 L150 125 M190 115 L200 120" stroke="#654321" stroke-width="2"/>
      </svg>
    `),
    artist: "Stone Age Artist",
    likes: 156,
    views: 675,
    category: "Animals"
  },
  {
    id: "4",
    title: "Sacred Symbols",
    description: "Mysterious geometric patterns and symbols with spiritual significance",
    imageData: "data:image/svg+xml;base64," + btoa(`
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#8B7D6B"/>
        <circle cx="100" cy="80" r="20" stroke="#4A4A4A" stroke-width="3" fill="none"/>
        <path d="M100 60 L100 100 M80 80 L120 80" stroke="#4A4A4A" stroke-width="2"/>
        <polygon points="200,60 220,100 180,100" stroke="#4A4A4A" stroke-width="3" fill="none"/>
        <path d="M50 150 Q75 130 100 150 Q125 170 150 150 Q175 130 200 150" stroke="#4A4A4A" stroke-width="2" fill="none"/>
        <circle cx="150" cy="120" r="3" fill="#4A4A4A"/>
        <circle cx="250" cy="100" r="3" fill="#4A4A4A"/>
        <circle cx="50" cy="120" r="3" fill="#4A4A4A"/>
      </svg>
    `),
    artist: "Mystic Painter",
    likes: 278,
    views: 1450,
    category: "Symbols"
  },
  {
    id: "5",
    title: "Mammoth Hunt",
    description: "Epic scene depicting the hunt of a mammoth by prehistoric humans",
    imageData: "data:image/svg+xml;base64," + btoa(`
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#8B4513"/>
        <ellipse cx="150" cy="120" rx="60" ry="30" fill="#654321"/>
        <path d="M90 120 Q80 100 85 90" stroke="#654321" stroke-width="4"/>
        <path d="M210 120 Q220 100 215 90" stroke="#654321" stroke-width="4"/>
        <circle cx="130" cy="110" r="2" fill="#2F2F2F"/>
        <path d="M120 130 Q130 140 140 130" stroke="#654321" stroke-width="2" fill="none"/>
        <path d="M40 140 L50 120 L45 115" stroke="#8B0000" stroke-width="2" fill="none"/>
        <circle cx="45" cy="140" r="2" fill="#8B0000"/>
        <path d="M250 145 L260 125 L255 120" stroke="#8B0000" stroke-width="2" fill="none"/>
        <circle cx="255" cy="145" r="2" fill="#8B0000"/>
      </svg>
    `),
    artist: "Hunter-Artist",
    likes: 312,
    views: 1680,
    category: "Scenes"
  },
  {
    id: "6",
    title: "Star Patterns",
    description: "Ancient astronomical observations recorded on cave walls",
    imageData: "data:image/svg+xml;base64," + btoa(`
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#2F2F2F"/>
        <circle cx="80" cy="60" r="2" fill="#FFD700"/>
        <circle cx="120" cy="40" r="3" fill="#FFD700"/>
        <circle cx="180" cy="70" r="2" fill="#FFD700"/>
        <circle cx="220" cy="50" r="2" fill="#FFD700"/>
        <circle cx="100" cy="120" r="3" fill="#FFD700"/>
        <circle cx="160" cy="140" r="2" fill="#FFD700"/>
        <circle cx="200" cy="120" r="2" fill="#FFD700"/>
        <circle cx="250" cy="80" r="2" fill="#FFD700"/>
        <path d="M80 60 L120 40 L180 70 L220 50" stroke="#FFD700" stroke-width="1" opacity="0.5"/>
        <path d="M100 120 L160 140 L200 120" stroke="#FFD700" stroke-width="1" opacity="0.5"/>
        <circle cx="150" cy="100" r="4" fill="#FFD700"/>
      </svg>
    `),
    artist: "Star Watcher",
    likes: 201,
    views: 945,
    category: "Astronomy"
  }
];

export function CaveArtGallery() {
  const [selectedArt, setSelectedArt] = useState<ArtPiece | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const categories = ['All', 'Animals', 'Symbols', 'Scenes', 'Astronomy'];
  
  const filteredArt = filter === 'All' 
    ? caveArtPieces 
    : caveArtPieces.filter(art => art.category === filter);

  return (
    <div className="p-6 bg-gradient-to-br from-amber-50 to-stone-100 dark:from-stone-900 dark:to-stone-800 min-h-screen">
      {/* Professional Header */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-4">
            Cave Art Gallery
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
            Explore ancient artistic expressions recreated digitally. Click any piece to view in detail and learn about prehistoric creativity.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={filter === category ? "default" : "outline"}
              onClick={() => setFilter(category)}
              className="text-sm"
              data-testid={`filter-${category.toLowerCase()}`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Art Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredArt.map((art) => (
            <Card 
              key={art.id}
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 overflow-hidden"
              onClick={() => setSelectedArt(art)}
              data-testid={`art-piece-${art.id}`}
            >
              <div className="relative">
                <img 
                  src={art.imageData} 
                  alt={art.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <Badge className="absolute top-3 right-3 bg-amber-600 text-white">
                  {art.category}
                </Badge>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {art.title}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 mb-3 line-clamp-2">
                  {art.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-medium">{art.artist}</span>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{art.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{art.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Art Detail Modal */}
        <Dialog open={!!selectedArt} onOpenChange={() => setSelectedArt(null)}>
          <DialogContent className="max-w-4xl w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-0 overflow-hidden" data-testid="modal-art-detail">
            {selectedArt && (
              <>
                <DialogHeader className="border-b border-stone-200 dark:border-stone-700 p-6 bg-stone-50 dark:bg-stone-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
                        {selectedArt.title}
                      </DialogTitle>
                      <p className="text-stone-600 dark:text-stone-300">
                        By {selectedArt.artist} • {selectedArt.category}
                      </p>
                    </div>
                    <Badge className="bg-amber-600 text-white">
                      Cave Art
                    </Badge>
                  </div>
                </DialogHeader>
                
                <div className="grid md:grid-cols-2 gap-6 p-6">
                  {/* Large Image Display */}
                  <div className="space-y-4">
                    <img 
                      src={selectedArt.imageData}
                      alt={selectedArt.title}
                      className="w-full rounded-lg shadow-lg border border-stone-200 dark:border-stone-700"
                    />
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-3">Description</h3>
                      <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                        {selectedArt.description}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-lg text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <Heart className="w-5 h-5 text-red-500" />
                          <span className="text-lg font-bold text-stone-800 dark:text-stone-100">{selectedArt.likes}</span>
                        </div>
                        <p className="text-sm text-stone-600 dark:text-stone-300">Likes</p>
                      </div>
                      <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-lg text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <Eye className="w-5 h-5 text-blue-500" />
                          <span className="text-lg font-bold text-stone-800 dark:text-stone-100">{selectedArt.views}</span>
                        </div>
                        <p className="text-sm text-stone-600 dark:text-stone-300">Views</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" data-testid="button-use-as-inspiration">
                        <Download className="w-4 h-4 mr-2" />
                        Use as Inspiration
                      </Button>
                      <Button variant="outline" className="w-full" data-testid="button-view-larger">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Larger
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}