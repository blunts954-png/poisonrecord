const path = require('path');
const fs = require('fs');

/**
 * Loads products from individual JSON files in the _data/products directory.
 * This allows the Admin CMS to add/edit products independently.
 */
function loadProducts() {
  const dirPath = path.resolve(__dirname, '../../_data/products');
  const products = {};
  
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
      files.forEach(file => {
        const raw = fs.readFileSync(path.join(dirPath, file), 'utf8');
        const data = JSON.parse(raw);
        // Use the filename (minus extension) or the "id" field as the key
        const key = data.id || file.replace('.json', '');
        products[key] = data;
      });
      return products;
    }
  } catch (e) {
    console.error("Error loading merged products from directory:", e);
  }
  
  // Minimal fallback
  return {
    drKnowLiveCbgb1989: {
      name: "Live CBGB 1989 - Dr. Know",
      unitAmount: 4500,
      imagePath: "/dr-know-live-cbgb-1989-ventura-punk-vinyl.jpg",
      inventoryType: "vinyl",
      maxQuantity: 4
    }
  };
}

const STRIPE_PRODUCTS = loadProducts();

module.exports = {
  STRIPE_PRODUCTS
};
