// Jack the Potato — Smart Contract Service
const { ethers } = require('ethers');

const GAME_ADDRESS     = process.env.GAME_ADDRESS     || '0x92Cff1F7E88bF5a676BfB499d2f5f74b1fa82257';
const SOUVENIR_ADDRESS = process.env.SOUVENIR_ADDRESS || '0xe3b8D57012fA84d42f52ADb14c3C63f1E67868DC';
const RPC_URL          = process.env.RPC_URL;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;

const GAME_ABI = [
  'function pot() view returns (uint256)',
  'function holder() view returns (address)',
  'function lastJackPrice() view returns (uint256)',
  'function lastTransferAt() view returns (uint256)',
  'function gameState() view returns (uint8)',
  'function currentStage() view returns (uint8)',
  'function currentTier() view returns (uint8)',
  'function minNextAsk() view returns (uint256)',
  'function jackCount() view returns (uint256)',
  'function seasonNumber() view returns (uint256)',
];

const SOUVENIR_ABI = [
  'function souvenirCount() view returns (uint256)',
  'function setTokenURI(uint256 tokenId, string uri) external',
  'function rarityScore(uint256 tokenId) view returns (uint8)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function souvenirs(uint256 tokenId) view returns (uint256 holdDuration, uint8 tier, uint8 stage, uint256 jackPrice, uint256 prevPrice, address originalOwner)',
];

function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

function getSigner() {
  return new ethers.Wallet(WALLET_PRIVATE_KEY, getProvider());
}

function getGameContract(signerOrProvider) {
  return new ethers.Contract(GAME_ADDRESS, GAME_ABI, signerOrProvider || getProvider());
}

function getSouvenirContract(signerOrProvider) {
  return new ethers.Contract(SOUVENIR_ADDRESS, SOUVENIR_ABI, signerOrProvider || getProvider());
}

// Returns game + souvenir state for use in souvenir generation
async function getPotatoState() {
  const provider = getProvider();
  const game     = getGameContract(provider);
  const souvenir = getSouvenirContract(provider);

  const [jackCountVal, souvenirCountVal, lastPriceWei, lastTransfer, potWei, stageVal] = await Promise.all([
    game.jackCount(),
    souvenir.souvenirCount(),
    game.lastJackPrice(),
    game.lastTransferAt(),
    game.pot(),
    game.currentStage(),
  ]);

  const holdDurationSeconds = Math.floor(Date.now() / 1000) - Number(lastTransfer);
  const holdDurationHours   = holdDurationSeconds / 3600;
  const priceEth            = parseFloat(ethers.formatEther(lastPriceWei));

  return {
    currentPrice:      priceEth.toString(),
    currentPriceWei:   lastPriceWei.toString(),
    totalSouvenirs:    Number(souvenirCountVal),
    totalTransfers:    Number(jackCountVal),
    holdDurationSeconds,
    holdDurationHours: Math.round(holdDurationHours * 10) / 10,
    stage:             Number(stageVal), // 0=DORMANT 1=SPROUTING 2=HARVEST
    pot:               ethers.formatEther(potWei),
  };
}

// Set the token URI on SouvenirNFT (called after image generation)
async function setSouvenirURI(tokenId, uri) {
  const signer   = getSigner();
  const contract = getSouvenirContract(signer);
  const tx = await contract.setTokenURI(tokenId, uri);
  await tx.wait();
  console.log(`✅ Souvenir URI set for token ${tokenId}: ${uri}`);
  return tx.hash;
}

// Rarity tier based on hold duration (hours)
function getRarityTier(holdDurationHours) {
  if (holdDurationHours < 6)   return { tier: 'common',    weights: { common: 85, uncommon: 10, rare:  4, epic:  1, legendary:  0 } };
  if (holdDurationHours < 48)  return { tier: 'uncommon',  weights: { common: 50, uncommon: 30, rare: 14, epic:  5, legendary:  1 } };
  if (holdDurationHours < 120) return { tier: 'rare',      weights: { common: 20, uncommon: 30, rare: 30, epic: 15, legendary:  5 } };
  if (holdDurationHours < 240) return { tier: 'epic',      weights: { common:  5, uncommon: 15, rare: 30, epic: 35, legendary: 15 } };
  return                               { tier: 'legendary', weights: { common:  1, uncommon:  4, rare: 15, epic: 30, legendary: 50 } };
}

// Roll rarity from weights
function rollRarity(weights) {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const [rarity, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (roll < cumulative) return rarity;
  }
  return 'common';
}

module.exports = {
  getPotatoState,
  setSouvenirURI,
  getRarityTier,
  rollRarity,
  getGameContract,
  getSouvenirContract,
  getProvider,
  getSigner,
};
