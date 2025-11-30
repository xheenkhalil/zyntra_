import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { FaFileContract } from 'react-icons/fa';
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";

const TermsOfServicePage: React.FC = () => {
    return (
        <div className="bg-white">
            <Navbar />
            <Box className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <Container maxWidth="lg">
                    <Paper elevation={0} className="p-8 md:p-12 rounded-2xl border border-gray-200 bg-white">
                        <Box className="flex items-center space-x-4 mb-8">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                <FaFileContract className="text-2xl" />
                            </div>
                            <div>
                                <Typography variant="h3" component="h1" className="text-3xl font-bold text-gray-900">
                                    Terms of Service
                                </Typography>
                                <Typography variant="subtitle1" className="text-gray-500 mt-1">
                                    Last Updated: {new Date().toLocaleDateString()}
                                </Typography>
                            </div>
                        </Box>

                        <div className="prose prose-lg max-w-none text-gray-600">
                            <p className="lead text-xl text-gray-700 mb-8">
                                Welcome to Zyntra. By accessing or using our website and examination platform, you agree to be bound by these Terms of Service.
                            </p>

                            <section className="mb-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    1. Acceptance of Terms
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    By registering for, accessing, or using the Zyntra platform, you agree to comply with these Terms of Service and all applicable laws and regulations. If you do not agree with these terms, you are prohibited from using this site.
                                </Typography>
                            </section>

                            <Divider className="my-8" />

                            <section className="mb-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    2. User Accounts
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    To access certain features, you must create an account. You agree to:
                                </Typography>
                                <ul className="list-disc pl-6 space-y-2 mb-4">
                                    <li>Provide accurate, current, and complete information during registration.</li>
                                    <li>Maintain the security of your password and account credentials.</li>
                                    <li>Notify us immediately of any unauthorized use of your account.</li>
                                    <li>Accept responsibility for all activities that occur under your account.</li>
                                </ul>
                            </section>

                            <Divider className="my-8" />

                            <section className="mb-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    3. Academic Integrity & Conduct
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    Zyntra is committed to maintaining academic integrity. Users agree NOT to:
                                </Typography>
                                <ul className="list-disc pl-6 space-y-2 mb-4">
                                    <li>Attempt to bypass or manipulate the proctoring systems.</li>
                                    <li>Share exam content, questions, or answers with others.</li>
                                    <li>Use unauthorized materials or assistance during an examination.</li>
                                    <li>Impersonate another user or allow someone else to take an exam on your behalf.</li>
                                    <li>Engage in any activity that disrupts or interferes with the platform's operation.</li>
                                </ul>
                                <Typography variant="body1" className="italic mt-2">
                                    Violation of these rules may result in immediate account suspension and reporting to your educational institution.
                                </Typography>
                            </section>

                            <Divider className="my-8" />

                            <section className="mb-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    4. Intellectual Property
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    The Zyntra platform, including its code, design, logos, and content, is the property of Zyntra and is protected by copyright and intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the platform for its intended educational purposes.
                                </Typography>
                            </section>

                            <Divider className="my-8" />

                            <section className="mb-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    5. Limitation of Liability
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    Zyntra is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform, including but not limited to technical failures, data loss, or exam interruptions, although we strive to provide a stable and secure service.
                                </Typography>
                            </section>

                            <Divider className="my-8" />

                            <section className="mb-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    6. Termination
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    We reserve the right to terminate or suspend your account and access to the platform at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
                                </Typography>
                            </section>

                            <section>
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    7. Changes to Terms
                                </Typography>
                                <Typography variant="body1">
                                    We reserve the right to modify these terms at any time. We will notify users of significant changes. Your continued use of the platform constitutes acceptance of the modified terms.
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

export default TermsOfServicePage;
