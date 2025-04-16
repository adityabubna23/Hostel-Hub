import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiUsers, FiSettings, FiLogOut, FiPlus, FiInbox, FiChevronLeft, FiChevronRight, FiUserPlus } from "react-icons/fi";
import { useAuth } from "../hooks/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  // Define role-based navigation links
  const navLinks = {
    ADMIN: [
      { to: "/admin/dashboard", label: "Dashboard", icon: <FiHome className="text-xl" /> },
      { to: "/admin/users", label: "Users", icon: <FiUsers className="text-xl" /> },
      { to: "/admin/settings", label: "Settings", icon: <FiSettings className="text-xl" /> },
      { to: "/admin/add-floor-room", label: "Add Floor & Room", icon: <FiPlus className="text-xl" /> },
      { to: "/admin/assign-student", label: "Assign Student", icon: <FiUsers className="text-xl" /> },
      { to: "/admin/send-notice", label: "Send Notice", icon: <FiInbox className="text-xl" /> },
      { to: "/admin/create-user", label: "Create User", icon: <FiUserPlus className="text-xl" /> },
    ],
    STUDENT: [
      { to: "/student/profile", label: "Profile", icon: <FiSettings className="text-xl" /> },
      { to: "/student/notices", label: "Notices", icon: <FiInbox className="text-xl" /> },
      { to: "/student/upload-documents", label: "Upload Documents", icon: <FiPlus className="text-xl" /> },
    ],
    WARDEN: [
      { to: "/warden/dashboard", label: "Dashboard", icon: <FiHome className="text-xl" /> },
      { to: "/warden/hostel", label: "Hostel Management", icon: <FiUsers className="text-xl" /> },
      { to: "/warden/complaints", label: "Complaints", icon: <FiSettings className="text-xl" /> },
    ],
    STAFF: [
      { to: "/staff/dashboard", label: "Dashboard", icon: <FiHome className="text-xl" /> },
      { to: "/staff/attendance", label: "Attendance", icon: <FiUsers className="text-xl" /> },
      { to: "/staff/reports", label: "Reports", icon: <FiSettings className="text-xl" /> },
    ],
  };

  // Get the links for the current user's role
  const links = navLinks[user?.role?.toUpperCase() as keyof typeof navLinks] || [];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div 
      className={`relative min-h-screen bg-yellow-50 text-yellow-800 flex flex-col shadow-lg transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-12 bg-yellow-400 text-white p-1 rounded-full shadow-md hover:bg-yellow-500 transition-all duration-200"
      >
        {isExpanded ? <FiChevronLeft /> : <FiChevronRight />}
      </button>

      {/* Logo Section with Animation */}
      <motion.div 
        className="flex items-center justify-center h-24 border-b border-yellow-200 bg-gradient-to-r from-yellow-400 to-yellow-300"
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
          <h1 className={`text-2xl font-bold text-white ${!isExpanded && 'text-sm'}`}>
            {isExpanded ? `Hostel ${user?.role}` : user?.role?.charAt(0)}
          </h1>
          {isExpanded && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-white mt-1"
            >
              Management System
            </motion.p>
          )}
        </motion.div>
      </motion.div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
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
                  `flex items-center gap-4 px-4 py-3 rounded-lg mb-2 transition-all duration-200 overflow-hidden
                  ${isActive 
                    ? "bg-yellow-400 text-white shadow-md" 
                    : "bg-white text-yellow-800 hover:bg-yellow-100 hover:translate-x-1"
                  }`
                }
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {link.icon}
                </motion.div>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.label}
                  </motion.span>
                )}
              </NavLink>
            </motion.div>
          ))}
        </AnimatePresence>
      </nav>

      {/* Logout Button */}
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
            bg-white hover:bg-yellow-100 text-yellow-800 shadow-sm
            transition-all duration-200 hover:translate-x-1
          `}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiLogOut className="text-xl" />
          {isExpanded && <span>Logout</span>}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;