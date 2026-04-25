// Jack the Potato — fal.ai Image Generation Service
// Bandit/outlaw aesthetic — same rarity logic, new visual identity.
// Trigger token: JACKPOTATO (requires retrained LoRA on new brand assets)

const FAL_API_KEY = process.env.FAL_API_KEY;
const FAL_LORA_URL = process.env.FAL_LORA_URL;

// ─── Personality rolls ───────────────────────────────────────────────────────
const SMUG_CHANCE   = 0.25; // 1 in 4 — extra smug/victorious expression
const FEMALE_CHANCE = 0.05; // 1 in 20 — bandit queen variant (very rare, any tier)

// ─── Backgrounds ─────────────────────────────────────────────────────────────

const COMMON_BACKGROUNDS = [
  'dusty desert plains under a harsh midday sun',
  'cracked dry earth with tumbleweeds in the distance',
  'scrubby frontier brush, pale blue sky',
  'sandy canyon walls, flat warm light',
  'lonely dirt road stretching into the horizon',
  'sun-bleached wooden fence, arid wasteland behind',
];

const UNCOMMON_BACKGROUNDS = [
  'frontier saloon interior, warm lamplight, sawdust floor',
  'small frontier town at dusk, long shadows',
  'rocky outcrop overlooking a dusty valley',
  'abandoned mine entrance, golden hour glow',
  'moonlit desert, coyote silhouette in background',
];

const RARE_BACKGROUNDS = [
  'dramatic mesa at sunset, deep orange and violet sky',
  'burning wanted poster curling at the edges, warm golden light',
  'dusty trail, smoke rising from a distant ranch, golden dusk',
  'border town cantina exterior at sunset, hanging lanterns',
  'shadowy gorge, lone horseman silhouette in the distance',
];

const EPIC_BACKGROUNDS = [
  'dark stormy night sky, burning ranch in the background, lightning',
  'standoff at high noon, heat shimmer, black smoke rising',
  'blazing inferno behind, riding into the dark desert night',
  'sheriffs posse torches in the distance, deep red sky',
  'saloon in flames, embers swirling, chaos and smoke',
];

// Legendary backgrounds are embedded in accessory strings for full scene control

// ─── Accessories — Male ───────────────────────────────────────────────────────

const COMMON_ACCESSORIES = [
  'wearing a faded red bandana around the neck',
  'wearing a dusty old cowboy hat slightly too big',
  'wearing a simple cloth bandana across the face',
  'wearing a beat-up straw hat and a bandana',
  'wearing a worn leather vest and a neck kerchief',
];

const UNCOMMON_ACCESSORIES = [
  'wearing a bandana mask over the face, holding a crumpled wanted poster',
  'wearing a battered cowboy hat, a stolen sheriff\'s badge pinned crooked on chest',
  'wearing a duster coat and a bandana, shifty eyes',
  'wearing a moth-eaten cowboy hat and fingerless gloves',
  'wearing a cracked leather vest, a kerchief, and a sly grin',
];

const RARE_ACCESSORIES = [
  'wearing a wide-brimmed outlaw hat with a silver band, a bandolier across the chest, stolen sheriff\'s star',
  'wearing a battered cowboy hat at a rakish angle, a bandana, a bullet-studded belt',
  'wearing a dark leather duster and a weathered cowboy hat, a deputy star stolen and pinned upside-down',
  'wearing a well-worn cowboy hat with a bullet hole through the brim, a bandana, confident smirk',
  'wearing a sun-faded outlaw hat, a silver spur earring, and a crossed-arms pose',
];

const EPIC_ACCESSORIES = [
  'wearing a golden-trimmed cowboy hat and a bandolier, engulfed in crackling flames',
  'wearing a gilded outlaw hat with war paint streaks across the face, surrounded by fire and sparks',
  'wearing a scorched golden hat tilted forward, a flaming bandana, eyes burning with intensity',
  'wearing a singed golden hat and a bullet-riddled vest, fire roaring behind, sparks flying',
  'wearing a flame-blackened cowboy hat with golden trim, a glowing bandolier, fierce as hell',
];

