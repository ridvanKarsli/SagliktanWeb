// Ortak odak halkası (sx içinde): '&:focus-visible': focusRingSx ya da
// '&.Mui-focusVisible': focusRingSx. Renkler index.css'teki --sg-focus-*
// değişkenlerinden gelir, tema değişince kendiliğinden uyar. Eskiden her
// bileşen 'primary.light' ile kendi dış çizgisini çiziyordu; o ton açık
// zeminde 2.4:1 ile görünmüyordu.
export const focusRingSx = {
  outline: '3px solid var(--sg-focus-color)',
  outlineOffset: '2px',
  boxShadow: 'var(--sg-focus-ring)',
}
