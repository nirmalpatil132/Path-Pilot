import { Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute'
import { AuthProvider } from './context'
import AppCheckpoint from './pages/app/AppCheckpoint'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import CareerDetail from './pages/careers/CareerDetail'
import CareerExplorer from './pages/careers/CareerExplorer'
import StyleGuide from './pages/dev/StyleGuide'
import Landing from './pages/Landing'
import OnboardingWizard from './pages/onboarding/OnboardingWizard'
import RoadmapPage from './pages/roadmap/RoadmapPage'
import ProjectsPage from './pages/projects/ProjectsPage'
import ProjectDetailPage from './pages/projects/ProjectDetailPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/dev/style-guide" element={<StyleGuide />} />
        <Route path="/careers" element={<CareerExplorer />} />
        <Route path="/careers/:slug" element={<CareerDetail />} />

        {/* Public-only routes (redirect authenticated users to /app) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected routes (require valid authentication session) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppCheckpoint />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
