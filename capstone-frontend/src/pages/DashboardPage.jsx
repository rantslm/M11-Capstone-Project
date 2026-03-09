import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Stack, TextField, Typography } from '@mui/material';

import AppLayout from '../components/AppLayout';

function DashboardPage() {
  // Used to redirect user if authentication token is missing
  const navigate = useNavigate();

  // Stores application records fetched from the backend API
  const [applications, setApplications] = useState([]);

  // Used to show loading state while data is being fetched
  const [loading, setLoading] = useState(true);

  /**
   * Fetch applications belonging to the logged-in user.
   * The request includes the JWT token stored in localStorage.
   * If the token is missing or invalid, the user is redirected
   * back to the authentication page.
   */
  useEffect(() => {
    async function fetchApplications() {
      const token = localStorage.getItem('token');

      // If no token exists, user is not authenticated
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

        // Store applications returned from backend
        setApplications(data);
      } catch (error) {
        console.error(error);
      } finally {
        // Stop loading indicator
        setLoading(false);
      }
    }

    fetchApplications();
  }, [navigate]);

  /**
   * Dashboard statistics derived from application data.
   * These values are calculated from the fetched applications.
   */

  // Total applications
  const activeApplications = applications.length;

  // Count of applications currently in interviewing stage
  const interviewingCount = applications.filter(
    (app) => app.stage === 'Interviewing'
  ).length;

  // Count of applications that resulted in offers
  const offerCount = applications.filter((app) => app.stage === 'Offer').length;

  // Total number of tasks across all applications
  const taskCount = applications.reduce(
    (total, app) => total + (app.tasks?.length || 0),
    0
  );

  return (
    <AppLayout title="Dashboard">
      <Stack spacing={4}>
        {/* Header section with overview title and search field */}
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
            Overview
          </Typography>

          {/* Search field (future feature for filtering results) */}
          <TextField size="small" placeholder="Search" />
        </Box>

        {/* Overview statistic cards */}
        <Grid container spacing={2}>
          {/* Active applications count */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h4" fontWeight={700}>
                {loading ? '—' : activeApplications}
              </Typography>
              <Typography>Active Applications</Typography>
            </Paper>
          </Grid>

          {/* Interviewing stage count */}
          <Grid size xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h4" fontWeight={700}>
                {loading ? '—' : interviewingCount}
              </Typography>
              <Typography>Interviews Scheduled</Typography>
            </Paper>
          </Grid>

          {/* Offers received count */}
          <Grid size xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h4" fontWeight={700}>
                {loading ? '—' : offerCount}
              </Typography>
              <Typography>Offers</Typography>
            </Paper>
          </Grid>

          {/* Total tasks across all applications */}
          <Grid size xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h4" fontWeight={700}>
                {loading ? '—' : taskCount}
              </Typography>
              <Typography>Tasks</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent activity / recent applications section */}
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
            Recent
          </Typography>

          <Stack spacing={2}>
            {/* Show the first five applications */}
            {applications.slice(0, 5).map((application) => (
              <Paper key={application.id} sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="h6">{application.company_name}</Typography>

                <Typography>{application.position_title}</Typography>

                <Typography variant="body2" color="text.secondary">
                  Stage: {application.stage}
                </Typography>
              </Paper>
            ))}

            {/* Display empty state if user has no applications */}
            {!loading && applications.length === 0 && (
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Typography>No recent items yet.</Typography>
              </Paper>
            )}
          </Stack>
        </Box>
      </Stack>
    </AppLayout>
  );
}

export default DashboardPage;
