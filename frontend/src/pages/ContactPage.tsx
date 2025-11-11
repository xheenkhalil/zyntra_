import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useNavigate } from "react-router-dom";

// --- FIX: Corrected import paths ---
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";

// Import icons
import {
  FaBuilding,
  FaPaperPlane,
  FaQuestionCircle,
  FaTools,
  FaHandshake,
} from "react-icons/fa";

// Define the shape of our form data
interface FormData {
  inquiry: "sales" | "support" | "general";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

// --- Main Contact Page Component ---
const ContactPage: React.FC = () => {
  const navigate = useNavigate();

  // --- State for the form ---
  const [formData, setFormData] = useState<FormData>({
    inquiry: "sales",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  // --- Form Handlers ---
  const handleChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // --- Simulate API Call ---
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitStatus("success");
      setFormData({
        inquiry: "sales",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="bg-white">
      {/* 1. NAVIGATION */}
      <Navbar />

      {/* 2. HERO SECTION */}
      <Box className="bg-gray-50 py-16 md:py-24 text-center">
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900"
          >
            Get in Touch
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto"
          >
            We’re here to help. Whether you have a question about features,
            pricing, or anything else, our team is ready to answer.
          </Typography>
        </Container>
      </Box>

      {/* 3. MAIN CONTENT (Form + Info) */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Paper
          elevation={0}
          className="p-6 sm:p-12 shadow-2xl rounded-2xl border border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16"
        >
          {/* --- Column 1: Contact Info (FIXED) --- */}
          <Box>
            <Typography
              variant="h4"
              component="h2"
              className="font-bold text-gray-900 mb-4"
            >
              Contact Information
            </Typography>
            <Typography className="text-gray-600 mb-8 leading-relaxed">
              Fill out the form, and our team will get back to you within 24
              hours. For enterprise inquiries, please use our sales email for a
              faster response.
            </Typography>
            {/* --- FIX: Added 'space-y-4' to the List for spacing --- */}
            <List className="space-y-4">
              <ListItem disableGutters alignItems="flex-start" className="p-0">
                <ListItemIcon className="mr-4 mt-1">
                  <FaHandshake className="text-blue-600 text-xl" />
                </ListItemIcon>
                <ListItemText
                  primary="B2B & Enterprise Sales"
                  secondary="sales@zyntra.com"
                  primaryTypographyProps={{
                    className: "font-semibold text-gray-900",
                  }}
                  secondaryTypographyProps={{
                    className: "text-blue-600 hover:underline",
                  }}
                />
              </ListItem>

              {/* --- FIX: ADDED BACK TECHNICAL SUPPORT --- */}
              <ListItem disableGutters alignItems="flex-start" className="p-0">
                <ListItemIcon className="mr-4 mt-1">
                  <FaTools className="text-blue-600 text-xl" />
                </ListItemIcon>
                <ListItemText
                  primary="Technical Support"
                  secondary="support@zyntra.com"
                  primaryTypographyProps={{
                    className: "font-semibold text-gray-900",
                  }}
                  secondaryTypographyProps={{
                    className: "text-blue-600 hover:underline",
                  }}
                />
              </ListItem>

              {/* --- FIX: ADDED BACK GENERAL INQUIRIES --- */}
              <ListItem disableGutters alignItems="flex-start" className="p-0">
                <ListItemIcon className="mr-4 mt-1">
                  <FaQuestionCircle className="text-blue-600 text-xl" />
                </ListItemIcon>
                <ListItemText
                  primary="General Inquiries"
                  secondary="hello@zyntra.com"
                  primaryTypographyProps={{
                    className: "font-semibold text-gray-900",
                  }}
                  secondaryTypographyProps={{
                    className: "text-blue-600 hover:underline",
                  }}
                />
              </ListItem>

              <ListItem disableGutters alignItems="flex-start" className="p-0">
                <ListItemIcon className="mr-4 mt-1">
                  <FaBuilding className="text-blue-600 text-xl" />
                </ListItemIcon>
                <ListItemText
                  primary="Our Office"
                  secondary="123 Exam Plaza, Lagos, Nigeria"
                  primaryTypographyProps={{
                    className: "font-semibold text-gray-900",
                  }}
                  secondaryTypographyProps={{ className: "text-gray-600" }}
                />
              </ListItem>
            </List>
          </Box>

          {/* --- Column 2: Contact Form (Spacing is fixed) --- */}
          <Box>
            <Box component="form" onSubmit={handleSubmit}>
              <Box mb={3}>
                <TextField
                  select
                  fullWidth
                  variant="outlined"
                  label="Reason for Inquiry"
                  name="inquiry"
                  value={formData.inquiry}
                  onChange={handleChange}
                >
                  <MenuItem value="sales">Enterprise/B2B Sales</MenuItem>
                  <MenuItem value="support">Technical Support</MenuItem>
                  <MenuItem value="general">General Inquiry</MenuItem>
                </TextField>
              </Box>

              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-6" mb={3}>
                <TextField
                  required
                  fullWidth
                  variant="outlined"
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <TextField
                  required
                  fullWidth
                  variant="outlined"
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </Box>

              <Box mb={3}>
                <TextField
                  required
                  fullWidth
                  type="email"
                  variant="outlined"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Box>

              <Box mb={3}>
                <TextField
                  fullWidth
                  type="tel"
                  variant="outlined"
                  label="Phone (Optional)"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Box>

              <Box mb={3}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="Your Message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                />
              </Box>

              <Button
                type="submit"
                color="inherit"
                size="large"
                disabled={isSubmitting}
                className="w-full flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                sx={{ border: "none" }}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <FaPaperPlane />
                  )
                }
              >
                <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
              </Button>

              {/* Submission Status Alerts */}
              {submitStatus === "success" && (
                <Alert severity="success" className="mt-6">
                  Thank you! Your message has been sent. We'll get back to you
                  soon.
                </Alert>
              )}
              {submitStatus === "error" && (
                <Alert severity="error" className="mt-6">
                  Something went wrong. Please try again later or email us
                  directly.
                </Alert>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* 4. FOOTER */}
      <Footer />
    </Box>
  );
};

export default ContactPage;