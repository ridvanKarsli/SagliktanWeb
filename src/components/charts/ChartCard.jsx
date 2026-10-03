import { useId, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { InsertChartOutlinedRounded, TableRowsOutlined } from '@mui/icons-material'
import { radius } from '../../design/tokens.js'
import { SeriesKey } from './ChartTooltip.jsx'

/**
 * Grafik kabı (<figure>): başlık, kısa açıklama, lejant ve "Tablo olarak gör"
 * geçişi. Tablo, grafiğin erişilebilir ikizidir - tooltip'e bakmadan her
 * değere ulaşılabilir (ekran okuyucu, renk ayırt edemeyenler, kesin sayı
 * isteyenler).
 *
 * legend: [{ key, label, color, kind }] - 2+ seri varsa gösterilir.
 * table:  { columns: [{ key, label, numeric?, format? }], rows: [{...}] }
 */
export default function ChartCard({ title, description, legend, table, busy = false, children, sx }) {
  const [showTable, setShowTable] = useState(false)
  const titleId = useId()
  const descId = useId()

  return (
    <Box
      component="figure"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      aria-busy={busy || undefined}
      sx={{
        m: 0, p: { xs: 1.75, sm: 2.25 }, minWidth: 0,
        bgcolor: 'background.paper', borderRadius: `${radius.md}px`,
        border: '1px solid', borderColor: 'brand.border',
        display: 'flex', flexDirection: 'column',
        transition: 'opacity 200ms ease',
        opacity: busy ? 0.55 : 1,
        ...sx,
      }}
    >
      <Box component="figcaption" sx={{ mb: 1.25 }}>
        <Typography id={titleId} variant="subtitle1" component="h3" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
          {title}
        </Typography>
        {description && (
          <Typography id={descId} variant="caption" component="p" sx={{ color: 'text.secondary', fontWeight: 600, m: 0, mt: 0.25 }}>
            {description}
          </Typography>
        )}
      </Box>

      {legend?.length > 1 && !showTable && (
        <Box component="ul" aria-label="Lejant" sx={{ listStyle: 'none', m: 0, p: 0, mb: 1, display: 'flex', flexWrap: 'wrap', columnGap: 2, rowGap: 0.5 }}>
          {legend.map(l => (
            <Box component="li" key={l.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.8125rem', fontWeight: 700, color: 'text.secondary' }}>
              <SeriesKey color={l.color} kind={l.kind} />
              {l.label}
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {showTable && table ? <DataTable table={table} caption={title} /> : children}
      </Box>

      {table && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5, mb: -0.5, mr: -0.75 }}>
          <Button
            size="small"
            variant="text"
            onClick={() => setShowTable(v => !v)}
            aria-pressed={showTable}
            startIcon={showTable ? <InsertChartOutlinedRounded /> : <TableRowsOutlined />}
            sx={{ minHeight: 36, px: 1.25, fontSize: '0.8125rem' }}
          >
            {showTable ? 'Grafik olarak gör' : 'Tablo olarak gör'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

function DataTable({ table, caption }) {
  return (
    <Box sx={{ maxHeight: 300, overflow: 'auto', borderRadius: `${radius.sm}px`, border: '1px solid', borderColor: 'brand.divider' }} tabIndex={0} aria-label={`${caption} tablosu`}>
      <Box
        component="table"
        sx={{
          width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem',
          '& th, & td': { px: 1.25, py: 0.75, textAlign: 'left', borderBottom: '1px solid', borderColor: 'brand.divider', whiteSpace: 'nowrap' },
          '& thead th': { position: 'sticky', top: 0, bgcolor: 'brand.surfaceAlt', fontWeight: 800, color: 'text.secondary', fontSize: '0.8125rem' },
          '& td.num, & th.num': { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
          '& tbody tr:last-of-type td': { borderBottom: 0 },
          '& tbody th': { fontWeight: 600 },
        }}
      >
        <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{caption}</caption>
        <thead>
          <tr>
            {table.columns.map(c => <th key={c.key} scope="col" className={c.numeric ? 'num' : undefined}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={r.id ?? i}>
              {table.columns.map((c, ci) => {
                const v = c.format ? c.format(r[c.key], r) : r[c.key]
                return ci === 0
                  ? <th key={c.key} scope="row">{v}</th>
                  : <td key={c.key} className={c.numeric ? 'num' : undefined}>{v}</td>
              })}
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  )
}
