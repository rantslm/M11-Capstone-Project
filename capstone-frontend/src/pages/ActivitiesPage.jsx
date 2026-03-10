import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  IconButton,
} from '@mui/material';

/* Activity icons */
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import HandshakeIcon from '@mui/icons-material/Handshake';

/* UI icons */
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditNoteIcon from '@mui/icons-material/EditNote';

/* Layout wrapper used across pages */
import AppLayout from '../components/AppLayout';

function ActivitiesPage() {
  // Used to redirect user back to auth page if no token exists
  const navigate = useNavigate();

  // Stores all fetched activities
  const [activities, setActivities] = useState([]);

  // Stores the currently selected activity for the right-side detail panel
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Stores applications for dropdown filtering and create dialog
  const [applications, setApplications] = useState([]);

  // UI state for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search + filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [applicationFilter, setApplicationFilter] = useState('All');
  const [activityTypeFilter, setActivityTypeFilter] = useState('All');

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [dialogMode, setDialogMode] = useState('add');
  const [editingActivityId, setEditingActivityId] = useState(null);
  // Form state for adding a new activity
  const [formData, setFormData] = useState({
    application_id: '',
    type: 'Email',
    occurred_at: '',
    summary: '',
    details: '',
  });

  /**
   * Fetch all activities for the authenticated user across all applications.
   * Activities are sorted newest first, and the first activity is selected by default.
   */
  async function fetchActivities() {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const response = await fetch('http://localhost:3001/activities', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend did not return JSON for activities.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch activities');
      }

      // Sort newest first
      const sortedActivities = [...data].sort(
        (a, b) => new Date(b.occurred_at) - new Date(a.occurred_at)
      );

      setActivities(sortedActivities);

      // Select the top activity by default on page load
      if (sortedActivities.length > 0) {
        setSelectedActivity(sortedActivities[0]);
      } else {
        setSelectedActivity(null);
      }
    } catch (error) {
      setError(error.message);
      setActivities([]);
      setSelectedActivity(null);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Fetch applications for filters and the Add Activity dialog.
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

      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend did not return JSON for applications.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch applications');
      }

      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }

  /**
   * Load page data on first render.
   */
  useEffect(() => {
    fetchActivities();
    fetchApplications();
  }, []);

  /**
   * Opens the Add Activity dialog and resets form state.
   */
  function handleOpenDialog() {
    setDialogMode('add');
    setEditingActivityId(null);
    setSubmitError('');

    setFormData({
      application_id: '',
      type: 'Email',
      occurred_at: '',
      summary: '',
      details: '',
    });

    setOpenDialog(true);
  }
  function handleOpenEditDialog(activity) {
    setDialogMode('edit');
    setEditingActivityId(activity.id);
    setSubmitError('');

    setFormData({
      application_id: activity.application_id || '',
      type: activity.type || 'Email',
      occurred_at: activity.occurred_at
        ? new Date(activity.occurred_at).toISOString().slice(0, 16)
        : '',
      summary: activity.summary || '',
      details: activity.details || '',
    });

    setOpenDialog(true);
  }

  /**
   * Closes the Add Activity dialog.
   */
  function handleCloseDialog() {
    setOpenDialog(false);
    setSubmitError('');
    setDialogMode('add');
    setEditingActivityId(null);
  }
  /**
   * Updates form field state as the user types/selects values.
   */
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /**
   * Creates a new activity for the selected application.
   */
  async function handleSubmitActivity(event) {
    event.preventDefault();
    setSubmitError('');

    const token = localStorage.getItem('token');

    if (!formData.application_id) {
      setSubmitError('Please select an application for this activity.');
      return;
    }

    const payload = {
      application_id: Number(formData.application_id),
      type: formData.type,
      occurred_at: formData.occurred_at,
      summary: formData.summary,
      details: formData.details,
    };

    const url =
      dialogMode === 'edit'
        ? `http://localhost:3001/activities/${editingActivityId}`
        : `http://localhost:3001/activities/application/${formData.application_id}`;

    const method = dialogMode === 'edit' ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(
          `Backend did not return JSON when ${dialogMode === 'edit' ? 'updating' : 'creating'} activity.`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${dialogMode} activity`);
      }

      await fetchActivities();
      handleCloseDialog();
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  /**
   * Creates application filter options from fetched activities.
   */
  const applicationOptions = useMemo(() => {
    const names = activities
      .map((activity) => activity.application?.company_name || 'General')
      .filter((value, index, array) => array.indexOf(value) === index);

    return ['All', ...names];
  }, [activities]);

  /**
   * Filters activities by search term, application, and type.
   * Search checks type, application company name, summary, and details.
   */
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const type = activity.type || '';
      const company = activity.application?.company_name || 'General';
      const summary = activity.summary || '';
      const details = activity.details || '';

      const matchesSearch =
        type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        details.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesApplication =
        applicationFilter === 'All' || company === applicationFilter;

      const matchesType = activityTypeFilter === 'All' || type === activityTypeFilter;

      return matchesSearch && matchesApplication && matchesType;
    });
  }, [activities, searchTerm, applicationFilter, activityTypeFilter]);

  /**
   * If the currently selected activity disappears after filtering,
   * automatically select the first visible activity.
   */
  useEffect(() => {
    if (filteredActivities.length === 0) {
      setSelectedActivity(null);
      return;
    }

    const selectedStillVisible = filteredActivities.some(
      (activity) => activity.id === selectedActivity?.id
    );

    if (!selectedStillVisible) {
      setSelectedActivity(filteredActivities[0]);
    }
  }, [filteredActivities, selectedActivity]);

  /**
   * Formats date for the left activity list.
   */
  function formatActivityDate(dateString) {
    if (!dateString) return 'No date';

    return new Date(dateString).toLocaleDateString();
  }

  /**
   * Formats date and time for the detail panel.
   */
  function formatActivityDateTime(dateString) {
    if (!dateString) return 'Not provided';

    return new Date(dateString).toLocaleString();
  }

  /**
   * Creates a short snippet for activity row preview.
   */
  function getSummarySnippet(text) {
    if (!text) return 'No summary';
    return text.length > 80 ? `${text.slice(0, 80)}...` : text;
  }
  function getActivityIcon(type) {
    switch (type) {
      case 'Call':
        return <PhoneIcon fontSize="small" />;
      case 'Email':
        return <EmailIcon fontSize="small" />;
      case 'Interview':
        return <HandshakeIcon fontSize="small" />;
      case 'Note':
        return <EditNoteIcon fontSize="small" />;
      default:
        return <EmailIcon fontSize="small" />;
    }
  }
  return (
    <AppLayout title="Activities">
      <Stack spacing={3}>
        {/* =========================
          PAGE HEADER
         ========================= */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            flexDirection: { xs: 'column', md: 'row' },
            flexWrap: 'wrap',
          }}
        >
          {/* Page title */}
          <Typography variant="h5" fontWeight={700}>
            Activities
          </Typography>

          {/* Filter by application */}
          <TextField
            select
            size="small"
            label="Application"
            value={applicationFilter}
            onChange={(event) => setApplicationFilter(event.target.value)}
            sx={{ minWidth: 180 }}
          >
            {applicationOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          {/* Filter by activity type */}
          <TextField
            select
            size="small"
            label="Activity Type"
            value={activityTypeFilter}
            onChange={(event) => setActivityTypeFilter(event.target.value)}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Email">Email</MenuItem>
            <MenuItem value="Call">Call</MenuItem>
            <MenuItem value="Interview">Interview</MenuItem>
            <MenuItem value="Note">Note</MenuItem>
          </TextField>

          {/* Search activities by type, company, summary, or details */}
          <TextField
            size="small"
            label="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          {/* Add Activity button */}
          <Button
            variant="contained"
            onClick={handleOpenDialog}
            sx={{
              backgroundColor: '#F59E0B',
              '&:hover': {
                backgroundColor: '#d97706',
              },
            }}
          >
            Add Activity
          </Button>
        </Box>

        {/* Global fetch error */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* =========================
          LOADING / MAIN CONTENT
         ========================= */}
        {loading ? (
          <Typography>Loading activities...</Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.5fr 1fr' },
              gap: 3,
            }}
          >
            {/* =========================
              LEFT PANEL: ACTIVITY LIST
             ========================= */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              {/* Count of filtered activities */}
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {filteredActivities.length}{' '}
                  {filteredActivities.length === 1 ? 'Activity' : 'Activities'}
                </Typography>
              </Box>

              {/* Column headers */}
              <Box
                sx={{
                  px: 3,
                  pb: 1.5,
                  display: 'grid',
                  gridTemplateColumns: '110px 50px 120px 1fr 1.3fr',
                  gap: 2,
                }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Date
                </Typography>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Type
                </Typography>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Activity
                </Typography>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Application
                </Typography>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Summary
                </Typography>
              </Box>

              <Divider />

              {/* Empty state */}
              {filteredActivities.length === 0 ? (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    No activities yet
                  </Typography>
                  <Typography color="text.secondary">
                    Add your first activity to start tracking calls, emails, interviews,
                    and notes.
                  </Typography>
                </Box>
              ) : (
                <Stack divider={<Divider />}>
                  {filteredActivities.map((activity) => {
                    const isSelected = selectedActivity?.id === activity.id;

                    return (
                      <Box
                        key={activity.id}
                        onClick={() => setSelectedActivity(activity)}
                        sx={{
                          cursor: 'pointer',
                          display: 'grid',
                          gridTemplateColumns: '6px 110px 50px 120px 1fr 1.3fr',
                          gap: 2,
                          alignItems: 'center',

                          /* Selected row styling:
                           - left orange selector bar
                           - sheer orange background */
                          bgcolor: isSelected
                            ? 'rgba(245, 158, 11, 0.10)'
                            : 'transparent',
                          transition: '0.2s ease',
                          '&:hover': {
                            bgcolor: isSelected
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(0,0,0,0.03)',
                          },
                        }}
                      >
                        {/* Orange selection bar */}
                        <Box
                          sx={{
                            alignSelf: 'stretch',
                            bgcolor: isSelected ? '#F59E0B' : 'transparent',
                          }}
                        />

                        {/* Date column */}
                        <Box sx={{ py: 2, pl: 1 }}>
                          <Typography variant="body2">
                            {formatActivityDate(activity.occurred_at)}
                          </Typography>
                        </Box>

                        {/* Icon column */}
                        <Box sx={{ py: 2, display: 'flex', alignItems: 'center' }}>
                          {getActivityIcon(activity.type)}
                        </Box>

                        {/* Activity type column */}
                        <Box sx={{ py: 2 }}>
                          <Typography fontWeight={600}>{activity.type}</Typography>
                        </Box>

                        {/* Related application column */}
                        <Box sx={{ py: 2 }}>
                          <Typography color="text.secondary">
                            {activity.application?.company_name || 'General'}
                          </Typography>
                        </Box>

                        {/* Summary snippet column */}
                        <Box sx={{ py: 2, pr: 2 }}>
                          <Typography color="text.secondary">
                            {getSummarySnippet(activity.summary)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Paper>

            {/* =========================
              RIGHT PANEL: ACTIVITY DETAIL
             ========================= */}
            <Paper sx={{ p: 3, borderRadius: 3, minHeight: 420 }}>
              {!selectedActivity ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    No activity selected
                  </Typography>
                  <Typography color="text.secondary">
                    Select an activity from the list to view details.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={3}>
                  {/* Top section with optional edit action */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Activity Detail
                      </Typography>
                      <Typography color="text.secondary">
                        Review the selected activity record.
                      </Typography>
                    </Box>

                    {/* Edit button*/}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenEditDialog(selectedActivity)}
                      sx={{
                        borderColor: '#F59E0B',
                        color: '#B45309',
                        '&:hover': {
                          borderColor: '#D97706',
                          backgroundColor: 'rgba(245, 158, 11, 0.08)',
                        },
                      }}
                    >
                      Edit Activity
                    </Button>
                  </Box>

                  <Divider />

                  {/* Contact block
                    Placeholder for now because current Activity model is linked to Application,
                    not directly to Contact yet. */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Contact
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={600}>
                          Contact link coming soon
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Activities are currently linked to applications. Direct
                          contact linking can be added in a later step.
                        </Typography>
                      </Box>

                      {/* Future link to Contacts page */}
                      <IconButton size="small" disabled>
                        <ArrowForwardIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Activity type block */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Activity Type
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {getActivityIcon(selectedActivity.type)}
                      <Typography>{selectedActivity.type}</Typography>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Related application block */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Related Application
                    </Typography>

                    {selectedActivity.application ? (
                      <Typography>
                        {selectedActivity.application.company_name} —{' '}
                        {selectedActivity.application.position_title}
                      </Typography>
                    ) : (
                      <Typography color="text.secondary">General</Typography>
                    )}
                  </Box>

                  <Divider />

                  {/* Date / time block */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Date and Time
                    </Typography>
                    <Typography color="text.secondary">
                      {formatActivityDateTime(selectedActivity.occurred_at)}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Summary block */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Summary
                    </Typography>
                    <Typography color="text.secondary">
                      {selectedActivity.summary || 'No summary provided'}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Details / notes block */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Notes
                    </Typography>
                    <Typography color="text.secondary">
                      {selectedActivity.details || 'No additional details'}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Paper>
          </Box>
        )}
      </Stack>

      {/* =========================
        PLACEHOLDER ADD ACTIVITY DIALOG
       ========================= */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogMode === 'edit' ? 'Edit Activity' : 'Add Activity'}
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmitActivity}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {submitError && <Alert severity="error">{submitError}</Alert>}

              <TextField
                select
                label="Related Application"
                name="application_id"
                value={formData.application_id}
                onChange={handleChange}
                required
                fullWidth
              >
                {applications.map((application) => (
                  <MenuItem key={application.id} value={application.id}>
                    {application.company_name} — {application.position_title}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Activity Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                fullWidth
              >
                <MenuItem value="Email">Email</MenuItem>
                <MenuItem value="Call">Call</MenuItem>
                <MenuItem value="Interview">Interview</MenuItem>
                <MenuItem value="Note">Note</MenuItem>
              </TextField>

              <TextField
                label="Date and Time"
                name="occurred_at"
                type="datetime-local"
                value={formData.occurred_at}
                onChange={handleChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                required
                fullWidth
              />

              <TextField
                label="Details"
                name="details"
                value={formData.details}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={4}
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#F59E0B',
                '&:hover': {
                  backgroundColor: '#D97706',
                },
              }}
            >
              {dialogMode === 'edit' ? 'Save Changes' : 'Add Activity'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AppLayout>
  );
}

export default ActivitiesPage;
