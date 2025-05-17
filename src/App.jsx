import './App.css'

function App() {
  return (
<div className="App">
  <img
    src="/sagliktanLogo.png"
    alt="Sağlıktan Logo"
    className="logo"
  />
  <h1>Sağlıkta Devrim Başlıyor</h1>
  <p className="info">
    <strong>Sağlıktan</strong>, kronik hastalıklar alanında uzman hekimlerle hastaları bir araya getiren,
    bilim temelli bir dijital sağlık platformudur.
  </p>
  <p className="info">
    Yeni tedavi yöntemleri, uzman görüşleri ve topluluk desteğiyle <em>çok yakında yayındayız.</em>
    <span style={{ color: "var(--color-light-teal)", marginLeft: "0.5rem" }}>💙</span>
  </p>
</div>

  )
}

export default App
