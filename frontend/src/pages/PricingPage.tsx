import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Import components
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";

// Import icons
import {
  FaCheckCircle,
  FaBuilding,
  FaUsers,
  FaFileAlt,
  FaComments,
} from "react-icons/fa";

// --- Pricing Tier Data ---
// In a real app, this might come from your DB/Stripe
const tiers = {
  monthly: [
    {
      name: "Starter",
      price: "$49",
      per: "/ mo",
      description: "For individual instructors and small teams getting started.",
      features: [
        "5 Admin/Creator Seats",
        "15 AI-Proctored Exams / mo",
        "Unlimited Guest Quizzes",
        "Basic Exam Builder",
        "Standard Analytics",
      ],
      buttonVariant: "outlined",
    },
    {
      name: "Pro",
      price: "$199",
      per: "/ mo",
      description: "For growing schools and businesses needing advanced security.",
      features: [
        "15 Admin/Creator Seats",
        "500 AI-Proctored Exams / mo",
        "Full AI Proctoring (Gaze, Audio, etc.)",
        "Biometric Verification",
        "Advanced Analytics & Reporting",
        "Custom Branding",
      ],
      buttonVariant: "contained",
      popular: true,
    },
    {
      name: "Scale",
      price: "$499",
      per: "/ mo",
      description: "For large institutions and high-volume testing.",
      features: [
        "50 Admin/Creator Seats",
        "2,000 AI-Proctored Exams / mo",
        "Everything in Pro",
        "API Access for Integrations",
        "Priority Support (Email & Chat)",
      ],
      buttonVariant: "outlined",
    },
  ],
  annually: [
    {
      name: "Starter",
      price: "$40",
      per: "/ mo",
      description: "For individual instructors and small teams getting started.",
      features: [
        "5 Admin/Creator Seats",
        "50 AI-Proctored Exams / mo",
        "Unlimited Guest Quizzes",
        "Basic Exam Builder",
        "Standard Analytics",
      ],
      buttonVariant: "outlined",
    },
    {
      name: "Pro",
      price: "$165",
      per: "/ mo",
      description: "For growing schools and businesses needing advanced security.",
      features: [
        "15 Admin/Creator Seats",
        "500 AI-Proctored Exams / mo",
        "Full AI Proctoring (Gaze, Audio, etc.)",
        "Biometric Verification",
        "Advanced Analytics & Reporting",
        "Custom Branding",
      ],
      buttonVariant: "contained",
      popular: true,
    },
    {
      name: "Scale",
      price: "$415",
      per: "/ mo",
      description: "For large institutions and high-volume testing.",
      features: [
        "50 Admin/Creator Seats",
        "2,000 AI-Proctored Exams / mo",
        "Everything in Pro",
        "API Access for Integrations",
        "Priority Support (Email & Chat)",
      ],
      buttonVariant: "outlined",
    },
  ],
};

