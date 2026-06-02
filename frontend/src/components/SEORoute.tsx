import React from "react";
import SEO from "./SEO";
import seoConfig from "../config/seoConfig";

interface SEORouteProps {
  path: string;
  children: React.ReactNode;
}

/**
 * Wraps a page component with the appropriate SEO meta tags
 * based on the route path. Falls back to defaults if no config found.
 * 
 * Usage:
 * <Route path="/about" element={<SEORoute path="/about"><AboutPage /></SEORoute>} />
 */
const SEORoute: React.FC<SEORouteProps> = ({ path, children }) => {
  const config = seoConfig[path];

  if (!config) {
    return <>{children}</>;
  }

  return (
    <>
      <SEO
        title={config.title}
        description={config.description}
        keywords={config.keywords}
        ogType={config.ogType}
        structuredData={config.structuredData}
      />
      {children}
    </>
  );
};

export default SEORoute;
