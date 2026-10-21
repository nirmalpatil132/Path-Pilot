import { Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute'
import { AuthProvider } from './context'
import AppCheckpoint from './pages/app/AppCheckpoint'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import StyleGuide from './pages/dev/StyleGuide'
import Landing from './pages/Landing'
import OnboardingWizard from './pages/onboarding/OnboardingWizard'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/dev/style-guide" element={<StyleGuide />} />

        {/* Public-only routes (redirect authenticated users to /app) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected routes (require valid authentication session) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppCheckpoint />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
