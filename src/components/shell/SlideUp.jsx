import { forwardRef } from 'react'
import { Slide } from '@mui/material'

// Mobilde tam ekran açılan pencereler (yeni gönderi, şikayet, üyeler)
// alttan yukarı kayarak gelir - telefonda alışılmış "sayfa" hissi.
// Dialog'un TransitionComponent'i olarak kullanılır.
const SlideUp = forwardRef(function SlideUp(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default SlideUp
