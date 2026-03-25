import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

# We want to insert the Music Videos link after Apparel in the main nav
# <a href="apparel.html">Apparel</a>
# <a href="music-videos.html">Music Videos</a>

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Ensure it's not already there twice
    if 'href="music-videos.html">Music Videos</a>' not in content:
        content = content.replace('<a href="apparel.html">Apparel</a>', 
                                 '<a href="apparel.html">Apparel</a>\n        <a href="music-videos.html">Music Videos</a>')

    # Remove it from the Vinyl dropdown if it's there to avoid confusion?
    # No, keeping it in both is fine, but user said it's not working, maybe they want it main.

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated all navs with Music Videos as a main link.")
