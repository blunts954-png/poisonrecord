import json
import os

data_path = r'c:\Users\blunt\Desktop\Websites\posion\_data\products.json'
out_dir = r'c:\Users\blunt\Desktop\Websites\posion\_data\products'

with open(data_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

for key, val in products.items():
    # add the slug/key to the object
    val['id'] = key
    with open(os.path.join(out_dir, f'{key}.json'), 'w', encoding='utf-8') as out:
        json.dump(val, out, indent=2)

print("Split products into individual files.")
