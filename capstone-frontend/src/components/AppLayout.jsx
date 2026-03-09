import { NavLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';

function AppLayout({ title, children }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Applications', path: '/applications' },
    { label: 'Contacts', path: '/contacts' },
    { label: 'Tasks', path: '/tasks' },
    { label: 'Activity', path: '/activity' },
    { label: 'Archive', path: '/archive' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#F5F6F8' }}>
      <Box
        sx={{
          width: 220,
          bgcolor: '#ECEEF2',
          borderRight: '1px solid #d0d4db',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            Job Tracker
          </Typography>
        </Box>

        <Divider />

        <List sx={{ pt: 1 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 2,
                '&.active': {
                  bgcolor: '#ffffff',
                },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button variant="outlined" fullWidth onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Box
          sx={{
            px: 4,
            py: 3,
            bgcolor: '#F5F6F8',
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ px: 4, pb: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>{children}</Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default AppLayout;
