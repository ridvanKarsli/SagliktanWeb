import { Alert, Box, Button, Skeleton, Stack, Typography } from '@mui/material'
import { GroupsRounded, PlaceOutlined } from '@mui/icons-material'
import ChoiceChips from './ChoiceChips.jsx'

function ChipSkeletons({ widths }) {
  return (
    <Stack direction="row" spacing={1}>
      {widths.map(w => <Skeleton key={w} variant="rounded" width={w} height={40} sx={{ borderRadius: 999 }} />)}
    </Stack>
  )
}

function GroupLabel({ name }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
      <GroupsRounded sx={{ fontSize: 18 }} />
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{name}</Typography>
    </Stack>
  )
}

// "Nereye paylaşıyorsun?" bölümü:
// - presetSubGroup varsa hedef sabittir, yalnızca gösterilir;
// - hastalık grubu sabitse (fixedDgId) sadece alt grup seçilir;
// - aksi halde önce üye olunan gruplardan biri, sonra alt grubu seçilir.
export default function PostTargetPicker({
  presetSubGroup, myGroups, fixedDgId, fixedDgName,
  diseaseGroupId, onDiseaseGroupChange, subGroups, subGroupId, onSubGroupChange, onExploreGroups
}) {
  if (presetSubGroup) {
    return (
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary', minWidth: 0 }}>
        <PlaceOutlined sx={{ fontSize: 18, flexShrink: 0 }} />
        <Typography variant="body2" noWrap>
          {presetSubGroup.diseaseGroupName ? `${presetSubGroup.diseaseGroupName} › ` : ''}
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>{presetSubGroup.name}</Box>
        </Typography>
      </Stack>
    )
  }

  if (myGroups === null) {
    return (
      <Stack spacing={1}>
        <Skeleton variant="text" width={140} />
        <ChipSkeletons widths={[96, 120, 80]} />
      </Stack>
    )
  }

  if (myGroups.length === 0 && fixedDgId == null) {
    return (
      <Alert
        severity="info"
        icon={<GroupsRounded />}
        action={
          <Button color="inherit" size="small" onClick={onExploreGroups} sx={{ minHeight: 36 }}>
            Keşfet
          </Button>
        }
      >
        Paylaşım yapmak için önce bir hastalık grubuna katılmalısın.
      </Alert>
    )
  }

  const canChooseGroup = fixedDgId == null && myGroups.length > 1
  return (
    <Box>
      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.6, lineHeight: 1.6 }}>
        Nereye paylaşıyorsun?
      </Typography>
      {canChooseGroup && (
        <Box sx={{ mt: 0.75 }}>
          <ChoiceChips
            ariaLabel="Hastalık grubu"
            items={myGroups}
            value={diseaseGroupId}
            onChange={onDiseaseGroupChange}
            getLabel={(g) => g.name}
          />
        </Box>
      )}
      {fixedDgId != null && fixedDgName && <GroupLabel name={fixedDgName} />}
      {fixedDgId == null && myGroups.length === 1 && <GroupLabel name={myGroups[0].name} />}
      {diseaseGroupId != null && (
        <Box sx={{ mt: 1 }}>
          {subGroups === undefined ? (
            <ChipSkeletons widths={[110, 90, 130]} />
          ) : subGroups.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Bu grupta henüz alt grup yok.</Typography>
          ) : (
            <ChoiceChips
              ariaLabel="Alt grup"
              wrap
              items={subGroups}
              value={subGroupId}
              onChange={onSubGroupChange}
              getLabel={(s) => s.name}
            />
          )}
        </Box>
      )}
      {diseaseGroupId == null && canChooseGroup && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          Önce bir grup seç, ardından konu başlığını (alt grup).
        </Typography>
      )}
    </Box>
  )
}
