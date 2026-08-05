// Bir kullanıcının bir postun/yorumun sahibi olup olmadığını ya da admin
// olduğunu (bu yüzden yönetebileceğini) kontrol eder - PostDetail.jsx'ten
// taşındı (bkz. clean-code audit).
export function canManage(user, authorId) {
  if (!user) return false
  return user.id === authorId || user.role === 'ADMIN'
}
