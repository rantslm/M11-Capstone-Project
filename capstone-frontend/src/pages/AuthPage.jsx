import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';

function AuthPage() {
  const navigate = useNavigate();

  // Controls whether the auth card is showing login or register
  const [tabValue, setTabValue] = useState(0);

  // Shared form state for auth inputs
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // UI feedback state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleTabChange(event, newValue) {
    setTabValue(newValue);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const isLogin = tabValue === 0;
    const endpoint = isLogin
      ? 'http://localhost:3001/auth/login'
      : 'http://localhost:3001/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLogin) {
        // Store auth data for protected requests
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        navigate('/applications');
      } else {
        setSuccess('Registration successful. You can now log in.');
        setTabValue(0);
        setFormData({
          email: '',
          password: '',
        });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
          alignItems: 'center',
          gap: 4,
          py: 6,
        }}
      >
        {/* Left side: startup / intro content */}
        <Box>
          <Typography variant="h3" gutterBottom>
            Job Application Tracker
          </Typography>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Organize applications, contacts, interviews, and follow-ups in one place.
          </Typography>

          <Typography variant="body1">
            Track each opportunity by company and position, manage recruiter and hiring
            manager contacts, log interview activity, and stay on top of tasks
            throughout your job search.
          </Typography>
        </Box>

        {/* Right side: auth card */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom>
            Welcome
          </Typography>

          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Button
              variant="contained"
              type="submit"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading
                ? tabValue === 0
                  ? 'Logging in...'
                  : 'Registering...'
                : tabValue === 0
                  ? 'Login'
                  : 'Register'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default AuthPage;
