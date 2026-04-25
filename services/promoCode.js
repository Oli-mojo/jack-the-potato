// Jack the Potato — Promo Code & Boost Service (stub)
// Full implementation (with Postgres persistence) to be added in a future pass.

async function createTradeInCode(wallet) { return null; }
async function getTradeInCodeForWallet(wallet) { return null; }
async function validateCode(code) { return { valid: false }; }
async function storePendingBoost(wallet, level) { return null; }
async function consumePendingBoost(wallet) { return 0; }
async function applyBoost(rarity, level) { return rarity; } // pass-through until Postgres impl
async function getLoyaltyStatus(wallet) { return { level: 0, jacks: 0 }; }
async function claimLoyaltyBoost(wallet) { return null; }
async function registerReferral(referrer, referee) { return null; }
async function applyReferral(wallet) { return null; }

module.exports = {
  createTradeInCode,
  getTradeInCodeForWallet,
  validateCode,
  storePendingBoost,
  consumePendingBoost,
  applyBoost,
  getLoyaltyStatus,
  claimLoyaltyBoost,
  registerReferral,
  applyReferral,
};
