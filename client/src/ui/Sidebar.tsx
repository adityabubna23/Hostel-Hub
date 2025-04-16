import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { 
  FiLogOut, FiChevronLeft, FiChevronRight,
  FiAlertCircle, FiUploadCloud, FiCheck,
  FiActivity, FiClipboard, FiUsers, FiLayers,
  FiBell, FiUserPlus, FiGrid
} from "react-icons/fi";
import { useAuth } from "../hooks/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [greeting, setGreeting] = useState("");

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Define role-based navigation links with enhanced icons
  const navLinks = {
    ADMIN: [
      { to: "/admin/dashboard", label: "Dashboard", icon: <FiGrid className="text-xl" /> },
      { to: "/admin/add-floor-room", label: "Add Floor & Room", icon: <FiLayers className="text-xl" /> },
      { to: "/admin/assign-student", label: "Assign Student", icon: <FiUsers className="text-xl" /> },
      { to: "/admin/send-notice", label: "Send Notice", icon: <FiBell className="text-xl" /> },
      { to: "/admin/create-user", label: "Create User", icon: <FiUserPlus className="text-xl" /> },
      { to: "/admin/verify-documents", label: "Verify Documents", icon: <FiCheck className="text-xl" /> },
      { to: "/admin/complaints", label: "Complaints", icon: <FiAlertCircle className="text-xl" /> },
    ],
    STUDENT: [
      { to: "/student/notices", label: "Notices", icon: <FiBell className="text-xl" /> },
      { to: "/student/upload-documents", label: "Upload Documents", icon: <FiUploadCloud className="text-xl" /> },
      { to: "/student/complaints", label: "Submit Complaint", icon: <FiAlertCircle className="text-xl" /> },
    ],
    WARDEN: [
      { to: "/warden/dashboard", label: "Dashboard", icon: <FiGrid className="text-xl" /> },
      { to: "/warden/hostel", label: "Hostel Management", icon: <FiLayers className="text-xl" /> },
      { to: "/warden/complaints", label: "Complaints", icon: <FiAlertCircle className="text-xl" /> },
    ],
    STAFF: [
      { to: "/staff/dashboard", label: "Dashboard", icon: <FiGrid className="text-xl" /> },
      { to: "/staff/attendance", label: "Attendance", icon: <FiClipboard className="text-xl" /> },
      { to: "/staff/reports", label: "Reports", icon: <FiActivity className="text-xl" /> },
    ],
  };

  // Get the links for the current user's role
  const links = navLinks[user?.role?.toUpperCase() as keyof typeof navLinks] || [];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div 
      className={`relative min-h-screen bg-yellow-50 text-yellow-800 flex flex-col shadow-xl transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Enhanced Toggle Button */}
      <motion.button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-12 bg-yellow-400 text-white p-2 rounded-full shadow-lg hover:shadow-xl hover:bg-yellow-500 transition-all duration-200 z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isExpanded ? <FiChevronLeft /> : <FiChevronRight />}
      </motion.button>

      {/* Enhanced Logo Section with Animation */}
      <motion.div 
        className="flex items-center justify-center h-28 border-b border-yellow-200 bg-gradient-to-r from-yellow-400 to-yellow-300 shadow-md"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center justify-center w-12 h-12 mb-2 rounded-full bg-white shadow-inner">
            <motion.span 
              className="text-yellow-500 text-xl font-bold"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
              }}
            >
              {user?.role?.charAt(0)}
            </motion.span>
          </div>
          <h1 className={`text-2xl font-bold text-white ${!isExpanded && 'text-sm'}`}>
            {isExpanded ? `Hostel ${user?.role}` : user?.role?.charAt(0)}
          </h1>
          {isExpanded && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-white mt-1 font-medium"
            >
              Management System
            </motion.p>
          )}
        </motion.div>
      </motion.div>
      
      {/* User Greeting */}
      {isExpanded && (
        <motion.div 
          className="px-4 py-3 text-center text-sm font-medium text-yellow-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p>{greeting}, {user?.name || user?.role}</p>
        </motion.div>
      )}

      {/* Navigation Links with Enhanced Animation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-300 scrollbar-track-transparent">
        <AnimatePresence>
          {links.map((link, index) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-lg mb-3 transition-all duration-200 overflow-hidden
                  ${isActive 
                    ? "bg-yellow-400 text-white shadow-md" 
                    : "bg-white text-yellow-800 hover:bg-yellow-100 hover:translate-x-1"
                  }`
                }
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center justify-center w-8 h-8"
                >
                  {link.icon}
                </motion.div>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium"
                  >
                    {link.label}
                  </motion.span>
                )}
              </NavLink>
            </motion.div>
          ))}
        </AnimatePresence>
      </nav>

      {/* Enhanced Logout Button */}
      <motion.div 
        className="px-4 py-6 border-t border-yellow-200"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={() => {
            localStorage.removeItem("auth-storage");
            window.location.href = "/login";
          }}
          className={`flex items-center gap-4 px-4 py-3 w-full text-left rounded-lg
            bg-white hover:bg-red-50 text-yellow-800 hover:text-red-500 shadow-sm
            transition-all duration-200 hover:translate-x-1
          `}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiLogOut className="text-xl" />
          {isExpanded && <span className="font-medium">Logout</span>}
        </motion.button>
      </motion.div>
      
      {/* Footer */}
      {isExpanded && (
        <motion.div 
          className="px-4 py-2 text-center text-xs text-yellow-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p>© {new Date().getFullYear()} Hostel Management</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Sidebar;