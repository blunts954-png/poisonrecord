import os

path = r'c:\Users\blunt\Desktop\Websites\posion\ventura-punk-record-store-online.html'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
found_digital_h2 = False
for line in lines:
    if '<h2>Digital Releases</h2>' in line and not found_digital_h2:
        # We need to insert the section start before the container that wrapping this H2
        # However, checking the previous lines, I likely just need to replace the gap
        found_digital_h2 = True
    new_lines.append(line)

content = "".join(new_lines)

# Stronger logic: find the gap between the end of vinyl section and Digital Releases
import re
pattern = r'</section>\s+<div class="container">\s+<h2>Digital Releases</h2>'
replacement = """</section>

    <!-- Tab: Digital Releases -->
    <section class="section tab-content" id="tab-digital-releases">
      <div class="container">
        <h2>Digital Releases</h2>"""

if re.search(pattern, content):
    content = re.sub(pattern, replacement, content)
    print("Fixed Digital Release section tag.")
else:
    print("Patter not found exactly, trying relaxed pattern.")
    pattern_relaxed = r'</section>.*?<div class="container">.*?<h2>Digital Releases</h2>'
    content = re.sub(pattern_relaxed, replacement, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
