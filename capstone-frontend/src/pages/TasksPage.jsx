import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getIncomingSelectedId, resolveSelectedRecord } from '../utils/selection';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Collapse,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';

import AppLayout from '../components/AppLayout';
import { navigateToRecord } from '../utils/navigation';

//Component State
function TasksPage() {
  const navigate = useNavigate();
  // all tasks returned from backend

  const location = useLocation();
  const incomingTaskId = getIncomingSelectedId(location, 'task');

  const [tasks, setTasks] = useState([]);

  const [selectedTask, setSelectedTask] = useState(null);

  //used to populate application dropdowns
  const [applications, setApplications] = useState([]);

  //UI feedback during API requests
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');

  //text search for task titles and applicaitons
  const [searchTerm, setSearchTerm] = useState('');
  const [applicationFilter, setApplicationFilter] = useState('All');
  const [dueDateFilter, setDueDateFilter] = useState('All');

  //controls open/closed state of task groups
  const [collapsedSections, setCollapsedSections] = useState({
    overdue: false,
    today: false,
    upcoming: false,
    noDueDate: false,
    completed: false,
  });

  //state for the quick add task row
  const [quickAdd, setQuickAdd] = useState({
    title: '',
    application_id: '',
    due_at: '',
  });

  // inline editing state for tasks
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingForm, setEditingForm] = useState({
    title: '',
    application_id: '',
    due_at: '',
    status: 'Open',
  });

  /**
   * Retrieves JWT token from localStorage.
   * If no token exists, redirect the user to the login page.
   */
  function getTokenOrRedirect() {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/');
      return null;
    }

    return token;
  }

  /**
   * Converts ISO date string into YYYY-MM-DD format
   * for use inside HTML date input fields.
   */
  function formatDateForInput(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Converts a date input value into an ISO string set to local midday.
   * This prevents timezone shifts that would otherwise store the date
   * as the previous day in the database.
   */
  function toLocalMiddayISOString(dateValue) {
    if (!dateValue) return null;

    const [year, month, day] = dateValue.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0);

    return localDate.toISOString();
  }

  //TASK GROUPING HELPERS

  function startOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  function endOfToday() {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
  }

  function isCompleted(task) {
    return task.status === 'Done';
  }

  function isOverdue(task) {
    if (!task.due_at || isCompleted(task)) return false;

    const dueDate = new Date(task.due_at);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < startOfToday();
  }

  function isToday(task) {
    if (!task.due_at || isCompleted(task)) return false;

    const dueDate = new Date(task.due_at);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate.getTime() === startOfToday().getTime();
  }

  function isUpcoming(task) {
    if (!task.due_at || isCompleted(task)) return false;

    const dueDate = new Date(task.due_at);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate > startOfToday();
  }

  function isNoDueDate(task) {
    return !task.due_at && !isCompleted(task);
  }
  // due date labels
  function formatDueLabel(task) {
    if (isCompleted(task)) return 'Completed';
    if (!task.due_at) return 'No Due Date';
    if (isToday(task)) return 'Due Today';

    const dueDate = new Date(task.due_at);
    const month = dueDate.toLocaleString('en-US', { month: 'short' });
    const day = dueDate.getDate();

    return `Due ${month} ${day}`;
  }

  /**
   * Fetch all tasks belonging to the authenticated user.
   * Includes related application information.
   */
  async function fetchTasks() {
    const token = getTokenOrRedirect();
    if (!token) return;

    try {
      setError('');

      const response = await fetch('http://localhost:3001/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tasks');
      }

      setTasks(data);

      if (data.length === 0) {
        setSelectedTask(null);
        return;
      }

      setSelectedTask((prevSelected) =>
        resolveSelectedRecord(data, prevSelected, incomingTaskId)
      );
    } catch (error) {
      setError(error.message);
    }
  }

  /**
   * Fetch all applications for the authenticated user.
   * Used to populate dropdowns when creating or editing tasks.
   */
  async function fetchApplications() {
    const token = getTokenOrRedirect();
    if (!token) return;

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
    }
  }

  /**
   * Loads tasks and applications simultaneously when
   * the page first renders.
   */
  async function loadPageData() {
    try {
      setLoading(true);
      await Promise.all([fetchTasks(), fetchApplications()]);
    } finally {
      setLoading(false);
    }
  }
  // fetch on load
  useEffect(() => {
    loadPageData();
  }, [location.search]);

  function toggleSection(sectionKey) {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  }

  function startEditing(task) {
    setEditingTaskId(task.id);
    setEditingForm({
      title: task.title || '',
      application_id: task.application_id || '',
      due_at: task.due_at ? formatDateForInput(task.due_at) : '',
      status: task.status || 'Open',
    });
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setEditingForm({
      title: '',
      application_id: '',
      due_at: '',
      status: 'Open',
    });
  }

  /**
   * Creates a new task from the quick add row.
   * Requires a title and an application selection.
   */
  async function handleQuickAddTask() {
    setSubmitError('');

    const token = getTokenOrRedirect();
    if (!token) return;

    if (!quickAdd.title.trim()) {
      setSubmitError('Please enter a task title.');
      return;
    }

    if (!quickAdd.application_id) {
      setSubmitError('Please select an application.');
      return;
    }

    try {
      const payload = {
        title: quickAdd.title.trim(),
        status: 'Open',
        due_at: toLocalMiddayISOString(quickAdd.due_at),
      };

      const response = await fetch(
        `http://localhost:3001/tasks/application/${quickAdd.application_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

      setQuickAdd({
        title: '',
        application_id: '',
        due_at: '',
      });

      await fetchTasks();
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  /**
   * Toggles a task between Open and Done status.
   */
  async function handleToggleTaskComplete(task) {
    const token = getTokenOrRedirect();
    if (!token) return;

    const nextStatus = task.status === 'Done' ? 'Open' : 'Done';

    try {
      const response = await fetch(`http://localhost:3001/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task');
      }

      await fetchTasks();
    } catch (error) {
      setError(error.message);
    }
  }
  /**
   * Saves changes made during inline task editing.
   */
  async function handleSaveEdit(taskId) {
    const token = getTokenOrRedirect();
    if (!token) return;

    if (!editingForm.title.trim()) {
      setError('Task title cannot be empty.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingForm.title.trim(),
          application_id: editingForm.application_id,
          due_at: toLocalMiddayISOString(editingForm.due_at),
          status: editingForm.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task');
      }

      cancelEditing();
      await fetchTasks();
    } catch (error) {
      setError(error.message);
    }
  }

  /**
   * Deletes a task after user confirmation.
   */
  async function handleDeleteTask(taskId) {
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    const token = getTokenOrRedirect();
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete task');
      }

      await fetchTasks();
    } catch (error) {
      setError(error.message);
    }
  }

  const applicationOptions = useMemo(() => {
    const names = tasks
      .map((task) =>
        task.application
          ? `${task.application.company_name} — ${task.application.position_title}`
          : ''
      )
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index);

    return ['All', ...names];
  }, [tasks]);

  /**
   * Filters tasks based on:
   * - search text
   * - selected application
   * - selected due date category
   */
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const taskTitle = task.title || '';
      const appLabel = task.application
        ? `${task.application.company_name} ${task.application.position_title}`
        : '';

      const matchesSearch =
        taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appLabel.toLowerCase().includes(searchTerm.toLowerCase());

      const currentApplicationLabel = task.application
        ? `${task.application.company_name} — ${task.application.position_title}`
        : '';

      const matchesApplication =
        applicationFilter === 'All' || currentApplicationLabel === applicationFilter;

      let matchesDueDate = true;

      if (dueDateFilter === 'Today') {
        matchesDueDate = isToday(task);
      } else if (dueDateFilter === 'Upcoming') {
        matchesDueDate = isUpcoming(task);
      } else if (dueDateFilter === 'Overdue') {
        matchesDueDate = isOverdue(task);
      } else if (dueDateFilter === 'No Due Date') {
        matchesDueDate = isNoDueDate(task);
      } else if (dueDateFilter === 'Completed') {
        matchesDueDate = isCompleted(task);
      }

      return matchesSearch && matchesApplication && matchesDueDate;
    });
  }, [tasks, searchTerm, applicationFilter, dueDateFilter]);

  /**
   * Group tasks into board sections.
   */
  const overdueTasks = filteredTasks.filter(isOverdue);
  const todayTasks = filteredTasks.filter(isToday);
  const upcomingTasks = filteredTasks.filter(isUpcoming);
  const noDueDateTasks = filteredTasks.filter(isNoDueDate);
  const completedTasks = filteredTasks.filter(isCompleted);

  useEffect(() => {
    if (filteredTasks.length === 0) {
      setSelectedTask(null);
      return;
    }

    const selectedStillVisible = filteredTasks.some(
      (task) => task.id === selectedTask?.id
    );

    if (!selectedStillVisible) {
      setSelectedTask(filteredTasks[0]);
    }
  }, [filteredTasks, selectedTask]);
  /**
   * Reusable component used to render each task section.
   *
   * Sections include:
   * - Overdue
   * - Today
   * - Upcoming
   * - No Due Date
   * - Completed
   *
   * Supports:
   * - collapsible UI
   * - optional accent color
   * - compact layout for right-side sections
   */
  function TaskSection({
    title,
    sectionKey,
    tasks,
    leftAccent,
    tinted,
    compact = false,
  }) {
    /**
     * Main page layout
     *
     * Layout includes:
     * - page header
     * - search and filter controls
     * - quick add task row
     * - two-column task board layout
     */
    return (
      <Paper
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid #e3e6eb',
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: collapsedSections[sectionKey] ? 'none' : '1px solid #eceff3',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant={compact ? 'h6' : 'h5'}
              fontWeight={700}
              sx={{ fontSize: compact ? '1.05rem' : '1.2rem' }}
            >
              {title}
            </Typography>
          </Box>

          <IconButton size="small" onClick={() => toggleSection(sectionKey)}>
            {collapsedSections[sectionKey] ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Box>

        <Collapse in={!collapsedSections[sectionKey]}>
          {tasks.length === 0 ? (
            <Box sx={{ p: 2.5 }}>
              <Typography color="text.secondary">No tasks in this section.</Typography>
            </Box>
          ) : (
            <Stack>
              {tasks.map((task, index) => {
                const isEditing = editingTaskId === task.id;
                const isSelected = selectedTask?.id === task.id;

                return (
                  <Box
                    key={task.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '6px 44px minmax(0, 1fr) auto',
                      alignItems: 'stretch',
                      bgcolor: isSelected
                        ? 'rgba(34, 197, 94, 0.10)'
                        : tinted
                          ? 'rgba(244, 67, 54, 0.10)'
                          : '#fff',
                      outline: isSelected
                        ? '2px solid rgba(34, 197, 94, 0.35)'
                        : 'none',
                      borderBottom:
                        index === tasks.length - 1 ? 'none' : '1px solid #eceff3',
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: leftAccent || 'transparent',
                      }}
                    />

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        pt: 1.8,
                      }}
                    >
                      <Checkbox
                        checked={task.status === 'Done'}
                        onChange={() => handleToggleTaskComplete(task)}
                      />
                    </Box>

                    <Box sx={{ py: 1.8, pr: 2 }}>
                      {isEditing ? (
                        <Stack spacing={1.5}>
                          <TextField
                            size="small"
                            label="Task"
                            value={editingForm.title}
                            onChange={(event) =>
                              setEditingForm((prev) => ({
                                ...prev,
                                title: event.target.value,
                              }))
                            }
                            fullWidth
                          />

                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: { xs: '1fr', md: '1fr 180px 140px' },
                              gap: 1.5,
                            }}
                          >
                            <TextField
                              select
                              size="small"
                              label="Application"
                              value={editingForm.application_id}
                              onChange={(event) =>
                                setEditingForm((prev) => ({
                                  ...prev,
                                  application_id: event.target.value,
                                }))
                              }
                              fullWidth
                            >
                              {applications.map((application) => (
                                <MenuItem key={application.id} value={application.id}>
                                  {application.company_name} —{' '}
                                  {application.position_title}
                                </MenuItem>
                              ))}
                            </TextField>

                            <TextField
                              size="small"
                              label="Due Date"
                              type="date"
                              value={editingForm.due_at}
                              onChange={(event) =>
                                setEditingForm((prev) => ({
                                  ...prev,
                                  due_at: event.target.value,
                                }))
                              }
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                            />

                            <TextField
                              select
                              size="small"
                              label="Status"
                              value={editingForm.status}
                              onChange={(event) =>
                                setEditingForm((prev) => ({
                                  ...prev,
                                  status: event.target.value,
                                }))
                              }
                              fullWidth
                            >
                              <MenuItem value="Open">Open</MenuItem>
                              <MenuItem value="Done">Done</MenuItem>
                              <MenuItem value="Snoozed">Snoozed</MenuItem>
                            </TextField>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<SaveOutlinedIcon />}
                              onClick={() => handleSaveEdit(task.id)}
                            >
                              Save
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CloseIcon />}
                              onClick={cancelEditing}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Stack>
                      ) : (
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 500,
                              textDecoration:
                                task.status === 'Done' ? 'line-through' : 'none',
                              wordBreak: 'break-word',
                            }}
                          >
                            {task.title}
                          </Typography>

                          {task.application ? (
                            <Typography
                              variant="body2"
                              onClick={() =>
                                navigateToRecord(
                                  navigate,
                                  'application',
                                  task.application.id
                                )
                              }
                              sx={{
                                mt: 0.5,
                                color: '#2563eb',
                                fontSize: '0.92rem',
                                cursor: 'pointer',
                                '&:hover': {
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              {task.application.company_name} —{' '}
                              {task.application.position_title}
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.5,
                                color: 'text.secondary',
                                fontSize: '0.92rem',
                              }}
                            >
                              No application
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>

                    <Box
                      sx={{
                        py: 1.8,
                        pr: 2,
                        pl: 1,
                        minWidth: compact ? 110 : 130,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      {!isEditing && (
                        <>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color:
                                sectionKey === 'overdue' ? '#e53935' : 'text.secondary',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formatDueLabel(task)}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => startEditing(task)}>
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Collapse>
      </Paper>
    );
  }

  return (
    <AppLayout title="Tasks">
      <Stack spacing={3}>
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
            Tasks
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              width: { xs: '100%', md: 'auto' },
            }}
          >
            <TextField
              size="small"
              label="Search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <TextField
              select
              size="small"
              label="Application"
              value={applicationFilter}
              onChange={(event) => setApplicationFilter(event.target.value)}
              sx={{ minWidth: 220 }}
            >
              {applicationOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Due Date"
              value={dueDateFilter}
              onChange={(event) => setDueDateFilter(event.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="Upcoming">Upcoming</MenuItem>
              <MenuItem value="No Due Date">No Due Date</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
          </Box>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Paper
          sx={{
            p: 1.5,
            borderRadius: 3,
            boxShadow: 'none',
            border: '1px solid #e3e6eb',
          }}
        >
          <Stack spacing={1.5}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr 160px auto' },
                gap: 1.5,
                alignItems: 'center',
              }}
            >
              <TextField
                size="small"
                placeholder="Add a task . . ."
                value={quickAdd.title}
                onChange={(event) =>
                  setQuickAdd((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                fullWidth
              />

              <TextField
                select
                size="small"
                value={quickAdd.application_id}
                onChange={(event) =>
                  setQuickAdd((prev) => ({
                    ...prev,
                    application_id: event.target.value,
                  }))
                }
                fullWidth
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="" disabled>
                  Select Application
                </MenuItem>
                {applications.map((application) => (
                  <MenuItem key={application.id} value={application.id}>
                    {application.company_name} — {application.position_title}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                size="small"
                type="date"
                value={quickAdd.due_at}
                onChange={(event) =>
                  setQuickAdd((prev) => ({
                    ...prev,
                    due_at: event.target.value,
                  }))
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <Button
                variant="contained"
                onClick={handleQuickAddTask}
                sx={{
                  bgcolor: '#22C55E',
                  '&:hover': {
                    bgcolor: '#16a34a',
                  },
                }}
              >
                + Add Task
              </Button>
            </Box>
          </Stack>
        </Paper>

        {loading ? (
          <Typography>Loading tasks...</Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.45fr 1fr' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            <Stack spacing={3}>
              <TaskSection
                title="Overdue"
                sectionKey="overdue"
                tasks={overdueTasks}
                leftAccent="#ef4444"
                tinted
              />

              <TaskSection
                title="Today"
                sectionKey="today"
                tasks={todayTasks}
                leftAccent="#22C55E"
              />
            </Stack>

            <Stack spacing={3}>
              <TaskSection
                title="Upcoming"
                sectionKey="upcoming"
                tasks={upcomingTasks}
                compact
              />

              <TaskSection
                title="No Due Date"
                sectionKey="noDueDate"
                tasks={noDueDateTasks}
                compact
              />

              <TaskSection
                title="Completed"
                sectionKey="completed"
                tasks={completedTasks}
                compact
              />
            </Stack>
          </Box>
        )}
      </Stack>
    </AppLayout>
  );
}

export default TasksPage;
