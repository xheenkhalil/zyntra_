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
} from "@mui/material";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// Import components
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";

// Import icons
import {
  FaCheckCircle,
  FaBuilding,
  FaUsers,
  FaComments,
  FaFileAlt,
  FaRocket,
  FaGraduationCap,
  FaBolt,
  FaEye,
  FaFingerprint,
  FaRobot,
  FaUserTie,
  FaArrowRight,
  FaShieldAlt,
  FaCalculator,
  FaUniversity,
} from "react-icons/fa";

// --- Credit multiplier data ---
const creditMultipliers = [
  {
    icon: <FaFileAlt />,
    feature: "Basic Exam (no proctoring)",
    credits: "1 credit",
    desc: "Standard exam delivery",
  },
  {
    icon: <FaEye />,
    feature: "AI Proctoring",
    credits: "2 credits",
    desc: "Real-time AI monitoring",
  },
  {
    icon: <FaFingerprint />,
    feature: "Biometric Verification",
    credits: "+1 credit",
    desc: "Identity verification add-on",
  },
  {
    icon: <FaRobot />,
    feature: "Auto-Grading (AI Essays)",
    credits: "+1 credit",
    desc: "NLP-powered essay scoring",
  },
  {
    icon: <FaUserTie />,
    feature: "Live Proctoring (coming soon)",
    credits: "5 credits",
    desc: "Human-supervised exams",
  },
];

// --- Plan Data ---
type PlanView = "subscription" | "payasyougo";

const subscriptionPlans = [
  {
    name: "Starter",
    price: "Free",
    per: "",
    credits: "50 credits/mo",
    description: "For individual teachers and small tryouts.",
    extraCreditCost: "$0.50/credit",
    features: [
      "50 credits included monthly",
      "Up to 2 admin seats",
      "Basic exam builder",
      "Standard analytics",
      "Email support",
    ],
    buttonLabel: "Start Free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$49",
    per: "/mo",
    credits: "500 credits/mo",
    description: "For coaching centres and growing teams.",
    extraCreditCost: "$0.35/credit",
    features: [
      "500 credits included monthly",
      "Up to 5 admin seats",
      "AI proctoring enabled",
      "Advanced analytics",
      "Custom branding",
      "Priority email support",
    ],
    buttonLabel: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$149",
    per: "/mo",
    credits: "2,000 credits/mo",
    description: "For schools and training companies.",
    extraCreditCost: "$0.25/credit",
    features: [
      "2,000 credits included monthly",
      "Up to 15 admin seats",
      "Full AI proctoring suite",
      "Biometric verification",
      "Auto-grading (essays & code)",
      "API access",
      "Chat & email support",
    ],
    buttonLabel: "Get Started",
    highlighted: true,
    popular: true,
  },
  {
    name: "Institution",
    price: "$399",
    per: "/mo",
    credits: "10,000 credits/mo",
    description: "For universities and large institutions.",
    extraCreditCost: "$0.15/credit",
    features: [
      "10,000 credits included monthly",
      "Unlimited admin seats",
      "Everything in Professional",
      "SSO / SAML integration",
      "Dedicated account manager",
      "SLA & uptime guarantee",
      "Phone, chat & email support",
    ],
    buttonLabel: "Get Started",
    highlighted: false,
  },
];

const creditBundles = [
  {
    name: "Micro",
    credits: "500",
    price: "$199",
    perCredit: "$0.40",
    validity: "90 days",
    bestFor: "One-off assessments",
  },
  {
    name: "Standard",
    credits: "2,000",
    price: "$599",
    perCredit: "$0.30",
    validity: "6 months",
    bestFor: "Semester exams",
  },
  {
    name: "Bulk",
    credits: "10,000",
    price: "$1,999",
    perCredit: "$0.20",
    validity: "12 months",
    bestFor: "Annual exam cycles",
    popular: true,
  },
  {
    name: "Mega",
    credits: "50,000",
    price: "$4,999",
    perCredit: "$0.10",
    validity: "12 months",
    bestFor: "Large-scale deployments",
  },
];

