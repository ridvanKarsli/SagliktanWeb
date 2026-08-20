// Faz8-6: uygulamada birçok yerde bir isim/avatar sadece onClick ile
// tıklanabilir yapılıyordu (gerçek bir <a>/<button> değil) - bu hem klavyeyle
// (Tab+Enter) hem de ekran okuyucuyla erişilemez, hem de tarayıcının "yeni
// sekmede aç" gibi standart bağlantı davranışlarından yoksun kalıyordu.
// Bu yardımcı, mevcut onClick tabanlı deseni bozmadan (halihazırda birçok
// yerde prop olarak taşınıyor, tam bir Link'e çevirmek geniş bir yeniden
// yapılandırma gerektirirdi) en azından klavye/screen-reader erişimini
// asgari düzeyde sağlıyor: role="button" + tabIndex + Enter/Space desteği.
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
