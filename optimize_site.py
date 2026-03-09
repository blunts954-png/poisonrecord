import os
import glob
import re

# Geos and Technical SEO settings for Ventura/805
GEO_TAGS = """
  <meta name="geo.region" content="US-CA" />
  <meta name="geo.placename" content="Ventura" />
  <meta name="geo.position" content="34.2746;-119.2290" />
  <meta name="ICBM" content="34.2746, -119.2290" />
"""

# Premium Navigation Toggle (Hamburger)
HAMBURGER_BUTTON = """
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
        <span class="hamburger"></span>
      </button>"""

def optimize_html(filepath):
    print(f"Processing: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add Geo Tags if missing (Local SEO)
    if 'name="geo.region"' not in content:
        content = re.sub(r'(</title>)', r'\1' + GEO_TAGS, content)

    # 2. Add Mobile Nav Toggle if missing (Mobile UX)
    if 'id="nav-toggle"' not in content:
        # Match different brand/header formats
        if '<a class="brand"' in content:
            content = re.sub(r'(<a class="brand".*?</a>)', r'\1' + HAMBURGER_BUTTON, content)
        elif '<div class="brand"' in content:
            content = re.sub(r'(<div class="brand".*?</div>)', r'\1' + HAMBURGER_BUTTON, content)

    # 3. Add ID to nav-links for mobile toggle targeting
    if 'id="nav-links"' not in content:
        content = re.sub(r'<nav class="nav-links"', r'<nav class="nav-links" id="nav-links"', content)

    # 4. Technical SEO Enhancement: Canonical URL
    if 'rel="canonical"' not in content:
        filename = os.path.basename(filepath)
        clean_name = filename.replace('.html', '')
        if clean_name == 'index':
            clean_name = ''
        # Netlify extensionless URL format support
        canonical_url = f'https://poisonwellrecords.netlify.app/{clean_name}'
        canonical_tag = f'  <link rel="canonical" href="{canonical_url}" />\n'
        content = re.sub(r'(</head>)', canonical_tag + r'\1', content)

    # 5. Accessibility & UX: Image Lazy Loading
    # Regular expression to find images without loading attribute
    content = re.sub(r'<img(?!.*?loading=)(.*?)>', r'<img\1 loading="lazy">', content)

    # 6. SEO Check: Single H1 validation
    h1_count = len(re.findall(r'<h1', content, re.I))
    if h1_count > 1:
        print(f"Warning: {filepath} has {h1_count} H1 tags. SEO best practice is one per page.")

    # 7. Local SEO Keywords reinforcement (subtle)
    # Check if meta description mentions local keywords
    desc_match = re.search(r'<meta name="description" content="(.*?)"', content)
    if desc_match:
        desc = desc_match.group(1)
        if "Ventura" not in desc and "805" not in desc:
            print(f"Tip: Update meta description for {filepath} to include 'Ventura 805' and 'Nardcore'.")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Finished optimizing: {filepath}")

def main():
    # Find all relevant HTML files
    html_files = glob.glob('*.html')
    html_files += [f for f in glob.glob('*') if f.endswith('.hidden.html')]
    
    for f in html_files:
        optimize_html(f)

if __name__ == "__main__":
    main()
