import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin,api } from '../../lib/api';
import { useAuthStore } from '../../stores/useStore';
import { ROLE_REDIRECTS, isValidRole } from '../../config/permission';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState('');

  // Animation effects for page elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delay: 0.3, 
        when: "beforeChildren",
        staggerChildren: 0.2
      }
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

  // Simulated light effect animation
  useEffect(() => {
    const interval = setInterval(() => {
      const loginCard = document.getElementById('login-card');
      if (loginCard) {
        loginCard.style.boxShadow = `0 15px 30px rgba(0, 0, 0, 0.1), 
                                     0 0 ${20 + Math.random() * 30}px rgba(255, 215, 0, ${0.2 + Math.random() * 0.3})`;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError('');

    try {
      const response = await loginMutation.mutateAsync({ 
        email, 
        password 
      });
      
      setAuth(response.user, response.token);
      
      // Check if role is valid before using it as an index
      if (response.role && isValidRole(response.role)) {
        navigate(ROLE_REDIRECTS[response.role], { replace: true });
      } else {
        console.error('Invalid role received:', response.role);
        setError('Invalid role configuration');
      }
    } catch (error) {
      setError('Invalid credentials');
    }
  };

  const handleAdminSignup = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setSignupError('');

    if (!adminEmail.endsWith('@gmail.com')) {
      setSignupError('Email must end with @gmail.com');
      return;
    }
  
    // Validate passwords match
    if (adminPassword !== adminConfirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }
  
    try {
      // Call the signup API from api.ts
      await api.auth.signup({
        name: 'Admin User', // Replace with actual input if needed
        email: adminEmail,
        password: adminPassword,
        roleName: 'Admin',
      });
  
      alert('Signup successful! You can now login with your credentials.');
      setShowSignup(false);
      setEmail(adminEmail);
      setPassword('');
      navigate('/login', { replace: true }); // Redirect to login route
    } catch (error: any) {
      setSignupError(error.response?.data?.message || 'An error occurred during signup. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-yellow-50 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-yellow-200 opacity-20"
            style={{
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <motion.div
        className="max-w-md w-full relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {!showSignup ? (
          <motion.div 
            id="login-card"
            className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-500"
            style={{ boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1), 0 0 20px rgba(255, 215, 0, 0.2)' }}
            whileHover={{ y: -5 }}
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Welcome Back</h2>
              <p className="text-center text-gray-500 mb-6">Please enter your details</p>
            </motion.div>

            {error && (
              <motion.div 
                className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <p>{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all duration-300 outline-none"
                  placeholder="Enter your email"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all duration-300 outline-none"
                  placeholder="Enter your password"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 shadow-md transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign in
                </motion.button>
              </motion.div>
            </form>

            <motion.div 
              className="mt-6 text-center"
              variants={itemVariants}
            >
              <p className="text-gray-600">
                Admin user? {" "}
                <button 
                  onClick={() => setShowSignup(true)}
                  className="text-yellow-600 font-medium hover:text-yellow-700 transition-colors duration-300"
                >
                  Sign up here
                </button>
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            id="signup-card"
            className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-500"
            style={{ boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1), 0 0 20px rgba(255, 215, 0, 0.2)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Admin Sign Up</h2>
              <p className="text-center text-gray-500 mb-6">Create an administrator account</p>
            </motion.div>

            {signupError && (
              <motion.div 
                className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <p>{signupError}</p>
              </motion.div>
            )}

            <form onSubmit={handleAdminSignup} className="space-y-4">
             

              <motion.div variants={itemVariants}>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="adminEmail"
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all duration-300 outline-none"
                  placeholder="Enter admin email"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="adminPassword"
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="block w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all duration-300 outline-none"
                  placeholder="Create password"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  className="block w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all duration-300 outline-none"
                  placeholder="Confirm password"
                />
              </motion.div>

              <div className="flex space-x-4 mt-6">
                <motion.button
                  type="button"
                  onClick={() => setShowSignup(false)}
                  className="w-1/2 py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back to Login
                </motion.button>

                <motion.button
                  type="submit"
                  className="w-1/2 py-3 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 shadow-md transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Account
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;