# Swirl

Draw on a canvas and mint the image as a Solana NFT.

![Swirl](https://res.cloudinary.com/dl8f1ztsy/image/upload/v1757186526/Screenshot_2025-09-06_212107_wrnzxk.png)

## What it does

Three routes:

- `/` — landing page, plus a strip of recent mints when Firebase has any
- `/create` — canvas (brush, eraser, rectangle, circle, triangle, fill, undo/redo) and the mint flow
- `/gallery` — search mints by name or wallet, or filter to the connected wallet

Minting pins the PNG and a Metaplex metadata JSON through Pinata, then sends one transaction from the connected wallet:

1. SOL transfer for the platform fee
2. A 0-decimal SPL mint
3. One token into the minter's associated token account
4. Token metadata (name, symbol, URI, 5% royalty, creator = the minter)
5. A master edition so wallets treat it as a collectible

The mint is recorded in Firebase Realtime Database for the gallery. There is no user account. Wallets that speak Wallet Standard (Phantom, Solflare, and others installed in the browser) show up on their own.

The landing page has a disabled "Create With Friends" control. It does not connect to anything.

If Pinata rejects the upload, the client substitutes a placeholder image and keeps going. That is a failure path, not a second storage backend.

## Stack

- React 18, TypeScript, Vite, Tailwind, wouter
- Express, for the Firebase config route and for serving the client
- `@solana/web3.js`, SPL Token, Metaplex Token Metadata
- Pinata (IPFS), Firebase Realtime Database

## Running locally

Node 20 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

The server listens on `PORT`, default `5000`. `.env` is loaded when the file is present.

```bash
npm run check   # tsc --noEmit
npm run build   # client to dist/public, server bundle to dist/index.js
npm start
```

`npm run build` inlines every `VITE_` variable that is set at build time. Set them before building if the production bundle should talk to Pinata or a private RPC.

## Environment

Names only. Empty values are in `.env.example`.

| Name | Where |
| --- | --- |
| `PORT` | Server listen port |
| `VITE_PINATA_JWT` | Browser. Pinata `pinFileToIPFS` |
| `VITE_FIREBASE_API_KEY` | Server, returned by `/api/firebase-config` |
| `VITE_FIREBASE_PROJECT_ID` | Server. Also used to build the database URL and bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Server |
| `VITE_FIREBASE_APP_ID` | Server |
| `VITE_FIREBASE_MEASUREMENT_ID` | Server, optional |
| `VITE_HELIUS_RPC_URL` | Browser. Used first when set |
| `VITE_SOLANA_RPC_URL` | Browser. Falls back to public mainnet |
| `VITE_PROJECTSERUM_RPC_URL` | Browser. Kept on the endpoint list; the connection uses the first entry |
| `VITE_PLATFORM_FEE_SOL` | Browser. Default `0.01` |
| `VITE_PLATFORM_FEE_ADDRESS` | Browser. Default is the fee account in `client/src/lib/solana.ts` |

The Firebase values are web-app config, not an admin credential. They still should not be committed.

## Project structure

```
client/src/pages          /, /create, /gallery
client/src/components     canvas, mint dialog, wallet, ui
client/src/lib            mint transaction, Pinata upload, Firebase
server                    Express, Vite middleware in dev, static files in prod
```

## Design notes

- The platform fee is the first instruction so the wallet preview shows a SOL transfer before the account-rent instructions.
- `maxSupply: 0` means no printed editions. Creating the master edition revokes mint authority, so there is no separate set-authority instruction.
- Balance is checked against mint rent plus rough rents for the token account, metadata account, and edition account, the platform fee, and a small fee buffer. It is an estimate, not a simulation.
- Confirmation retries the same blockhash for about 30 seconds, and also checks `getSignatureStatus`, because `confirmTransaction` can time out on a tx that still landed.
- Gallery reads `gallery_mints`, newest first, capped at 50. If that node is empty it falls back to the older `mints/{wallet}` tree.
- Undo history is capped at 20 states. Each state is a PNG data URL.
- The canvas is the Canvas 2D API.

## License

MIT. See [LICENSE](LICENSE).
