// Yorum thread yardımcıları (PostDetail.jsx'ten taşındı - bkz. clean-code
// audit). Backend tüm yorum ağacını (sınırsız derinlik) tek seferde gömülü
// döndürmüyor - her yorum sadece kendi DOĞRUDAN yanıt SAYISINI (replyCount)
// taşıyor, gerçek yanıtlar kullanıcı o dalı TIKLAYIP açtığında ayrı bir
// istekle sayfalı olarak gelir (bkz. usePostComments.js'teki threadStack).
// Bu yüzden aynı anda bellekte sadece kök liste (comments) + o an açık olan
// thread zincirinin seviyeleri var. Bir yorum; kök listede, ya da açık olan
// herhangi bir thread seviyesinde bulunabilir - bu yüzden güncelleme/sayaç
// artırma işlemleri tüm bu olası konumları tarıyor.

function bumpAt(comment, id, delta) {
  if (comment.id !== id) return comment
  return { ...comment, replyCount: (comment.replyCount ?? 0) + delta }
}

// Bir yoruma yeni bir doğrudan yanıt eklendiğinde, o yorumun replyCount'unu
// -nerede gösteriliyorsa orada- bir artırır (kök liste + tüm açık thread
// seviyeleri, sadece en üstteki değil - kullanıcı "Geri" ile üst seviyeye
// döndüğünde de sayaç güncel görünsün diye).
export function bumpReplyCount(comments, threadStack, parentId, delta) {
  const nextComments = comments.map(c => bumpAt(c, parentId, delta))
  const nextStack = threadStack.map(frame => ({
    ...frame,
    comment: bumpAt(frame.comment, parentId, delta),
    replies: frame.replies.map(r => bumpAt(r, parentId, delta))
  }))
  return { comments: nextComments, threadStack: nextStack }
}

// Bir yorum düzenlendiğinde/silindiğinde, sadece değişen alanları (content,
// deleted) -nerede gösteriliyorsa orada- günceller. Bilerek `updated`
// objesini olduğu gibi spread ETMİYORUZ: update() uç noktası replyCount'u
// bilmediği için 0 döner, tam spread bu doğru sayacın üzerine yazardı.
function patchAt(comment, updated) {
  if (comment.id !== updated.id) return comment
  return { ...comment, content: updated.content, deleted: updated.deleted }
}

export function updateCommentEverywhere(comments, threadStack, updated) {
  const nextComments = comments.map(c => patchAt(c, updated))
  const nextStack = threadStack.map(frame => ({
    ...frame,
    comment: patchAt(frame.comment, updated),
    replies: frame.replies.map(r => patchAt(r, updated))
  }))
  return { comments: nextComments, threadStack: nextStack }
}
