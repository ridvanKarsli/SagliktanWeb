import { useEffect, useState } from 'react'
import { Box, Button, ButtonBase, CircularProgress, Stack, Typography } from '@mui/material'
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
              sx={{
                position: 'relative', overflow: 'hidden', width: '100%', minHeight: 46,
                justifyContent: 'flex-start', textAlign: 'left', px: 1.5, py: 1, borderRadius: 2.5,
                border: '1.5px solid', borderColor: mine ? 'primary.main' : 'divider',
                bgcolor: showResults ? 'transparent' : 'background.paper',
                '&:hover': { borderColor: 'primary.main' },
                '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 }
              }}
            >
              {showResults && (
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute', inset: 0, width: `${pct}%`,
                    bgcolor: mine ? 'rgba(76,184,159,0.22)' : 'action.selected',
                    transition: 'width .4s ease',
                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' }
                  }}
                />
              )}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ position: 'relative', width: '100%' }}>
                {pendingId === opt.id
                  ? <CircularProgress size={16} />
                  : mine ? <CheckCircleRounded sx={{ fontSize: 18, color: 'primary.main' }} /> : null}
                <Typography variant="body2" sx={{ fontWeight: mine ? 700 : 500, flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                  {opt.label}
                </Typography>
                {showResults && (
                  <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                    %{pct}
                  </Typography>
                )}
              </Stack>
            </ButtonBase>
          )
        })}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.75, color: 'text.secondary' }}>
        <PollOutlined sx={{ fontSize: 16 }} />
        <Typography variant="caption" sx={{ flex: 1 }}>
          {total} oy{!showResults ? ' · Sonuçları görmek için oy ver' : ''}
        </Typography>
        {voted && (
          <Button size="small" onClick={unvote} disabled={pendingId != null} sx={{ minHeight: 32, color: 'text.secondary' }}>
            {pendingId === 'remove' ? <CircularProgress size={14} /> : 'Oyumu geri al'}
          </Button>
        )}
      </Stack>
    </Box>
  )
}
