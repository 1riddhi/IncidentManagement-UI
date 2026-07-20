import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { IncidentDetails } from "./pages/IncidentDetails";
import { IncidentProvider } from "./hooks/useIncidents";
export default function App() {
  return (
    <BrowserRouter><IncidentProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/incident/:id" element={<IncidentDetails />} />
        <Route path="*" element={<IncidentDetails />} />
      </Routes>
    </IncidentProvider></BrowserRouter>
  );
}
