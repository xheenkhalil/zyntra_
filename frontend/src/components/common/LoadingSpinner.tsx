import React from "react";
import { Box, CircularProgress } from "@mui/material";

/**
 * A simple, centered loading spinner component used for Suspense fallbacks.
 */
const LoadingSpinner: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 4,
        my: 4,
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default LoadingSpinner;