// --- Main Pricing Page Component ---
const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [planView, setPlanView] = useState<PlanView>("subscription");

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: PlanView | null
  ) => {
    if (newView !== null) {
      setPlanView(newView);
    }
  };

  return (
    <Box className="bg-white">
      {/* 1. NAVIGATION */}
      <Navbar />

      {/* 2. HERO SECTION */}
      <Box className="relative bg-[#111A50] text-white py-20 md:py-28 text-center overflow-hidden">
        <Box className="absolute inset-0 overflow-hidden opacity-20">
          <Box className="floating-element absolute top-10 left-10 w-16 h-16 glass-effect rounded-full"></Box>
          <Box className="floating-element absolute top-40 right-20 w-12 h-12 glass-effect rounded-full"></Box>
          <Box className="floating-element absolute bottom-20 left-1/4 w-20 h-20 glass-effect rounded-full"></Box>
        </Box>
        <Container maxWidth="md" className="relative z-10">
          <Chip
            label="Simple, Transparent Pricing"
            className="mb-6 !bg-white/10 !text-white/90 font-medium"
          />
          <Typography
            variant="h2"
            component="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            Pay Only for the Exams You Deliver
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-2"
          >
            No monthly waste. No annual lock-in. Credits that scale with your
            needs — from 50 students to 50,000.
          </Typography>
          <Typography className="text-white/60 text-sm max-w-xl mx-auto">
            1 credit = 1 student taking 1 exam. That's it.
          </Typography>
        </Container>
      </Box>

      {/* 3. HOW CREDITS WORK */}
      <Box className="bg-gray-50 py-12">
        <Container maxWidth="lg">
          <Box className="text-center mb-8">
            <Typography className="text-sm font-semibold text-[#111A50] uppercase mb-2">
              How It Works
            </Typography>
            <Typography
              variant="h4"
              className="text-xl sm:text-2xl font-bold text-gray-900"
            >
              Simple Credit-Based Pricing
            </Typography>
          </Box>
          <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {creditMultipliers.map((item) => (
              <Paper
                key={item.feature}
                elevation={0}
                className="p-4 rounded-xl border border-gray-200 text-center hover:shadow-md transition-shadow"
              >
                <Box className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  {React.isValidElement(item.icon)
                    ? React.cloneElement(
                        item.icon as React.ReactElement<any, any>,
                        {
                          className: "text-[#111A50]",
                        }
                      )
                    : item.icon}
                </Box>
                <Typography className="font-semibold text-gray-900 text-sm mb-1">
                  {item.feature}
                </Typography>
                <Typography className="text-[#111A50] font-bold text-lg">
                  {item.credits}
                </Typography>
                <Typography className="text-gray-500 text-xs mt-1">
                  {item.desc}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* 4. PLAN TOGGLE */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="text-center mb-10">
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Choose How You Pay
          </Typography>
          <Typography className="text-gray-600 max-w-2xl mx-auto mb-8">
            Subscribe monthly for ongoing access with included credits, or buy
            credit bundles for one-off exam events — no subscription required.
          </Typography>
          <ToggleButtonGroup
            value={planView}
            exclusive
            onChange={handleViewChange}
            className="!rounded-xl overflow-hidden"
          >
            <ToggleButton
              value="subscription"
              className="!px-6 !py-2.5 !normal-case !font-semibold"
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#111A50 !important",
                  color: "#fff !important",
                },
              }}
            >
              <FaBolt className="mr-2 text-sm" />
              Monthly Plans
            </ToggleButton>
            <ToggleButton
              value="payasyougo"
              className="!px-6 !py-2.5 !normal-case !font-semibold"
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#111A50 !important",
                  color: "#fff !important",
                },
              }}
            >
              <FaCalculator className="mr-2 text-sm" />
              Credit Bundles
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* SUBSCRIPTION PLANS */}
        {planView === "subscription" && (
          <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionPlans.map((plan) => (
              <Paper
                key={plan.name}
                elevation={plan.highlighted ? 4 : 1}
                className={`p-6 rounded-2xl flex flex-col relative ${
                  plan.highlighted
                    ? "border-2 border-[#111A50] scale-[1.02]"
                    : "border border-gray-200"
                }`}
              >
                {plan.popular && (
                  <Chip
                    label="Most Popular"
                    size="small"
                    className="!absolute -top-3 left-1/2 !-translate-x-1/2 !bg-[#111A50] !text-white !font-semibold"
                  />
                )}
                <Typography className="font-bold text-gray-900 text-xl mt-2">
                  {plan.name}
                </Typography>
                <Typography className="text-gray-500 text-sm mt-1 mb-4">
                  {plan.description}
                </Typography>

                {/* Price */}
                <Box className="flex items-baseline mb-1">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.per && (
                    <span className="text-gray-500 ml-1">{plan.per}</span>
                  )}
                </Box>
                <Typography className="text-[#111A50] font-semibold text-sm mb-1">
                  {plan.credits}
                </Typography>
                <Typography className="text-gray-400 text-xs mb-4">
                  Extra: {plan.extraCreditCost}
                </Typography>

                {/* CTA */}
                <Button
                  variant={plan.highlighted ? "contained" : "outlined"}
                  size="large"
                  className={`w-full !normal-case !font-semibold !rounded-lg ${
                    plan.highlighted
                      ? "!bg-[#111A50] !text-white hover:!bg-[#080D2B]"
                      : "!border-[#111A50] !text-[#111A50]"
                  }`}
                  onClick={() => navigate("/register")}
                >
                  {plan.buttonLabel}
                </Button>

                {/* Features */}
                <ul className="mt-6 space-y-2.5 flex-grow list-none p-0 m-0">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start space-x-2">
                      <FaCheckCircle className="text-green-500 text-xs mt-1 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </Paper>
            ))}
          </Box>
        )}

        {/* PAY-AS-YOU-GO BUNDLES */}
        {planView === "payasyougo" && (
          <Box>
            <Box className="text-center mb-8">
              <Typography className="text-gray-600 max-w-xl mx-auto">
                Buy credits upfront — no subscription needed. Perfect for
                one-off exams, seasonal testing, or institutions with
                unpredictable schedules.
              </Typography>
            </Box>
            <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {creditBundles.map((bundle) => (
                <Paper
                  key={bundle.name}
                  elevation={bundle.popular ? 4 : 1}
                  className={`p-6 rounded-2xl flex flex-col text-center relative ${
                    bundle.popular
                      ? "border-2 border-[#111A50] scale-[1.02]"
                      : "border border-gray-200"
                  }`}
                >
                  {bundle.popular && (
                    <Chip
                      label="Best Value"
                      size="small"
                      className="!absolute -top-3 left-1/2 !-translate-x-1/2 !bg-[#111A50] !text-white !font-semibold"
                    />
                  )}
                  <Typography className="font-bold text-gray-900 text-xl mt-2">
                    {bundle.name}
                  </Typography>
                  <Typography className="text-gray-500 text-sm mt-1">
                    {bundle.bestFor}
                  </Typography>

                  <Box className="my-6">
                    <Typography className="text-4xl font-extrabold text-gray-900">
                      {bundle.price}
                    </Typography>
                    <Typography className="text-[#111A50] font-bold text-lg mt-1">
                      {bundle.credits} credits
                    </Typography>
                    <Typography className="text-gray-400 text-sm">
                      {bundle.perCredit} per credit
                    </Typography>
                  </Box>

                  <Typography className="text-gray-500 text-xs mb-4 bg-gray-50 rounded-lg py-2">
                    Valid for {bundle.validity}
                  </Typography>

                  <Button
                    variant={bundle.popular ? "contained" : "outlined"}
                    size="large"
                    className={`w-full !normal-case !font-semibold !rounded-lg mt-auto ${
                      bundle.popular
                        ? "!bg-[#111A50] !text-white hover:!bg-[#080D2B]"
                        : "!border-[#111A50] !text-[#111A50]"
                    }`}
                    onClick={() => navigate("/register")}
                  >
                    Buy Credits
                  </Button>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </Container>

      {/* 5. EDUCATION DISCOUNT */}
      <Box className="bg-gray-50 py-12 md:py-16">
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            className="p-6 sm:p-10 rounded-2xl border border-green-200 bg-green-50"
          >
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <Box>
                <Box className="flex items-center space-x-2 mb-3">
                  <FaUniversity className="text-green-600 text-xl" />
                  <Typography className="font-bold text-green-800 text-lg">
                    Education Discount
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  className="text-xl sm:text-2xl font-bold text-gray-900 mb-3"
                >
                  Special Pricing for Public & Government Schools
                </Typography>
                <Typography className="text-gray-700 leading-relaxed mb-4">
                  We believe every institution deserves access to world-class
                  assessment tools. Public schools, government institutions, and
                  non-profit educational organisations qualify for significant
                  discounts on all plans and credit bundles.
                </Typography>
                <ul className="space-y-2 list-none p-0 m-0">
                  <li className="flex items-center space-x-2">
                    <FaCheckCircle className="text-green-500 text-sm" />
                    <span className="text-gray-700 text-sm">
                      Up to 40% off on subscription plans
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaCheckCircle className="text-green-500 text-sm" />
                    <span className="text-gray-700 text-sm">
                      Reduced per-credit rates on all bundles
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaCheckCircle className="text-green-500 text-sm" />
                    <span className="text-gray-700 text-sm">
                      Free onboarding and training for staff
                    </span>
                  </li>
                </ul>
              </Box>
              <Box className="text-center">
                <Box className="bg-white rounded-2xl p-6 shadow-md inline-block">
                  <FaGraduationCap className="text-5xl text-green-600 mx-auto mb-4" />
                  <Typography className="font-bold text-gray-900 text-lg mb-2">
                    Eligible?
                  </Typography>
                  <Typography className="text-gray-600 text-sm mb-4">
                    Public schools, state universities, and government
                    institutions.
                  </Typography>
                  <Button
                    variant="contained"
                    className="!bg-green-600 !text-white hover:!bg-green-700 !normal-case !font-semibold !rounded-lg"
                    onClick={() => navigate("/contact")}
                  >
                    Apply for Education Pricing
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* 6. CREDIT CALCULATOR EXAMPLE */}
      <Container maxWidth="lg" className="py-16 md:py-24">
        <Box className="text-center mb-10">
          <Typography className="text-sm font-semibold text-[#111A50] uppercase mb-2">
            See It In Action
          </Typography>
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4"
          >
            Real-World Pricing Examples
          </Typography>
          <Typography className="text-gray-600 max-w-2xl mx-auto">
            No surprises. Here's exactly what it costs for common exam
            scenarios.
          </Typography>
        </Box>
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Scenario 1 */}
          <Paper
            elevation={0}
            className="p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <Typography className="font-bold text-gray-900 text-lg mb-1">
              Small Coaching Centre
            </Typography>
            <Typography className="text-gray-500 text-sm mb-4">
              Weekly quizzes for a single class
            </Typography>
            <Box className="space-y-2 text-sm text-gray-700 mb-4">
              <p>
                <strong>30 students</strong> × 4 quizzes/month
              </p>
              <p>Basic exams (no proctoring)</p>
              <p>= 120 credits/month</p>
            </Box>
            <Box className="bg-[#111A50]/5 rounded-xl p-4 text-center">
              <Typography className="text-2xl font-bold text-[#111A50]">
                Free
              </Typography>
              <Typography className="text-gray-500 text-xs">
                Covered by Starter plan (50 free) + $35 extra
              </Typography>
            </Box>
          </Paper>

          {/* Scenario 2 */}
          <Paper
            elevation={0}
            className="p-6 rounded-2xl border-2 border-[#111A50] hover:shadow-lg transition-shadow"
          >
            <Typography className="font-bold text-gray-900 text-lg mb-1">
              University Mid-Terms
            </Typography>
            <Typography className="text-gray-500 text-sm mb-4">
              AI-proctored exams for a department
            </Typography>
            <Box className="space-y-2 text-sm text-gray-700 mb-4">
              <p>
                <strong>500 students</strong> × 5 exams
              </p>
              <p>AI proctoring (2 credits each)</p>
              <p>= 5,000 credits</p>
            </Box>
            <Box className="bg-[#111A50]/5 rounded-xl p-4 text-center">
              <Typography className="text-2xl font-bold text-[#111A50]">
                $999
              </Typography>
              <Typography className="text-gray-500 text-xs">
                Bulk Bundle at $0.20/credit
              </Typography>
            </Box>
          </Paper>

          {/* Scenario 3 */}
          <Paper
            elevation={0}
            className="p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <Typography className="font-bold text-gray-900 text-lg mb-1">
              National Exam Board
            </Typography>
            <Typography className="text-gray-500 text-sm mb-4">
              15,000 students over 3 days
            </Typography>
            <Box className="space-y-2 text-sm text-gray-700 mb-4">
              <p>
                <strong>15,000 students</strong> × 1 exam
              </p>
              <p>AI proctoring (2 credits each)</p>
              <p>= 30,000 credits</p>
            </Box>
            <Box className="bg-[#111A50]/5 rounded-xl p-4 text-center">
              <Typography className="text-2xl font-bold text-[#111A50]">
                $3,000
              </Typography>
              <Typography className="text-gray-500 text-xs">
                Mega Bundle at $0.10/credit
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* 7. ENTERPRISE CTA */}
      <Box className="bg-[#111A50] py-16 md:py-24">
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            className="p-8 sm:p-12 rounded-2xl shadow-xl border-t-4 border-[#111A50]"
          >
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <Box className="md:col-span-2">
                <Typography
                  variant="h4"
                  component="h3"
                  className="text-2xl sm:text-3xl font-bold text-gray-900"
                >
                  Need a Custom Enterprise Solution?
                </Typography>
                <Typography className="text-lg text-gray-700 mt-4 leading-relaxed">
                  For exam boards, government agencies, and organisations with
                  100,000+ students — we offer custom volume pricing, dedicated
                  infrastructure, and white-label deployment options.
                </Typography>
                <Box className="grid grid-cols-2 gap-4 mt-6">
                  <Box className="flex items-center space-x-2">
                    <FaUsers className="text-[#111A50]" />
                    <span className="text-gray-700 text-sm">
                      Unlimited admins
                    </span>
                  </Box>
                  <Box className="flex items-center space-x-2">
                    <FaBuilding className="text-[#111A50]" />
                    <span className="text-gray-700 text-sm">
                      SSO / SAML integration
                    </span>
                  </Box>
                  <Box className="flex items-center space-x-2">
                    <FaComments className="text-[#111A50]" />
                    <span className="text-gray-700 text-sm">
                      Dedicated account manager
                    </span>
                  </Box>
                  <Box className="flex items-center space-x-2">
                    <FaShieldAlt className="text-[#111A50]" />
                    <span className="text-gray-700 text-sm">
                      99.9% uptime SLA
                    </span>
                  </Box>
                  <Box className="flex items-center space-x-2">
                    <FaFileAlt className="text-[#111A50]" />
                    <span className="text-gray-700 text-sm">
                      Custom contracts & invoicing
                    </span>
                  </Box>
                  <Box className="flex items-center space-x-2">
                    <FaRocket className="text-[#111A50]" />
                    <span className="text-gray-700 text-sm">
                      Credits from $0.05 each
                    </span>
                  </Box>
                </Box>
              </Box>

              <Box className="text-center md:text-right">
                <Button
                  color="inherit"
                  onClick={() => navigate("/contact")}
                  className="!px-8 !py-3 !bg-[#111A50] hover:!bg-[#080D2B] !text-white !rounded-lg !font-semibold !shadow-lg hover:!shadow-xl !transform hover:!-translate-y-0.5 !normal-case"
                  sx={{ border: "none" }}
                  endIcon={<FaArrowRight />}
                >
                  Contact Sales
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* 8. FAQ SECTION */}
      <Container maxWidth="md" className="py-16 md:py-24">
        <Typography
          variant="h3"
          component="h2"
          className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10"
        >
          Frequently Asked Questions
        </Typography>
        <Box className="space-y-6">
          {[
            {
              q: "What exactly is a credit?",
              a: "1 credit = 1 student taking 1 basic exam. Features like AI proctoring, biometric verification, or auto-grading consume additional credits per session. You can see the exact multiplier for each feature on this page.",
            },
            {
              q: "Do unused credits roll over?",
              a: "Credits included in subscription plans are allocated monthly and do not roll over to the next month. Credit bundles (pay-as-you-go) are valid for the duration specified on the bundle (90 days to 12 months).",
            },
            {
              q: "Can I mix subscription + credit bundles?",
              a: "Yes! Many institutions use a subscription plan for their baseline monthly exams, then purchase a credit bundle for peak exam seasons (mid-terms, finals) when they need extra capacity.",
            },
            {
              q: "What currencies do you support?",
              a: "We offer regional pricing in multiple currencies including USD, GBP, EUR, and NGN. Your currency is automatically detected based on your location, or you can select it manually in the billing settings.",
            },
            {
              q: "Is there a minimum commitment for Enterprise?",
              a: "Enterprise plans include a 12-month minimum term to ensure dedicated infrastructure provisioning and priority SLA. This comes with the benefit of the lowest per-credit rates available.",
            },
            {
              q: "Do you offer discounts for educational institutions?",
              a: "Yes! Public schools, government institutions, and non-profit educational organisations qualify for up to 40% off on all plans and credit bundles. Contact our sales team to apply.",
            },
          ].map((faq) => (
            <Paper
              key={faq.q}
              elevation={0}
              className="p-5 rounded-xl border border-gray-200"
            >
              <Typography className="font-semibold text-gray-900 mb-2">
                {faq.q}
              </Typography>
              <Typography className="text-gray-600 text-sm leading-relaxed">
                {faq.a}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* 9. BOTTOM CTA */}
      <Box className="bg-[#111A50] py-16">
        <Container maxWidth="md" className="text-center">
          <Typography
            variant="h3"
            component="h2"
            className="text-2xl sm:text-3xl font-bold text-white mb-4"
          >
            Ready to Get Started?
          </Typography>
          <Typography className="text-white/70 max-w-xl mx-auto mb-8">
            Start with 50 free credits — no credit card required. Scale up as
            you grow.
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="flex items-center space-x-2 px-8 py-3 bg-white text-[#111A50] rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition-colors no-underline"
            >
              <FaRocket />
              <span>Start Free</span>
            </Link>
            <Link
              to="/contact"
              className="flex items-center space-x-2 px-8 py-3 text-white/80 hover:text-white border border-white/30 rounded-lg font-medium transition-colors no-underline"
            >
              <FaComments />
              <span>Talk to Sales</span>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* 10. FOOTER */}
      <Footer />
    </Box>
  );
};

export default PricingPage;