const LEGENDARY_ACCESSORIES = [
  'wearing a cracked golden cowboy hat with glowing orange fissures, skin almost entirely charred, ash and embers swirling, a burning MOST WANTED poster in the background, midnight black and ember glow, flat cartoon illustration style',
  'wearing a scorched golden hat and a jewelled bandana, deep charcoal skin with lava-crack texture, smouldering wanted posters raining down, crimson and coal black background, flat cartoon illustration style',
  'wearing a shattered golden outlaw hat tilted at a legendary angle, coal-black charred skin with orange cracks, ash and smoke all around, dark violet and ember background, flat cartoon illustration style',
  'wearing a blackened golden hat with a glowing brim, cracked volcanic skin, a charred bandolier, swirling embers, smoky midnight background with orange glow, flat cartoon illustration style',
  'wearing a golden crown-hat hybrid with cracks glowing like lava, charred to the core, most wanted in the whole territory, dramatic black and orange background, ash raining down, flat cartoon illustration style',
];

// ─── Accessories — Female (Bandit Queen variants) ─────────────────────────────

const FEMALE_COMMON_ACCESSORIES = [
  'wearing a dusty pink bandana tied in her hair, a flower tucked behind the ear',
  'wearing a small sun-bleached cowboy hat and a cute neck kerchief',
  'wearing a faded floral bandana across the face, big nervous eyes',
];

const FEMALE_UNCOMMON_ACCESSORIES = [
  'wearing a bandana mask and a stolen rose from a boutonnière, sharp eyes',
  'wearing a patched cowboy hat with a feather, a stolen deputy badge',
  'wearing a duster and a silk bandana, looking like trouble',
];

const FEMALE_RARE_ACCESSORIES = [
  'wearing a wide-brimmed hat adorned with a silver rose, a pearl-handled pistol holster, stolen gems',
  'wearing an outlaw hat with lace trim, a jewelled bandana, long lashes, absolutely iconic',
  'wearing a hat with a broken sheriff\'s star pinned to it, pearl earrings, fierce and regal',
];

const FEMALE_EPIC_ACCESSORIES = [
  'wearing a flaming floral crown and a golden bandolier, engulfed in fire, bandit queen energy',
  'wearing a gilded hat with fire-red feathers, war paint, surrounded by flames and sparks',
  'wearing a scorched golden flower crown and a glowing bandana, eyes blazing, pure chaos',
];

const FEMALE_LEGENDARY_ACCESSORIES = [
  'wearing a cracked diamond-studded outlaw hat with glowing fissures, charred elegant skin, burning wanted posters swirling, midnight and ember background, flat cartoon illustration style',
  'wearing a scorched golden flower crown with lava cracks, smoky dramatic eye makeup, ash raining down, crimson and black background, flat cartoon illustration style',
  'wearing a shattered jewelled outlaw hat, volcanic skin with glowing cracks, fierce smouldering gaze, dark violet and ember background, flat cartoon illustration style',
];

// ─── Utility ─────────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

/**
 * Build a fal.ai prompt for a Souvenir based on rarity tier.
 * Rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
 *
 * The JACKPOTATO trigger token activates the LoRA style.
 * Rarity tiers map to on-chain rarityFromScore():
 *   0–19 → common, 20–39 → uncommon, 40–59 → rare, 60–79 → epic, 80–100 → legendary
 */
