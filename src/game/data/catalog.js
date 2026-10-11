// Mahalle kataloğunun istemci tarafı yedeği (game-spec §1, §3, §5, §7).
// Asıl kaynak sunucunun GET /api/game/catalog cevabıdır; bu dosya yalnızca
// katalog gelene kadar/gelmezse ekranlar boş kalmasın diye ve görsel test
// betiğinin (scripts/visual-harness.mjs) sahte cevabı için kullanılır.
// Saf JS: Node betikleri de içe aktarır.

const c = (key, slot, name, price = 0, starter = price === 0) => ({ key, slot, name, price, starter })

export const FALLBACK_CATALOG = {
  clothing: [
    c('s1', 'skin', 'Açık'), c('s2', 'skin', 'Buğday'), c('s3', 'skin', 'Esmer'), c('s4', 'skin', 'Kahve'), c('s5', 'skin', 'Koyu'),
    c('short', 'hair', 'Kısa'), c('long', 'hair', 'Uzun'), c('bun', 'hair', 'Topuz'), c('curly', 'hair', 'Kıvırcık'), c('bob', 'hair', 'Küt'), c('buzz', 'hair', 'Kazınmış'),
    c('black', 'hairColor', 'Siyah'), c('brown', 'hairColor', 'Kahverengi'), c('auburn', 'hairColor', 'Kızıl'), c('blonde', 'hairColor', 'Sarı'), c('gray', 'hairColor', 'Kır'),
    c('tee_mint', 'top', 'Nane tişört'), c('hoodie_sky', 'top', 'Gök kapüşonlu'), c('sweater_cream', 'top', 'Krem kazak'),
    c('cardigan_rose', 'top', 'Gül hırka', 40), c('shirt_check', 'top', 'Ekose gömlek', 40), c('jacket_denim', 'top', 'Kot ceket', 60),
    c('raincoat_sun', 'top', 'Sarı yağmurluk', 60), c('vest_knit', 'top', 'Örgü yelek', 45),
    c('jeans', 'bottom', 'Kot'), c('chinos', 'bottom', 'Bej pantolon'), c('skirt', 'bottom', 'Etek'),
    c('shorts', 'bottom', 'Şort', 30), c('joggers', 'bottom', 'Eşofman', 35), c('long_skirt', 'bottom', 'Uzun etek', 45),
    c('glasses_round', 'accessory', 'Yuvarlak gözlük'), c('sunhat', 'accessory', 'Hasır şapka', 50), c('beanie', 'accessory', 'Bere', 35),
    c('scarf', 'accessory', 'Atkı', 35), c('headphones', 'accessory', 'Kulaklık', 70), c('flower_pin', 'accessory', 'Çiçek toka', 30),
    c('backpack', 'accessory', 'Sırt çantası', 55), c('cap', 'accessory', 'Kasket', 40),
  ],
  furniture: [
    ['sofa', 'Nane kanepe', 2, 1, 80], ['armchair', 'Kayısı koltuk', 1, 1, 50], ['bed', 'Yorganlı yatak', 2, 2, 100],
    ['rug', 'Yuvarlak halı', 2, 2, 40], ['coffee_table', 'Sehpa', 1, 1, 30], ['bookshelf', 'Kitaplık', 1, 1, 60],
    ['floor_lamp', 'Abajur', 1, 1, 35], ['monstera', 'Deve tabanı', 1, 1, 30], ['cactus', 'Kaktüs', 1, 1, 20],
    ['cat_bed', 'Kedi yatağı', 1, 1, 30], ['aquarium', 'Akvaryum', 1, 1, 90], ['piano', 'Piyano', 2, 1, 120],
    ['desk', 'Çalışma masası', 2, 1, 70], ['chair', 'Sandalye', 1, 1, 25], ['radio', 'Eski radyo', 1, 1, 45],
    ['flower_vase', 'Çiçek vazosu', 1, 1, 25], ['beanbag', 'Armut koltuk', 1, 1, 40], ['dining_table', 'Yemek masası', 2, 2, 90],
    ['fireplace', 'Şömine', 2, 1, 110], ['easel', 'Resim sehpası', 1, 1, 55], ['tv', 'Televizyon', 2, 1, 90],
  ].map(([key, name, w, d, price]) => ({ key, name, w, d, price, floor: key === 'rug' })),
  bodies: [{ key: 'female', name: 'Kadın' }, { key: 'male', name: 'Erkek' }],
  gifts: [
    { key: 'flower', name: 'Çiçek', price: 5 }, { key: 'tea', name: 'Sıcak çay', price: 5 }, { key: 'soup', name: 'Sıcak çorba', price: 8 },
    { key: 'blanket', name: 'Battaniye', price: 10 }, { key: 'book', name: 'Kitap', price: 10 }, { key: 'lantern', name: 'Dilek feneri', price: 15 },
  ],
  messages: [
    { key: 'gecmis_olsun', text: 'Geçmiş olsun' }, { key: 'yanindayim', text: 'Yanındayım' }, { key: 'seni_dusundum', text: 'Bugün seni düşündüm' },
    { key: 'iyi_ki_varsin', text: 'İyi ki varsın' }, { key: 'guclusun', text: 'Sen çok güçlüsün' }, { key: 'birlikteyiz', text: 'Birlikteyiz' },
    { key: 'kendine_iyi_bak', text: 'Kendine iyi bak, dinlen' }, { key: 'tesekkurler', text: 'Teşekkür ederim' },
  ],
  phrases: [
    ['merhaba', 'Merhaba!'], ['gunaydin', 'Günaydın!'], ['iyi_aksamlar', 'İyi akşamlar!'], ['nasilsin', 'Nasılsın?'], ['iyiyim', 'İyiyim, teşekkürler'],
    ['idare_eder', 'İdare eder'], ['yorgunum', 'Bugün biraz yorgunum'], ['gecmis_olsun', 'Geçmiş olsun'], ['yanindayim', 'Yanındayım'],
    ['sen_guclusun', 'Sen çok güçlüsün'], ['birlikteyiz', 'Birlikteyiz'], ['tesekkurler', 'Teşekkür ederim'], ['rica_ederim', 'Rica ederim'],
    ['cok_guzel', 'Çok güzel!'], ['evin_cok_guzel', 'Evin çok güzel!'], ['gel_otur', 'Gel, biraz oturalım'], ['cay_icelim', 'Çay içelim mi?'],
    ['hava_guzel', 'Hava ne güzel'], ['gorusuruz', 'Görüşürüz!'], ['iyi_geceler', 'İyi geceler'], ['hosgeldin', 'Hoş geldin!'],
    ['seni_gormek_guzel', 'Seni görmek güzel'], ['kendine_iyi_bak', 'Kendine iyi bak'], ['dinlenmeliyim', 'Biraz dinlenmeliyim'],
    ['bugun_iyi_bir_gun', 'Bugün iyi bir gün'], ['bir_adim_bir_adim', 'Adım adım'], ['umut', 'Umudunu kaybetme'], ['sarilalim', 'Sarılalım mı?'],
    ['ne_guzel_tesadut', 'Ne güzel tesadüf'], ['hep_burdayim', 'Hep buradayım'],
  ].map(([key, text]) => ({ key, text })),
  emotes: [
    ['wave', 'El salla'], ['hug', 'Sarıl'], ['heart', 'Kalp'], ['laugh', 'Gül'], ['clap', 'Alkış'], ['tea', 'Çay'], ['sleepy', 'Uykulu'], ['sparkle', 'Işıltı'],
  ].map(([key, name]) => ({ key, name })),
  zones: [
    { key: 'meydan', name: 'Meydan', width: 16, height: 16 },
    { key: 'park', name: 'Park', width: 18, height: 18 },
    { key: 'carsi', name: 'Çarşı', width: 14, height: 14 },
    { key: 'sahil', name: 'Sahil', width: 20, height: 12 },
    { key: 'mahalle', name: 'Mahalle sokağı', width: 20, height: 10 },
  ],
}

