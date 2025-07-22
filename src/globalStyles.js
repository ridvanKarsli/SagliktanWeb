import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
    height: 100%;
  }

  body {
    font-family: ${theme.typography.fontFamily};
    background-color: ${theme.colors.background};
    color: ${theme.colors.text};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .app-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
  }

  button {
    cursor: pointer;
    border: none;
    border-radius: ${theme.borderRadius.md};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-family: ${theme.typography.fontFamily};
    font-weight: 500;
    transition: ${theme.transitions.default};
    background-color: ${theme.colors.primary};
    color: ${theme.colors.white};
    width: 100%;
    max-width: 100%;

    &:hover {
      background-color: ${theme.colors.secondary};
      transform: translateY(-1px);
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(52, 195, 161, 0.3);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }
  }

  input, select, textarea {
    width: 100%;
    padding: ${theme.spacing.sm};
    border: 1px solid ${theme.colors.secondary};
    border-radius: ${theme.borderRadius.md};
    font-family: ${theme.typography.fontFamily};
    font-size: ${theme.typography.body.fontSize};
    margin-bottom: ${theme.spacing.sm};
    transition: ${theme.transitions.default};
    background-color: ${theme.colors.white};

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 3px rgba(52, 195, 161, 0.1);
    }

    &::placeholder {
      color: ${theme.colors.secondary};
      opacity: 0.7;
    }

    &:disabled {
      background-color: ${theme.colors.background};
      cursor: not-allowed;
    }
  }

  label {
    display: block;
    margin-bottom: ${theme.spacing.xs};
    color: ${theme.colors.text};
    font-weight: 500;
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${theme.colors.text};
    margin-bottom: ${theme.spacing.md};
    line-height: 1.2;
    font-family: ${theme.typography.fontFamily};
  }

  a {
    color: ${theme.colors.secondary};
    text-decoration: none;
    transition: ${theme.transitions.default};

    &:hover {
      color: ${theme.colors.primary};
    }
  }

  .container {
    max-width: ${theme.maxWidth.container};
    margin: 0 auto;
    padding: 0 ${theme.spacing.md};
    width: 100%;
  }

  .form-container {
    max-width: ${theme.maxWidth.form};
    margin: 0 auto;
    padding: ${theme.spacing.xl};
    background-color: ${theme.colors.white};
    border-radius: ${theme.borderRadius.lg};
    box-shadow: ${theme.shadows.md};
    width: 100%;
  }

  /* Page Transitions */
  .page-enter {
    opacity: 0;
    transform: translateY(20px);
  }

  .page-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 300ms, transform 300ms;
  }

  .page-exit {
    opacity: 1;
  }

  .page-exit-active {
    opacity: 0;
    transition: opacity 300ms;
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    html {
      font-size: 14px;
    }

    .container {
      padding: 0 ${theme.spacing.sm};
    }

    input, select, textarea {
      padding: ${theme.spacing.md};
    }

    .form-container {
      padding: ${theme.spacing.lg};
    }
  }

  /* Accessibility */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Focus styles */
  :focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.secondary};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.primary};
  }

  /* Form validation styles */
  input:invalid,
  select:invalid,
  textarea:invalid {
    border-color: #ff4d4f;
  }

  .error-message {
    color: #ff4d4f;
    font-size: ${theme.typography.small.fontSize};
    margin-top: -${theme.spacing.xs};
    margin-bottom: ${theme.spacing.sm};
  }

  /* Loading states */
  .loading {
    opacity: 0.7;
    pointer-events: none;
  }

  /* Responsive images */
  img {
    max-width: 100%;
    height: auto;
  }
`;

export { GlobalStyles }; 