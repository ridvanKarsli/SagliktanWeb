import { useState } from 'react'
import { Alert, Box, Button, ButtonBase, Skeleton, Stack, Typography } from '@mui/material'
import {
  CheckCircleRounded, ChevronRightRounded, ForumOutlined, GroupsRounded, PlaceOutlined, RadioButtonUncheckedRounded
} from '@mui/icons-material'

const sameId = (a, b) => a != null && b != null && String(a) === String(b)

// Adım başlığı: "1  Grubunu seç" - gerçek bir sıra olduğu için numaralı.
function StepTitle({ step, title, hint }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          aria-hidden
          sx={{
            width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0,
            bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: '0.8rem', fontWeight: 800
          }}
        >
          {step}
        </Box>
        <Typography variant="subtitle1" component="h3">{title}</Typography>
      </Stack>
      {hint && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25, ml: 4 }}>
          {hint}
        </Typography>
      )}
    </Box>
  )
}

// 1. adım: hastalık grupları - ikonlu, iri kartlar (konulardan görsel olarak ayrı).
function GroupCards({ groups, value, onChange }) {
  return (
    <Box
      role="radiogroup"
      aria-label="Hastalık grubu"
      sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 1 }}
    >
      {groups.map(g => {
        const selected = sameId(g.id, value)
        return (
          <ButtonBase
            key={g.id}
            role="radio"
            aria-checked={selected}
            aria-label={g.name}
            onClick={() => onChange(g.id)}
            className="tap-scale"
            sx={{
              flexDirection: 'column', alignItems: 'flex-start', gap: 1, p: 1.5, minHeight: 92, borderRadius: 4,
              textAlign: 'left', border: '2px solid', borderColor: selected ? 'primary.main' : 'brand.border',
              bgcolor: selected ? 'brand.primarySoft' : 'background.paper',
              transition: 'border-color 160ms ease, background-color 160ms ease',
              '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 }
            }}
          >
            <Stack direction="row" justifyContent="space-between" sx={{ width: '100%' }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'brand.primarySoft', color: 'primary.main' }}>
                <GroupsRounded sx={{ fontSize: 20 }} />
              </Box>
              {selected
                ? <CheckCircleRounded sx={{ color: 'primary.main' }} />
                : <RadioButtonUncheckedRounded sx={{ color: 'brand.borderStrong' }} />}
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.3 }}>{g.name}</Typography>
          </ButtonBase>
        )
      })}
    </Box>
  )
}

// 2. adım: seçilen grubun konuları (alt gruplar) - açıklamalı liste satırları.
function TopicList({ topics, value, onChange }) {
  return (
    <Stack role="radiogroup" aria-label="Alt grup" spacing={0.75}>
      {topics.map(t => {
        const selected = sameId(t.id, value)
        return (
          <ButtonBase
            key={t.id}
            role="radio"
            aria-checked={selected}
            aria-label={t.name}
            onClick={() => onChange(t.id)}
            className="tap-scale"
            sx={{
              justifyContent: 'flex-start', textAlign: 'left', gap: 1.5, px: 1.5, py: 1.25, minHeight: 56, borderRadius: 3,
              border: '1.5px solid', borderColor: selected ? 'primary.main' : 'brand.border',
              bgcolor: selected ? 'brand.primarySoft' : 'background.paper',
              '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 }
            }}
          >
            <ForumOutlined sx={{ color: selected ? 'primary.main' : 'text.secondary', flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>{t.name}</Typography>
              {t.description && (
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                  {t.description}
                </Typography>
              )}
            </Box>
            {selected
              ? <CheckCircleRounded sx={{ color: 'primary.main', flexShrink: 0 }} />
              : <RadioButtonUncheckedRounded sx={{ color: 'brand.borderStrong', flexShrink: 0 }} />}
          </ButtonBase>
        )
      })}
    </Stack>
  )
}

// Seçim tamamlanınca: "Grup / Konu" özet satırları, her biri "Değiştir" ile.
function SummaryRow({ icon, label, value, onChange, changeLabel }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ px: 1.5, py: 1 }}>
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2 }}>{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>{value}</Typography>
      </Box>
      {onChange && (
        <Button size="small" onClick={onChange} aria-label={changeLabel} sx={{ minHeight: 36, flexShrink: 0 }}>
          Değiştir
        </Button>
      )}
    </Stack>
  )
}

function Skeletons() {
  return (
    <Stack spacing={1}>
      <Skeleton variant="text" width={160} />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <Skeleton variant="rounded" height={92} />
        <Skeleton variant="rounded" height={92} />
      </Box>
    </Stack>
  )
}

