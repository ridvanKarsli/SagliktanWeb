// Bildirim kapsülünün türe göre otomatik kapanma süreleri (ms). Yaşlı/az
// gören üyeler için uzun: başarı/bilgi 6 sn, hata/uyarı 8 sn. LumoNotification
// ve NotificationContext buradan okur (bileşen dosyasından export edilmez:
// react-refresh/only-export-components).
export const NOTIFICATION_DURATION = { success: 6000, info: 6000, warning: 8000, error: 8000 }
