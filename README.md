# 💰 BillSplitr - Decentralized Expense Splitting Platform

**Split bills fairly. Settle with any cryptocurrency. Verified on-chain.**

BillSplitr is a Web3-powered expense splitting application that combines AI receipt verification, IPFS storage, multi-blockchain payment support, and on-chain settlement to create a trustless, transparent group expense management system.

---

## 🌟 What is BillSplitr?

BillSplitr revolutionizes how groups split expenses by combining traditional expense tracking with blockchain technology:

- **🤖 AI Receipt Verification**: Upload receipts that are analyzed by Google Gemini AI to detect fake or manipulated receipts
- **🔒 Tamper-Proof Storage**: All receipts permanently stored on IPFS via Pinata - immutable proof of every expense
- **💳 Multi-Crypto Payments**: Pay with BTC, ETH, or 199+ cryptocurrencies via SideShift.ai integration
- **⚡ Fast Settlement**: Low-fee on-chain settlements on Polygon blockchain
- **👥 Group Management**: Create groups, invite members, track who owes whom
- **📊 Smart Analytics**: Real-time balance calculations and expense tracking
- **🔐 Secure Authentication**: Email/password + optional wallet connection

---


live url - https://billsplitrer.vercel.app/

live demo video - https://youtu.be/EJFPJsUisd8

## 🎯 Use Cases

- **👫 Friends**: Split restaurant bills, vacation expenses, or shared subscriptions
- **🏠 Roommates**: Track rent, utilities, groceries, and household expenses
- **✈️ Travel Groups**: Manage shared trip costs with multi-currency support
- **🎉 Events**: Split costs for parties, weddings, or group activities
- **💼 Small Teams**: Track project expenses with verifiable receipts

---

## 🚀 How It Works

### 1. **Create a Group**
- Set up your expense group with a name and description
- Get a unique invite code and QR code
- Add members by sharing the code

### 2. **Add Expenses**
- Upload receipt images (JPG, PNG)
- AI analyzes the receipt to detect authenticity
- Receipt stored permanently on IPFS
- Expense details saved on-chain (optional)

### 3. **Track Balances**
- Automatic calculation of who owes whom
- Optimized settlement suggestions
- Real-time balance updates

### 4. **Settle Up**
- Choose your preferred cryptocurrency (BTC, ETH, USDC, etc.)
- SideShift converts your payment to USDC on Polygon
- Settlement recorded on-chain for transparency
- Credit score increases with on-time payments

---

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives

### **Backend & APIs**
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB Atlas** - Document database for users, groups, expenses
- **JWT Authentication** - Secure session management

