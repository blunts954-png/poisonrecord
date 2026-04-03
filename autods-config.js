window.POISON_WELL_AUTODS_LINKS = {
  // Public AutoDS product URLs only!
  pwrHoodie: {
    base: "https://shop.autods.com/poisonwell/pwr-hoodie",
    sizes: {
      S: "https://shop.autods.com/poisonwell/pwr-hoodie?size=S",
      M: "https://shop.autods.com/poisonwell/pwr-hoodie?size=M",
      L: "https://shop.autods.com/poisonwell/pwr-hoodie?size=L",
      XL: "https://shop.autods.com/poisonwell/pwr-hoodie?size=XL",
      "2XL": "https://shop.autods.com/poisonwell/pwr-hoodie?size=2XL"
    }
  },
  pwrTeeBlack: {
    base: "https://shop.autods.com/poisonwell/pwr-tee",
    sizes: {
      S: "https://shop.autods.com/poisonwell/pwr-tee?size=S",
      M: "https://shop.autods.com/poisonwell/pwr-tee?size=M",
      L: "https://shop.autods.com/poisonwell/pwr-tee?size=L",
      XL: "https://shop.autods.com/poisonwell/pwr-tee?size=XL",
      "2XL": "https://shop.autods.com/poisonwell/pwr-tee?size=2XL"
    }
  },
  pwrPatchPack: {
    base: "https://shop.autods.com/poisonwell/pwr-patch-pack"
  }
};

function goToAutoDSProductVariant(key, cardElem) {
  const size = cardElem.dataset.size || 'M';
  const data = window.POISON_WELL_AUTODS_LINKS[key];
  if (!data) return;
  const target = (data.sizes && data.sizes[size]) ? data.sizes[size] : data.base;
  window.open(target, '_blank');
}