function buildPrompt(rarity) {
  const isFemale = Math.random() < FEMALE_CHANCE;
  const isSmug   = Math.random() < SMUG_CHANCE;

  const smugExpression = 'impossibly smug grin, victorious gleaming eyes';

  if (isFemale) {
    console.log(`   ✨ Bandit Queen variant rolled!`);
    switch (rarity) {
      case 'common':
        return `a JACKPOTATO cartoon character, young female potato bandit, small and scrappy, rosy cheeks, big nervous eyes, ${pick(FEMALE_COMMON_ACCESSORIES)}, ${pick(COMMON_BACKGROUNDS)}, ${isSmug ? smugExpression : 'shy defiant smile'}, flat cartoon illustration style`;
      case 'uncommon':
        return `a JACKPOTATO cartoon character, female potato outlaw, on the run but holding it together, ${pick(FEMALE_UNCOMMON_ACCESSORIES)}, ${pick(UNCOMMON_BACKGROUNDS)}, ${isSmug ? smugExpression : 'cautious sly expression'}, flat cartoon illustration style`;
      case 'rare':
        return `a JACKPOTATO cartoon character, female potato outlaw with a reputation, golden shimmer to the skin, ${pick(FEMALE_RARE_ACCESSORIES)}, ${pick(RARE_BACKGROUNDS)}, ${isSmug ? smugExpression : 'proud dangerous confidence'}, flat cartoon illustration style, gleaming and regal`;
      case 'epic':
        return `a JACKPOTATO cartoon character, notorious female potato bandit queen, engulfed in roaring flames, ${pick(FEMALE_EPIC_ACCESSORIES)}, ${pick(EPIC_BACKGROUNDS)}, ${isSmug ? smugExpression : 'fierce unstoppable fury'}, flat cartoon illustration style`;
      case 'legendary':
        return `a JACKPOTATO cartoon character, most notorious female potato outlaw in the West, skin almost entirely charred and cracked, ${pick(FEMALE_LEGENDARY_ACCESSORIES)}, ${isSmug ? smugExpression : 'imperious smouldering gaze'}`;
      default:
        return `a JACKPOTATO cartoon character, female potato bandit, ${pick(COMMON_BACKGROUNDS)}, flat cartoon illustration style`;
    }
  }

  switch (rarity) {
    case 'common':
      return `a JACKPOTATO cartoon character, young scrappy potato bandit, small and rough around the edges, big innocent eyes, rosy cheeks, ${pick(COMMON_ACCESSORIES)}, ${pick(COMMON_BACKGROUNDS)}, ${isSmug ? smugExpression : 'nervous but defiant expression'}, flat cartoon illustration style`;
    case 'uncommon':
      return `a JACKPOTATO cartoon character, potato outlaw on the run, getting the hang of the outlaw life, ${pick(UNCOMMON_ACCESSORIES)}, ${pick(UNCOMMON_BACKGROUNDS)}, ${isSmug ? smugExpression : 'cautious shifty expression'}, flat cartoon illustration style`;
    case 'rare':
      return `a JACKPOTATO cartoon character, known potato outlaw with a reputation, golden shimmer to the skin, ${pick(RARE_ACCESSORIES)}, ${pick(RARE_BACKGROUNDS)}, ${isSmug ? smugExpression : 'cool dangerous confidence'}, flat cartoon illustration style, weathered and regal`;
    case 'epic':
      return `a JACKPOTATO cartoon character, notorious potato bandit, most wanted in the territory, engulfed in roaring flames, ${pick(EPIC_ACCESSORIES)}, ${pick(EPIC_BACKGROUNDS)}, ${isSmug ? smugExpression : 'fierce unstoppable energy'}, flat cartoon illustration style`;
    case 'legendary':
      return `a JACKPOTATO cartoon character, the most wanted potato outlaw in the whole West, skin almost entirely charred and cracked like cooling lava, ${pick(LEGENDARY_ACCESSORIES)}, ${isSmug ? smugExpression : 'impossibly smug legendary outlaw gaze'}`;
    default:
      return `a JACKPOTATO cartoon character, potato bandit, ${pick(COMMON_BACKGROUNDS)}, flat cartoon illustration style`;
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

async function generateSouvenirImage(rarity, holdDurationHours, holderAddress) {
  const { fal } = await import('@fal-ai/client');

  fal.config({ credentials: FAL_API_KEY });

  const prompt = buildPrompt(rarity);
  // Append hold duration and address slice for uniqueness — backend logs only
  const enhancedPrompt = `${prompt}, held for ${Math.round(holdDurationHours)} hours`;

  console.log(`🤠 Generating ${rarity} souvenir image...`);
  console.log(`   Holder: ${holderAddress.slice(0, 6)}`);
  console.log(`   Prompt: ${enhancedPrompt}`);

  const result = await fal.subscribe('fal-ai/flux-lora', {
    input: {
      prompt:               enhancedPrompt,
      loras:                FAL_LORA_URL ? [{ path: FAL_LORA_URL, scale: 1.0 }] : [],
      num_images:           1,
      image_size:           'square_hd',
      num_inference_steps:  28,
      guidance_scale:       3.5,
    },
    logs: false,
  });

  const imageUrl = result.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error('No image returned from fal.ai');

  console.log(`✅ Image generated: ${imageUrl}`);
  return imageUrl;
}

module.exports = { generateSouvenirImage, buildPrompt };
