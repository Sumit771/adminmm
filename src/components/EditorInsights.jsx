// src/components/EditorInsights.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    LinearProgress,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    IconButton,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    Person as PersonIcon,
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    TrendingUp as TrendingUpIcon,
    Work as WorkIcon,
    Timeline as TimelineIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useEditorStats } from '../context/EditorStatsContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useOrders } from '../hooks/useOrders';

const EditorInsights = () => {
    const { user } = useAuth();
    const { editorStats, loading, refreshStats } = useEditorStats();
    const { orders: allOrders, loading: ordersLoading } = useOrders();
    const [selectedEditor, setSelectedEditor] = useState(null);

    // Debug logging
    useEffect(() => {
        console.log('EditorInsights - editorStats:', editorStats);
        console.log('EditorInsights - loading:', loading);
        console.log('EditorInsights - allOrders:', allOrders);
        console.log('EditorInsights - ordersLoading:', ordersLoading);
    }, [editorStats, loading, allOrders, ordersLoading]);

    // Filter orders for selected editor
    const editorOrders = useMemo(() => {
        if (!selectedEditor || !allOrders) return [];
        console.log('All orders:', allOrders);
        console.log('Filtering orders for editor:', selectedEditor.email, 'name:', selectedEditor.name);
        const filtered = allOrders.filter(order => {
            const matchesEmail = order.assignedToEmail === selectedEditor.email;
            const matchesName = order.assignedToName === selectedEditor.name;
            console.log('Checking order:', order.id, 'assignedToEmail:', order.assignedToEmail, 'assignedToName:', order.assignedToName, 'matchesEmail:', matchesEmail, 'matchesName:', matchesName);
            return matchesEmail || matchesName;
        });
        console.log('Filtered orders:', filtered);
        return filtered;
    }, [selectedEditor, allOrders]);

    useEffect(() => {
        if (editorStats.length > 0 && !selectedEditor) {
            setSelectedEditor(editorStats[0]);
        } else if (editorStats.length > 0 && selectedEditor) {
            // Check if selectedEditor still exists in the updated stats
            const stillExists = editorStats.find(editor => editor.email === selectedEditor.email);
            if (!stillExists) {
                setSelectedEditor(editorStats[0]);
            }
        } else if (editorStats.length === 0) {
            setSelectedEditor(null);
        }
    }, [editorStats, selectedEditor]);

    // Debug selectedEditor
    useEffect(() => {
        console.log('Selected editor changed:', selectedEditor);
    }, [selectedEditor]);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
    };

    const calculateAverageTurnaround = (stats) => {
        if (!stats.completedOrders || stats.completedOrders.length === 0) return 0;
        const totalHours = stats.completedOrders.reduce((sum, order) => {
            const assignedDate = new Date(order.assignedAt.seconds * 1000);
            const completedDate = new Date(order.completedAt.seconds * 1000);
            return sum + (completedDate - assignedDate) / (1000 * 60 * 60);
        }, 0);
        return (totalHours / stats.completedOrders.length).toFixed(1);
    };

    const getPerformanceData = (stats) => {
        if (!stats.monthlyStats) return [];
        return Object.entries(stats.monthlyStats).map(([month, data]) => ({
            month,
            completed: data.completed || 0,
            assigned: data.assigned || 0,
            avgTurnaround: data.avgTurnaround || 0,
        }));
    };

    const getWorkloadColor = (workload) => {
        if (workload >= 80) return 'error';
        if (workload >= 60) return 'warning';
        return 'success';
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Loading Editor Insights...
                </Typography>
                <LinearProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Editor Insights
                </Typography>
                <Tooltip title="Refresh Data">
                    <IconButton onClick={refreshStats} color="primary">
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            <Grid container spacing={3}>
                {/* Editor List */}
                <Grid item xs={12} md={4}>
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PersonIcon sx={{ mr: 1 }} />
                            Editors ({editorStats.length})
                        </Typography>
                        <List sx={{ p: 0 }}>
                            {editorStats.map((editor) => (
                                <ListItem
                                    key={editor.email}
                                    button
                                    onClick={() => setSelectedEditor(editor)}
                                    sx={{
                                        p: 2,
                                        mb: 1.5,
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease',
                                        border: '1px solid',
                                        borderColor: selectedEditor?.email === editor.email ? 'transparent' : 'divider',
                                        background: selectedEditor?.email === editor.email ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'background.paper',
                                        color: selectedEditor?.email === editor.email ? 'white' : 'text.primary',
                                        boxShadow: selectedEditor?.email === editor.email ? '0 4px 12px 0 rgba(118, 75, 162, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)'
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: selectedEditor?.email === editor.email ? 'rgba(255,255,255,0.2)' : 'primary.light' }}>
                                            {editor.name?.charAt(0)?.toUpperCase() || 'E'}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={editor.name || editor.email}
                                        secondary={`${editor.totalAssigned || 0} Assigned / ${editor.totalCompleted || 0} Completed`}
                                        primaryTypographyProps={{ fontWeight: 600 }}
                                        secondaryTypographyProps={{ color: selectedEditor?.email === editor.email ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Grid>

                {/* Editor Details */}
                <Grid item xs={12} md={8}>
                    {selectedEditor ? (
                        <>
                            {/* Profile Header */}
                            <Card sx={{ mb: 3 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
                                            {selectedEditor.name?.charAt(0)?.toUpperCase() || 'E'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h5">{selectedEditor.name || 'Unknown Editor'}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedEditor.email}
                                            </Typography>
                                            <Chip
                                                label={`Active since ${formatDate(selectedEditor.createdAt)}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ mt: 1 }}
                                            />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Summary Cards */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6} sm={3}>
                                    <Card>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <AssignmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                            <Typography variant="h4">{selectedEditor.totalAssigned || 0}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Assigned
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Card>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                                            <Typography variant="h4">{selectedEditor.totalCompleted || 0}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Completed
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Card>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <ScheduleIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                                            <Typography variant="h4">{calculateAverageTurnaround(selectedEditor)}h</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Avg Turnaround
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Card>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <WorkIcon color={getWorkloadColor(selectedEditor.currentWorkload || 0)} sx={{ fontSize: 40, mb: 1 }} />
                                            <Typography variant="h4">{selectedEditor.currentWorkload || 0}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Current Workload
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Performance Chart */}
                            <Card sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Monthly Performance
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={getPerformanceData(selectedEditor)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Bar dataKey="completed" fill="#4caf50" name="Completed" />
                                            <Bar dataKey="assigned" fill="#2196f3" name="Assigned" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Turnaround Time Chart */}
                            <Card sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Turnaround Time Trend
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={getPerformanceData(selectedEditor)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Line type="monotone" dataKey="avgTurnaround" stroke="#ff9800" strokeWidth={2} name="Avg Hours" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Recent Activity
                                    </Typography>
                                    <List>
                                        {selectedEditor.recentActivity?.slice(0, 5).map((activity, index) => (
                                            <React.Fragment key={index}>
                                                <ListItem>
                                                    <ListItemText
                                                        primary={activity.description}
                                                        secondary={formatDate(activity.timestamp)}
                                                    />
                                                </ListItem>
                                                {index < 4 && <Divider />}
                                            </React.Fragment>
                                        )) || (
                                                <ListItem>
                                                    <ListItemText primary="No recent activity" />
                                                </ListItem>
                                            )}
                                    </List>
                                </CardContent>
                            </Card>

                            {/* Editor's Orders */}
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Editor's Orders ({editorOrders.length})
                                    </Typography>
                                    {ordersLoading ? (
                                        <LinearProgress />
                                    ) : editorOrders.length > 0 ? (
                                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Telecaller</TableCell>
                                                        <TableCell>Status</TableCell>
                                                        <TableCell>Created</TableCell>
                                                        <TableCell>Completed</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {editorOrders.map((order) => (
                                                        <TableRow key={order.id}>
                                                            <TableCell>{order.telecaller}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={order.status}
                                                                    color={order.status === 'completed' ? 'success' : order.status === 'in-progress' ? 'info' : 'warning'}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>{order.createdAt?.toDate().toLocaleDateString()}</TableCell>
                                                            <TableCell>{order.completedAt?.toDate().toLocaleDateString() || 'N/A'}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                            No orders assigned to this editor.
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                Select an editor to view insights
                            </Typography>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default EditorInsights;