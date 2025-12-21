// src/components/OrdersList.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    useMediaQuery,
    useTheme,
    Avatar,
    TextField,
    InputAdornment,
    Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const statusColors = {
    pending: 'warning',
    'in-progress': 'info',
    completed: 'success',
};

const OrdersList = () => {
    const { orders, loading } = useOrders();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const ordersPerPage = 10;

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) {
            return Math.floor(interval) + " years ago";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + " months ago";
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return Math.floor(interval) + " days ago";
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return Math.floor(interval) + " hours ago";
        }
        interval = seconds / 60;
        if (interval > 1) {
            return Math.floor(interval) + " minutes ago";
        }
        return Math.floor(seconds) + " seconds ago";
    };

    const filteredOrders = useMemo(() => {
        if (!searchTerm) {
            return orders;
        }
        return orders.filter(order =>
            order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.whatsapp.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.telecaller.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.assignedToName && order.assignedToName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [orders, searchTerm]);

    // Reset to page 1 when search term changes for better UX
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const pageCount = Math.ceil(filteredOrders.length / ordersPerPage);
    const paginatedOrders = useMemo(() => {
        return filteredOrders.slice((page - 1) * ordersPerPage, page * ordersPerPage);
    }, [filteredOrders, page, ordersPerPage]);


    if (loading) return <div>Loading...</div>;

    const renderOrders = () => (
        paginatedOrders.map((order) => (
            <TableRow 
                key={order.id} 
                onClick={() => navigate(`/order/${order.id}`)}
                sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: 'action.hover', cursor: 'pointer' }
                }}
            >
                <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                            {order.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body1" fontWeight="500">{order.name}</Typography>
                    </Box>
                </TableCell>
                <TableCell>{order.whatsapp}</TableCell>
                <TableCell>{order.country}</TableCell>
                <TableCell>{order.telecaller}</TableCell>
                <TableCell>{order.assignedToName}</TableCell>
                <TableCell>
                    <Chip label={order.status} color={statusColors[order.status] || 'default'} size="small" sx={{ textTransform: 'capitalize' }} />
                </TableCell>
                <TableCell>{order.createdAt ? timeAgo(order.createdAt.toDate()) : 'N/A'}</TableCell>
            </TableRow>
        ))
    );

    const renderCards = () => (
        <Grid container spacing={3} justifyContent="center">
            {paginatedOrders.map((order) => (
                <Grid item xs={12} sm={6} md={4} key={order.id}>
                    <Card 
                        onClick={() => navigate(`/order/${order.id}`)}
                        sx={{ 
                            height: '100%', 
                            borderRadius: 2, 
                            position: 'relative', 
                            overflow: 'hidden', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            cursor: 'pointer'
                        }}
                    >
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '4px',
                            width: '100%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }} />
                        <CardContent sx={{ pt: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                                <Avatar sx={{ bgcolor: 'primary.light' }}>
                                    {order.name.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" component="div" fontWeight="600">{order.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {order.createdAt ? timeAgo(order.createdAt.toDate()) : 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" sx={{ mb: 0.5 }}><strong>WhatsApp:</strong> {order.whatsapp}</Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Country:</strong> {order.country}</Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Telecaller:</strong> {order.telecaller}</Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}><strong>Assigned:</strong> {order.assignedToName}</Typography>

                            <Chip
                                label={order.status}
                                color={statusColors[order.status] || 'default'}
                                size="small"
                                sx={{ textTransform: 'capitalize' }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search orders by name, number, country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
            {isMobile ? (
                renderCards()
            ) : (
                <Paper sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="orders table">
                            <TableHead sx={{ '& .MuiTableCell-root': { fontWeight: '600', backgroundColor: 'action.hover' } }}>
                                <TableRow>
                                    <TableCell>Customer Name</TableCell>
                                    <TableCell>WhatsApp</TableCell>
                                    <TableCell>Country</TableCell>
                                    <TableCell>Telecaller</TableCell>
                                    <TableCell>Assigned To</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Age</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {renderOrders()}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
            {pageCount > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={pageCount}
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            )}
        </Box>
    );
};

export default OrdersList;