import os
import glob
import re

def cleanup_html(filepath):
    print(f"Cleaning: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match the pattern </head>\s*<link rel="canonical" ... />\s* and move it inside </head>
    pattern = r'(</head>)\s*(<link rel="canonical".*?/>)'
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, r'  \2\n\1', content, flags=re.DOTALL)
        
    # Also handle the duplicate case if it exists
    # If there are two canonical tags, keep only one inside the head.
    canonicals = re.findall(r'<link rel=[\'"]canonical[\'"].*?/>', content)
    if len(canonicals) > 1:
        # Keep the first one, remove others? 
        # Actually, let's just ensure there's only one inside the head.
        first_canonical = canonicals[0].strip()
        # Remove all canonicals
        content = re.sub(r'\s*<link rel=[\'"]canonical[\'"].*?/>', '', content)
        # Re-add the first one before </head>
        content = re.sub(r'(</head>)', f'  {first_canonical}\n\\1', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    html_files = glob.glob('*.html')
    html_files += [f for f in glob.glob('*') if f.endswith('.hidden.html')]
    for f in html_files:
        cleanup_html(f)

if __name__ == "__main__":
    main()