// --- Main Pricing Page Component ---
const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "monthly"
  );

  const handleCycleChange = (
    event: React.MouseEvent<HTMLElement>,
    newCycle: "monthly" | "annually" | null
  ) => {
    if (newCycle !== null) {
      setBillingCycle(newCycle);
    }
  };

  const currentTiers = tiers[billingCycle];

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
            Flexible Plans for Every Team
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto"
          >
            Choose the plan that fits your institution's needs. From solo
            instructors to large-scale universities, we have you covered.
          </Typography>

          {/* Monthly/Annual Toggle */}
          <Box className="mt-8 flex justify-center">
            <ToggleButtonGroup
              value={billingCycle}
              exclusive
              onChange={handleCycleChange}
              color="primary"
            >
              <ToggleButton value="monthly" className="px-6 py-2">
                Monthly
              </ToggleButton>
              <ToggleButton value="annually" className="px-6 py-2">
                Annually (Save 20%)
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Container>
      </Box>

      {/* 3. PRICING TIERS GRID */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {currentTiers.map((tier) => (
            <Paper
              key={tier.name}
              elevation={tier.popular ? 4 : 1}
              // The "Most Popular" card has a border
              className={`p-6 sm:p-8 rounded-2xl flex flex-col ${
                tier.popular ? "border-2 border-blue-600" : "border"
              }`}
              sx={{
                borderColor: tier.popular ? "primary.main" : "divider",
              }}
            >
              {/* "Most Popular" Badge */}
              {tier.popular && (
                <Chip
                  label="Most Popular"
                  color="primary"
                  className="w-fit font-semibold"
                  size="small"
                />
              )}
              
              <Typography
                variant="h4"
                component="h3"
                className={`text-2xl font-bold mt-4 ${
                  tier.popular ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {tier.name}
              </Typography>
              <Typography className="text-gray-600 mt-2">
                {tier.description}
              </Typography>

              {/* Price */}
              <Box className="flex items-baseline my-6">
                <span className="text-4xl font-extrabold text-gray-900">
                  {tier.price}
                </span>
                <span className="text-lg text-gray-600 ml-1">{tier.per}</span>
              </Box>

              {/* Get Started Button */}
              <Button
                variant={
                  tier.buttonVariant as "outlined" | "contained" | "text"
                }
                color="primary"
                size="large"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Get Started
              </Button>

              {/* Features List */}
              <List className="mt-6 space-y-2 flex-grow">
                {tier.features.map((feature) => (
                  <ListItem key={feature} disableGutters>
                    <ListItemIcon className="min-w-0 mr-3">
                      <FaCheckCircle className="text-green-500" />
                    </ListItemIcon>
                    <ListItemText
                      primary={feature}
                      className="text-gray-700"
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* 4. CUSTOMIZATION (ENTERPRISE) TIER */}
      <Box className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 md:py-24">
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            className="p-8 sm:p-12 rounded-2xl shadow-xl border-t-4 border-blue-600"
          >
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <Box className="md:col-span-2">
                <Typography
                  variant="h4"
                  component="h3"
                  className="text-2xl sm:text-3xl font-bold text-gray-900"
                >
                  Need a Custom Solution?
                </Typography>
                <Typography className="text-lg text-gray-700 mt-4 leading-relaxed">
                  For large-scale enterprises with unique requirements, we offer
                  custom plans. Get unlimited exams, SAML/SSO integration,
                  on-premise deployment options, and a dedicated account
                  manager.
                </Typography>
                <List className="mt-4">
                  <ListItem disableGutters className="w-1/2 inline-block">
                    <ListItemIcon className="min-w-0 mr-2">
                      <FaUsers className="text-blue-600" />
                    </ListItemIcon>
                    <ListItemText primary="Unlimited Admins" />
                  </ListItem>
                  <ListItem disableGutters className="w-1/2 inline-block">
                    <ListItemIcon className="min-w-0 mr-2">
                      <FaBuilding className="text-blue-600" />
                    </ListItemIcon>
                    <ListItemText primary="SSO Integration" />
                  </ListItem>
                  <ListItem disableGutters className="w-1/2 inline-block">
                    <ListItemIcon className="min-w-0 mr-2">
                      <FaComments className="text-blue-600" />
                    </ListItemIcon>
                    <ListItemText primary="Dedicated Support" />
                  </ListItem>
                  <ListItem disableGutters className="w-1/2 inline-block">
                    <ListItemIcon className="min-w-0 mr-2">
                      <FaFileAlt className="text-blue-600" />
                    </ListItemIcon>
                    <ListItemText primary="Custom Contracts" />
                  </ListItem>
                </List>
              </Box>

              <Box className="text-center md:text-right">
                <Button
                  color="inherit"
                  onClick={() => navigate("/login")} // Or a /contact-sales page
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  sx={{ border: "none" }}
                >
                  Contact Sales
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* 5. FOOTER */}
      <Footer />
    </Box>
  );
};

export default PricingPage;