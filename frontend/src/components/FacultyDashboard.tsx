import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, Calendar, LogOut, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { getCurrentTime, getCurrentDate, getCurrentTimestamp } from '../utils/time';
import { Faculty, Venue, ScheduleData, FeedbackSubmission, AuditCheck } from '../types';

const FacultyDashboard: React.FC = () => {
  // --- All of your existing state is preserved ---
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [auditCheck, setAuditCheck] = useState<AuditCheck | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  // This new state will hold ALL slots fetched from the backend
  const [allScheduleData, setAllScheduleData] = useState<ScheduleData[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleData[]>([]);
  const [feedbacks, setFeedbacks] = useState<{ [key: string]: string }>({});
  const [submittedVenues, setSubmittedVenues] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();

  // Your timer useEffect remains the same
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- This useEffect is now connected to your real backend ---
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      
      const storedFaculty = localStorage.getItem('faculty');
      const token = localStorage.getItem('authToken'); // Make sure you use 'authToken' as set in LoginPage
      
      if (!storedFaculty || !token) {
        navigate('/');
        return;
      }
      
      const facultyData = JSON.parse(storedFaculty);
      setFaculty(facultyData);

      try {
        // 1. Fetch all schedule data for the logged-in user
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/audit`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const slotsFromApi: ScheduleData[] = response.data;

        // 2. Check if any slots were returned
        if (slotsFromApi && slotsFromApi.length > 0) {
          setAuditCheck({ hasAudit: true, dayOrder: slotsFromApi[0]?.day || 'N/A' });
          setAllScheduleData(slotsFromApi); // Store all slots

          // 3. Automatically create a list of unique venues from the schedule
          const uniqueVenues = [...new Map(slotsFromApi.map(item => [item.venue, { venue: item.venue }])).values()];
          setVenues(uniqueVenues);
        } else {
          // No slots means no audit today
          setAuditCheck({ hasAudit: false, dayOrder: null });
        }
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        // If token is invalid or expired, log the user out
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [navigate]);

  // Handle batch selection - this now filters the data we already fetched
  const handleBatchChange = (batch: string) => {
    setSelectedBatch(batch);
    if (batch) {
      const filteredSchedule = allScheduleData.filter(
        // Ensure comparison works even if batch is number or string
        (slot) => String(slot.batch) === batch
      );
      setScheduleData(filteredSchedule);
    } else {
      setScheduleData([]); // Clear schedule if no batch is selected
    }
  };
  
  // This function is unchanged as per your request, still using a mock submission
  const handleSubmitFeedback = async (venue: string) => {
    const feedback = feedbacks[venue];
    if (!feedback?.trim()) {
      alert('Please enter feedback before submitting.');
      return;
    }

    const scheduleItem = scheduleData.find(s => s.venue === venue);
    if (!scheduleItem) {
      alert('Schedule information not found for this venue.');
      return;
    }

    setSubmitting(prev => ({ ...prev, [venue]: true }));

    try {
      const submissionData: FeedbackSubmission = {
        venue: venue,
        slot: scheduleItem.slot,
        feedback: feedback.trim(),
        timestamp: getCurrentTimestamp()
      };
      
      // !!! IMPORTANT: Replace this with a real API call later !!!
      console.log('Simulating feedback submission:', submissionData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      // await mockApi.submitFeedback(submissionData);

      setSubmittedVenues(prev => new Set([...prev, venue]));
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(prev => ({ ...prev, [venue]: false }));
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('faculty');
    localStorage.removeItem('authToken'); // Ensure this matches the key used in LoginPage
    navigate('/');
  };

  // The rest of your JSX rendering logic is completely unchanged.
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-[#E0E0E0] text-xl">Loading...</div>
      </div>
    );
  }

  if (!auditCheck?.hasAudit) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#E0E0E0] text-2xl font-semibold mb-4">
            No Audit Scheduled for Today
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 bg-[#3498DB] text-white rounded-lg hover:bg-[#2980B9] transition-colors duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#2A2A2A] rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-[#3498DB]" />
                <div>
                  <div className="text-sm text-gray-400">Faculty Name</div>
                  <div className="text-[#E0E0E0] font-semibold">{faculty?.name}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-[#3498DB]" />
                <div>
                  <div className="text-sm text-gray-400">Faculty ID</div>
                  <div className="text-[#E0E0E0] font-semibold">{faculty?.id}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-[#3498DB]" />
                <div>
                  <div className="text-sm text-gray-400">Day Order</div>
                  <div className="text-[#E0E0E0] font-semibold">Day Order: {auditCheck.dayOrder}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-[#3498DB]" />
                <div>
                  <div className="text-sm text-gray-400">Date</div>
                  <div className="text-[#E0E0E0] font-semibold">{getCurrentDate()}</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-[#3498DB]" />
                <div className="text-[#E0E0E0] font-mono text-lg">{currentTime}</div>
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
        </div>

        {/* Batch Selector */}
        <div className="bg-[#2A2A2A] rounded-lg p-6 mb-6">
          <label htmlFor="batch" className="block text-sm font-medium text-[#E0E0E0] mb-2">
            Select Batch
          </label>
          <select
            id="batch"
            value={selectedBatch}
            onChange={(e) => handleBatchChange(e.target.value)}
            className="w-48 px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all duration-200"
          >
            <option value="">Select a batch</option>
            <option value="1">Batch 1</option>
            <option value="2">Batch 2</option>
          </select>
        </div>

        {/* Audit Table */}
        <div className="bg-[#2A2A2A] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#3498DB]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Venue</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Slot</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Time of Visit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Feedback</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {venues.map((venue, index) => {
                  const scheduleItem = scheduleData.find(s => s.venue === venue.venue);
                  const isSubmitted = submittedVenues.has(venue.venue);
                  const isSubmitting = submitting[venue.venue];
                  
                  return (
                    <tr key={index} className="hover:bg-[#1A1A1A] transition-colors duration-200">
                      <td className="px-6 py-4 text-[#E0E0E0] font-medium">{venue.venue}</td>
                      <td className="px-6 py-4 text-[#E0E0E0]">
                        {scheduleItem?.slot || (selectedBatch ? '-' : 'Select batch')}
                      </td>
                      <td className="px-6 py-4 text-[#E0E0E0]">
                        {scheduleItem?.timeOfVisit || (selectedBatch ? '-' : 'Select batch')}
                      </td>
                      <td className="px-6 py-4">
                        <textarea
                          value={feedbacks[venue.venue] || ''}
                          onChange={(e) => setFeedbacks(prev => ({
                            ...prev,
                            [venue.venue]: e.target.value
                          }))}
                          disabled={isSubmitted}
                          placeholder="Enter your feedback..."
                          className="w-full h-20 px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-[#E0E0E0] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleSubmitFeedback(venue.venue)}
                          disabled={isSubmitted || isSubmitting || !selectedBatch}
                          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isSubmitted 
                              ? 'bg-green-600 text-white cursor-not-allowed'
                              : 'bg-[#3498DB] text-white hover:bg-[#2980B9] disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          {isSubmitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : isSubmitted ? (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          ) : null}
                          {isSubmitted ? 'Submitted ✓' : isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;