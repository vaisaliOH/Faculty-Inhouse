import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Users, FileText } from 'lucide-react';
import { mockApi } from '../utils/mockApi';
import { Faculty, AdminFeedback } from '../types';

const AdminDashboard: React.FC = () => {
  const [admin, setAdmin] = useState<Faculty | null>(null);
  const [selectedDayOrder, setSelectedDayOrder] = useState<string>('');
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [feedbackData, setFeedbackData] = useState<AdminFeedback[]>([]);
  const [loadingFaculty, setLoadingFaculty] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get admin from localStorage
    const storedAdmin = localStorage.getItem('admin');
    if (!storedAdmin) {
      navigate('/admin-login');
      return;
    }
    
    const adminData = JSON.parse(storedAdmin);
    setAdmin(adminData);
  }, [navigate]);

  // Handle day order selection
  const handleDayOrderChange = async (dayOrder: string) => {
    setSelectedDayOrder(dayOrder);
    setSelectedFaculty(null);
    setFeedbackData([]);
    
    if (!dayOrder) {
      setFacultyList([]);
      return;
    }

    setLoadingFaculty(true);
    try {
      const faculty = await mockApi.getFacultyByDay(parseInt(dayOrder));
      setFacultyList(faculty);
    } catch (error) {
      console.error('Failed to fetch faculty:', error);
    } finally {
      setLoadingFaculty(false);
    }
  };

  // Handle faculty selection
  const handleFacultySelect = async (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    
    if (!selectedDayOrder) return;

    setLoadingFeedback(true);
    try {
      const feedback = await mockApi.getFeedbackForFaculty(parseInt(selectedDayOrder), faculty.id);
      setFeedbackData(feedback);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      setFeedbackData([]);
    } finally {
      setLoadingFeedback(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/admin-login');
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#2A2A2A] rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-[#3498DB] p-2 rounded-full">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#E0E0E0]">Admin Feedback Review</h1>
                <p className="text-gray-400">Logged in as: {admin?.name}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Day Order Selector */}
        <div className="bg-[#2A2A2A] rounded-lg p-6 mb-6">
          <label htmlFor="dayOrder" className="block text-sm font-medium text-[#E0E0E0] mb-2">
            Select Day Order
          </label>
          <select
            id="dayOrder"
            value={selectedDayOrder}
            onChange={(e) => handleDayOrderChange(e.target.value)}
            className="w-48 px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all duration-200"
          >
            <option value="">Select Day Order</option>
            <option value="1">Day Order 1</option>
            <option value="2">Day Order 2</option>
            <option value="3">Day Order 3</option>
            <option value="4">Day Order 4</option>
            <option value="5">Day Order 5</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Faculty List */}
          <div className="bg-[#2A2A2A] rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-[#3498DB]" />
              <h2 className="text-lg font-semibold text-[#E0E0E0]">Faculty with Audit Duty</h2>
            </div>
            
            {!selectedDayOrder && (
              <p className="text-gray-400 text-center py-8">Please select a Day Order to view faculty list</p>
            )}
            
            {selectedDayOrder && loadingFaculty && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498DB] mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading faculty...</p>
              </div>
            )}
            
            {selectedDayOrder && !loadingFaculty && facultyList.length === 0 && (
              <p className="text-gray-400 text-center py-8">No faculty found for this day</p>
            )}
            
            <div className="space-y-2">
              {facultyList.map((faculty) => (
                <div
                  key={faculty.id}
                  onClick={() => handleFacultySelect(faculty)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedFaculty?.id === faculty.id
                      ? 'bg-[#3498DB] text-white'
                      : 'bg-[#1A1A1A] text-[#E0E0E0] hover:bg-[#3A3A3A]'
                  }`}
                >
                  <div className="font-medium">{faculty.name}</div>
                  <div className="text-sm opacity-75">{faculty.id}</div>
                  <div className="text-sm opacity-75">{faculty.email}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Details Table */}
          <div className="bg-[#2A2A2A] rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-[#3498DB]" />
              <h2 className="text-lg font-semibold text-[#E0E0E0]">Feedback Details</h2>
            </div>
            
            {!selectedFaculty && (
              <p className="text-gray-400 text-center py-8">Select a faculty member to view their feedback</p>
            )}
            
            {selectedFaculty && loadingFeedback && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498DB] mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading feedback...</p>
              </div>
            )}
            
            {selectedFaculty && !loadingFeedback && (
              <div className="overflow-hidden rounded-lg border border-gray-600">
                {feedbackData.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No feedback submitted by this faculty</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#3498DB]">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-white">Venue</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-white">Slot</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-white">Time of Visit</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-white">Time Entered</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-white">Feedback</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-600">
                        {feedbackData.map((item, index) => (
                          <tr key={index} className="bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors duration-200">
                            <td className="px-4 py-3 text-[#E0E0E0] font-medium">{item.venue}</td>
                            <td className="px-4 py-3 text-[#E0E0E0]">{item.slot}</td>
                            <td className="px-4 py-3 text-[#E0E0E0]">{item.timeOfVisit}</td>
                            <td className="px-4 py-3 text-[#E0E0E0] text-sm">
                              {formatTimestamp(item.timeEntered)}
                            </td>
                            <td className="px-4 py-3 text-[#E0E0E0]">
                              <div className="max-w-xs truncate" title={item.feedback}>
                                {item.feedback}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;