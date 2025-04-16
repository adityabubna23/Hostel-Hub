import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Room {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
}

const AssignStudentPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // White and yellow theme colors
  const colors = {
    primary: "#FFDD00", // Bright yellow
    secondary: "#FFF6C3", // Light yellow
    accent: "#FFB800", // Amber yellow
    white: "#FFFFFF",
    text: "#333333",
    lightGray: "#F5F5F5",
  };

  // Fetch rooms when the component mounts
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.admin.getFloors();
        const allRooms = response.flatMap((floor: any) =>
          floor.rooms.map((room: any) => ({
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            currentOccupancy: room.currentOccupancy || 0,
          }))
        );
        setRooms(allRooms);
      } catch (error: any) {
        showNotification(`Error fetching rooms: ${error.response?.data?.error || error.message}`, "error");
      }
    };

    fetchRooms();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transition = "opacity 0.5s ease";
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
  };

  const handleAssignStudent = async () => {
    if (!selectedRoomId) {
      showNotification("Please select a room.", "error");
      return;
    }
    if (!studentName.trim() || !studentEmail.trim()) {
      showNotification("Please enter student name and email.", "error");
      return;
    }
  
    setIsLoading(true);
    try {
      await api.admin.assignStudent({
        roomId: selectedRoomId,
        studentName,
        studentEmail,
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
  
      // Fetch updated rooms to reflect the new occupancy
      const updatedRooms = await api.admin.getFloors();
      const allRooms = updatedRooms.flatMap((floor: any) =>
        floor.rooms.map((room: any) => ({
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          currentOccupancy: room.currentOccupancy || 0,
        }))
      );
      setRooms(allRooms);
  
      setStudentName("");
      setStudentEmail("");
      setSelectedRoomId("");
    } catch (error: any) {
      showNotification(`Error assigning student: ${error.response?.data?.error || error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const successVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${colors.white} 0%, ${colors.secondary} 100%)` }}>
      <motion.div 
        className="max-w-2xl mx-auto p-8 rounded-lg shadow-xl"
        style={{ backgroundColor: colors.white }}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="flex items-center mb-8"
          variants={itemVariants}
        >
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
            style={{ backgroundColor: colors.primary }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: colors.text }}>Assign Student to Room</h1>
        </motion.div>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="mb-6 p-4 rounded-lg text-center text-white bg-green-500"
              variants={successVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              Student assigned successfully! 🎉
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="mb-6" variants={itemVariants}>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Select Room</label>
          <div className="relative">
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full p-3 border rounded-lg appearance-none focus:outline-none focus:ring-2 transition-all"
              style={{ 
                borderColor: colors.accent,
                backgroundColor: colors.lightGray,
                color: colors.text,
                boxShadow: `0 0 0 ${selectedRoomId ? "2px" : "0px"} ${colors.primary}`
              }}
            >
              <option value="">-- Select a Room --</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} (Capacity: {room.currentOccupancy}/{room.capacity})
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div className="mb-6" variants={itemVariants}>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Student Name</label>
          <motion.input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
            placeholder="Enter student name"
            style={{ 
              borderColor: colors.accent,
              backgroundColor: colors.lightGray,
              color: colors.text,
              boxShadow: `0 0 0 ${studentName ? "2px" : "0px"} ${colors.primary}`
            }}
            whileFocus={{ scale: 1.01 }}
          />
        </motion.div>

        <motion.div className="mb-6" variants={itemVariants}>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Student Email</label>
          <motion.input
            type="email"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
            placeholder="Enter student email"
            style={{ 
              borderColor: colors.accent,
              backgroundColor: colors.lightGray,
              color: colors.text,
              boxShadow: `0 0 0 ${studentEmail ? "2px" : "0px"} ${colors.primary}`
            }}
            whileFocus={{ scale: 1.01 }}
          />
        </motion.div>

        <motion.button
          onClick={handleAssignStudent}
          disabled={isLoading}
          className="w-full p-3 text-lg font-medium rounded-lg shadow-lg transition-all"
          style={{ 
            background: `linear-gradient(45deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
            color: colors.text,
            opacity: isLoading ? 0.7 : 1
          }}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Assigning Student...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                <path d="M16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Assign Student
            </div>
          )}
        </motion.button>

        <motion.div 
          className="mt-8 text-center text-sm"
          variants={itemVariants}
          style={{ color: colors.text }}
        >
          {rooms.length > 0 ? (
            <p>Currently managing {rooms.length} rooms with a total capacity of {rooms.reduce((sum, room) => sum + room.capacity, 0)} students</p>
          ) : (
            <p>Loading room information...</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AssignStudentPage;