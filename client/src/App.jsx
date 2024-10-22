import './App.css'
import DrawPage from './pages/DrawPage'
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DrawPage />} />
    </Routes>
  )
}

export default App
