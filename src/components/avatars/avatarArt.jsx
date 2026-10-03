// Sağlıktan'ın "yol arkadaşları": faydalı oy aldıkça açılan profil
// avatarları. Hepsi aynı çizim dilinde: dolu renkli zemin dairesi, yumuşak
// gövde, nokta gözler, pembe yanaklar, küçük gülümseme. Anahtarlar backend'deki
// AvatarCatalog ile birebir aynı olmalı.

const INK = '#23302E'
const BLUSH = '#FF8FA3'

function Face({ x = 32, y = 36, spread = 7, smile = 4, eye = 2.1 }) {
  return (
    <g>
      <ellipse cx={x - spread} cy={y} rx={eye} ry={eye * 1.15} fill={INK} />
      <ellipse cx={x + spread} cy={y} rx={eye} ry={eye * 1.15} fill={INK} />
      <circle cx={x - spread - 0.6} cy={y - 0.8} r={0.7} fill="#fff" />
      <circle cx={x + spread - 0.6} cy={y - 0.8} r={0.7} fill="#fff" />
      <ellipse cx={x - spread - 3.4} cy={y + 4} rx={2.6} ry={1.6} fill={BLUSH} opacity="0.75" />
      <ellipse cx={x + spread + 3.4} cy={y + 4} rx={2.6} ry={1.6} fill={BLUSH} opacity="0.75" />
      <path d={`M${x - smile} ${y + 3.6} Q${x} ${y + 3.6 + smile * 0.9} ${x + smile} ${y + 3.6}`} stroke={INK} strokeWidth="1.7" strokeLinecap="round" fill="none" />
    </g>
  )
}

