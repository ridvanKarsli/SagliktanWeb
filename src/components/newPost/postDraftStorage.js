// Gönderi taslağı ve son kullanılan hedef cihazda (localStorage) saklanır:
// pencere yanlışlıkla kapansa da (mobilde geri hareketi, dışarı dokunma)
// yazı kaybolmaz. localStorage gizli sekmede / dolu kotada hata fırlatabilir;
// taslak bir kolaylık, asla akışı bozmamalı.
const DRAFT_KEY = 'sagliktan:post-draft'
const LAST_TARGET_KEY = 'sagliktan:last-post-target'

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* yoksay */ }
}
function remove(key) {
  try { localStorage.removeItem(key) } catch { /* yoksay */ }
}

export const loadDraft = () => read(DRAFT_KEY)
export const saveDraft = (draft) => write(DRAFT_KEY, draft)
export const clearDraft = () => remove(DRAFT_KEY)

export const loadLastTarget = () => read(LAST_TARGET_KEY)
export const saveLastTarget = (target) => write(LAST_TARGET_KEY, target)
