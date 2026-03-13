import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { getIncomingSelectedId, resolveSelectedRecord } from '../utils/selection';
import { navigateToRecord } from '../utils/navigation';
import AppLayout from '../components/AppLayout';

function ContactsPage() {
  // Used to redirect user back to auth page if no token exists
  const navigate = useNavigate();

  // Stores all contacts returned from the backend
  const [contacts, setContacts] = useState([]);

  // Stores the contact currently selected in the list
  const [selectedContact, setSelectedContact] = useState(null);

  // Stores applications for the Add Contact dialog dropdown
  const [applications, setApplications] = useState([]);

  // UI state for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search + filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [applicationFilter, setApplicationFilter] = useState('All');

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [dialogMode, setDialogMode] = useState('add');
  const [editingContactId, setEditingContactId] = useState(null);

  const location = useLocation();
  const incomingContactId = getIncomingSelectedId(location, 'contact');

  const emptyContactForm = {
    application_id: '',
    name: '',
    title: '',
    email: '',
    phone: '',
    linkedin_url: '',
    contact_type: 'Other',
    notes: '',
  };
  // Shared form state for add/edit contact dialog.
  const [formData, setFormData] = useState(emptyContactForm);

  /**
   * Fetch all contacts for the authenticated user across all applications.
   * If contacts exist, the first one is automatically selected by default.
   */
  async function fetchContacts() {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const response = await fetch('http://localhost:3001/contacts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch contacts');
      }

      setContacts(data);
      // select first contact by default or keep currently selected contact
      if (data.length === 0) {
        setSelectedContact(null);
        return;
      }

      setSelectedContact((prevSelected) =>
        resolveSelectedRecord(data, prevSelected, incomingContactId)
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Fetch applications for the Add Contact dialog so the user
   * can attach a contact to an application.
   */
  async function fetchApplicationsForDialog() {
    const token = localStorage.getItem('token');

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

      return data;
    } catch (error) {
      setSubmitError(error.message);
      return [];
    }
  }

  /**
   * Load contacts when the page first renders.
   */
  useEffect(() => {
    fetchContacts();
  }, [location.search]);

  /**
   * Opens the Add Contact dialog and loads applications for the dropdown.
   */
  async function handleOpenDialog() {
    setDialogMode('add');
    setEditingContactId(null);
    setSubmitError('');
    setFormData(emptyContactForm);

    const applicationData = await fetchApplicationsForDialog();
    setApplications(applicationData);
    setOpenDialog(true);
  }
  /**
   * Opens the Edit Contact dialog, pre-fills with existing contact data
   */
  async function handleOpenEditDialog(contact) {
    setDialogMode('edit');
    setEditingContactId(contact.id);
    setSubmitError('');

    const applicationData = await fetchApplicationsForDialog();
    setApplications(applicationData);

    setFormData({
      application_id: contact.application?.id || contact.application_id || '',
      name: contact.name || '',
      title: contact.title || '',
      email: contact.email || '',
      phone: contact.phone || '',
      linkedin_url: contact.linkedin_url || '',
      contact_type: contact.contact_type || 'Other',
      notes: contact.notes || '',
    });

    setOpenDialog(true);
  }
  /**
   * Closes the add/edit dialog and resets all related state to default values.
   */
  function handleCloseDialog() {
    setOpenDialog(false);
    setSubmitError('');
    setDialogMode('add');
    setEditingContactId(null);
    setFormData(emptyContactForm);
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
   * Creates a new contact under the selected application.
   */
  async function handleSubmitContact(event) {
    event.preventDefault();
    setSubmitError('');

    const token = localStorage.getItem('token');

    if (!formData.application_id) {
      setSubmitError('Please select an application for this contact.');
      return;
    }

    const payload = {
      application_id: Number(formData.application_id),
      name: formData.name,
      title: formData.title,
      email: formData.email,
      phone: formData.phone,
      linkedin_url: formData.linkedin_url,
      contact_type: formData.contact_type,
      notes: formData.notes,
    };
    // checks if in edit mode and sets the corresponding URL for the fetch req
    const url =
      dialogMode === 'edit'
        ? `http://localhost:3001/contacts/${editingContactId}`
        : `http://localhost:3001/contacts/application/${formData.application_id}`;

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${dialogMode} contact`);
      }

      await fetchContacts();
      handleCloseDialog();
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  /**
   * Returns initials for the selected contact avatar.
   */
  function getInitials(contact) {
    if (!contact?.name) return '?';

    return contact.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  /**
   * Creates application filter options based on the contacts returned.
   * For now, contacts are always tied to applications, but "General"
   * is left in place for future flexibility.
   */
  const applicationOptions = useMemo(() => {
    const names = contacts
      .map((contact) => contact.application?.company_name || 'General')
      .filter((value, index, array) => array.indexOf(value) === index);

    return ['All', ...names];
  }, [contacts]);

  /**
   * Filters contacts by search term and selected application.
   * Search matches name, company, title, and contact type.
   */
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const name = contact.name || '';
      const company = contact.application?.company_name || 'General';
      const title = contact.title || '';
      const contactType = contact.contact_type || '';

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contactType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesApplication =
        applicationFilter === 'All' || company === applicationFilter;

      return matchesSearch && matchesApplication;
    });
  }, [contacts, searchTerm, applicationFilter]);

  /* keeps selection after filtering */
  useEffect(() => {
    if (filteredContacts.length === 0) {
      setSelectedContact(null);
      return;
    }

    const selectedStillVisible = filteredContacts.some(
      (contact) => contact.id === selectedContact?.id
    );

    if (!selectedStillVisible) {
      setSelectedContact(filteredContacts[0]);
    }
  }, [filteredContacts, selectedContact]);

  return (
    <AppLayout title="Contacts">
      <Stack spacing={3}>
        {/* Page header */}
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
            Contacts
          </Typography>

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

          <TextField
            size="small"
            label="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <Button variant="contained" onClick={handleOpenDialog} color="secondary">
            Add Contact
          </Button>
        </Box>

        {/* Error message */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Loading state / main content */}
        {loading ? (
          <Typography>Loading contacts...</Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' },
              gap: 3,
            }}
          >
            {/* Left panel: contacts list */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {filteredContacts.length} Contact
                  {filteredContacts.length === 1 ? '' : 's'}
                </Typography>
              </Box>

              {/* Table-style column headers */}
              <Box
                sx={{
                  px: 3,
                  pb: 1.5,
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr 1fr',
                  gap: 2,
                }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Name
                </Typography>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Company
                </Typography>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Context
                </Typography>
              </Box>

              <Divider />

              {/* Empty list state */}
              {filteredContacts.length === 0 ? (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    No contacts yet
                  </Typography>
                  <Typography color="text.secondary">
                    Add your first contact to start tracking recruiters, hiring
                    managers, and interview connections.
                  </Typography>
                </Box>
              ) : (
                <Stack divider={<Divider />}>
                  {filteredContacts.map((contact) => {
                    const isSelected = selectedContact?.id === contact.id;

                    return (
                      <Box
                        key={contact.id}
                        onClick={() => setSelectedContact(contact)}
                        sx={{
                          cursor: 'pointer',
                          display: 'grid',
                          gridTemplateColumns: '6px 1.2fr 1fr 1fr',
                          gap: 2,
                          alignItems: 'center',
                          bgcolor: isSelected
                            ? 'rgba(103, 58, 183, 0.08)'
                            : 'transparent',
                          transition: '0.2s ease',
                          '&:hover': {
                            bgcolor: isSelected
                              ? 'rgba(103, 58, 183, 0.12)'
                              : 'rgba(0,0,0,0.03)',
                          },
                        }}
                      >
                        {/* Purple selection bar */}
                        <Box
                          sx={{
                            alignSelf: 'stretch',
                            bgcolor: isSelected ? 'secondary.main' : 'transparent',
                          }}
                        />

                        <Box sx={{ py: 2, pl: 1 }}>
                          <Typography fontWeight={600}>
                            {contact.name || 'Unnamed Contact'}
                          </Typography>
                        </Box>

                        <Box sx={{ py: 2 }}>
                          <Typography color="text.secondary">
                            {contact.application?.company_name || 'General'}
                          </Typography>
                        </Box>

                        <Box sx={{ py: 2, pr: 2 }}>
                          <Typography color="text.secondary">
                            {contact.contact_type || 'Other'}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Paper>

            {/* Right panel: selected contact details */}
            <Paper sx={{ p: 3, borderRadius: 3, minHeight: 420 }}>
              {!selectedContact ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    No contact selected
                  </Typography>
                  <Typography color="text.secondary">
                    Select a contact from the list to view details.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={3}>
                  {/* header with name, role, and edit button */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 56, height: 56 }}>
                        {getInitials(selectedContact)}
                      </Avatar>

                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {selectedContact.name || 'Unnamed Contact'}
                        </Typography>
                        <Typography color="text.secondary">
                          {selectedContact.title ||
                            selectedContact.contact_type ||
                            'No role provided'}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenEditDialog(selectedContact)}
                      color="secondary"
                    >
                      Edit Contact
                    </Button>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Contact Info
                    </Typography>

                    <Stack spacing={1}>
                      <Typography>
                        <strong>Email:</strong>{' '}
                        {selectedContact.email || 'Not provided'}
                      </Typography>
                      <Typography>
                        <strong>Phone:</strong>{' '}
                        {selectedContact.phone || 'Not provided'}
                      </Typography>
                      <Typography>
                        <strong>Link:</strong>{' '}
                        {selectedContact.linkedin_url ? (
                          <a
                            href={selectedContact.linkedin_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {selectedContact.linkedin_url}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </Typography>
                    </Stack>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Related Application
                    </Typography>

                    {selectedContact.application ? (
                      <Paper
                        variant="outlined"
                        onClick={() =>
                          navigateToRecord(
                            navigate,
                            'application',
                            selectedContact.application.id
                          )
                        }
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: '0.2s ease',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.02)',
                          },
                        }}
                      >
                        <Typography fontWeight={600}>
                          {selectedContact.application.company_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedContact.application.position_title}
                        </Typography>
                      </Paper>
                    ) : (
                      <Typography color="text.secondary">General</Typography>
                    )}
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Related Activity
                    </Typography>
                    {!selectedContact.activities?.length ? (
                      <Typography color="text.secondary">
                        No activities linked to this contact.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {selectedContact.activities.map((activity) => (
                          <Paper
                            key={activity.id}
                            variant="outlined"
                            onClick={() =>
                              navigateToRecord(navigate, 'activity', activity.id)
                            }
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              cursor: 'pointer',
                              transition: '0.2s ease',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.02)',
                              },
                            }}
                          >
                            <Typography fontWeight={600}>
                              {activity.type || 'Activity'}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              {activity.summary || 'No summary provided'}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Stack>
              )}
            </Paper>
          </Box>
        )}
      </Stack>

      {/* Add Contact dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogMode === 'edit' ? 'Edit Contact' : 'Add Contact'}
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmitContact}>
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
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
              />

              <TextField
                label="Title / Role"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                placeholder="Senior Editorial Director"
              />

              <TextField
                select
                label="Contact Type"
                name="contact_type"
                value={formData.contact_type}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="Recruiter">Recruiter</MenuItem>
                <MenuItem value="HiringManager">Hiring Manager</MenuItem>
                <MenuItem value="Interviewer">Interviewer</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>

              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                label="Link"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                fullWidth
                placeholder="LinkedIn or contact URL"
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
              {dialogMode === 'edit' ? 'Save Changes' : 'Add Contact'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AppLayout>
  );
}

export default ContactsPage;
