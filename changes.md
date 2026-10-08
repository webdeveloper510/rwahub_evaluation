# CHANGES

I completed the RWAHub local evaluation.

I set up the app, compiled the contracts, and deployed them on the local chain (chain id 31337). The deployed addresses are in `src/config/contracts.json`. I connected MetaMask to Hardhat Local and signed in.

I created an asset from Asset Creation: **Steel Chronograph 2024**, category Watches, price $2,500, with an uploaded photo. That same asset and photo show on the home page, Dashboard, Marketplace, and Explorer.

## Bug found and fixed

One bug came up while doing that. An uploaded image was replaced by a stock photo on every page. I fixed it in these files:

- `src/pages/tokenize/TokenizePage.tsx`: the uploaded photo is saved with the asset instead of a temporary browser link.
- `src/utils/apiAssets.ts`: the save step no longer replaces that photo with the stock image.
- `src/server/middleware/validation.js`: loading the asset list no longer drops the asset when the photo is not one of the built-in files.

## Security review

I also wrote `SECURITY.md` with two issues already in the code:

- `selfVerify` lets any wallet mark itself as KYC-verified, and the compliance contract allows every transfer.
- Loading the asset list can write a file using hidden data inside an image. A page load should not create or change files.

## Setup steps performed

1. `npm install`, then created `.env` from `example.env` (`.env` is git-ignored and not committed).
2. `npm run compile`.
3. `npm run chain` (Hardhat node at `http://127.0.0.1:8545`, chain id `31337`).
4. `npm run deploy:local`. This updated `src/config/contracts.json` with the `kyc`, `marketplace`, `token` and `compliance` addresses.
5. Restarted `npm run dev` so Vite picked up the new addresses.
6. Added the Hardhat Local network in MetaMask (chain id `31337`, currency `ETH`) and imported Hardhat Account #0. This key is public and is for the local chain only.
7. Signed in at http://localhost:5173/ and created the asset at `/asset-creation`, confirming the MetaMask transactions.

## Files added or changed

| File | Change |
|------|--------|
| `src/config/contracts.json` | Updated by `npm run deploy:local` with local contract addresses |
| `src/pages/tokenize/TokenizePage.tsx` | Bug fix: save the uploaded photo with the asset |
| `src/utils/apiAssets.ts` | Bug fix: stop replacing the uploaded photo with a stock image |
| `src/server/middleware/validation.js` | Bug fix: do not drop assets with a non-built-in photo when loading the list |
| `SECURITY.md` | Added: security review (two issues) |
| `CHANGES.md` | Added: this file |

## How to run

```bash
npm install
cp example.env .env        # Windows: Copy-Item example.env .env
npm run compile
npm run chain              # keep this running
npm run deploy:local       # in a second terminal
npm run dev                # restart after deploy
```

Then add Hardhat Local in MetaMask, import Account #0, sign in at http://localhost:5173/ and create an asset at `/asset-creation`.