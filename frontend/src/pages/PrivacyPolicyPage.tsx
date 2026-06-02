import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { FaShieldAlt } from 'react-icons/fa';
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="bg-white">
            <Navbar />
            <Box className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <Container maxWidth="lg">
                    <Paper elevation={0} className="p-8 md:p-12 rounded-2xl border border-gray-200 bg-white">
                        <Box className="flex items-center space-x-4 mb-8">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-[#111A50]">
                                <FaShieldAlt className="text-2xl" />
                            </div>
                            <div>
                                <Typography variant="h3" component="h1" className="text-3xl font-bold text-gray-900">
                                    Privacy Policy
                                </Typography>
                                <Typography variant="subtitle1" className="text-gray-500 mt-1">
                                    Last Updated: {new Date().toLocaleDateString()}
                                </Typography>
                            </div>
                        </Box>

                        <div className="prose prose-lg max-w-none text-gray-600">
                            <p className="lead text-xl text-gray-700 mb-8">
                                At Zyntra, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered examination platform.
                            </p>

                            <section className="mb-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    1. Information We Collect
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    We collect information that you provide directly to us when you register for an account, create or take an exam, or communicate with us. This may include:
                                </Typography>
                                <ul className="list-disc pl-6 space-y-2 mb-4">
                                    <li><strong>Personal Identification Information:</strong> Name, email address, phone number, and institutional affiliation.</li>
                                    <li><strong>Biometric Data:</strong> Facial recognition data used solely for identity verification and proctoring purposes during exams, with your explicit consent.</li>
                                    <li><strong>Usage Data:</strong> Information about how you interact with our platform, including log files, device information, and browser type.</li>
                                    <li><strong>Exam Data:</strong> Responses, scores, and performance analytics generated during assessments.</li>
                                </ul>
                            </section>

                            <Divider className="my-8" />

                            <section className="mb-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    2. How We Use Your Information
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    We use the collected information for specific educational and administrative purposes:
                                </Typography>
                                <ul className="list-disc pl-6 space-y-2 mb-4">
                                    <li>To provide, operate, and maintain our examination services.</li>
                                    <li>To verify student identity and ensure academic integrity through AI proctoring.</li>
                                    <li>To generate detailed performance analytics for students and educators.</li>
                                    <li>To communicate with you regarding account updates, exam schedules, and support.</li>
                                    <li>To improve our AI algorithms and platform functionality (using anonymized data).</li>
                                </ul>
                            </section>

                            <Divider className="my-8" />

                            <section className="mb-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    3. Data Protection & Security
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    We implement industry-standard security measures to protect your data:
                                </Typography>
                                <ul className="list-disc pl-6 space-y-2 mb-4">
                                    <li><strong>Encryption:</strong> All data is encrypted in transit (SSL/TLS) and at rest.</li>
                                    <li><strong>Access Controls:</strong> Strict role-based access controls ensure only authorized personnel can access sensitive data.</li>
                                    <li><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments.</li>
                                    <li><strong>Data Retention:</strong> We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy or as required by law.</li>
                                </ul>
                            </section>

                            <Divider className="my-8" />

                            <section className="mb-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    4. Sharing of Information
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    We do not sell your personal information. We may share information with:
                                </Typography>
                                <ul className="list-disc pl-6 space-y-2 mb-4">
                                    <li><strong>Educational Institutions:</strong> To report exam results and proctoring logs to your school or organization.</li>
                                    <li><strong>Service Providers:</strong> Third-party vendors who assist us in operating our platform (e.g., cloud hosting, email services), bound by strict confidentiality agreements.</li>
                                    <li><strong>Legal Requirements:</strong> If required by law or in response to valid requests by public authorities.</li>
                                </ul>
                            </section>

                            <Divider className="my-8" />

                            <section className="mb-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    5. Your Rights
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    Depending on your location (e.g., GDPR, CCPA), you may have the right to:
                                </Typography>
                                <ul className="list-disc pl-6 space-y-2 mb-4">
                                    <li>Access the personal data we hold about you.</li>
                                    <li>Request correction of inaccurate data.</li>
                                    <li>Request deletion of your data (subject to institutional retention policies).</li>
                                    <li>Object to processing of your data.</li>
                                </ul>
                            </section>

                            <section>
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    6. Contact Us
                                </Typography>
                                <Typography variant="body1">
                                    If you have any questions about this Privacy Policy, please contact us at:
                                    <br />
                                    <a href="mailto:privacy@zyntra.com" className="text-[#111A50] hover:underline">privacy@zyntra.com</a>
                                </Typography>
                            </section>
                        </div>
                    </Paper>
                </Container>
            </Box>
            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;
