import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MockForm from './pages/MockForm';
import Logs from './pages/Logs';
import Login from './pages/Login';
import Register from './pages/Register';
import Teams from './pages/Teams';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/mocks/new" element={<MockForm />} />
              <Route path="/mocks/:id/edit" element={<MockForm />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
