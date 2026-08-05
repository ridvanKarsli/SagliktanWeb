// Bir kullanıcının profiline git - kendi profilinse (App.jsx'te UserProfile
// zaten /profile'a yönlendiriyor ama burada da direkt /profile'a göndermek
// gereksiz bir ara sayfa atlamasını önler) tam yetkili /profile'a, başkası
// için herkese açık /users/:id sayfasına. PostDetail.jsx'ten taşındı (bkz.
// clean-code audit).
export function goToUserProfile(navigate, currentUser, targetUserId) {
  if (!targetUserId) return
  if (currentUser && String(currentUser.id) === String(targetUserId)) {
    navigate('/profile')
  } else {
    navigate(`/users/${targetUserId}`)
  }
}
