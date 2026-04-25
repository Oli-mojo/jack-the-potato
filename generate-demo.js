const https = require('https');
const fs    = require('fs');
const path  = require('path');

const FAL_API_KEY = process.env.FAL_API_KEY;
if (!FAL_API_KEY) { console.error('\n❌  FAL_API_KEY not set\n'); process.exit(1); }

const OUT_DIR = path.join(__dirname, '..', 'Demo Souvenirs bandit');
fs.mkdirSync(OUT_DIR, { recursive: true });

const TIERS = [
  { rarity: 'common',    label: '🥔 Common',    prompt: 'a cartoon potato character, young scrappy potato bandit, big innocent eyes, rosy cheeks, wearing a faded red bandana and a dusty old cowboy hat slightly too big, dusty desert plains, nervous but defiant expression, flat cartoon illustration style' },
  { rarity: 'uncommon',  label: '🤠 Uncommon',  prompt: 'a cartoon potato character, potato outlaw on the run, wearing a bandana mask over the face, battered cowboy hat, stolen sheriff badge pinned crooked, frontier saloon interior warm lamplight, cautious shifty expression, flat cartoon illustration style' },
  { rarity: 'rare',      label: '⭐ Rare',       prompt: 'a cartoon potato character, known potato outlaw with a golden shimmer to the skin, wide-brimmed outlaw hat with silver band, bandolier across chest, stolen sheriff star, dramatic mesa at sunset deep orange and violet sky, cool dangerous confidence, flat cartoon illustration style' },
  { rarity: 'epic',      label: '🔥 Epic',       prompt: 'a cartoon potato character, notorious potato bandit most wanted in the territory, engulfed in roaring flames, golden-trimmed cowboy hat and bandolier, war paint streaks across the face, dark stormy night sky with burning ranch and lightning, fierce unstoppable energy, flat cartoon illustration style' },
  { rarity: 'legendary', label: '💀 Legendary',  prompt: 'a cartoon potato character, the most wanted potato outlaw in the whole West, skin almost entirely charred and cracked like cooling lava with glowing orange fissures, cracked golden cowboy hat, ash and embers swirling, burning MOST WANTED poster in background, midnight black and ember glow, impossibly smug legendary outlaw gaze, flat cartoon illustration style' },
];

function post(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({ hostname: 'queue.fal.run', path: '/fal-ai/flux/schnell', method: 'POST', headers: { 'Authorization': `Key ${FAL_API_KEY}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (res) => { let r=''; res.on('data',d=>r+=d); res.on('end',()=>{ try{resolve(JSON.parse(r))}catch(e){reject(new Error('Bad JSON: '+r))} }); });
    req.on('error', reject); req.write(data); req.end();
  });
}

function get(urlStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = https.request({ hostname: url.hostname, path: url.pathname+url.search, method: 'GET', headers: { 'Authorization': `Key ${FAL_API_KEY}` } }, (res) => {
      if (res.statusCode===301||res.statusCode===302) return get(res.headers.location).then(resolve).catch(reject);
      let r=''; res.on('data',d=>r+=d); res.on('end',()=>{ try{resolve(JSON.parse(r))}catch(e){reject(new Error(r))} });
    });
    req.on('error', reject); req.end();
  });
}

function sleep(ms) { return new Promise(r=>setTimeout(r,ms)); }

async function generate(prompt) {
  const sub = await post({ prompt, image_size:'square_hd', num_inference_steps:4, num_images:1 });
  if (!sub.request_id) throw new Error('No request_id: '+JSON.stringify(sub));
  const url = `https://queue.fal.run/fal-ai/flux/schnell/requests/${sub.request_id}`;
  for (let i=0;i<60;i++) {
    await sleep(2500);
    const s = await get(url);
    if (s.status==='COMPLETED') { const imgs=s.output?.images||s.images; if(imgs?.[0]?.url) return imgs[0].url; throw new Error('No image: '+JSON.stringify(s)); }
    if (s.status==='FAILED') throw new Error('Failed: '+JSON.stringify(s));
    process.stdout.write('.');
  }
  throw new Error('Timeout');
}

function download(imgUrl, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(imgUrl, (res) => {
      if (res.statusCode===301||res.statusCode===302) { file.close(); fs.unlink(dest,()=>{}); return download(res.headers.location,dest).then(resolve).catch(reject); }
      res.pipe(file); file.on('finish',()=>{ file.close(); resolve(); });
    }).on('error', reject);
  });
}

async function main() {
  console.log('\n🤠  Jack the Potato — Bandit Souvenir Demo');
  console.log('📁  Saving to: ' + OUT_DIR + '\n');
  for (const tier of TIERS) {
    console.log(tier.label);
    try {
      process.stdout.write('   Generating ');
      const imgUrl = await generate(tier.prompt);
      const dest = path.join(OUT_DIR, tier.rarity+'.jpg');
      await download(imgUrl, dest);
      console.log(' ✅  '+tier.rarity+'.jpg');
    } catch(err) { console.log(' ❌  '+err.message); }
  }
  console.log('\n🎉  Done!\n');
}

main();
