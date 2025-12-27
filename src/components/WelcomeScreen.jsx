import { Box, Button, Typography, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function WelcomeScreen({ onContinue }) {
  const navigate = useNavigate()

  const handleContinue = () => {
    if (onContinue) {
      onContinue()
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 6 }
      }}
    >
      <Stack
        spacing={4}
        alignItems="center"
        sx={{
          maxWidth: 500,
          width: '100%',
          textAlign: 'center'
        }}
      >
        {/* Konuşma Baloncuğu */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            mb: 2,
            animation: 'fadeInDown 0.6s ease-out',
            '@keyframes fadeInDown': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-20px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <Box
            sx={{
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              px: { xs: 3, sm: 4 },
              py: { xs: 2.5, sm: 3 },
              borderRadius: 4,
              position: 'relative',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '16px solid transparent',
                borderRight: '16px solid transparent',
                borderTop: `16px solid`,
                borderTopColor: 'primary.main',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: 22, sm: 26 },
                lineHeight: 1.4,
                mb: 1
              }}
            >
              Aramıza Hoş Geldin! 🎉
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: 15, sm: 17 },
                opacity: 0.95,
                lineHeight: 1.6
              }}
            >
              Artık Sagliktan ailesinin bir parçasısın. Hemen giriş yap ve keşfetmeye başla!
            </Typography>
          </Box>
        </Box>

        {/* Lumo Görseli */}
        <Box
          sx={{
            width: { xs: 200, sm: 250 },
            height: { xs: 200, sm: 250 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeInUp 0.8s ease-out 0.2s both, bounce 2s ease-in-out infinite 1s',
            '@keyframes fadeInUp': {
              '0%': {
                opacity: 0,
                transform: 'translateY(30px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            },
            '@keyframes bounce': {
              '0%, 100%': {
                transform: 'translateY(0)'
              },
              '50%': {
                transform: 'translateY(-12px)'
              }
            }
          }}
        >
          <Box
            component="img"
            src="/Lumo.png"
            alt="Lumo"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))'
            }}
          />
        </Box>

        {/* Devam Et Butonu */}
        <Button
          variant="contained"
          size="large"
          onClick={handleContinue}
          sx={{
            minWidth: { xs: 200, sm: 240 },
            minHeight: { xs: 48, sm: 52 },
            fontSize: { xs: 16, sm: 18 },
            fontWeight: 600,
            px: { xs: 4, sm: 5 },
            py: { xs: 1.5, sm: 1.75 },
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            animation: 'fadeInUp 0.8s ease-out 0.4s both',
            '@keyframes fadeInUp': {
              '0%': {
                opacity: 0,
                transform: 'translateY(30px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            },
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Giriş Yap
        </Button>
      </Stack>
    </Box>
  )
}

