// Bir isim/avatar gibi gerçek <button>/<a> olmayan bir öğeyi tıklanabilir
// yaparken klavye ve ekran okuyucu erişimini sağlar: role="button" +
// tabIndex + Enter/Space desteği.
export function clickableProps(onClick) {
  return {
    role: 'button',
    tabIndex: 0,
    onClick,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick(e)
      }
    }
  }
}

// İçinde başka butonlar barındıran tıklanabilir kartlar için (ör. "Katıl"
// butonlu grup kartı, eylem çubuklu gönderi kartı). Kökü role="button"
// yapmak iç içe etkileşimli öğe üretir ve ekran okuyucuyu bozar; bunun
// yerine kart odaklanabilir bir makale olur, Enter/Space yalnızca kartın
// kendisi odaktayken (içerideki bir butondan gelmiyorsa) kartı açar.
export function cardActivationProps(onActivate, label) {
  return {
    role: 'article',
    tabIndex: 0,
    'aria-label': label,
    onClick: onActivate,
    onKeyDown: (e) => {
      if (e.target !== e.currentTarget) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onActivate(e)
      }
    }
  }
}
