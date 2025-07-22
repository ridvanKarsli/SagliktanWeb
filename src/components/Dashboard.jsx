import React from "react";
import { Heart, Shield, Users, Clock, CheckCircle, Star } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="bg-[#0B3A4E] text-white py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-[#34C3A1]" />
            <h1 className="text-2xl font-bold">Sağlıktan</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#hakkimizda" className="hover:text-[#34C3A1] transition-colors">
              Hakkımızda
            </a>
            <a href="#ozellikler" className="hover:text-[#34C3A1] transition-colors">
              Özellikler
            </a>
            <a href="#avantajlar" className="hover:text-[#34C3A1] transition-colors">
              Avantajlar
            </a>
            <a href="#iletisim" className="hover:text-[#34C3A1] transition-colors">
              İletişim
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#0B3A4E] to-[#1B7A85] text-white">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold mb-6">
              Sağlığınız Bizim <span className="text-[#34C3A1]">Önceliğimiz</span>
            </h2>
            <p className="text-xl mb-8 text-gray-100">
              Modern teknoloji ile sağlık hizmetlerini bir araya getiren, güvenilir ve kullanıcı dostu platformumuzla
              sağlığınızı yönetin, uzmanlarla iletişim kurun ve sağlıklı yaşam alışkanlıkları edinin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#34C3A1] hover:bg-[#34C3A1]/90 text-[#0B3A4E] font-semibold px-8 py-3 rounded-lg text-lg transition-colors">
                Platformu Keşfet
              </button>
              <button
                className="border border-white text-white hover:bg-white hover:text-[#0B3A4E] bg-transparent px-8 py-3 rounded-lg text-lg transition-colors"
              >
                Daha Fazla Bilgi
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="hakkimizda" className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#0B3A4E] mb-4">Sağlıktan Nedir?</h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Sağlıktan, bireylerin sağlık yolculuklarında onlara rehberlik eden, uzman doktorlar ve sağlık
              profesyonelleri ile buluşturan dijital sağlık platformudur.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h4 className="text-2xl font-semibold text-[#0B3A4E] mb-6">Misyonumuz</h4>
              <p className="text-gray-600 mb-6">
                Herkesin kaliteli sağlık hizmetlerine kolay erişim sağlamasını, sağlık bilincini artırmasını ve daha
                sağlıklı bir yaşam sürmesini desteklemek.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#34C3A1]" />
                  <span className="text-gray-700">7/24 sağlık desteği</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#34C3A1]" />
                  <span className="text-gray-700">Uzman doktor konsültasyonu</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#34C3A1]" />
                  <span className="text-gray-700">Kişiselleştirilmiş sağlık takibi</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="bg-[#34C3A1]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-10 w-10 text-[#34C3A1]" />
                </div>
                <h5 className="text-xl font-semibold text-[#0B3A4E] mb-2">Güvenilir Platform</h5>
                <p className="text-gray-600">
                  Sağlık verileriniz en yüksek güvenlik standartlarıyla korunur ve sadece sizin kontrolünüzdedir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="ozellikler" className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#0B3A4E] mb-4">Platform Özellikleri</h3>
            <p className="text-lg text-gray-600">
              Sağlığınızı yönetmek için ihtiyacınız olan tüm araçlar tek platformda
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-lg p-8">
              <div className="text-center">
                <div className="bg-[#0B3A4E]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-[#0B3A4E]" />
                </div>
                <div className="text-[#0B3A4E] text-xl font-semibold mb-2">Uzman Konsültasyonu</div>
                <div className="text-center text-gray-600">
                  Alanında uzman doktorlarla online görüşme yapın, sorularınızı sorun ve profesyonel tavsiyeler alın.
                </div>
              </div>
            </div>
            <div className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-lg p-8">
              <div className="text-center">
                <div className="bg-[#34C3A1]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-[#34C3A1]" />
                </div>
                <div className="text-[#0B3A4E] text-xl font-semibold mb-2">Sağlık Takibi</div>
                <div className="text-center text-gray-600">
                  Vital değerlerinizi takip edin, ilaç hatırlatıcıları kurun ve sağlık geçmişinizi kayıt altına alın.
                </div>
              </div>
            </div>
            <div className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-lg p-8">
              <div className="text-center">
                <div className="bg-[#1B7A85]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-[#1B7A85]" />
                </div>
                <div className="text-[#0B3A4E] text-xl font-semibold mb-2">7/24 Destek</div>
                <div className="text-center text-gray-600">
                  Acil durumlarda 7/24 sağlık desteği alın, randevu planlayın ve sağlık durumunuzu izleyin.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="avantajlar" className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#0B3A4E] mb-4">Neden Sağlıktan?</h3>
            <p className="text-lg text-gray-600">Sağlık yolculuğunuzda size sunduğumuz benzersiz avantajlar</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-[#34C3A1] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-[#0B3A4E] mb-2">Kolay Erişim</h4>
                  <p className="text-gray-600">
                    İstediğiniz zaman, istediğiniz yerden sağlık hizmetlerine erişin. Mobil ve web uyumlu platform.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-[#34C3A1] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-[#0B3A4E] mb-2">Güvenli Veri</h4>
                  <p className="text-gray-600">
                    Tüm sağlık verileriniz şifrelenmiş olarak saklanır ve sadece sizin kontrolünüzdedir.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-[#34C3A1] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-[#0B3A4E] mb-2">Uygun Fiyat</h4>
                  <p className="text-gray-600">
                    Kaliteli sağlık hizmetlerini uygun fiyatlarla sunuyoruz. Farklı paket seçenekleri mevcuttur.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#0B3A4E] to-[#1B7A85] p-8 rounded-lg text-white">
              <h4 className="text-2xl font-bold mb-4">Kullanıcı Memnuniyeti</h4>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-[#34C3A1] fill-current" />
                ))}
                <span className="ml-2 text-lg font-semibold">4.8/5</span>
              </div>
              <p className="mb-6">
                Binlerce kullanıcımız platformumuzdan memnun ve sağlık yolculuklarında Sağlıktan'ı tercih ediyor.
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#34C3A1]">50K+</div>
                  <div className="text-sm">Aktif Kullanıcı</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#34C3A1]">1000+</div>
                  <div className="text-sm">Uzman Doktor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-[#0B3A4E] text-white">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Sağlıklı Yaşama İlk Adımı Atın</h3>
          <p className="text-xl mb-8 text-gray-100 max-w-2xl mx-auto">
            Sağlıktan platformuna katılın ve sağlığınızı profesyonel bir şekilde yönetmeye başlayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#34C3A1] hover:bg-[#34C3A1]/90 text-[#0B3A4E] font-semibold px-8 py-3 rounded-lg text-lg transition-colors">
              Ücretsiz Başlayın
            </button>
            <button
              className="border border-white text-white hover:bg-white hover:text-[#0B3A4E] bg-transparent px-8 py-3 rounded-lg text-lg transition-colors"
            >
              Demo İzleyin
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="iletisim" className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-[#34C3A1]" />
                <h4 className="text-xl font-bold">Sağlıktan</h4>
              </div>
              <p className="text-gray-400">Sağlığınız için güvenilir dijital çözümler sunuyoruz.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Platform</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#34C3A1] transition-colors">
                    Özellikler
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#34C3A1] transition-colors">
                    Fiyatlandırma
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#34C3A1] transition-colors">
                    Güvenlik
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Destek</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#34C3A1] transition-colors">
                    Yardım Merkezi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#34C3A1] transition-colors">
                    İletişim
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#34C3A1] transition-colors">
                    SSS
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Yasal</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-[#34C3A1] transition-colors">
                    Gizlilik Politikası
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#34C3A1] transition-colors">
                    Kullanım Şartları
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#34C3A1] transition-colors">
                    KVKK
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Sağlıktan. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 