import PageLoader from './PageLoader.jsx'

// Oturum kontrolü sürerken (route guard'lar) tam ekran gösterge. Renkler
// temadan gelir - sabit koyu renk açık temada bir anlık koyu ekran
// "yanıp sönmesi" yaratıyordu.
export default function FullScreenLoader() {
  return <PageLoader fullScreen />
}
