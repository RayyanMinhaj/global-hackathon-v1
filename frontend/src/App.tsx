import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import './App.css';

function App() {
  return (

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Home />} />
          <Route path="/register" element={<Home />} />
        </Routes>

  );
}

export default App;
