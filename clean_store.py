import os

path = r'c:\Users\blunt\Desktop\Websites\posion\ventura-punk-record-store-online.html'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_test_pressings = False
removed_video = False

# Mapping for digital covers
band_covers = {
    'Rubber Band': 'assets/pwricon.png', # Placeholder or known
    'Had Some Devils': 'assets/pwricon.png',
    'Narthex Structure': 'narthex-structure-1984-ventura-805-punk-vinyl.jpg',
    'FSKD': 'front-street-knuckle-draggers-805-punk-record.jpg',
    'Los Bonedrivers': 'los-bonedrivers-socal-punk-vinyl.jpg',
    'RAW': 'raw-radioactive-waste-805-punk-vinyl.jpg',
    'Shim Come Quick': 'shim-come-quick-denim-leather-and-chains-punk-vinyl.jpg',
    'All a Blur': 'assets/pwricon.png'
}

for line in lines:
    # 1. Remove Test Pressings section
    if 'id="tab-test-pressings"' in line:
        skip_test_pressings = True
    if skip_test_pressings and '</section>' in line:
        skip_test_pressings = False
        continue
    if skip_test_pressings:
        continue
        
    # 2. Remove Video Embeds in Digital Releases
    if '<div class="video-embed">' in line or '<iframe>' in line:
        removed_video = True
        continue
    if removed_video and '</div>' in line:
        removed_video = False
        continue
    if removed_video:
        continue

    # 3. Add images to Digital cards
    if 'article class="card digital-band-card"' in line:
        new_lines.append(line)
        # We need the band name from subsequent lines to pick the right cover
        continue
        
    new_lines.append(line)

# Second pass for digital covers logic (simplified replacement)
content = "".join(new_lines)

# Injecting images into digital-band-card containers
import re
def inject_img(match):
    band_match = re.search(r'<p class="band-name">([^<]+)</p>', match.group(0))
    if band_match:
        band = band_match.group(1).strip()
        img = band_covers.get(band, 'assets/pwricon.png')
        return match.group(0).replace('<article class="card digital-band-card">', 
            f'<article class="card digital-band-card">\n            <img src="{img}" class="digital-cover" loading="lazy" style="width:100%; aspect-ratio:1/1; object-fit:cover; margin-bottom:1rem; border:1px solid var(--line);">')
    return match.group(0)

content = re.sub(r'<article class="card digital-band-card">.*?</article>', inject_img, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("ventura-punk-record-store-online.html cleaned and digital covers added.")
