import { useState, useRef, useEffect } from 'react';
import { api } from '../../lib/api';
import { 
  Bell, Send, FileText, Upload, CheckCircle, AlertCircle, 
  Sun, Cloud, Stars, Sparkles, Wind, Leaf
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface NoticeFormData {
  title: string;
  content: string;
  targetRoles: string[];
  documents: File[];
}

interface NotificationState {
  show: boolean;
  message: string;
  isSuccess: boolean;
}

const SendNoticePage = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState>({ 
    show: false, 
    message: '', 
    isSuccess: true 
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [hoverState, setHoverState] = useState<string | null>(null);
  
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Motion values for interactive elements
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);
  const springConfig = { stiffness: 200, damping: 30 };
  const scaleSpring = useSpring(1, springConfig);

  // Track mouse position for interactive card effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
  
    const formData = new FormData();
  
    // Add title and content to FormData
    formData.append('title', titleRef.current?.value || '');
    formData.append('content', contentRef.current?.value || '');
  
    // Set the selected roles from state
    formData.append('targetRoles', JSON.stringify(selectedRoles));
  
    // Add files to FormData
    selectedFiles.forEach((file) => {
      formData.append("documents", file); // Manually appending files
    });
  
    try {
      const response = await api.admin.sendNotice(formData);
      console.log('Notice sent successfully:', response);
  
      // Successful animation sequence
      scaleSpring.set(1.05);
      setTimeout(() => scaleSpring.set(1), 200);
  
      // Reset form
      formRef.current?.reset();
      setSelectedRoles([]);
      setSelectedFiles([]);
  
      showNotification('Notice sent successfully!', true);
    } catch (error) {
      console.error('Error sending notice:', error);
      showNotification('Failed to send notice. Please try again.', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showNotification = (message: string, isSuccess: boolean) => {
    setNotification({ show: true, message, isSuccess });
    
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.options);
    const selected = options.filter(option => option.selected).map(option => option.value);
    setSelectedRoles(selected);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeRole = (role: string) => {
    setSelectedRoles(prev => prev.filter(r => r !== role));
  };

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      removeRole(role);
    } else {
      setSelectedRoles(prev => [...prev, role]);
    }
  };

  const availableRoles = [
    { id: 'Student', label: 'Student' },
    { id: 'Warden', label: 'Warden' },
    { id: 'Admin', label: 'Admin' },
    { id: 'Faculty', label: 'Faculty' },
    { id: 'Staff', label: 'Staff' },
    { id: 'Parents', label: 'Parents' }
  ];

  const shimmerVariants = {
    initial: { 
      backgroundPosition: '0% 0%', 
    },
    animate: { 
      backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-white via-yellow-50 to-white p-6 relative overflow-hidden"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-yellow-100 to-yellow-200 opacity-20"
            initial={{ 
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              x: [
                Math.random() * 200 - 100,
                Math.random() * 200 - 100, 
                Math.random() * 200 - 100
              ],
              y: [
                Math.random() * 200 - 100,
                Math.random() * 200 - 100,
                Math.random() * 200 - 100
              ]
            }}
            transition={{ 
              duration: 20 + Math.random() * 20, 
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            style={{
              width: `${Math.random() * 400 + 100}px`,
              height: `${Math.random() * 400 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: `blur(${Math.random() * 50 + 30}px)`,
            }}
          />
        ))}
      </div>

      <div className="flex justify-center items-center min-h-screen relative z-10">
        <motion.div 
          className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-yellow-200 w-full max-w-2xl overflow-hidden"
          style={{ 
            rotateX, 
            rotateY,
            scale: scaleSpring,
            boxShadow: '0 20px 70px rgba(251, 191, 36, 0.2), 0 10px 30px rgba(251, 191, 36, 0.1)'
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => scaleSpring.set(1.02)}
          onMouseLeave={() => {
            scaleSpring.set(1);
            mouseX.set(0);
            mouseY.set(0);
          }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15 
          }}
        >
          {/* Interactive background gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-white via-yellow-50 to-yellow-100 opacity-80"
            animate={{ 
              background: [
                'linear-gradient(120deg, rgba(255,255,255,1) 0%, rgba(254,249,231,1) 50%, rgba(254,240,138,0.3) 100%)',
                'linear-gradient(200deg, rgba(255,255,255,1) 0%, rgba(254,249,231,1) 50%, rgba(254,240,138,0.3) 100%)',
                'linear-gradient(300deg, rgba(255,255,255,1) 0%, rgba(254,249,231,1) 50%, rgba(254,240,138,0.3) 100%)',
                'linear-gradient(360deg, rgba(255,255,255,1) 0%, rgba(254,249,231,1) 50%, rgba(254,240,138,0.3) 100%)',
                'linear-gradient(120deg, rgba(255,255,255,1) 0%, rgba(254,249,231,1) 50%, rgba(254,240,138,0.3) 100%)',
              ]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "linear" 
            }}
          />
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
            style={{ backgroundSize: '200% 200%' }}
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <div className="relative p-10 z-10">
            <motion.div
              className="flex items-center mb-8"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ rotate: 20, scale: 1.2 }}
                whileTap={{ rotate: 40, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-3 bg-yellow-100 rounded-full mr-4 shadow-md"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 5, 0, -5, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  <Bell className="text-yellow-500" size={28} />
                </motion.div>
              </motion.div>
              <div>
                <motion.h1 
                  className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Send Notice
                </motion.h1>
                <motion.p 
                  className="text-gray-500 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Share important announcements with your community
                </motion.p>
              </div>
            </motion.div>
            
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <motion.div 
                className="form-element"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <motion.div 
                  whileHover={{ scale: 1.01 }} 
                  whileTap={{ scale: 0.99 }}
                  onHoverStart={() => setHoverState('title')}
                  onHoverEnd={() => setHoverState(null)}
                  className="relative"
                >
                  <input
                    ref={titleRef}
                    type="text"
                    name="title"
                    id="title"
                    placeholder="Enter notice title"
                    required
                    className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 focus:outline-none transition-all duration-200 bg-white/70 backdrop-blur-sm shadow-sm"
                  />
                  
                  <AnimatePresence>
                    {hoverState === 'title' && (
                      <motion.div 
                        className="absolute inset-0 rounded-lg pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          boxShadow: '0 0 15px rgba(252, 211, 77, 0.5), 0 0 5px rgba(252, 211, 77, 0.3)',
                        }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="form-element"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <motion.div 
                  whileHover={{ scale: 1.01 }} 
                  whileTap={{ scale: 0.99 }}
                  onHoverStart={() => setHoverState('content')}
                  onHoverEnd={() => setHoverState(null)}
                  className="relative"
                >
                  <textarea
                    ref={contentRef}
                    name="content"
                    id="content"
                    placeholder="Enter notice content (optional)"
                    rows={5}
                    className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 focus:outline-none transition-all duration-200 bg-white/70 backdrop-blur-sm shadow-sm"
                  />
                  
                  <AnimatePresence>
                    {hoverState === 'content' && (
                      <motion.div 
                        className="absolute inset-0 rounded-lg pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          boxShadow: '0 0 15px rgba(252, 211, 77, 0.5), 0 0 5px rgba(252, 211, 77, 0.3)',
                        }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="form-element"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Target Audience
                </label>
                
                {/* Prettier role selection chips instead of select */}
                <motion.div 
                  className="flex flex-wrap gap-2 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1, delayChildren: 0.6 }}
                >
                  {availableRoles.map((role) => (
                    <motion.div
                      key={role.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleRole(role.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-2 shadow-sm ${
                        selectedRoles.includes(role.id) 
                          ? 'bg-yellow-400 text-yellow-900 border-2 border-yellow-500' 
                          : 'bg-white text-gray-600 border border-yellow-100 hover:border-yellow-300'
                      }`}
                    >
                      {selectedRoles.includes(role.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <CheckCircle size={14} className="text-yellow-800" />
                        </motion.div>
                      )}
                      {role.label}
                      
                      {selectedRoles.includes(role.id) && (
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: [0, 0.2, 0],
                            scale: [0.8, 1.2, 1.5],
                          }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                          style={{
                            background: 'radial-gradient(circle, rgba(252, 211, 77, 0.5) 0%, rgba(252, 211, 77, 0) 70%)',
                          }}
                        />
                      )}
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Hidden select for form submission */}
                <select
                  name="targetRoles"
                  multiple
                  className="hidden"
                  value={selectedRoles}
                  onChange={handleRoleChange}
                  required
                >
                  {availableRoles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
                
                <AnimatePresence>
                  {selectedRoles.length === 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-xs mt-1"
                    >
                      Please select at least one role
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
              
              <motion.div 
                className="form-element"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <label htmlFor="documents" className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments (Optional)
                </label>
                <motion.div 
                  className="relative border-2 border-dashed border-yellow-200 rounded-lg p-8 text-center transition-colors duration-200 overflow-hidden"
                  whileHover={{ 
                    scale: 1.01, 
                    backgroundColor: "rgba(254, 240, 138, 0.2)",
                    borderColor: "rgba(252, 211, 77, 0.8)" 
                  }}
                  whileTap={{ scale: 0.99 }}
                  onHoverStart={() => setHoverState('upload')}
                  onHoverEnd={() => setHoverState(null)}
                >
                  {/* Animated particles */}
                  {hoverState === 'upload' && (
                    <>
                      {[...Array(10)].map((_, i) => (
                        <motion.div
                          key={`particle-${i}`}
                          className="absolute w-2 h-2 rounded-full bg-yellow-300"
                          initial={{ 
                            opacity: 0,
                            x: '50%',
                            y: '100%',
                            scale: 0
                          }}
                          animate={{ 
                            opacity: [0, 1, 0],
                            y: ['100%', '-50%'],
                            x: [`50%`, `${50 + (Math.random() * 60 - 30)}%`],
                            scale: [0, Math.random() * 0.5 + 0.5, 0]
                          }}
                          transition={{ 
                            duration: 1 + Math.random(),
                            repeat: Infinity,
                            repeatDelay: Math.random() * 0.5,
                            ease: "easeOut"
                          }}
                        />
                      ))}
                    </>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  
                  <motion.div
                    className="flex flex-col items-center justify-center gap-3"
                    animate={
                      hoverState === 'upload' 
                        ? { y: -5, scale: 1.05 } 
                        : { y: 0, scale: 1 }
                    }
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <motion.div
                      className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center"
                      animate={{ 
                        boxShadow: hoverState === 'upload' 
                          ? [
                              '0 0 0 rgba(252, 211, 77, 0.4)',
                              '0 0 20px rgba(252, 211, 77, 0.6)',
                              '0 0 0 rgba(252, 211, 77, 0.4)'
                            ]
                          : '0 0 0 rgba(252, 211, 77, 0)'
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}
                    >
                      <motion.div
                        animate={{ 
                          y: hoverState === 'upload' ? [0, -5, 0] : 0,
                          rotate: hoverState === 'upload' ? [0, -10, 0, 10, 0] : 0
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut" 
                        }}
                      >
                        <Upload className="text-yellow-500" size={28} />
                      </motion.div>
                    </motion.div>
                    
                    <motion.button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-yellow-600 font-medium hover:text-yellow-700 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Click to upload files
                    </motion.button>
                    
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG up to 10MB
                    </p>
                  </motion.div>
                </motion.div>
                
                <AnimatePresence>
                  {selectedFiles.length > 0 && (
                    <motion.div 
                      className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-100 overflow-hidden"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <motion.div 
                        className="flex justify-between items-center mb-3"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p className="text-sm font-medium text-gray-700">
                          Selected files ({selectedFiles.length})
                        </p>
                        
                        <motion.button
                          type="button"
                          onClick={() => setSelectedFiles([])}
                          className="text-xs text-gray-500 hover:text-red-500"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Clear all
                        </motion.button>
                      </motion.div>
                      
                      <motion.ul 
                        className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.05 }}
                      >
                        {selectedFiles.map((file, index) => (
                          <motion.li 
                            key={`${file.name}-${index}`} 
                            className="text-sm text-gray-600 flex items-center justify-between bg-white p-3 rounded-md shadow-sm border border-yellow-50"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            whileHover={{ x: 5, backgroundColor: "rgba(254, 249, 195, 0.5)" }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="flex items-center max-w-[80%]">
                              <div className="p-2 bg-yellow-100 rounded-md mr-3">
                                <FileText size={16} className="text-yellow-500" />
                              </div>
                              <div className="truncate">
                                <p className="truncate font-medium">{file.name}</p>
                                <p className="text-xs text-gray-400">
                                  {(file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <motion.button
                              type="button"
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                              onClick={() => removeFile(index)}
                              whileHover={{ scale: 1.1, rotate: 10 }}
                              whileTap={{ scale: 0.9, rotate: 0 }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12"></path>
                              </svg>
                            </motion.button>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              <motion.div 
                className="form-element pt-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <motion.button
                  type="submit"
                  disabled={isSubmitting || selectedRoles.length === 0}
                  className={`relative w-full inline-flex justify-center items-center px-6 py-4 border border-transparent text-base font-medium rounded-lg shadow-md text-white overflow-hidden 
                  ${selectedRoles.length === 0 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500'}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200`}
                  whileHover={selectedRoles.length > 0 ? { scale: 1.02, y: -2 } : {}}
                  whileTap={selectedRoles.length > 0 ? { scale: 0.98, y: 0 } : {}}
                >
                  {/* Animated gradient background */}
                  {selectedRoles.length > 0 && !isSubmitting && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-200/30 to-yellow-400/0"
                      style={{ backgroundSize: '200% 100%' }}
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 0%', '0% 0%']
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                  
                  {isSubmitting ? (
                    <>
                      <motion.svg 
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                        animate={{ rotate: 360 }}
                        transition={{ 
                          duration: 1, 
                          repeat: Infinity, 
                          ease: "linear" 
                        }}
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        ></circle>
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </motion.svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Notice
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
      
      {/* Notification toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div 
            className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg max-w-md ${
              notification.isSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className={`p-2 rounded-full mr-3 ${
              notification.isSuccess ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {notification.isSuccess ? (
                <CheckCircle className="text-green-500" size={18} />
              ) : (
                <AlertCircle className="text-red-500" size={18} />
              )}
            </div>
            <p className={`text-sm font-medium ${
              notification.isSuccess ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Decorative elements */}
      <div className="fixed bottom-10 left-10 opacity-10 pointer-events-none">
        <Sun size={40} />
      </div>
      <div className="fixed top-10 right-10 opacity-10 pointer-events-none">
        <Cloud size={40} />
      </div>
      <div className="fixed top-1/4 left-1/4 opacity-10 pointer-events-none">
        <Stars size={30} />
      </div>
      <div className="fixed bottom-1/4 right-1/4 opacity-10 pointer-events-none">
        <Sparkles size={30} />
      </div>
      <div className="fixed top-1/2 left-10 opacity-10 pointer-events-none">
        <Wind size={30} />
      </div>
      <div className="fixed bottom-1/2 right-10 opacity-10 pointer-events-none">
        <Leaf size={30} />
      </div>
    </motion.div>
  );
};

export default SendNoticePage;