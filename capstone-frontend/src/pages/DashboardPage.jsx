import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Stack, TextField, Typography } from '@mui/material';

import AppLayout from '../components/AppLayout';
import { navigateToRecord } from '../utils/navigation';

function DashboardPage() {
  // Used to redirect user if authentication token is missing
  const navigate = useNavigate();

  // Stores records fetched from the backend API
  const [applications, setApplications] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Used to show loading state while data is being fetched
  const [loading, setLoading] = useState(true);

  /**
   * Fetch records belonging to the logged-in user.
   * The request includes the JWT token stored in localStorage.
   * If the token is missing or invalid, the user is redirected
   * back to the authentication page.
   */
  useEffect(() => {
    async function fetchDashboardData() {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [applicationsRes, contactsRes, activitiesRes, tasksRes] =
          await Promise.all([
            fetch('http://localhost:3001/applications', { headers }),
            fetch('http://localhost:3001/contacts', { headers }),
            fetch('http://localhost:3001/activities', { headers }),
            fetch('http://localhost:3001/tasks', { headers }),
          ]);

        const [applicationsData, contactsData, activitiesData, tasksData] =
          await Promise.all([
            applicationsRes.json(),
            contactsRes.json(),
            activitiesRes.json(),
            tasksRes.json(),
          ]);

        if (!applicationsRes.ok) {
          throw new Error(applicationsData.error || 'Failed to fetch applications');
        }

        if (!contactsRes.ok) {
          throw new Error(contactsData.error || 'Failed to fetch contacts');
        }

        if (!activitiesRes.ok) {
          throw new Error(activitiesData.error || 'Failed to fetch activities');
        }

        if (!tasksRes.ok) {
          throw new Error(tasksData.error || 'Failed to fetch tasks');
        }

        setApplications(applicationsData);
        setContacts(contactsData);
        setActivities(activitiesData);
        setTasks(tasksData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
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
  const taskCount = tasks.length;

  // recent records array
  const recentRecords = useMemo(() => {
    const applicationRecords = applications.map((application) => ({
      id: application.id,
      recordType: 'application',
      title: `${application.company_name}`,
      subtitle: `${application.position_title} • Application`,
      timestamp: application.updatedAt || application.createdAt,
      meta: `Stage: ${application.stage}`,
    }));

    const contactRecords = contacts.map((contact) => ({
      id: contact.id,
      recordType: 'contact',
      title: contact.name || 'Unnamed Contact',
      subtitle: `${contact.application?.company_name || 'General'} • Contact`,
      timestamp: contact.updatedAt || contact.createdAt,
      meta: contact.title || contact.contact_type || 'No role provided',
    }));

    const activityRecords = activities.map((activity) => ({
      id: activity.id,
      recordType: 'activity',
      title: activity.type || 'Activity',
      subtitle: `${activity.application?.company_name || 'General'} • Activity`,
      timestamp: activity.updatedAt || activity.createdAt,
      meta: activity.summary || 'No summary provided',
    }));

    const taskRecords = tasks.map((task) => ({
      id: task.id,
      recordType: 'task',
      title: task.title || 'Untitled Task',
      subtitle: `${task.application?.company_name || 'General'} • Task`,
      timestamp: task.updatedAt || task.createdAt,
      meta: `Status: ${task.status || 'Open'}`,
    }));

    return [
      ...applicationRecords,
      ...contactRecords,
      ...activityRecords,
      ...taskRecords,
    ]
      .filter((record) => record.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  }, [applications, contacts, activities, tasks]);

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

        {/* Recent activity / recent records section */}
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
            Recent
          </Typography>

          <Stack spacing={2}>
            {recentRecords.map((record) => (
              <Paper
                key={`${record.recordType}-${record.id}`}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: '0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.02)',
                  },
                }}
                onClick={() => navigateToRecord(navigate, record.recordType, record.id)}
              >
                <Typography variant="h6">{record.title}</Typography>

                <Typography>{record.subtitle}</Typography>

                <Typography variant="body2" color="text.secondary">
                  {record.meta}
                </Typography>
              </Paper>
            ))}

            {!loading && recentRecords.length === 0 && (
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
