import os
from PIL import Image

def optimize_img(path, size=(800, 800), quality=75):
    if not os.path.exists(path): return
    print(f"Optimizing {path}...")
    try:
        img = Image.open(path)
        img.thumbnail(size, Image.Resampling.LANCZOS)
        if path.lower().endswith('.png'):
            img.save(path, 'PNG', optimize=True, compress_level=9)
        else:
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            img.save(path, 'JPEG', quality=quality, optimize=True)
        print(f"Done: {path}")
    except Exception as e:
        print(f"Failed {path}: {e}")

# Walk the whole project
for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or '.venv' in root: continue
    for file in files:
        if file.lower().endswith(('.jpg', '.jpeg', '.png')):
            # Skip logo if already done? No, do it again to be sure.
            # Skip massive design screenshots
            if 'homepage' in file or 'digital-releases' in file or 'premium' in file: continue
            optimize_img(os.path.join(root, file))

print("Full project image hardware compression complete.")
