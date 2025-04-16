import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

// Interfaces
interface RoomChangeRequest {
  id: string;
  reason: string;
  currentRoom: string;
  desiredRoom: string;
  status: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

interface Complaint {
  id: string;
  complaintNumber: string;
  complaint: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

const ViewComplaints: React.FC = () => {
  // States
  const [activeTab, setActiveTab] = useState<'complaints' | 'roomChangeRequests'>('complaints');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [roomChangeRequests, setRoomChangeRequests] = useState<RoomChangeRequest[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [alternateRoom, setAlternateRoom] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1 
      }
    },
    exit: { 
      opacity: 0,
      transition: { when: "afterChildren" }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  };

  const tabVariants = {
    inactive: { y: 0 },
    active: { 
      y: 0,
      boxShadow: "0px 4px 0px #FFD700",
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  // Fetch data for both tabs
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        if (activeTab === 'complaints') {
          const data = await api.admin.getAllComplaints();
          setComplaints(data);
        } else {
          const data = await api.admin.getAllRoomChangeRequests();
          setRoomChangeRequests(data);
        }
      } catch (error: any) {
        setError(error.response?.data?.error || 'An error occurred while fetching data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Handle room change request status update
  const handleUpdateStatus = async (requestId: string, status: string) => {
    try {
      const newRoom = alternateRoom[requestId] || undefined;
      await api.admin.updateRoomChangeRequestStatus({ requestId, status, alternateRoom: newRoom });
      
      // Show success message with animation
      setSuccessMessage(`Room change request ${status.toLowerCase()} successfully.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Update local state
      setRoomChangeRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, status } : request
        )
      );
      setAlternateRoom((prev) => ({ ...prev, [requestId]: '' }));
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred while updating the status.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header with animated gradient */}
      <motion.div 
        className="mb-8 text-center relative overflow-hidden rounded-lg p-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: "linear-gradient(45deg, #FFEB3B, #FFF9C4)",
          boxShadow: "0 4px 20px rgba(255, 215, 0, 0.3)"
        }}
      >
        <motion.h1 
          className="text-3xl font-bold text-gray-800"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          Hostel Management Portal
        </motion.h1>
        <motion.div 
          className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ 
            duration: 10, 
            ease: "linear", 
            repeat: Infinity,
          }}
          style={{ background: "#FFD700" }}
        />
      </motion.div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <motion.div className="inline-flex rounded-lg p-1 bg-gray-100">
          <motion.button
            variants={tabVariants}
            animate={activeTab === 'complaints' ? 'active' : 'inactive'}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === 'complaints' ? 'bg-yellow-100 text-gray-800' : 'bg-transparent text-gray-600'
            }`}
            onClick={() => setActiveTab('complaints')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Student Complaints
          </motion.button>
          <motion.button
            variants={tabVariants}
            animate={activeTab === 'roomChangeRequests' ? 'active' : 'inactive'}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === 'roomChangeRequests' ? 'bg-yellow-100 text-gray-800' : 'bg-transparent text-gray-600'
            }`}
            onClick={() => setActiveTab('roomChangeRequests')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Room Change Requests
          </motion.button>
        </motion.div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {error}
          </motion.div>
        )}
        {successMessage && (
          <motion.div 
            className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="flex justify-center my-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content based on active tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'complaints' && !isLoading && (
          <motion.div
            key="complaints"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl p-6 shadow-lg"
            style={{ boxShadow: "0 10px 30px rgba(255, 215, 0, 0.1)" }}
          >
            <motion.h2 
              className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2 border-yellow-200"
              variants={itemVariants}
            >
              Student Complaints
            </motion.h2>
            
            {complaints.length === 0 ? (
              <motion.p 
                className="text-center text-gray-500 py-8"
                variants={itemVariants}
              >
                No complaints found
              </motion.p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <motion.tr variants={itemVariants} className="bg-yellow-50">
                      <th className="p-3 text-left text-gray-700">Complaint #</th>
                      <th className="p-3 text-left text-gray-700">Student</th>
                      <th className="p-3 text-left text-gray-700">Email</th>
                      <th className="p-3 text-left text-gray-700">Complaint</th>
                      <th className="p-3 text-left text-gray-700">Date</th>
                    </motion.tr>
                  </thead>
                  <tbody>
                    {complaints.map((complaint) => (
                      <motion.tr 
                        key={complaint.id}
                        variants={itemVariants}
                        className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors"
                        whileHover={{ scale: 1.01 }}
                      >
                        <td className="p-3">{complaint.complaintNumber}</td>
                        <td className="p-3 font-medium">{complaint.student.name}</td>
                        <td className="p-3 text-gray-600">{complaint.student.email}</td>
                        <td className="p-3">{complaint.complaint}</td>
                        <td className="p-3 text-gray-500">{formatDate(complaint.createdAt)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'roomChangeRequests' && !isLoading && (
          <motion.div
            key="roomChangeRequests"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl p-6 shadow-lg"
            style={{ boxShadow: "0 10px 30px rgba(255, 215, 0, 0.1)" }}
          >
            <motion.h2 
              className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2 border-yellow-200"
              variants={itemVariants}
            >
              Room Change Requests
            </motion.h2>
            
            {roomChangeRequests.length === 0 ? (
              <motion.p 
                className="text-center text-gray-500 py-8"
                variants={itemVariants}
              >
                No room change requests found
              </motion.p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <motion.tr variants={itemVariants} className="bg-yellow-50">
                      <th className="p-3 text-left text-gray-700">Student</th>
                      <th className="p-3 text-left text-gray-700">Email</th>
                      <th className="p-3 text-left text-gray-700">Reason</th>
                      <th className="p-3 text-left text-gray-700">Current Room</th>
                      <th className="p-3 text-left text-gray-700">Desired Room</th>
                      <th className="p-3 text-left text-gray-700">Status</th>
                      <th className="p-3 text-left text-gray-700">Actions</th>
                    </motion.tr>
                  </thead>
                  <tbody>
                    {roomChangeRequests.map((request) => (
                      <motion.tr 
                        key={request.id}
                        variants={itemVariants}
                        className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors"
                        whileHover={{ scale: 1.01 }}
                      >
                        <td className="p-3 font-medium">{request.student.name}</td>
                        <td className="p-3 text-gray-600">{request.student.email}</td>
                        <td className="p-3">{request.reason}</td>
                        <td className="p-3">{request.currentRoom}</td>
                        <td className="p-3">{request.desiredRoom}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {request.status === 'Pending' ? (
                            <motion.div className="flex flex-col space-y-2">
                              <input
                                type="text"
                                placeholder="Alternate Room (Optional)"
                                value={alternateRoom[request.id] || ''}
                                onChange={(e) =>
                                  setAlternateRoom((prev) => ({
                                    ...prev,
                                    [request.id]: e.target.value,
                                  }))
                                }
                                className="px-3 py-1 border border-yellow-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
                              />
                              <div className="flex space-x-2">
                                <motion.button
                                  onClick={() => handleUpdateStatus(request.id, 'Approved')}
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Approve
                                </motion.button>
                                <motion.button
                                  onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Reject
                                </motion.button>
                              </div>
                            </motion.div>
                          ) : (
                            <span className="text-gray-500 text-sm">No actions available</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Footer element with animated background */}
      <motion.div 
        className="mt-12 text-center text-gray-500 text-sm p-4 rounded-lg relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ background: "linear-gradient(135deg, #FFF9C4, #FFFDE7)" }}
      >
        <p>© 2025 Hostel Management System</p>
        <motion.div 
          className="absolute -top-10 -left-10 w-20 h-20 rounded-full"
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ 
            duration: 15, 
            ease: "easeInOut", 
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{ background: "rgba(255, 215, 0, 0.1)" }}
        />
      </motion.div>
    </div>
  );
};

export default ViewComplaints;