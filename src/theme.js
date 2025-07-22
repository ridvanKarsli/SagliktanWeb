const theme = {
  colors: {
    background: '#FAF9F6',
    text: '#0B3A4E',
    primary: '#34C3A1',
    secondary: '#1B7A85',
    white: '#FFFFFF',
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', 'Open Sans', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    body: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    small: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
  },
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
  maxWidth: {
    container: '640px',
    form: '480px',
  },
  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.2s ease',
  },
};

export { theme }; 