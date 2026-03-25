import os
import re

def cleanup(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove YouTube videos container
    # <div class="video-grid">...</div>
    content = re.sub(r'<div class="video-grid">.*?</div>', '', content, flags=re.DOTALL)

    # Remove needle-drop section if it still exists
    content = re.sub(r'<section class="needle-drop".*?</section>', '', content, flags=re.DOTALL)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

cleanup(r'c:\Users\blunt\Desktop\Websites\posion\ventura-punk-record-store-online.html')
cleanup(r'c:\Users\blunt\Desktop\Websites\posion\index.html')

print("Final HTML cleanup complete.")
