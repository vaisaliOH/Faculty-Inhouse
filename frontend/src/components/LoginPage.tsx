import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogIn } from 'lucide-react';
import axios from 'axios'; // 1. Import axios and remove mockApi

const LoginPage: React.FC = () => {
  const [facultyId, setFacultyId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 2. Renamed to handleLogin for clarity, but the core logic change is inside
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('Sending to backend:', { facultyId, email }); 
    try {
      // 3. This is the REAL API call that replaces your mockApi call
      const response = await axios.post(
        // The URL is built from your environment variable
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/login`, 
        // The data being sent to the backend
        {
          facultyId,
          email,
        }
      );

      // 4. If the login is successful, the backend should send a token
      if (response.data && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        if (response.data.user) {
          localStorage.setItem('faculty', JSON.stringify(response.data.user));
        }
        navigate('/faculty-dashboard');
      } else {
        setError('Login successful, but no authentication token was received.');
      }

    } catch (err: any) {
      // 5. This handles errors, like wrong credentials or server issues
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-[#3498DB] p-3 rounded-full">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#E0E0E0]">Faculty Login</h2>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>

        {/* 6. The form now calls handleLogin instead of handleSubmit */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="facultyId" className="block text-sm font-medium text-[#E0E0E0] mb-2">
                Faculty ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="facultyId"
                  type="text"
                  required
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-[#E0E0E0] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all duration-200"
                  placeholder="Enter your Faculty ID"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#E0E0E0] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-[#E0E0E0] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg border border-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#3498DB] hover:bg-[#2980B9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3498DB] focus:ring-offset-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center">
                <LogIn className="h-5 w-5 mr-2" />
                Login
              </div>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/admin-login')}
              className="text-[#3498DB] hover:text-[#2980B9] text-sm transition-colors duration-200"
            >
              Login as Admin?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;