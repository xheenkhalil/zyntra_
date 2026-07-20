import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Certification } from '../types/certification';

const SuperAdminCertifications: React.FC = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const res = await axios.get('/api/certifications', { withCredentials: true });
      setCertifications(res.data);
    } catch (error) {
      console.error('Error fetching certifications', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;
    try {
      await axios.delete(`/api/certifications/${id}`, { withCredentials: true });
      fetchCertifications();
    } catch (error) {
      console.error('Error deleting certification', error);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Certifications</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={() => navigate('/superadmin/certifications/new')}
        >
          Create Certification
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certifications.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell>{cert.title}</TableCell>
                <TableCell>${cert.price}</TableCell>
                <TableCell>{cert.is_published ? 'Published' : 'Draft'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => navigate(`/superadmin/certifications/${cert.id}/edit`)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(cert.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {certifications.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No certifications found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SuperAdminCertifications;
