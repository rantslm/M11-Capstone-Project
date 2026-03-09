import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Alert, Paper, Stack, Chip } from '@mui/material';

import AppLayout from '../components/AppLayout';

function ApplicationsPage() {
  // Used to redirect user if they are not authenticated
  const navigate = useNavigate();

  // Stores fetched application records
  const [applications, setApplications] = useState([]);

  // UI feedback state
  const [error, setError] = useState('');
  // Controls loading state while API request is running
  const [loading, setLoading] = useState(true);

  /**
   * Fetch applications for the logged-in user.
   * If no token exists, redirect back to auth page.
   */
  useEffect(() => {
    async function fetchApplications() {
      const token = localStorage.getItem('token');
      // If no token exists, redirect back to auth page
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/applications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch applications');
        }

        setApplications(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [navigate]);

  /**
   * Returns a simple MUI Chip color based on application stage.
   */
  function getStageColor(stage) {
    switch (stage) {
      case 'Saved':
        return 'default';
      case 'Applied':
        return 'primary';
      case 'Interviewing':
        return 'secondary';
      case 'Offer':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  }

  return (
    <AppLayout title="Applications">
      <Stack spacing={3}>
        {/* Page header with button placeholder for future create form */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            My Applications
          </Typography>

          <Button variant="contained">New Application</Button>
        </Box>

        {/* Error message if fetch fails */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Loading state */}
        {loading ? (
          <Typography>Loading applications...</Typography>
        ) : applications.length === 0 ? (
          // Empty state if user has no applications yet
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              No applications yet
            </Typography>
            <Typography>
              Create your first application to start tracking your job search.
            </Typography>
          </Paper>
        ) : (
          // Application cards
          <Stack spacing={2}>
            {applications.map((application) => (
              <Paper key={application.id} sx={{ p: 3, borderRadius: 3 }}>
                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', md: 'center' },
                      gap: 2,
                      flexDirection: { xs: 'column', md: 'row' },
                    }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {application.company_name} — {application.position_title}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {application.location || 'Location not provided'}
                      </Typography>
                    </Box>

                    {/* Stage indicator */}
                    <Chip
                      label={application.stage}
                      color={getStageColor(application.stage)}
                    />
                  </Box>

                  {/* Secondary details */}
                  <Typography variant="body2">
                    Job URL: {application.job_url || 'Not provided'}
                  </Typography>

                  <Typography variant="body2">
                    Contacts: {application.contacts?.length || 0}
                  </Typography>

                  <Typography variant="body2">
                    Activities: {application.activities?.length || 0}
                  </Typography>

                  <Typography variant="body2">
                    Tasks: {application.tasks?.length || 0}
                  </Typography>

                  {application.notes && (
                    <Typography variant="body2">Notes: {application.notes}</Typography>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </AppLayout>
  );
}

export default ApplicationsPage;
