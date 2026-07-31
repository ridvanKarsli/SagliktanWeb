import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

// window.confirm() tarayıcının kendi native penceresini açar - uygulamanın
// koyu temasıyla hiç uyumlu değil, aniden beyaz bir sistem kutusu çıkarıp
// deneyimi bozuyor (özellikle mobilde göze batıyor). Bu context, aynı
// senkron-hissi veren ama tamamen temalı bir alternatif sunuyor:
// `const ok = await confirm('Emin misin?')` şeklinde kullanılır.
const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null) // { message, title, confirmLabel, danger }
  const resolverRef = useRef(null)

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      setState({
        message,
        title: options.title || 'Emin misiniz?',
        confirmLabel: options.confirmLabel || 'Sil',
        cancelLabel: options.cancelLabel || 'Vazgeç',
        danger: options.danger !== false, // varsayılan: yıkıcı aksiyon (kırmızı buton)
      })
    })
  }, [])

  const handleClose = (result) => {
    setState(null)
    resolverRef.current?.(result)
    resolverRef.current = null
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={!!state} onClose={() => handleClose(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{state?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary' }}>{state?.message}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => handleClose(false)}>{state?.cancelLabel}</Button>
          <Button
            variant="contained"
            color={state?.danger ? 'error' : 'primary'}
            onClick={() => handleClose(true)}
            autoFocus
          >
            {state?.confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  )
}

// Kullanım: const confirm = useConfirm(); const ok = await confirm('Silinsin mi?')
export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider')
  }
  return context
}
