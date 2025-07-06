# IPPY Blind Box Game 🎮

A blockchain-based blind box/gacha game built with Next.js, featuring NFT collection mechanics and interactive gameplay.

## ✨ Features

- **🎰 Gacha Machine**: Pull blind boxes to collect NFTs
- **🎮 Claw Machine**: Interactive claw game experience
- **📦 Inventory System**: Manage your NFT collection
- **🛒 Marketplace**: Trade and purchase items
- **📱 Responsive Design**: Works on desktop and mobile

## 🚀 Setup Instructions

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Pinata Configuration (for IPFS)
PINATA_JWT=your_pinata_jwt_here
NEXT_PUBLIC_GATEWAY_URL=your-gateway.mypinata.cloud

# Blockchain Configuration
NEXT_PUBLIC_RPC_URL=your_rpc_url_here
NEXT_PUBLIC_CHAIN_ID=1315

# Privy Configuration (for wallet auth)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
```

### Getting Pinata Credentials

1. Visit [Pinata Cloud](https://pinata.cloud/) and create an account
2. Go to the [Keys Page](https://app.pinata.cloud/keys) and click "New Key"
3. For development, select "Admin" privileges
4. Copy your **JWT** (not the API Key/Secret)
5. Go to [Gateways Page](https://app.pinata.cloud/gateways) to get your gateway URL

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint
```

## 🔧 CORS Fix for Pinata

This project implements server-side API routes to handle Pinata requests and avoid CORS issues:

- `/api/pinata/metadata` - Fetches NFT metadata via server-side
- `/api/pinata/gateway` - Creates signed URLs for IPFS content

**Important**: Use `PINATA_JWT` (server-side) not `NEXT_PUBLIC_PINATA_JWT` to keep credentials secure.

## 🏗️ Architecture

### Frontend Components

- `app/gacha/` - Gacha machine interface
- `app/claw/` - Claw machine game
- `app/inventory/` - NFT collection management
- `app/market/` - Trading marketplace

### Smart Contracts

- `contract/contracts/BlindBox.sol` - Main blind box contract
- `contract/contracts/IPPYNFT.sol` - NFT minting contract

### Key Features

- **Blockchain Integration**: Story Protocol network
- **NFT Standards**: ERC1155 for blind boxes, custom for IPPYs
- **Metadata Storage**: IPFS via Pinata
- **Wallet Connection**: Privy authentication
- **State Management**: React hooks and context

## 🛠️ Development

### Code Quality

- ESLint configuration with Next.js rules
- TypeScript for type safety
- Tailwind CSS for styling
- Responsive design patterns

### Project Structure

```
├── app/                 # Next.js app directory
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── contract/           # Smart contract code
├── public/             # Static assets
└── utils/              # Helper functions
```

## 📱 Deployment

The app is optimized for deployment on Vercel with proper environment variable configuration and build optimizations.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

Built with ❤️ using Next.js, TypeScript, and blockchain technology.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

📦 Single Module Deployment

- BlindBoxSystem#IPPYNFT - 0x702097673370e14F5b8a77dB55d2799D136767Bd
- BlindBoxSystem#BlindBox - 0x87d3FEE94B8306702Dfdba539c0BACAC0985594B
- NFTMarketplace#NFTMarketplace - 0x8D2729D9807E9FdD7d648BD3045c39B80aB2E5c7