### **Blockchain & Crypto**
- **Polygon Amoy Testnet** - Fast, low-cost blockchain settlements
- **Ethers.js** - Ethereum library for Web3 interactions
- **Smart Contract** - On-chain expense settlement logic
  - **Contract Address**: `0x05d4D20Ab099dd2c4Ee59D305c17273c8D0d06F1`
  - **Explorer**: [View on PolygonScan](https://amoy.polygonscan.com/address/0x05d4D20Ab099dd2c4Ee59D305c17273c8D0d06F1)

### **AI & Storage**
- **Google Gemini AI** - Receipt analysis and fraud detection
- **Pinata (IPFS)** - Permanent, decentralized receipt storage
- **SideShift.ai** - Cross-chain crypto conversion (199+ coins)
  - Converts any crypto → USDC on Polygon
  - No KYC required
  - Affiliate ID: `yZE6xxSOH`

---

## 🔑 API Integrations

### **1. SideShift.ai - Multi-Crypto Payments**

BillSplitr uses SideShift to enable payments with any cryptocurrency:

```javascript
// User pays with BTC, ETH, or any supported coin
// SideShift converts it to USDC on Polygon
// Settlement happens on Polygon blockchain

const shift = await fetch('/api/sideshift/shift', {
  method: 'POST',
  body: JSON.stringify({
    depositCoin: 'btc',     // User's chosen crypto
    settleCoin: 'usdc',      // Always settles in USDC
    depositAmount: '0.001',  // Amount to deposit
    settleAddress: '0x...'   // Recipient's Polygon address
  })
});
```

**Why SideShift?**
- 199+ cryptocurrencies supported
- No KYC required
- Direct cross-chain swaps
- Affiliate partnership for fee sharing

### **2. Google Gemini AI - Receipt Verification**

Receipts are analyzed to detect:
- Fake or digitally manipulated images
- Inconsistent formatting
- Missing required information
- Suspicious patterns

```javascript
const analysis = await fetch('/api/receipts/analyze', {
  method: 'POST',
  body: JSON.stringify({
    imageBase64: receiptImage
  })
});

// Returns:
// - isLegit: boolean
// - confidence: number
// - flags: string[]
// - analysis: string
```

### **3. Pinata - IPFS Storage**

Every receipt is permanently stored on IPFS:

```javascript
const upload = await fetch('/api/receipts/upload', {
  method: 'POST',
  body: formData
});

// Returns IPFS hash
// Access via: https://gateway.pinata.cloud/ipfs/{hash}
```

**Benefits:**
- Immutable proof of expenses
- Decentralized storage
- No single point of failure
- Permanent availability

### **4. Polygon Blockchain - On-Chain Settlement**

Smart contract handles expense settlements:

```solidity
// Smart contract features:
- recordSettlement(groupId, from, to, amount)
- getGroupBalance(groupId, member)
- verifySettlement(settlementId)
```

**Why Polygon?**
- Low transaction fees (~$0.01)
- Fast confirmation (<2 seconds)
- Ethereum-compatible
- Secure and decentralized

---

## 📋 Smart Contract Details

**Network**: Polygon Amoy Testnet  
**Contract Address**: `0x05d4D20Ab099dd2c4Ee59D305c17273c8D0d06F1`  
**Explorer**: https://amoy.polygonscan.com/address/0x05d4D20Ab099dd2c4Ee59D305c17273c8D0d06F1

### **Key Functions:**
- `createGroup(string name)` - Register a new expense group
- `addExpense(uint256 groupId, uint256 amount, string description)` - Record an expense
- `settleBalance(uint256 groupId, address to, uint256 amount)` - Settle a debt
- `getGroupBalance(uint256 groupId, address member)` - Check member balance

---

## 🔒 Environment Variables

Create a `.env` file in the root directory:

```env
# Blockchain
PRIVATE_KEY=your_wallet_private_key
POLYGON_AMOY_RPC=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
CONTRACT_ADDRESS=0x05d4D20Ab099dd2c4Ee59D305c17273c8D0d06F1
NEXT_PUBLIC_CONTRACT_ADDRESS=0x05d4D20Ab099dd2c4Ee59D305c17273c8D0d06F1

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# AI & Storage
GEMINI_API_KEY=your_gemini_api_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Crypto Exchange
SIDESHIFT_SECRET=your_sideshift_secret
SIDESHIFT_AFFILIATE_ID=your_affiliate_id

# Wallet Connect (optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ or Bun
- MongoDB database
- Polygon Amoy testnet tokens (get from faucet)

### **Installation**

```bash
# Clone the repository
git clone https://github.com/yourusername/billsplitr.git
cd billsplitr

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev
# or
bun dev
```

Visit `http://localhost:3000` to see the app.

### **Deploy Smart Contract**

```bash
# Deploy to Polygon Amoy
bun scripts/deploy.js

# Copy the contract address to .env
```

---

## 📱 Key Features Walkthrough

### **Dashboard**
- View all your groups
- See pending settlements
- Track your credit score
- Quick actions for common tasks

### **Groups Page**
- Create new groups with invite codes
- Join existing groups
- View group details and members
- Share groups via QR code

### **Expenses Page**
- Add new expenses with receipts
- Upload photos for AI verification
- Assign expenses to group members
- View expense history

### **Settle Page**
- See who owes you and whom you owe
- Choose from 199+ cryptocurrencies
- Get real-time exchange rates
- Complete settlement on-chain

### **Activity Feed**
- Real-time updates on group activities
- See new expenses, settlements, and members
- Filter by group or activity type

### **Analytics Dashboard**
- Spending trends by category
- Group expense breakdowns
- Monthly spending charts
- Credit score history

---

## 🔐 Security Features

- **JWT Authentication**: Secure session management
- **IPFS Storage**: Immutable receipt storage
- **AI Fraud Detection**: Gemini analyzes receipt authenticity
- **On-Chain Verification**: Settlements recorded on blockchain
- **Encrypted Credentials**: Environment variables for sensitive data
- **No Private Key Storage**: Users control their own wallets

---

## 📊 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/wallet` - Link wallet address

### **Groups**
- `POST /api/groups` - Create group
- `GET /api/groups` - Get user's groups
- `GET /api/groups/[id]` - Get group details
- `POST /api/groups/join` - Join group with code
- `GET /api/groups/[id]/balances` - Get group balances

### **Expenses**
- `POST /api/expenses` - Add expense
- `GET /api/expenses` - Get user's expenses
- `GET /api/expenses/[id]` - Get expense details

### **Receipts**
- `POST /api/receipts/upload` - Upload to IPFS
- `POST /api/receipts/analyze` - AI verification

### **Settlements**
- `POST /api/settlements` - Record settlement
- `GET /api/settlements` - Get settlement history

### **SideShift**
- `GET /api/sideshift/coins` - Get supported coins
- `POST /api/sideshift/shift` - Create crypto shift

---

## 🎨 Design & UX

- **Color Scheme**: Sky blue (#0ea5e9) and white
- **Typography**: Geist Sans for clean, modern look
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile-first design, works on all devices
- **Accessibility**: Radix UI components for WCAG compliance

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🌐 Links

- **Live Demo**: https://billsplitr.vercel.app
- **Smart Contract**: https://amoy.polygonscan.com/address/0x05d4D20Ab099dd2c4Ee59D305c17273c8D0d06F1
- **Documentation**: See DEPLOYMENT.md for detailed setup
- **Support**: [Open an issue](https://github.com/yourusername/billsplitr/issues)

---

## 🙏 Acknowledgments

- **Polygon** - Fast, low-cost blockchain infrastructure
- **SideShift.ai** - Multi-chain crypto conversion
- **Pinata** - Reliable IPFS pinning service
- **Google Gemini** - Advanced AI receipt analysis
- **Vercel** - Seamless deployment platform

---

## 📞 Contact

For questions or support, please open an issue on GitHub.

**Built with ❤️ for the Web3 community**
