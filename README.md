# DeFi Analytics Dashboard

A professional-grade DeFi analytics platform that allows users to analyze any wallet's portfolio, LP positions, yields, and gas metrics across Ethereum and Solana - without requiring wallet connection.

## Features

- **Portfolio Tracking**: Real-time token balances and portfolio value across multiple chains
- **LP Position Analytics**: Track liquidity pool positions, fees earned, APY, and impermanent loss
- **Gas Fee Tracker**: Monitor real-time gas prices on Ethereum and Solana
- **Yield Opportunities**: Discover high-yield farming opportunities across DeFi protocols
- **Impermanent Loss Calculator**: Calculate potential IL for LP positions
- **AI-Powered Insights**: Get personalized portfolio analysis and recommendations

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Data Fetching**: SWR for caching and real-time updates
- **AI**: Vercel AI SDK with OpenAI GPT-4o-mini
- **APIs**: Alchemy (Ethereum), Helius (Solana), The Graph, DeFi Llama, Etherscan, CoinGecko

## Getting Started

### Prerequisites

- Node.js 18+ installed
- API keys for the following services:
  - **Alchemy API Key** (required for Ethereum data)
  - **Helius API Key** (required for Solana data)
  - **Etherscan API Key** (optional, for gas tracking)

### Environment Variables Setup

This project requires the following environment variables. You can set them in the **Vars** section of the v0 in-chat sidebar:

\`\`\`env
ALCHEMY_API_KEY=your_alchemy_api_key
HELIUS_API_KEY=your_helius_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
\`\`\`

**Getting API Keys:**

1. **Alchemy** (Ethereum data):
   - Sign up at [alchemy.com](https://www.alchemy.com/)
   - Create a new app
   - Copy your API key (format: `okmLMo92Dd3BSljdeC78P...`)

2. **Helius** (Solana data):
   - Sign up at [helius.dev](https://www.helius.dev/)
   - Create a new project
   - Copy your API key (just the key, not the full RPC URL)

3. **Etherscan** (Gas tracking):
   - Sign up at [etherscan.io](https://etherscan.io/)
   - Generate an API key
   - Copy your API key

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set your environment variables in the v0 Vars section (see above)

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Enter Wallet Address**: Paste any Ethereum or Solana wallet address on the home page
2. **View Portfolio**: See real-time token balances, total value, and 24h changes
3. **Analyze LP Positions**: Navigate to LP Positions to see liquidity pool analytics
4. **Check Gas Fees**: Monitor current gas prices and get transaction cost estimates
5. **Discover Yields**: Browse yield farming opportunities with APY and risk ratings
6. **Get AI Insights**: Generate personalized portfolio analysis and recommendations

## API Endpoints

- `GET /api/portfolio/[address]?chain=ethereum` - Fetch wallet portfolio data
- `GET /api/lp-positions/[address]` - Fetch LP positions
- `GET /api/gas/[chain]` - Get current gas prices
- `GET /api/yields` - Fetch yield opportunities
- `POST /api/ai-insights` - Generate AI portfolio analysis
- `POST /api/ai-summary` - Generate AI portfolio summary

## Features in Detail

### Portfolio Overview
- Multi-chain support (Ethereum, Solana)
- Real-time token prices from CoinGecko
- 24-hour price change tracking
- Portfolio value history charts
- Powered by Alchemy API for Ethereum and Helius API for Solana

### LP Positions
- Track positions on Uniswap, SushiSwap, Curve, Raydium, Orca
- Calculate fees earned and APY
- Monitor impermanent loss
- Price range indicators

### Gas Tracker
- Real-time gas prices (slow, standard, fast)
- 24-hour gas price trends
- Transaction cost estimator
- Gas-saving tips

### Yield Scanner
- Discover opportunities across 50+ protocols
- Filter by chain, risk level, and type
- Sort by APY, TVL, or risk score
- Featured and trending opportunities

## No Wallet Connection Required

This dashboard uses public blockchain data and APIs only. Users never need to connect their wallet or sign transactions - simply paste any address to analyze.

## Troubleshooting

### API Errors

If you see errors like "API key not configured":
1. Go to the **Vars** section in the v0 in-chat sidebar
2. Add the required environment variables (see Environment Variables Setup above)
3. Make sure you're using just the API key, not full URLs

### Helius API Key Format

If you see "invalid api key provided" for Solana:
- Make sure you're using just the API key (e.g., `3a47cf54-de3b-4b43-a056-d6d8ebe11063`)
- NOT the full RPC URL (e.g., `https://mainnet.helius-rpc.com/?api-key=...`)

### AI Insights Not Working

The AI insights use the Vercel AI Gateway which is automatically configured. If you see errors:
- Check that you're using the latest version of the AI SDK
- The model "openai/gpt-4o-mini" should work by default

## License

MIT