export const AVATAR_ART = {
  filiz: {
    bg: '#CDEFE3',
    art: (
      <g>
        <path d="M32 22 C31 16 26 12 19 12 C19 19 24 23 32 23Z" fill="#59C08F" />
        <path d="M32 22 C33 15 39 11 46 12 C45 19 40 23 32 23Z" fill="#7AD39F" />
        <rect x="30.8" y="19" width="2.4" height="8" rx="1.2" fill="#3FA06F" />
        <path d="M14 46 C14 32 22 25 32 25 C42 25 50 32 50 46 C50 55 42 58 32 58 C22 58 14 55 14 46Z" fill="#8FDCAF" />
        <Face y={41} />
      </g>
    ),
  },
  damla: {
    bg: '#D5E9FA',
    art: (
      <g>
        <path d="M32 9 C38 20 50 31 50 42 C50 53 42 59 32 59 C22 59 14 53 14 42 C14 31 26 20 32 9Z" fill="#6DB6F0" />
        <path d="M22 34 C23 28 26 24 28 22" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity="0.7" fill="none" />
        <Face y={42} />
      </g>
    ),
  },
  bulut: {
    bg: '#E2DCFB',
    art: (
      <g>
        <path d="M18 50 C10 50 8 41 14 37 C12 29 21 24 27 28 C29 20 40 19 43 27 C51 25 57 33 52 40 C57 45 53 51 47 50Z" fill="#FFFFFF" />
        <Face y={41} />
      </g>
    ),
  },
  cakil: {
    bg: '#EFE6D6',
    art: (
      <g>
        <path d="M12 44 C11 33 20 24 33 24 C46 24 54 32 53 43 C52 53 43 57 32 57 C20 57 13 53 12 44Z" fill="#B9B3A8" />
        <path d="M20 32 C24 29 28 28 31 28" stroke="#D6D1C7" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <Face y={42} />
      </g>
    ),
  },
  papatya: {
    bg: '#FFF1C9',
    art: (
      <g>
        {Array.from({ length: 10 }).map((_, i) => (
          <ellipse key={i} cx="32" cy="16" rx="5.2" ry="10" fill="#FFFFFF" transform={`rotate(${i * 36} 32 34)`} />
        ))}
        <circle cx="32" cy="34" r="13" fill="#FFC94A" />
        <Face y={33} spread={5.5} smile={3.2} eye={1.8} />
      </g>
    ),
  },
  kirpi: {
    bg: '#F6E3D3',
    art: (
      <g>
        <path d="M10 50 L13 38 L9 33 L16 29 L15 21 L23 22 L26 14 L32 19 L38 14 L41 22 L49 21 L48 29 L55 33 L51 38 L54 50Z" fill="#8A6247" />
        <path d="M17 50 C17 39 24 33 32 33 C40 33 47 39 47 50 C47 56 40 58 32 58 C24 58 17 56 17 50Z" fill="#E9C9A8" />
        <circle cx="32" cy="49" r="2.2" fill={INK} />
        <Face y={44} spread={6.5} smile={0} />
      </g>
    ),
  },
  kaplumbaga: {
    bg: '#D8F0D9',
    art: (
      <g>
        <circle cx="32" cy="22" r="9" fill="#9BD49A" />
        <Face y={22} spread={4.5} smile={2.6} eye={1.6} />
        <path d="M11 48 C11 35 20 29 32 29 C44 29 53 35 53 48Z" fill="#4FA669" />
        <path d="M22 33 L26 41 L22 48 M42 33 L38 41 L42 48 M26 41 H38" stroke="#3B8752" strokeWidth="2" fill="none" />
        <ellipse cx="18" cy="51" rx="5" ry="3.5" fill="#9BD49A" />
        <ellipse cx="46" cy="51" rx="5" ry="3.5" fill="#9BD49A" />
      </g>
    ),
  },
  serce: {
    bg: '#FBE2C8',
    art: (
      <g>
        <ellipse cx="32" cy="40" rx="18" ry="17" fill="#B9835A" />
        <ellipse cx="32" cy="46" rx="11" ry="10" fill="#F3D9BC" />
        <path d="M14 38 C8 36 7 30 10 27 C15 30 17 34 17 38Z" fill="#9C6B46" />
        <path d="M31 39 L35 41 L31 43Z" fill="#F2A33A" />
        <Face y={35} spread={6} smile={0} />
        <path d="M24 23 C27 19 31 19 33 22" stroke="#9C6B46" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  kedi: {
    bg: '#FCE4EC',
    art: (
      <g>
        <path d="M14 30 L16 13 L27 23Z" fill="#FFF7F2" />
        <path d="M50 30 L48 13 L37 23Z" fill="#FFF7F2" />
        <path d="M17 26 L18 17 L24 23Z" fill="#FFB7C5" />
        <path d="M47 26 L46 17 L40 23Z" fill="#FFB7C5" />
        <ellipse cx="32" cy="39" rx="20" ry="18" fill="#FFF7F2" />
        <Face y={38} />
        <path d="M14 41 H6 M14 45 H7 M50 41 H58 M50 45 H57" stroke="#D8C9C2" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    ),
  },
  ayicik: {
    bg: '#F3E1CF',
    art: (
      <g>
        <circle cx="17" cy="21" r="7" fill="#A9774F" />
        <circle cx="47" cy="21" r="7" fill="#A9774F" />
        <circle cx="17" cy="21" r="3.5" fill="#E7C29F" />
        <circle cx="47" cy="21" r="3.5" fill="#E7C29F" />
        <circle cx="32" cy="38" r="20" fill="#B9855B" />
        <ellipse cx="32" cy="45" rx="9" ry="7" fill="#E7C29F" />
        <ellipse cx="32" cy="42.5" rx="2.6" ry="2" fill={INK} />
        <Face y={35} spread={7.5} smile={0} />
      </g>
    ),
  },
  baykus: {
    bg: '#E4E0F7',
    art: (
      <g>
        <path d="M14 22 L20 13 L24 22Z M50 22 L44 13 L40 22Z" fill="#7D6A9E" />
        <ellipse cx="32" cy="38" rx="19" ry="20" fill="#9A86BE" />
        <ellipse cx="32" cy="46" rx="11" ry="10" fill="#D9CDEB" />
        <circle cx="24.5" cy="31" r="7" fill="#fff" />
        <circle cx="39.5" cy="31" r="7" fill="#fff" />
        <circle cx="24.5" cy="31.5" r="3.2" fill={INK} />
        <circle cx="39.5" cy="31.5" r="3.2" fill={INK} />
        <circle cx="23.6" cy="30.4" r="1" fill="#fff" />
        <circle cx="38.6" cy="30.4" r="1" fill="#fff" />
        <path d="M30 37 L32 41 L34 37Z" fill="#F2A33A" />
      </g>
    ),
  },
  tilki: {
    bg: '#FFE2CC',
    art: (
      <g>
        <path d="M12 30 L16 11 L28 24Z" fill="#F08A3C" />
        <path d="M52 30 L48 11 L36 24Z" fill="#F08A3C" />
        <path d="M32 58 C20 58 11 48 11 34 C17 27 24 24 32 24 C40 24 47 27 53 34 C53 48 44 58 32 58Z" fill="#F59A4E" />
        <path d="M32 58 C25 58 19 53 18 46 C23 44 28 46 32 50 C36 46 41 44 46 46 C45 53 39 58 32 58Z" fill="#FFF4EA" />
        <ellipse cx="32" cy="49" rx="2.4" ry="1.8" fill={INK} />
        <Face y={39} spread={7.5} smile={0} />
      </g>
    ),
  },
  gunes: {
    bg: '#FFEBC2',
    art: (
      <g>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x="30.5" y="5" width="3" height="9" rx="1.5" fill="#F7B733" transform={`rotate(${i * 30} 32 34)`} />
        ))}
        <circle cx="32" cy="34" r="16" fill="#FFCD4D" />
        <Face y={33} />
      </g>
    ),
  },
  'deniz-feneri': {
    bg: '#D3ECF5',
    art: (
      <g>
        <path d="M32 14 L47 6 L47 22Z" fill="#FFE59A" opacity="0.85" />
        <path d="M32 14 L17 6 L17 22Z" fill="#FFE59A" opacity="0.85" />
        <rect x="25" y="10" width="14" height="9" rx="3" fill="#2A6FA6" />
        <rect x="27.5" y="12" width="9" height="5" rx="1.5" fill="#FFE59A" />
        <path d="M23 21 H41 L44 58 H20Z" fill="#FFFFFF" />
        <path d="M22.6 30 H41.4 L42.1 38 H21.9Z M21.4 46 H42.6 L43.3 54 H20.7Z" fill="#E9606F" />
        <Face y={26} spread={4.5} smile={2.4} eye={1.5} />
      </g>
    ),
  },
  'ay-cicegi': {
    bg: '#FFF0BF',
    art: (
      <g>
        {Array.from({ length: 14 }).map((_, i) => (
          <ellipse key={i} cx="32" cy="12" rx="4.6" ry="9" fill="#FFC21E" transform={`rotate(${i * (360 / 14)} 32 33)`} />
        ))}
        <circle cx="32" cy="33" r="14" fill="#8B5A2B" />
        <circle cx="32" cy="33" r="11" fill="#A86F38" />
        <Face y={32} spread={5} smile={3} eye={1.8} />
      </g>
    ),
  },
  yildiz: {
    bg: '#FFE6A8',
    art: (
      <g>
        <path d="M32 7 L39.5 23.5 L57 25.5 L44 37.5 L47.5 55 L32 46 L16.5 55 L20 37.5 L7 25.5 L24.5 23.5Z" fill="#FFC531" stroke="#F2A33A" strokeWidth="2" strokeLinejoin="round" />
        <Face y={33} spread={6} smile={3.4} />
        <path d="M54 8 L55.4 11.6 L59 13 L55.4 14.4 L54 18 L52.6 14.4 L49 13 L52.6 11.6Z" fill="#fff" />
      </g>
    ),
  },
}

export function hasAvatarArt(key) {
  return !!key && Object.prototype.hasOwnProperty.call(AVATAR_ART, key)
}
