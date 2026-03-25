import os

path = r'c:\Users\blunt\Desktop\Websites\posion\apparel.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace CJ Text
content = content.replace('CJ Dropshipping', 'AutoDS')

# Replace Config script
content = content.replace('cj-config.js', 'autods-config.js')

# Simple replacement for cards by targeting unique strings
old_hoodie_onclick = "onclick=\"goToCJProductVariant('pwrHoodie', this.closest('.card'))\">Order on CJ"
new_hoodie_onclick = "onclick=\"goToAutoDSProductVariant('pwrHoodie', this.closest('.card'))\">Buy on AutoDS"
content = content.replace(old_hoodie_onclick, new_hoodie_onclick)

old_tee_onclick = "onclick=\"goToCJProductVariant('pwrTeeBlack', this.closest('.card'))\">Order on CJ"
new_tee_onclick = "onclick=\"goToAutoDSProductVariant('pwrTeeBlack', this.closest('.card'))\">Buy on AutoDS"
content = content.replace(old_tee_onclick, new_tee_onclick)

old_patch_onclick = "onclick=\"goToCJProductVariant('pwrPatchPack', this.closest('.card'))\">Order on CJ"
new_patch_onclick = "onclick=\"goToAutoDSProductVariant('pwrPatchPack', this.closest('.card'))\">Buy on AutoDS"
content = content.replace(old_patch_onclick, new_patch_onclick)

# Update descriptions
content = content.replace('print-on-demand line', 'AutoDS line')
content = content.replace('CJ Dropshipping product pages', 'AutoDS product pages')
content = content.replace('cj-config.js', 'autods-config.js')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("apparel.html updated via python.")
