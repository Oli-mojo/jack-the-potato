// Jack the Potato — Social Announcements (stub)
// Twitter/Discord integration to be wired in a future pass.

async function announcePotatoPassed({ hand, fromAddress, holdDurationHours, pricePaid, rarity, newAskingPrice, imageUrl } = {}) {
  console.log(`📣 [social stub] Jack #${hand} — ${fromAddress?.slice(0,6)} held ${holdDurationHours?.toFixed(1)}h, paid ${pricePaid} ETH, got a ${rarity} souvenir`);
  // TODO: wire up Twitter / Discord webhooks
}

module.exports = { announcePotatoPassed };
