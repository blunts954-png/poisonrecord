import os
import re

path = r'c:\Users\blunt\Desktop\Websites\posion\ventura-punk-record-store-online.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Dictionary of band mappings for digital covers
artwork_map = {
    "Rubber Band": "assets/pwricon.png",
    "Had Some Devils": "assets/pwricon.png",
    "Narthex Structure": "narthex-structure-1984-ventura-805-punk-vinyl.jpg",
    "FSKD": "front-street-knuckle-draggers-805-punk-record.jpg",
    "RAW": "raw-radioactive-waste-805-punk-vinyl.jpg",
    "Shim Come Quick": "shim-come-quick-denim-leather-and-chains-punk-vinyl.jpg",
    "The Missing 23rd": "the-missing-23rd-the-end-of-an-error-ventura-hardcore-vinyl.jpg",
    "I Decline": "i-decline-failure-by-design-socal-punk-vinyl.jpg",
    "Chaotic Evil": "assets/pwricon.png",
    "The Pits": "assets/pwricon.png",
    "Locals Only": "assets/pwricon.png"
}

# Regex to find each article with digital-band-card class
# and inject the img tag after the opening <article> if it doesn't have one
pattern = re.compile(r'(<article class="card digital-band-card">)(.*?)(<h3 class="album-title">)(.*?)(</h3>\s+<p class="band-name">)(.*?)(</p>)', re.DOTALL)

def inject_artwork(match):
    prefix = match.group(1)
    middle = match.group(2)
    h3_open = match.group(3)
    album = match.group(4)
    h3_close = match.group(5)
    band = match.group(6).strip()
    suffix = match.group(7)
    
    # Simple check for RAW or other multi-band names
    img_src = artwork_map.get(band, "assets/pwricon.png")
    
    img_tag = f'\n            <img src="{img_src}" class="digital-cover" loading="lazy" style="width:100%; aspect-ratio:1/1; object-fit:cover; margin-bottom:1rem; border:1px solid var(--line);">'
    
    return f'{prefix}{img_tag}{middle}{h3_open}{album}{h3_close}{band}{suffix}'

new_content = pattern.sub(inject_artwork, content)

# Remove the YouTube video from this page specifically
new_content = re.sub(r'<!-- YouTube Videos -->.*?</div>\s+</div>', '<!-- YouTube Videos (Moved to Music Videos Page) -->', new_content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated Digital Art and removed local videos.")
