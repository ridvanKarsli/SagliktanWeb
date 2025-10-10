// Tamamen sahte, gerçek istek yok!

export async function fakeLogin(emailOrUsername, password) {
    await delay(500)
    if (!emailOrUsername || !password || password.length < 4) {
      const err = new Error('Geçersiz bilgiler. Şifre en az 4 karakter olmalı.')
      err.code = 401
      throw err
    }
    return {
      id: 'u_1',
      username: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername,
      email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@example.com`,
      name: 'Sağlık Kullanıcısı',
      bio: 'Sağlık ve iyi yaşamla ilgileniyorum.',
      avatarUrl: 'https://i.pravatar.cc/150?img=3'
    }
  }
  
  export async function fakeRegister({ username, email, password, confirmPassword }) {
    await delay(600)
    if (!username || !email || !password) {
      const e = new Error('Tüm alanları doldurun.')
      e.code = 400
      throw e
    }
    if (password !== confirmPassword) {
      const e = new Error('Şifreler eşleşmiyor.')
      e.code = 400
      throw e
    }
    // Başarı simülasyonu
    return true
  }
  
  export const delay = (ms) => new Promise((res) => setTimeout(res, ms))
  