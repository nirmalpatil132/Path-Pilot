import { Route, Routes } from 'react-router-dom'

import StyleGuide from './pages/dev/StyleGuide'
import Landing from './pages/Landing'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dev/style-guide" element={<StyleGuide />} />
    </Routes>
  )
}

export default App
