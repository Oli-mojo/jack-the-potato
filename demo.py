import os, json, time, urllib.request, urllib.error

KEY = os.environ.get("FAL_API_KEY")
if not KEY:
    print("\n❌  Run with: FAL_API_KEY=your_key python3 demo.py\n")
    exit(1)

OUT = os.path.expanduser("~/Desktop/bandit-demo")
os.makedirs(OUT, exist_ok=True)

TIERS = [
    ("common",    "a cartoon potato character, young scrappy potato bandit, big innocent eyes, rosy cheeks, wearing a faded red bandana and a dusty old cowboy hat, dusty desert plains, nervous but defiant expression, flat cartoon illustration style"),
    ("uncommon",  "a cartoon potato character, potato outlaw on the run, wearing a bandana mask over the face, battered cowboy hat, stolen sheriff badge pinned crooked, frontier saloon interior warm lamplight, cautious shifty expression, flat cartoon illustration style"),
    ("rare",      "a cartoon potato character, known potato outlaw with a golden shimmer to the skin, wide-brimmed outlaw hat with silver band, bandolier across chest, stolen sheriff star, dramatic mesa at sunset deep orange and violet sky, cool dangerous confidence, flat cartoon illustration style"),
    ("epic",      "a cartoon potato character, notorious potato bandit most wanted in the territory, engulfed in roaring flames, golden-trimmed cowboy hat and bandolier, war paint streaks across the face, dark stormy night sky with burning ranch and lightning, fierce unstoppable energy, flat cartoon illustration style"),
    ("legendary", "a cartoon potato character, the most wanted potato outlaw in the whole West, skin almost entirely charred and cracked like cooling lava with glowing orange fissures, cracked golden cowboy hat, ash and embers swirling, burning MOST WANTED poster in background, midnight black and ember glow, impossibly smug legendary outlaw gaze, flat cartoon illustration style"),
]

def api(method, path, body=None):
    url = f"https://queue.fal.run{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method,
        headers={"Authorization": f"Key {KEY}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def generate(prompt):
    sub = api("POST", "/fal-ai/flux/schnell", {
        "prompt": prompt, "image_size": "square_hd",
        "num_inference_steps": 4, "num_images": 1
    })
    rid = sub.get("request_id")
    if not rid:
        raise Exception(f"No request_id: {sub}")
    for _ in range(60):
        time.sleep(2.5)
        s = api("GET", f"/fal-ai/flux/schnell/requests/{rid}")
        if s.get("status") == "COMPLETED":
            imgs = (s.get("output") or {}).get("images") or s.get("images", [])
            if imgs and imgs[0].get("url"):
                return imgs[0]["url"]
            raise Exception(f"No image in response")
        if s.get("status") == "FAILED":
            raise Exception(f"Job failed")
        print(".", end="", flush=True)
    raise Exception("Timed out")

def download(url, dest):
    urllib.request.urlretrieve(url, dest)

print("\n🤠  Jack the Potato — Bandit Souvenir Demo")
print(f"📁  Saving to: {OUT}\n")

for rarity, prompt in TIERS:
    print(f"Generating {rarity}... ", end="", flush=True)
    try:
        img_url = generate(prompt)
        download(img_url, f"{OUT}/{rarity}.jpg")
        print("✅")
    except Exception as e:
        print(f"❌  {e}")

print("\n🎉  Done! Check ~/Desktop/bandit-demo/\n")
