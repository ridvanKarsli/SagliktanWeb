import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.background};
  padding: ${theme.spacing.xl};
`;

const FormCard = styled.div`
  background-color: ${theme.colors.white};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  width: 100%;
  max-width: ${theme.maxWidth.form};
`;

const Title = styled.h1`
  font-size: ${theme.typography.h1.fontSize};
  font-weight: ${theme.typography.h1.fontWeight};
  color: ${theme.colors.text};
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  grid-column: ${props => props.fullWidth ? 'span 2' : 'span 1'};

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-column: span 1;
  }
`;

const Label = styled.label`
  color: ${theme.colors.text};
  font-weight: 500;
`;

const Input = styled.input`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.secondary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.body.fontSize};
  transition: ${theme.transitions.default};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(52, 195, 161, 0.1);
  }
`;

const Select = styled.select`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.secondary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.body.fontSize};
  background-color: ${theme.colors.white};
  transition: ${theme.transitions.default};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(52, 195, 161, 0.1);
  }
`;

const Button = styled.button`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: 1.1rem;
  font-weight: 600;
  grid-column: span 2;
  transition: ${theme.transitions.default};

  &:hover {
    background-color: ${theme.colors.secondary};
    transform: translateY(-2px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 195, 161, 0.3);
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: ${theme.spacing.lg};
  color: ${theme.colors.text};

  a {
    color: ${theme.colors.secondary};
    text-decoration: none;
    font-weight: 600;
    margin-left: ${theme.spacing.xs};
    transition: ${theme.transitions.default};

    &:hover {
      color: ${theme.colors.primary};
    }
  }
`;

const SignUp = ({ onSignUp, onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    role: 'patient',
    dateOfBirth: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSignUp(formData);
  };

  return (
    <Container>
      <FormCard>
        <Title>Kayıt Ol</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Ad</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="surname">Soyad</Label>
            <Input
              type="text"
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="role">Rol</Label>
            <Select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="patient">Hasta</option>
              <option value="doctor">Doktor</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="dateOfBirth">Doğum Tarihi</Label>
            <Input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup fullWidth>
            <Label htmlFor="email">E-posta</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup fullWidth>
            <Label htmlFor="password">Şifre</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
            />
          </FormGroup>

          <Button type="submit">Kayıt Ol</Button>
        </Form>

        <LoginLink>
          Zaten hesabınız var mı?
          <a href="#" onClick={onNavigateToLogin}>Giriş Yap</a>
        </LoginLink>
      </FormCard>
    </Container>
  );
};

export default SignUp; 