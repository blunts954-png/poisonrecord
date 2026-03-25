import os
from PIL import Image

# Optimized images list
targets = [
    ('hero-background.jpg', (1600, 1600)),
    ('poison-well-records-logo-ventura-805-punk-label.png', (800, 800)),
    ('the-missing-23rd-the-end-of-an-error-ventura-hardcore-vinyl.jpg', (800, 800)),
    ('front-street-knuckle-draggers-805-punk-record.jpg', (800, 800))
]

cwd = os.getcwd()

for filename, size in targets:
    path = os.path.join(cwd, filename)
    if os.path.exists(path):
        print(f"Optimizing {filename}...")
        img = Image.open(path)
        img.thumbnail(size, Image.Resampling.LANCZOS)
        
        # If it's the logo, using a high compression PNG or even JPG if opacity 0.06 hide artifacts
        if filename.endswith('.png'):
            # Convert to RGB (white bg) to save as JPG for massive savings
            # or just high compression PNG
            img.save(path, 'PNG', optimize=True, compress_level=9)
        else:
            img.convert('RGB').save(path, 'JPEG', quality=75, optimize=True)
        print(f"Done: {filename}")

print("Image hardware compression complete.")
