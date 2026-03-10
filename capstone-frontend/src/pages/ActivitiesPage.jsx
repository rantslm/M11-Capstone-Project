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
import VideocamIcon from '@mui/icons-material/Videocam';
import HandshakeIcon from '@mui/icons-material/Handshake';

/* UI icons */
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/* Layout wrapper used across pages */
import AppLayout from '../components/AppLayout';
