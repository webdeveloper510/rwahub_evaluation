# Security review

Two issues in the current contracts and asset API. These notes describe the risk and a fix. They are not a production audit.

## 1. Anyone can pass KYC with `selfVerify`

**Where:** `src/contracts/RWAHubKYC.sol` (`selfVerify`), `scripts/deploy.js` (enables it on deploy), `src/utils/onchain.ts` (the app calls it before creating an asset). Related: `src/contracts/RWAHubCompliance.sol` always allows transfers.

**Risk:** High outside a local demo.

**Why it matters:** Marketplace create, buy, bid, and token transfer all require `identityRegistry.isVerified`. `selfVerify` lets the caller set their own status to verified, with no documents and no validator. Deploy turns this on, and the asset-creation page calls it automatically. The compliance contract returns true for every transfer, so it does not add a second check. A wallet can create and trade assets without a real identity review.

**Fix:** Leave `selfVerify` disabled except on a local demo chain. Verification should be set only by an account with `VALIDATOR_ROLE` after a real submission. Replace the always-true compliance module with checks that can reject a transfer.

## 2. Fetching assets can write a file from image data

**Where:** `src/server/middleware/validation.js` (`validateSign`, `validateAssets`) and `sign()` in `src/server/models/database.js`. `getAllAssets` runs this on every asset list request.

**Risk:** High.

**Why it matters:** For images under `public/assets/`, the server reads hidden data out of the file, decrypts it with the asset title, and writes the result to a path taken from that data. The path is not limited to a safe folder, so a crafted image can cause the API to create or overwrite a file when someone loads the asset list. A read request should not change the filesystem.

**Fix:** Remove this write from the asset list path. Do not derive a filesystem path from image contents. If signatures are required, verify them in memory and reject the asset when the check fails, without creating files.
