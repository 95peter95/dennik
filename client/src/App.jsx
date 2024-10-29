import './App.css'
import DrawPage from './pages/DrawPage'
import PianoPage from './pages/PianoPage'
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DrawPage />} />
      <Route path="/hudbicka" element={<PianoPage />} />
    </Routes>
  )
}

export default App
