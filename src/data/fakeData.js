export const initialPosts = [
    {
      id: 'p1',
      author: 'Ayşe',
      content: 'Günlük yürüyüşlerim migrenimi azalttı, sizde durumlar nasıl?',
      timestamp: Date.now() - 1000 * 60 * 60 * 4
    },
    {
      id: 'p2',
      author: 'Mehmet',
      content: 'Meditasyon uygulamaları öneriniz var mı?',
      timestamp: Date.now() - 1000 * 60 * 60 * 2
    }
  ]
  
  export const mockUsers = [
    { id: 'u2', name: 'Dr. Elif', title: 'Aile Hekimi', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 'u3', name: 'Can', title: 'Beslenme Koçu', avatar: 'https://i.pravatar.cc/150?img=7' },
    { id: 'u4', name: 'Zeynep', title: 'Fizyoterapist', avatar: 'https://i.pravatar.cc/150?img=8' }
  ]
  
  // Çok basit AI cevapları (tamamen sahte)
  export function mockAiAnswer(userMessage) {
    const norms = [
      'Bol su içmek, düzenli uyku ve hafif egzersiz çoğu kişi için iyi bir başlangıçtır.',
      'Belirtileriniz devam ederse bir uzmana danışın. Bu uygulama tıbbi tavsiye vermez.',
      'Dengeli beslenme ve stres yönetimi, genel sağlık üzerinde etkilidir.'
    ]
    const pick = norms[Math.floor(Math.random() * norms.length)]
    return `“${userMessage}” hakkında: ${pick}`
  }
  