// Profil sağlık özeti için ortak sabitler (karşılama, ayarlar, profil kartları).

export const COMMUNITY_ROLES = [
  { value: 'PATIENT', label: 'Hastalığı yaşıyorum', short: 'Hasta' },
  { value: 'CAREGIVER', label: 'Hasta yakınıyım', short: 'Hasta yakını' },
  { value: 'PROFESSIONAL', label: 'Sağlık profesyoneliyim', short: 'Sağlık profesyoneli' },
  { value: 'OTHER', label: 'Merak ediyorum / diğer', short: 'Üye' },
]

function roleShortLabel(role) {
  return COMMUNITY_ROLES.find(r => r.value === role)?.short || null
}

// "2021'de tanı" / yakınlar için "Yakınına 2021'de tanı" gibi kısa özet.
export function healthSummaryParts({ communityRole, diagnosisYear, city } = {}) {
  const parts = []
  const role = roleShortLabel(communityRole)
  if (role && communityRole !== 'OTHER') parts.push(role)
  if (diagnosisYear) parts.push(communityRole === 'CAREGIVER' ? `Yakınına ${diagnosisYear}'de tanı` : `${diagnosisYear}'de tanı`)
  if (city) parts.push(city)
  return parts
}

// Türkiye'nin 81 ili - backend'deki TurkishCities.ALL ile BİREBİR aynı olmalı
// (SagliktanApi validation/TurkishCities.java). Backend listede olmayan her
// değeri 400 "Lütfen listeden bir il seçin" ile reddeder; şehir alanı bu
// yüzden yalnızca bu listeden seçim kabul eder (bkz. CityField).
export const TR_CITIES = Object.freeze([
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin',
  'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
  'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum',
  'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 'İzmir',
  'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis', 'Kırıkkale', 'Kırklareli',
  'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir',
  'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Şanlıurfa', 'Siirt', 'Sinop', 'Şırnak', 'Sivas',
  'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
])
