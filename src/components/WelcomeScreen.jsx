import { Box, Button, Typography, Stack } from "@mui/material"
import { useNavigate } from "react-router-dom"

export default function WelcomeScreen() {
  const navigate = useNavigate()
  
  return (
    <Box sx={{ 
      minHeight: "100vh", 
      bgcolor: "background.default", 
      display: "flex", 
      alignItems: "center",
      justifyContent: "center",
      px: 3
    }}>
      <Box sx={{ maxWidth: 400, textAlign: "center" }}>
        <Box 
          component="img" 
          src="/sagliktanLogo.png" 
          alt="Sağlıktan" 
          sx={{ width: 64, height: 64, borderRadius: "50%", mb: 4 }} 
        />
        
        <Typography variant="h1" sx={{ mb: 1.5 }}>
          Sağlıktan
        </Typography>
        
        <Typography variant="body1" sx={{ color: "text.secondary", mb: 5, lineHeight: 1.7 }}>
          Kronik hastalar ve sağlık uzmanları için güvenilir sosyal platform
        </Typography>
        
        <Stack spacing={2}>
          <Button 
            variant="contained" 
            onClick={() => navigate("/login")} 
            fullWidth
            size="large"
          >
            Giriş Yap
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate("/register")} 
            fullWidth
            size="large"
          >
            Kayıt Ol
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
