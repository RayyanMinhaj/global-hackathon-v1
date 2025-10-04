import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DocumentationDashboard from './pages/DocumentationDashboard';

function App() {
  return (

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<DocumentationDashboard />} />
        </Routes>

  );
}

export default App;
