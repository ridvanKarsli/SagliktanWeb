import { useCallback, useRef, useState } from 'react'

// Form hata gösterimi için ortak davranış (kurallar utils/validation.js'te):
// - Hata, kullanıcı alandan ayrılınca (blur) ya da gönder'e basınca görünür;
//   ilk kez yazarken araya girmez. Bir kez göründükten sonra yazdıkça
//   anında güncellenir (düzeltildiği an kaybolur).
// - Gönderimde ilk hatalı alana odaklanılır.
// - Sunucudan gelen alan hataları (ApiError.fieldErrors) ilgili alanın
//   altında gösterilir ve kullanıcı o alanı değiştirince kalkar.
//
// validate(values) => { alan: 'hata metni' | null } - anahtar sırası,
// "ilk hatalı alan" sırasını belirler (formdaki görsel sırayla aynı yazın).
export function useFormValidation(values, validate) {
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [server, setServer] = useState({})
  const refs = useRef({})

  const errors = validate(values) || {}
  const firstInvalid = Object.keys(errors).find(k => errors[k])
  const isValid = !firstInvalid

  const serverError = (name) => {
    const s = server[name]
    return s && Object.is(values?.[name], s.value) ? s.msg : null
  }

  const error = (name) => serverError(name) || ((submitted || touched[name]) ? errors[name] || null : null)

  const focus = useCallback((name) => {
    const el = refs.current[name]
    if (el && typeof el.focus === 'function') {
      el.focus({ preventScroll: true })
      el.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
    }
  }, [])

  const touch = useCallback((name) => {
    setTouched(t => (t[name] ? t : { ...t, [name]: true }))
  }, [])

  // Alandan çıkınca hata hemen gösterilirse alttaki düğme kayar ve aynı
  // dokunuşun "click"i düğmeyi ıskalar (gönder'e basmak boşa gider). Bu yüzden:
  // odak bir düğmeye geçiyorsa işaretleme (gönderim zaten hepsini doğrular),
  // aksi halde kısa bir gecikmeyle işaretle.
  const handleBlur = (name) => (e) => {
    const next = e?.relatedTarget
    if (next && (next.tagName === 'BUTTON' || next.getAttribute?.('role') === 'button')) return
    setTimeout(() => touch(name), 180)
  }

  // TextField'e yayılacak ortak prop'lar: <TextField {...form.field('email')} />
  const field = (name) => ({
    inputRef: (el) => { if (el) refs.current[name] = el },
    onBlur: handleBlur(name),
    error: !!error(name),
  })

  // Odak için yalnızca ref (ör. özel bileşenler, buton grupları).
  const refFor = (name) => (el) => { if (el) refs.current[name] = el }

  // Gönderim öncesi: tüm hataları görünür yap, ilk hatalıya odaklan.
  const validateAll = () => {
    setSubmitted(true)
    if (firstInvalid) focus(firstInvalid)
    return isValid
  }

  // Sunucu hatalarını alanlara bağla. Hiçbir alan eşleşmediyse false döner
  // (çağıran genel bir bildirim göstermeli).
  const applyServerErrors = (fieldErrors) => {
    const entries = Object.entries(fieldErrors || {}).filter(([k, msg]) => msg && k in (values || {}))
    if (!entries.length) return false
    setServer(Object.fromEntries(entries.map(([k, msg]) => [k, { msg, value: values[k] }])))
    focus(entries[0][0])
    return true
  }

  const reset = useCallback(() => {
    setTouched({})
    setSubmitted(false)
    setServer({})
  }, [])

  return { errors, isValid, error, field, refFor, touch, focus, validateAll, applyServerErrors, reset, submitted }
}
