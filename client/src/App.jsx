import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import JobsPage from './pages/JobsPage.jsx';
import JobDetailsPage from './pages/JobDetailsPage.jsx';
import SkillsPage from './pages/SkillsPage.jsx';
import SkillDetailsPage from './pages/SkillDetailsPage.jsx';
import CompaniesPage from './pages/CompaniesPage.jsx';
import CompanyDetailsPage from './pages/CompanyDetailsPage.jsx';
import JobMatchPage from './pages/JobMatchPage.jsx';
import GraphExplorerPage from './pages/GraphExplorerPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';


export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/skills/:id" element={<SkillDetailsPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:id" element={<CompanyDetailsPage />} />
        <Route path="/match" element={<JobMatchPage />} />
        <Route path="/graph" element={<GraphExplorerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
