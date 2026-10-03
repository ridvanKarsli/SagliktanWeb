import { useEffect, useState } from 'react'
import { Box, Button, ButtonBase, CircularProgress, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { CheckCircleRounded, PollOutlined } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { removePollVote, votePoll } from '../services/api.js'

/**
 * Anket: oy vermeden önce seçenekler büyük dokunma alanlı butonlar; oy
 * verince (ya da gönderi sahibiysen) sonuç çubukları + yüzdeler. Tek seçim;
 * başka seçeneğe dokunmak oyu değiştirir, "Oyumu geri al" siler.
 * Kart içinde de kullanıldığı için tüm tıklamalar karta yayılmaz.
 */
export default function PollView({ postId, poll: initialPoll, isOwner = false, onChange, sx }) {
  const { token } = useAuth()
  const { showError } = useNotification()
  const [poll, setPoll] = useState(initialPoll)
  const [pendingId, setPendingId] = useState(null)

  useEffect(() => { setPoll(initialPoll) }, [initialPoll])

  if (!poll || !Array.isArray(poll.options) || poll.options.length === 0) return null

  const voted = poll.myOptionId != null
  const showResults = voted || isOwner
  const total = poll.totalVotes || 0

  const apply = (next) => { setPoll(next); onChange?.(next) }

  const vote = async (optionId) => {
    if (pendingId != null || optionId === poll.myOptionId) return
    setPendingId(optionId)
    try {
      apply(await votePoll(token, postId, optionId))
    } catch (err) {
      showError(err.message || 'Oy verilemedi.')
    } finally {
      setPendingId(null)
    }
  }

  const unvote = async () => {
    setPendingId('remove')
    try {
      apply(await removePollVote(token, postId))
    } catch (err) {
      showError(err.message || 'Oy geri alınamadı.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role="group"
      aria-label="Anket"
      sx={{ mb: 1.5, ...sx }}
    >
      <Stack spacing={1}>
        {poll.options.map(opt => {
          const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0
          const mine = opt.id === poll.myOptionId
          return (
            <ButtonBase
              key={opt.id}
              onClick={() => vote(opt.id)}
              disabled={pendingId != null}
              aria-pressed={mine}
              aria-label={showResults ? `${opt.label}: yüzde ${pct}, ${opt.votes} oy${mine ? ', senin seçimin' : ''}` : `${opt.label} seçeneğine oy ver`}
              className="tap-scale"
              sx={{
                position: 'relative', overflow: 'hidden', width: '100%', minHeight: 50,
                justifyContent: 'flex-start', textAlign: 'left', px: 1.75, py: 1.125, borderRadius: '14px',
                border: '1.5px solid', borderColor: mine ? 'brand.lilac' : 'brand.border',
                bgcolor: showResults ? 'background.paper' : 'brand.lilacSoft',
                transition: 'border-color 160ms ease, background-color 160ms ease',
                '&:hover': { borderColor: 'brand.lilac' },
                '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'brand.lilac', outlineOffset: 2 }
              }}
            >
              {showResults && (
                <Box
                  aria-hidden
                  className="sg-poll-fill"
                  sx={{
                    position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pct}%`,
                    bgcolor: (t) => alpha(t.palette.brand.lilac, mine ? 0.24 : 0.1),
                    transition: 'width 480ms var(--ease-flow)'
                  }}
                />
              )}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ position: 'relative', width: '100%' }}>
                {pendingId === opt.id
                  ? <CircularProgress size={16} />
                  : mine ? <CheckCircleRounded sx={{ fontSize: 19, color: 'brand.lilac' }} /> : null}
                <Typography variant="body2" sx={{ fontWeight: mine ? 800 : 600, flex: 1, minWidth: 0, wordBreak: 'break-word', color: 'text.primary' }}>
                  {opt.label}
                </Typography>
                {showResults && (
                  <Typography variant="body2" sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', flexShrink: 0, color: mine ? 'brand.lilac' : 'text.primary' }}>
                    %{pct}
                  </Typography>
                )}
              </Stack>
            </ButtonBase>
          )
        })}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.75, color: 'text.secondary', minHeight: 44 }}>
        <PollOutlined sx={{ fontSize: 16 }} />
        <Typography variant="caption" sx={{ flex: 1 }}>
          {total} oy{!showResults ? ' · Oy verince sonuçları görürsün' : ''}
        </Typography>
        {voted && (
          <Button size="small" onClick={unvote} disabled={pendingId != null} sx={{ minHeight: 44, color: 'text.secondary' }}>
            {pendingId === 'remove' ? <CircularProgress size={14} /> : 'Oyumu geri al'}
          </Button>
        )}
      </Stack>
    </Box>
  )
}