// Katalog dizilerinden anahtar -> kayıt sözlükleri (ekranlar sık arar).
export function indexCatalog(cat) {
  const by = (arr) => Object.fromEntries((arr || []).map((i) => [i.key, i]))
  return {
    ...cat,
    clothingByKey: by(cat.clothing),
    furnitureByKey: by(cat.furniture),
    giftsByKey: by(cat.gifts),
    messagesByKey: by(cat.messages),
    phrasesByKey: by(cat.phrases),
    emotesByKey: by(cat.emotes),
    zonesByKey: by(cat.zones),
  }
}

// Bölge kısa açıklamaları (harita sayfası).
export const ZONE_BLURBS = {
  meydan: 'Çeşme başı, çay ocağı ve herkesin uğrak yeri',
  park: 'Gölet kenarında sakin bir yürüyüş',
  carsi: 'Giyim ve mobilya tezgâhları burada',
  sahil: 'İskele, deniz ve simitçi',
  mahalle: 'Senin evin ve komşu kapıları',
}

export const ROOM_VISIBILITY_OPTIONS = [
  { value: 'EVERYONE', label: 'Herkes', help: 'Mahalledeki herkes evine uğrayabilir.' },
  { value: 'KNOWN', label: 'Tanıdıklarım', help: 'Yalnızca Sağlıktan’da mesajlaştığın kişiler girebilir.' },
  { value: 'NOBODY', label: 'Kimse', help: 'Evin kapalı. Hediyeler yine kapına ulaşır.' },
]

export const REPORT_REASONS = [
  'Rahatsız edici davranış',
  'Uygunsuz takma ad',
  'Beni takip ediyor',
  'Başka bir şey',
]
