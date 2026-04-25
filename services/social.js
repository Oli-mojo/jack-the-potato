// Jack the Potato — Social Announcements (stub)
// Twitter/Discord integration to be wired in a future pass.

async function announcePotatoPassed(from, to, price, season) {
  console.log(`📣 [social stub] Potato passed from ${from} to ${to} for ${price} ETH (Season ${season})`);
  // TODO: wire up Twitter / Discord webhooks
}

module.exports = { announcePotatoPassed };
