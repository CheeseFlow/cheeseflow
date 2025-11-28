// Tag translations from English to Chinese
export const tagTranslations: Record<string, string> = {
  "brand creation": "品牌创建",
  "brand power": "品牌力量",
  "branding": "品牌塑造",
  "brand tagline": "品牌标语",
  "brand naming": "品牌命名",
  "brand credibility": "品牌信誉",
  "brand logo": "品牌标志",
  "brand colors": "品牌颜色",
};

// Translate a tag to Chinese, fallback to original if no translation exists
export function translateTag(tag: string, lang: string = "en"): string {
  if (lang === "zh") {
    return tagTranslations[tag.toLowerCase()] || tag;
  }
  return tag;
}

// Translate an array of tags
export function translateTags(tags: string[], lang: string = "en"): string[] {
  return tags.map((tag) => translateTag(tag, lang));
}