/**
 * "Nereye paylaşıyorsun?" - iki net adım:
 *   1) Hastalık grubu (yalnızca üye olunanlar) - ikonlu kartlar
 *   2) O grubun konusu (alt grup) - açıklamalı liste
 * İkisi seçilince tek bir özet kutusuna dönüşür ("Değiştir" ile geri açılır).
 * presetSubGroup verilirse hedef sabittir; fixedDgId verilirse yalnızca konu seçilir.
 */
export default function PostTargetPicker({
  presetSubGroup, myGroups, fixedDgId, fixedDgName,
  diseaseGroupId, onDiseaseGroupChange, subGroups, subGroupId, onSubGroupChange, onExploreGroups
}) {
  // Kullanıcı "Değiştir"e bastıysa o adım açık kalır; yoksa seçim durumuna göre karar verilir.
  const [editing, setEditing] = useState(null) // null | 'group' | 'topic'

  if (presetSubGroup) {
    return (
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary', minWidth: 0 }}>
        <PlaceOutlined sx={{ fontSize: 18, flexShrink: 0 }} />
        <Typography variant="body2" noWrap>
          {presetSubGroup.diseaseGroupName ? `${presetSubGroup.diseaseGroupName} › ` : ''}
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{presetSubGroup.name}</Box>
        </Typography>
      </Stack>
    )
  }

  if (myGroups === null) return <Skeletons />

  if (myGroups.length === 0 && fixedDgId == null) {
    return (
      <Alert
        severity="info"
        icon={<GroupsRounded />}
        action={<Button color="inherit" size="small" onClick={onExploreGroups} sx={{ minHeight: 36 }}>Keşfet</Button>}
      >
        Paylaşım yapmak için önce bir hastalık grubuna katılmalısın.
      </Alert>
    )
  }

  const canChooseGroup = fixedDgId == null && myGroups.length > 1
  const selectedGroup = myGroups.find(g => sameId(g.id, diseaseGroupId))
  const groupName = fixedDgId != null ? fixedDgName : (selectedGroup?.name || (myGroups.length === 1 ? myGroups[0].name : ''))
  const selectedTopic = Array.isArray(subGroups) ? subGroups.find(s => sameId(s.id, subGroupId)) : null

  const showGroupStep = canChooseGroup && (editing === 'group' || diseaseGroupId == null)
  const showTopicStep = !showGroupStep && diseaseGroupId != null && (editing === 'topic' || !selectedTopic)

  const pickGroup = (id) => {
    onDiseaseGroupChange(id)
    setEditing(null)
  }
  const pickTopic = (id) => {
    onSubGroupChange(id)
    setEditing(null)
  }

  return (
    <Box component="section" aria-label="Nereye paylaşıyorsun?">
      <Typography variant="subtitle2" component="h2" sx={{ color: 'text.secondary', mb: 1.25 }}>
        Nereye paylaşıyorsun?
      </Typography>

      {showGroupStep && (
        <>
          <StepTitle step={1} title="Grubunu seç" hint="Üye olduğun hastalık grupları" />
          <GroupCards groups={myGroups} value={diseaseGroupId} onChange={pickGroup} />
        </>
      )}

      {!showGroupStep && (
        <Box sx={{ borderRadius: 4, bgcolor: 'brand.surfaceAlt', overflow: 'hidden' }}>
          <SummaryRow
            icon={<GroupsRounded />}
            label="Grup"
            value={groupName}
            onChange={canChooseGroup ? () => setEditing('group') : null}
            changeLabel="Grubu değiştir"
          />
          {selectedTopic && !showTopicStep && (
            <>
              <Box sx={{ height: '1px', bgcolor: 'divider', mx: 1.5 }} />
              <SummaryRow
                icon={<ForumOutlined />}
                label="Konu"
                value={selectedTopic.name}
                onChange={Array.isArray(subGroups) && subGroups.length > 1 ? () => setEditing('topic') : null}
                changeLabel="Konuyu değiştir"
              />
            </>
          )}
        </Box>
      )}

      {showTopicStep && (
        <Box sx={{ mt: 2 }}>
          <StepTitle
            step={canChooseGroup ? 2 : 1}
            title="Konuyu seç"
            hint={groupName ? `${groupName} grubunun içindeki başlıklar` : undefined}
          />
          {subGroups === undefined ? (
            <Stack spacing={0.75}>
              {[0, 1, 2].map(i => <Skeleton key={i} variant="rounded" height={56} />)}
            </Stack>
          ) : subGroups.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Bu grupta henüz konu yok.</Typography>
          ) : (
            <TopicList topics={subGroups} value={subGroupId} onChange={pickTopic} />
          )}
        </Box>
      )}

      {showGroupStep && diseaseGroupId == null && (
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1, color: 'text.secondary' }}>
          <ChevronRightRounded sx={{ fontSize: 18 }} />
          <Typography variant="caption">Grubu seçince, içindeki konulardan birini seçeceksin.</Typography>
        </Stack>
      )}
    </Box>
  )
}
