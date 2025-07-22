import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${theme.colors.background};
`;

const Header = styled.header`
  background-color: ${theme.colors.text};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  color: ${theme.colors.white};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: ${theme.shadows.md};
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${theme.spacing.lg};
  align-items: center;
`;

const NavLink = styled.a`
  color: ${theme.colors.white};
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
  padding-top: calc(80px + ${theme.spacing.xl});
`;

const ProfileCard = styled.div`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.white};
  font-size: 3rem;
  font-weight: 600;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Name = styled.h2`
  font-size: ${theme.typography.h2.fontSize};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const Role = styled.p`
  color: ${theme.colors.secondary};
  font-size: 1.1rem;
  margin-bottom: ${theme.spacing.md};
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const Label = styled.label`
  color: ${theme.colors.text};
  font-weight: 500;
`;

const Input = styled.input`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.secondary};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.body.fontSize};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
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
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

const Profile = ({ user, onNavigateToDashboard, onLogout }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    surname: user.surname || '',
    email: user.email || '',
    dateOfBirth: user.dateOfBirth || '',
    phone: user.phone || '',
    address: user.address || '',
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
    // Here you would typically make an API call to update the user's profile
    console.log('Updated profile data:', formData);
  };

  const getInitials = () => {
    return `${formData.name?.[0] || ''}${formData.surname?.[0] || ''}`.toUpperCase();
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo>Sağlıktan</Logo>
          <Nav>
            <NavLink href="#" onClick={onNavigateToDashboard}>Ana Sayfa</NavLink>
            <NavLink href="#" onClick={onLogout}>Çıkış Yap</NavLink>
          </Nav>
        </HeaderContent>
      </Header>

      <Main>
        <ProfileCard>
          <ProfileHeader>
            <Avatar>{getInitials()}</Avatar>
            <ProfileInfo>
              <Name>{`${formData.name} ${formData.surname}`}</Name>
              <Role>{user.role === 'doctor' ? 'Doktor' : 'Hasta'}</Role>
            </ProfileInfo>
          </ProfileHeader>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Ad</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <Label>Soyad</Label>
              <Input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <Label>E-posta</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <Label>Doğum Tarihi</Label>
              <Input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <Label>Telefon</Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <Label>Adres</Label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </FormGroup>

            <Button type="submit">Profili Güncelle</Button>
          </Form>
        </ProfileCard>
      </Main>
    </Container>
  );
};

export default Profile; 