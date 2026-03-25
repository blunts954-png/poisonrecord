path = r'c:\Users\blunt\Desktop\Websites\posion\site.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Disable vinyl player
content = content.replace('function initVinylPreviewPlayer() {', 'function initVinylPreviewPlayer() { return; // disabled')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("site.js updated.")
