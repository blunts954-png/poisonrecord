import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

nav_old = """            <a href="ventura-punk-record-store-online.html#tab-vinyl">All Vinyl</a>
            <a href="ventura-punk-record-store-online.html#tab-test-pressings">Test Pressings</a>
            <a href="ventura-punk-record-store-online.html#tab-digital-releases">Digital Releases</a>
            <a href="ventura-punk-record-store-online.html#tab-rarities">Rarities</a>"""

nav_new = """            <a href="ventura-punk-record-store-online.html#tab-vinyl">All Vinyl</a>
            <a href="ventura-punk-record-store-online.html#tab-digital-releases">Digital Releases</a>
            <a href="ventura-punk-record-store-online.html#tab-rarities">Rarities</a>
            <a href="music-videos.html">Music Videos</a>"""

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update Nav
    if 'tab-test-pressings' in content:
        # Try both with and without exact indentation
        content = content.replace('ventura-punk-record-store-online.html#tab-test-pressings', 'music-videos.html')
        content = content.replace('Test Pressings', 'Music Videos')

    # Remove videos (iframes)
    content = re.sub(r'<div class="video-embed">.*?</div>', '', content, flags=re.DOTALL)
    content = re.sub(r'<iframe.*?</iframe>', '', content, flags=re.DOTALL)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Updated {len(html_files)} files: Nav and Video Removal.")
