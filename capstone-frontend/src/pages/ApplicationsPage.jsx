import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';

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

  // Controls whether the create application dialog is open
  const [openDialog, setOpenDialog] = useState(false);

  // Stores form values for a new application
  const [formData, setFormData] = useState({
    company_name: '',
    position_title: '',
    stage: 'Saved',
    location: '',
    job_url: '',
    salary_min: '',
    salary_max: '',
    applied_at: '',
    notes: '',
  });

  // Stores submission errors for the create form
  const [submitError, setSubmitError] = useState('');

  /**
   * Fetch applications for the logged-in user.
   * the JWT token is read from localStorage and sent in the Authorization header
   */
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
  /**
   * Runs when the page loads to fetch applications.
   */
  useEffect(() => {
    fetchApplications();
  }, []);

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
  /**
   * Opens the create application dialog.
   */
  function handleOpenDialog() {
    setOpenDialog(true);
    setSubmitError('');
  }

  /**
   * Closes the dialog and resets form errors.
   */
  function handleCloseDialog() {
    setOpenDialog(false);
    setSubmitError('');
  }

  /**
   * Updates form state when the user types into an input.
   */
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /**
   * Fetches the logged-in user's applications from the backend.
   * This is reused after creating a new application so the list refreshes.
   */
  async function fetchApplications() {
    const token = localStorage.getItem('token');

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

  /**
   * Sends a new application to the backend.
   */
  async function handleCreateApplication(event) {
    event.preventDefault();
    setSubmitError('');

    const payload = {
      ...formData,
      salary_min: formData.salary_min ? Number(formData.salary_min) : null,
      salary_max: formData.salary_max ? Number(formData.salary_max) : null,
      applied_at: formData.applied_at || null,
    };
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3001/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create application');
      }

      // Refresh the applications list after successful creation
      await fetchApplications();

      // Reset form fields
      setFormData({
        company_name: '',
        position_title: '',
        stage: 'Saved',
        location: '',
        job_url: '',
        salary_min: '',
        salary_max: '',
        applied_at: '',
        notes: '',
      });

      // Close dialog
      handleCloseDialog();
    } catch (error) {
      setSubmitError(error.message);
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

          <Button variant="contained" onClick={handleOpenDialog}>
            New Application
          </Button>
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
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>New Application</DialogTitle>

        <Box component="form" onSubmit={handleCreateApplication}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {submitError && <Alert severity="error">{submitError}</Alert>}

              <TextField
                label="Company Name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                fullWidth
              />

              <TextField
                label="Position Title"
                name="position_title"
                value={formData.position_title}
                onChange={handleChange}
                required
                fullWidth
              />

              <TextField
                select
                label="Stage"
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="Saved">Saved</MenuItem>
                <MenuItem value="Applied">Applied</MenuItem>
                <MenuItem value="Interviewing">Interviewing</MenuItem>
                <MenuItem value="Offer">Offer</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </TextField>

              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                label="Job URL"
                name="job_url"
                value={formData.job_url}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                label="Salary Min"
                name="salary_min"
                type="number"
                value={formData.salary_min}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                label="Salary Max"
                name="salary_max"
                type="number"
                value={formData.salary_max}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                name="applied_at"
                type="date"
                value={formData.applied_at}
                onChange={handleChange}
                fullWidth
                slotProps={{ InputLabel: { shrink: true } }}
              />

              <TextField
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={3}
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AppLayout>
  );
}

export default ApplicationsPage;
