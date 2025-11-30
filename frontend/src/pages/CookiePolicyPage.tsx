import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { FaCookieBite } from 'react-icons/fa';
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";

const CookiePolicyPage: React.FC = () => {
    return (
        <div className="bg-white">
            <Navbar />
            <Box className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <Container maxWidth="lg">
                    <Paper elevation={0} className="p-8 md:p-12 rounded-2xl border border-gray-200 bg-white">
                        <Box className="flex items-center space-x-4 mb-8">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                                <FaCookieBite className="text-2xl" />
                            </div>
                            <div>
                                <Typography variant="h3" component="h1" className="text-3xl font-bold text-gray-900">
                                    Cookie Policy
                                </Typography>
                                <Typography variant="subtitle1" className="text-gray-500 mt-1">
                                    Last Updated: {new Date().toLocaleDateString()}
                                </Typography>
                            </div>
                        </Box>

                        <div className="prose prose-lg max-w-none text-gray-600">
                            <p className="lead text-xl text-gray-700 mb-8">
                                This Cookie Policy explains how Zyntra uses cookies and similar technologies to recognize you when you visit our website and use our platform.
                            </p>

                            <section className="mb-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    1. What are Cookies?
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
                                </Typography>
                            </section>

                            <Divider className="my-8" />

                            <section className="mb-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    2. How We Use Cookies
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    We use cookies for several reasons:
                                </Typography>
                                <ul className="list-disc pl-6 space-y-4 mb-4">
                                    <li>
                                        <strong>Essential Cookies:</strong> These are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas (e.g., logging in to take an exam).
                                    </li>
                                    <li>
                                        <strong>Performance & Functionality Cookies:</strong> These are used to enhance the performance and functionality of our website but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.
                                    </li>
                                    <li>
                                        <strong>Analytics Cookies:</strong> These collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you.
                                    </li>
                                </ul>
                            </section>

                            <Divider className="my-8" />

                            <section className="mb-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    3. Third-Party Cookies
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    In some cases, we may use third-party cookies. For example, we use Google Analytics to help us understand how our users interact with the website. These third parties may use cookies to collect information about your activities on our website and other websites to provide you with targeted advertising based on your interests.
                                </Typography>
                            </section>

                            <Divider className="my-8" />

                            <section className="mb-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    4. Managing Cookies
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. In addition, most web browsers allow you to control cookies through their settings preferences.
                                </Typography>
                                <Typography variant="body1">
                                    Please note that if you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our website may be restricted.
                                </Typography>
                            </section>

                            <section className="mt-8">
                                <Typography variant="h5" className="font-bold text-gray-900 mb-4">
                                    5. Updates to This Policy
                                </Typography>
                                <Typography variant="body1">
                                    We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
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

export default CookiePolicyPage;
