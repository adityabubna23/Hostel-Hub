import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';

const SubmitComplaintAndRoomChange: React.FC = () => {
  const [studentId, setStudentId] = useState<string>('');
  const [complaint, setComplaint] = useState<string>('');
  const [roomChangeReason, setRoomChangeReason] = useState<string>('');
  const [currentRoom, setCurrentRoom] = useState<string>('');
  const [desiredRoom, setDesiredRoom] = useState<string>('');
  const [complaintMessage, setComplaintMessage] = useState<string>('');
  const [roomChangeMessage, setRoomChangeMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'complaint' | 'roomChange'>('complaint');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Color scheme
  const colors = {
    primary: '#FFDE59', // Yellow
    primaryLight: '#FFF5D4',
    secondary: '#FFFFFF', // White
    text: '#333333',
    border: '#E0E0E0',
  };

  // Fetch the logged-in student's ID from local storage or API
  useEffect(() => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const user = JSON.parse(authStorage).state.user;
        if (user && user.id) {
          setStudentId(user.id);
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }
  }, []);

  // Handle Submit Complaint
  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.student.submitComplaint({ studentId, complaint });
      setComplaintMessage(response.message);
      setComplaint(''); // Clear the complaint field after submission
      
      // Show success animation
      setTimeout(() => {
        setComplaintMessage('');
      }, 5000);
    } catch (error: any) {
      setComplaintMessage(error.response?.data?.error || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Submit Room Change Request
  const handleRoomChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.student.submitRoomChangeRequest({
        studentId,
        reason: roomChangeReason,
        currentRoom,
        desiredRoom,
      });
      setRoomChangeMessage(response.message);
      setRoomChangeReason('');
      setCurrentRoom('');
      setDesiredRoom('');
      
      // Show success animation
      setTimeout(() => {
        setRoomChangeMessage('');
      }, 5000);
    } catch (error: any) {
      setRoomChangeMessage(error.response?.data?.error || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        padding: "2rem",
        maxWidth: "1000px",
        margin: "0 auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: colors.text,
        background: colors.secondary,
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
      }}
    >
      <motion.h1 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ 
          textAlign: "center", 
          marginBottom: "2rem",
          color: colors.text,
          fontWeight: 600,
          fontSize: "2rem"
        }}
      >
        Student Service Center
      </motion.h1>

      {/* Tab Navigation */}
      <motion.div
        style={{
          display: "flex",
          marginBottom: "2rem",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
        }}
      >
        <motion.button
          onClick={() => setActiveTab('complaint')}
          style={{
            flex: 1,
            padding: "1rem",
            border: "none",
            background: activeTab === 'complaint' ? colors.primary : colors.primaryLight,
            color: colors.text,
            fontWeight: activeTab === 'complaint' ? 600 : 400,
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
          whileHover={{ background: colors.primary }}
          whileTap={{ scale: 0.98 }}
        >
          Submit Complaint
        </motion.button>
        <motion.button
          onClick={() => setActiveTab('roomChange')}
          style={{
            flex: 1,
            padding: "1rem",
            border: "none",
            background: activeTab === 'roomChange' ? colors.primary : colors.primaryLight,
            color: colors.text,
            fontWeight: activeTab === 'roomChange' ? 600 : 400,
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
          whileHover={{ background: colors.primary }}
          whileTap={{ scale: 0.98 }}
        >
          Room Change Request
        </motion.button>
      </motion.div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'complaint' ? (
          <motion.section
            key="complaint"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              background: colors.secondary,
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
              border: `1px solid ${colors.border}`
            }}
          >
            <motion.h2 
              variants={itemVariants}
              style={{ 
                color: colors.text, 
                borderBottom: `2px solid ${colors.primary}`,
                paddingBottom: "0.5rem",
                display: "inline-block"
              }}
            >
              Submit Your Complaint
            </motion.h2>
            
            <form onSubmit={handleComplaintSubmit}>
              <motion.div
                variants={itemVariants}
                style={{ marginBottom: "1.5rem", marginTop: "1.5rem" }}
              >
                <label 
                  style={{ 
                    display: "block", 
                    marginBottom: "0.5rem", 
                    fontWeight: 500 
                  }}
                >
                  Complaint Details:
                </label>
                <motion.textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  required
                  whileFocus={{ boxShadow: `0 0 0 2px ${colors.primary}` }}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: `1px solid ${colors.border}`,
                    minHeight: "150px",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                  placeholder="Please describe your complaint in detail..."
                />
              </motion.div>
              
              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02, backgroundColor: "#FFD000" }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: colors.primary,
                  color: colors.text,
                  border: "none",
                  padding: "0.8rem 1.5rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "block",
                  margin: "0 auto",
                  fontSize: "1rem",
                  boxShadow: "0 2px 10px rgba(255, 222, 89, 0.3)",
                }}
              >
                {isSubmitting ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ display: "inline-block" }}
                  >
                    ⏳
                  </motion.span>
                ) : "Submit Complaint"}
              </motion.button>
            </form>
            
            <AnimatePresence>
              {complaintMessage && (
                <motion.div
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    background: complaintMessage.includes("success") || complaintMessage.includes("received") ? 
                      "rgba(0, 200, 0, 0.1)" : "rgba(255, 100, 100, 0.1)",
                    borderRadius: "8px",
                    textAlign: "center",
                    border: complaintMessage.includes("success") || complaintMessage.includes("received") ? 
                      "1px solid rgba(0, 200, 0, 0.3)" : "1px solid rgba(255, 100, 100, 0.3)",
                  }}
                >
                  {complaintMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        ) : (
          <motion.section
            key="roomChange"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              background: colors.secondary,
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
              border: `1px solid ${colors.border}`
            }}
          >
            <motion.h2 
              variants={itemVariants}
              style={{ 
                color: colors.text, 
                borderBottom: `2px solid ${colors.primary}`,
                paddingBottom: "0.5rem",
                display: "inline-block"
              }}
            >
              Request Room Change
            </motion.h2>
            
            <form onSubmit={handleRoomChangeSubmit}>
              <motion.div
                variants={itemVariants}
                style={{ marginBottom: "1.5rem", marginTop: "1.5rem" }}
              >
                <label 
                  style={{ 
                    display: "block", 
                    marginBottom: "0.5rem", 
                    fontWeight: 500 
                  }}
                >
                  Reason for Room Change:
                </label>
                <motion.textarea
                  value={roomChangeReason}
                  onChange={(e) => setRoomChangeReason(e.target.value)}
                  required
                  whileFocus={{ boxShadow: `0 0 0 2px ${colors.primary}` }}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: `1px solid ${colors.border}`,
                    minHeight: "150px",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                  placeholder="Please explain why you need to change rooms..."
                />
              </motion.div>
              
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <motion.div variants={itemVariants} style={{ flex: 1 }}>
                  <label 
                    style={{ 
                      display: "block", 
                      marginBottom: "0.5rem", 
                      fontWeight: 500 
                    }}
                  >
                    Current Room:
                  </label>
                  <motion.input
                    type="text"
                    value={currentRoom}
                    onChange={(e) => setCurrentRoom(e.target.value)}
                    required
                    whileFocus={{ boxShadow: `0 0 0 2px ${colors.primary}` }}
                    style={{
                      width: "100%",
                      padding: "0.8rem 1rem",
                      borderRadius: "8px",
                      border: `1px solid ${colors.border}`,
                      fontFamily: "inherit",
                    }}
                    placeholder="e.g. B-204"
                  />
                </motion.div>
                
                <motion.div variants={itemVariants} style={{ flex: 1 }}>
                  <label 
                    style={{ 
                      display: "block", 
                      marginBottom: "0.5rem", 
                      fontWeight: 500 
                    }}
                  >
                    Desired Room:
                  </label>
                  <motion.input
                    type="text"
                    value={desiredRoom}
                    onChange={(e) => setDesiredRoom(e.target.value)}
                    required
                    whileFocus={{ boxShadow: `0 0 0 2px ${colors.primary}` }}
                    style={{
                      width: "100%",
                      padding: "0.8rem 1rem",
                      borderRadius: "8px",
                      border: `1px solid ${colors.border}`,
                      fontFamily: "inherit",
                    }}
                    placeholder="e.g. A-105"
                  />
                </motion.div>
              </div>
              
              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02, backgroundColor: "#FFD000" }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: colors.primary,
                  color: colors.text,
                  border: "none",
                  padding: "0.8rem 1.5rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "block",
                  margin: "0 auto",
                  fontSize: "1rem",
                  boxShadow: "0 2px 10px rgba(255, 222, 89, 0.3)",
                }}
              >
                {isSubmitting ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ display: "inline-block" }}
                  >
                    ⏳
                  </motion.span>
                ) : "Submit Room Change Request"}
              </motion.button>
            </form>
            
            <AnimatePresence>
              {roomChangeMessage && (
                <motion.div
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    background: roomChangeMessage.includes("success") || roomChangeMessage.includes("received") ? 
                      "rgba(0, 200, 0, 0.1)" : "rgba(255, 100, 100, 0.1)",
                    borderRadius: "8px",
                    textAlign: "center",
                    border: roomChangeMessage.includes("success") || roomChangeMessage.includes("received") ? 
                      "1px solid rgba(0, 200, 0, 0.3)" : "1px solid rgba(255, 100, 100, 0.3)",
                  }}
                >
                  {roomChangeMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>
      
      {/* Decorative elements */}
      <motion.div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.primaryLight} 0%, rgba(255,255,255,0) 70%)`,
          zIndex: -1,
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      <motion.div
        style={{
          position: "absolute",
          top: "15%",
          right: "10%",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.primaryLight} 0%, rgba(255,255,255,0) 70%)`,
          zIndex: -1,
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          delay: 1,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </motion.div>
  );
};

export default SubmitComplaintAndRoomChange;