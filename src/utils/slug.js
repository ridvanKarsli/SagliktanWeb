// Hastalık grubu adından adres parçası üretir:
// "Retinitis Pigmentosa" -> "retinitis-pigmentosa", "Çölyak Hastalığı" -> "colyak-hastaligi".
// Backend'deki Slugs.of (SagliktanApi/util/Slugs.java) ile aynı kural olmalı.
const MAP = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u' }

export function slugify(text) {
  return String(text || '')
    .trim()
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşüâîû]/g, ch => MAP[ch])
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Grubun ziyaretçilere açık tanıtım sayfası (ad yoksa null).
export function groupIntroPath(groupName) {
  const slug = slugify(groupName)
  return slug ? `/g/${slug}` : null
}
