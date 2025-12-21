import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    RadioGroup,
    FormControlLabel,
    Radio,
    Autocomplete,
    Paper,
    Grid,
    Link,
    InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { toast } from 'react-toastify';

/* -------------------- COUNTRY DATA -------------------- */

const countries = [
    { name: 'India', code: '+91' },
    { name: 'United States', code: '+1' },
    { name: 'United Kingdom', code: '+44' },
    { name: 'UAE', code: '+971' },
    { name: 'Saudi Arabia', code: '+966' },
    { name: 'Canada', code: '+1' },
    { name: 'Australia', code: '+61' },
];

/* -------------------- EDITORS -------------------- */

const editors = [
    { email: 'tarun@mm.com', name: 'Tarun' },
    { email: 'gurwinder@mm.com', name: 'Gurwinder' },
    { email: 'roop@mm.com', name: 'Roop' },
    { email: 'harinder@mm.com', name: 'Harinder' },
];

/* -------------------- STYLES -------------------- */

const GradientTextField = styled(TextField)(({ theme }) => ({
    '& label.Mui-focused': { color: '#667eea' },
    '& .MuiOutlinedInput-root': {
        borderRadius: 14,
        '&:hover fieldset': { borderColor: '#764ba2' },
        '&.Mui-focused fieldset': {
            borderWidth: 2,
            borderImage: `linear-gradient(135deg,#667eea,#764ba2) 1`,
        },
    },
}));

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    width: 1,
});

/* -------------------- COMPONENT -------------------- */

const OrderForm = ({ onOrderCreated }) => {
    const { role } = useAuth();

    const [form, setForm] = useState({
        name: '',
        whatsapp: '',
        country: '',
        telecaller: '',
        imageType: 'upload',
        sampleImageUrl: '',
        assignedToEmail: '',
        assignedToName: '',
    });

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    /* ---------- SMART COUNTRY AUTOFILL ---------- */
    const handleWhatsappChange = (e) => {
        const value = e.target.value;

        let detectedCountry = form.country;

        if (value.startsWith('+')) {
            const match = countries.find((c) =>
                value.startsWith(c.code)
            );
            if (match) detectedCountry = match.name;
        }

        setForm({
            ...form,
            whatsapp: value,
            country: detectedCountry,
        });
    };

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (role !== 'team-leader') {
            toast.error('Only team leader can create orders');
            setLoading(false);
            return;
        }

        try {
            let imageUrl = form.sampleImageUrl;

            if (form.imageType === 'upload' && file) {
                const storageRef = ref(storage, `samples/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                imageUrl = await getDownloadURL(storageRef);
            }

            await addDoc(collection(db, 'orders'), {
                ...form,
                sampleImageUrl: imageUrl,
                status: 'pending',
                createdAt: serverTimestamp(),
                completedAt: null,
            });

            toast.success('Order created successfully');
            onOrderCreated();
        } catch (err) {
            toast.error(err.message);
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="xl">
            <Paper
                sx={{
                    p: { xs: 2, md: 4 },
                    borderRadius: 4,
                    background: 'linear-gradient(180deg,#ffffff,#f7f9ff)',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.08)',
                }}
            >
                <Typography variant="h4" fontWeight={700} mb={4}>
                    Create New Order
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* LEFT */}
                        <Grid item xs={12} md={6}>
                            <GradientTextField
                                fullWidth
                                label="Client Name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />

                            {/* WhatsApp with auto-detect */}
                            <GradientTextField
                                fullWidth
                                label="WhatsApp Number"
                                name="whatsapp"
                                value={form.whatsapp}
                                onChange={handleWhatsappChange}
                                required
                                sx={{ mt: 3 }}
                                placeholder="+91 98765 43210"
                                helperText="Country auto-detects from code. You can change it."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography sx={{ color: 'text.secondary', pr: 1 }}>

                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Country (editable) */}
                            <Autocomplete
                                options={countries}
                                getOptionLabel={(o) => o.name}
                                value={
                                    countries.find((c) => c.name === form.country) || null
                                }
                                onChange={(e, v) =>
                                    setForm({ ...form, country: v?.name || '' })
                                }
                                renderInput={(params) => (
                                    <GradientTextField
                                        {...params}
                                        label="Country"
                                        sx={{ mt: 3 }}
                                    />
                                )}
                            />

                            <GradientTextField
                                fullWidth
                                label="Telecaller"
                                name="telecaller"
                                value={form.telecaller}
                                onChange={handleChange}
                                sx={{ mt: 3 }}
                                required
                            />
                        </Grid>

                        {/* RIGHT */}
                        <Grid item xs={12} md={6}>
                            <Typography fontWeight={600} mb={1}>
                                Sample Image
                            </Typography>

                            <RadioGroup
                                row
                                name="imageType"
                                value={form.imageType}
                                onChange={handleChange}
                            >
                                <FormControlLabel value="upload" control={<Radio />} label="Upload" />
                                <FormControlLabel
                                    value="url"
                                    control={<Radio />}
                                    label={
                                        <Typography>
                                            URL
                                            <Link
                                                href="https://imgbb.com/"
                                                target="_blank"
                                                sx={{ ml: 0.5, fontSize: 12 }}
                                            >
                                                (host here)
                                            </Link>
                                        </Typography>
                                    }
                                />
                            </RadioGroup>

                            {form.imageType === 'upload' ? (
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<UploadFileIcon />}
                                    fullWidth
                                    sx={{ mt: 2, py: 1.4 }}
                                >
                                    Upload Image
                                    <VisuallyHiddenInput
                                        type="file"
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                </Button>
                            ) : (
                                <GradientTextField
                                    fullWidth
                                    label="Image URL"
                                    name="sampleImageUrl"
                                    value={form.sampleImageUrl}
                                    onChange={handleChange}
                                    sx={{ mt: 2 }}
                                />
                            )}

                            <FormControl fullWidth sx={{ mt: 3 }}>
                                <InputLabel>Assign Editor</InputLabel>
                                <Select
                                    value={form.assignedToEmail}
                                    label="Assign Editor"
                                    onChange={(e) => {
                                        const ed = editors.find(i => i.email === e.target.value);
                                        setForm({
                                            ...form,
                                            assignedToEmail: ed.email,
                                            assignedToName: ed.name,
                                        });
                                    }}
                                >
                                    {editors.map((e) => (
                                        <MenuItem key={e.email} value={e.email}>
                                            {e.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* ACTIONS */}
                    <Box display="flex" justifyContent="flex-end" gap={2} mt={5}>
                        <Button variant="outlined" onClick={onOrderCreated}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            sx={{
                                px: 4,
                                color: '#fff',
                                background: 'linear-gradient(135deg,#667eea,#764ba2)',
                            }}
                        >
                            {loading ? 'Saving…' : 'Save Order'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default OrderForm;
