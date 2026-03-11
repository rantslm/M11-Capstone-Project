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

  // Tracks whether the dialog is creating a new application or editing one
  const [isEditMode, setIsEditMode] = useState(false);

  // Stores the application currently being edited
  const [editingApplicationId, setEditingApplicationId] = useState(null);

  // Stores text entered into the search field
  const [searchTerm, setSearchTerm] = useState('');

  // Stores selected stage filter
  const [stageFilter, setStageFilter] = useState('All');

  // Controls whether the archive dialog is open
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);

  // Stores the application selected for archiving
  const [archivingApplicationId, setArchivingApplicationId] = useState(null);

  // Stores the archive reason selected in the archive dialog
  const [archiveReason, setArchiveReason] = useState('Rejected');

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
   * Opens the dialog in create mode.
   */
  function handleOpenDialog() {
    setIsEditMode(false);
    setEditingApplicationId(null);
    setSubmitError('');
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
    setOpenDialog(true);
  }

  /**
   * Opens the dialog in edit mode and preloads the selected application data.
   */
  function handleOpenEditDialog(application) {
    setIsEditMode(true);
    setEditingApplicationId(application.id);
    setSubmitError('');
    setFormData({
      company_name: application.company_name || '',
      position_title: application.position_title || '',
      stage: application.stage || 'Saved',
      location: application.location || '',
      job_url: application.job_url || '',
      salary_min: application.salary_min ?? '',
      salary_max: application.salary_max ?? '',
      applied_at: application.applied_at ? application.applied_at.slice(0, 10) : '',
      notes: application.notes || '',
    });
    setOpenDialog(true);
  }

  /**
   * Closes the dialog and clears mode-specific state.
   */
  function handleCloseDialog() {
    setOpenDialog(false);
    setSubmitError('');
    setIsEditMode(false);
    setEditingApplicationId(null);
  }
  /**
   * Opens the archive dialog for the selected application.
   */
  function handleOpenArchiveDialog(applicationId) {
    setArchivingApplicationId(applicationId);
    setArchiveReason('Rejected');
    setSubmitError('');
    setOpenArchiveDialog(true);
  }

  /**
   * Closes the archive dialog and clears archive state.
   */
  function handleCloseArchiveDialog() {
    setOpenArchiveDialog(false);
    setArchivingApplicationId(null);
    setArchiveReason('Rejected');
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
  async function handleSubmitApplication(event) {
    event.preventDefault();
    setSubmitError('');

    const token = localStorage.getItem('token');

    const payload = {
      ...formData,
      salary_min: formData.salary_min ? Number(formData.salary_min) : null,
      salary_max: formData.salary_max ? Number(formData.salary_max) : null,
      applied_at: formData.applied_at || null,
    };

    const url = isEditMode
      ? `http://localhost:3001/applications/${editingApplicationId}`
      : 'http://localhost:3001/applications';

    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save application');
      }

      await fetchApplications();
      handleCloseDialog();
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  /**
   * Archives an application with the selected archive reason.
   */
  async function handleArchiveApplication() {
    if (!archivingApplicationId) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `http://localhost:3001/applications/${archivingApplicationId}/archive`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            archive_reason: archiveReason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to archive application');
      }

      await fetchApplications();
      setSubmitError('');
      handleCloseArchiveDialog();
    } catch (error) {
      setSubmitError(error.message);
    }
  }
  /**
   * Filters applications based on search term and selected stage.
   */
  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.position_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (application.location || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = stageFilter === 'All' || application.stage === stageFilter;

    return matchesSearch && matchesStage;
  });

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
          <TextField
            size="small"
            label="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <TextField
            select
            size="small"
            label="Stage"
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Saved">Saved</MenuItem>
            <MenuItem value="Applied">Applied</MenuItem>
            <MenuItem value="Interviewing">Interviewing</MenuItem>
            <MenuItem value="Offer">Offer</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
          <Button variant="contained" onClick={handleOpenDialog}>
            New Application
          </Button>
        </Box>

        {/* Error message if fetch fails */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Loading state */}
        {loading ? (
          <Typography>Loading applications...</Typography>
        ) : filteredApplications.length === 0 ? (
          // Empty state if user has no applications yet
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              No applications yet
            </Typography>
            <Typography>
              Try adjusting your search or filter, or create a new application.
            </Typography>
          </Paper>
        ) : (
          // Application cards
          <Stack spacing={2}>
            {filteredApplications.map((application) => (
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
                  <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenEditDialog(application)}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleOpenArchiveDialog(application.id)}
                    >
                      Archive
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{isEditMode ? 'Edit Application' : 'New Application'}</DialogTitle>

        <Box component="form" onSubmit={handleSubmitApplication}>
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
                InputLabelProps={{ shrink: true }}
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
              {isEditMode ? 'Save Changes' : 'New Application'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      {/* Archive dialog used to move an active application into the archive
          with a required archive reason.*/}
      <Dialog
        open={openArchiveDialog}
        onClose={handleCloseArchiveDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Archive Application</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <Typography color="text.secondary">
              Select a reason for moving this application to the archive.
            </Typography>

            <TextField
              select
              label="Reason"
              value={archiveReason}
              onChange={(event) => setArchiveReason(event.target.value)}
              fullWidth
            >
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="Offer Declined">Offer Declined</MenuItem>
              <MenuItem value="Withdrawn">Withdrawn</MenuItem>
              <MenuItem value="Position Closed">Position Closed</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseArchiveDialog}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleArchiveApplication}>
            Archive
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}

export default ApplicationsPage;
