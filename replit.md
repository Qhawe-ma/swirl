# Overview

This is a Solana NFT Paint application that allows users to create digital artwork using a browser-based drawing canvas and mint it as real NFTs on the Solana mainnet. The application combines professional drawing tools with blockchain integration, enabling artists to create, customize, and permanently store their artwork on the blockchain.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses React with TypeScript as the primary frontend framework, providing a component-based architecture for managing the drawing interface, wallet integration, and NFT minting workflow. The UI is built with shadcn/ui components and Tailwind CSS for consistent styling and responsive design.

**Key Frontend Components:**
- **Canvas System**: Fabric.js powers the drawing canvas with professional tools including brush, eraser, color picker, brush size controls, and undo/redo functionality
- **Wallet Integration**: Solana wallet adapter components handle connection to Phantom and Solflare wallets
- **NFT Minting Form**: Captures artwork metadata (name, description) and handles the complete minting process
- **State Management**: React hooks manage application state including drawing tools, canvas data, and minting workflow

## Backend Architecture
The backend uses Express.js with TypeScript in a minimal configuration, serving the React application and providing API endpoints. The architecture follows a simple REST pattern with Vite for development hot reloading.

**Backend Components:**
- **Express Server**: Handles static file serving and API routing
- **Storage Interface**: Provides abstraction for data persistence with in-memory implementation
- **Development Tools**: Vite integration for hot module replacement and development features

## Data Storage Solutions
The application uses multiple storage approaches depending on data type:

**Database**: PostgreSQL with Drizzle ORM for relational data, currently implementing a basic user schema that can be extended for artwork metadata and user preferences.

**Blockchain Storage**: Solana mainnet stores the actual NFT tokens and ownership records, providing immutable proof of ownership and authenticity.

**Decentralized Storage**: IPFS via NFT.Storage handles artwork images and metadata JSON files, ensuring permanent, decentralized access to the actual content.

## Authentication and Authorization
The system uses Solana wallet-based authentication, where users connect their cryptocurrency wallets (Phantom, Solflare) to access minting functionality. This approach eliminates traditional username/password systems and leverages blockchain identity.

**Wallet Connection Flow:**
- Users connect via WalletMultiButton component
- Application verifies wallet connection and displays balance
- Minting operations require wallet signatures for transaction authorization
- SOL balance validation ensures users can pay blockchain fees

# External Dependencies

## Blockchain Integration
- **@solana/web3.js**: Core Solana blockchain interaction library for mainnet connections and transaction handling
- **@metaplex-foundation/js**: NFT standard implementation ensuring compatibility with Solana marketplaces and wallets
- **@solana/wallet-adapter-react**: Wallet connection and transaction signing infrastructure
- **Solana Mainnet**: Live blockchain network requiring real SOL for transaction fees (~0.002-0.01 SOL per mint)

## Drawing and Canvas
- **fabric.js**: Advanced HTML5 canvas manipulation library providing professional drawing tools, object manipulation, and export capabilities
- **react-color**: Color picker component for artwork customization

## IPFS and Storage
- **nft.storage**: Free IPFS pinning service optimized for NFT metadata and image storage, providing permanent decentralized hosting
- **IPFS Protocol**: Decentralized file system ensuring artwork permanence and accessibility

## UI and Styling
- **@radix-ui/react-***: Accessible, unstyled UI primitives for building the interface
- **Tailwind CSS**: Utility-first CSS framework for responsive design and consistent styling
- **shadcn/ui**: Pre-built component library combining Radix UI with Tailwind for rapid development

## Development and Build Tools
- **Vite**: Modern build tool providing fast development server and optimized production builds
- **TypeScript**: Type safety across the entire application stack
- **Drizzle ORM**: Type-safe database interactions with PostgreSQL
- **@replit/vite-plugin-***: Replit-specific development tools for the hosting environment