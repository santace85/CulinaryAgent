import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./theme.css";
import { ThemeProvider } from "./context/ThemeContext";
import { MeasurementProvider } from "./context/MeasurementContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <MeasurementProvider>
        <App />
      </MeasurementProvider>
    </ThemeProvider>
  </StrictMode>,
);
