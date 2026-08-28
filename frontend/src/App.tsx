import { Navigate, Route, Routes } from 'react-router-dom'

import StyleGuide from './pages/dev/StyleGuide'

/**
 * Phase 1 scope: no product screens exist yet. "/" redirects to the
 * design-system style guide, the only route this phase delivers.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dev/style-guide" replace />} />
      <Route path="/dev/style-guide" element={<StyleGuide />} />
    </Routes>
  )
}

export default App
