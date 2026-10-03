import LeafBurst from '../celebration/LeafBurst.jsx'
import { useAvatarUnlocks } from './useAvatarUnlocks.js'

// Yeni açılan yol arkadaşları için kutlama (bkz. useAvatarUnlocks). Görünmez;
// yalnızca kutlama anında yaprak yağmuru çizer.
export default function AvatarUnlockWatcher() {
  const burst = useAvatarUnlocks()
  return <LeafBurst trigger={burst} />
}
