import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Room {
  id: string;
  name: string;
  capacity: number;
}

interface Floor {
  id: string;
  name: string;
  rooms: Room[];
}

const AddFloorAndRoomPage: React.FC = () => {
  const [floorName, setFloorName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [floors, setFloors] = useState<Floor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomCapacity, setRoomCapacity] = useState<number | "">("");
  const [isFloorFormActive, setIsFloorFormActive] = useState(false);
  const [isRoomFormActive, setIsRoomFormActive] = useState(false);

  useEffect(() => {
    const fetchFloors = async () => {
      setIsLoading(true);
      try {
        const response = await api.admin.getFloors();
        const floorsWithRooms = response.map((floor: Floor) => ({
          ...floor,
          rooms: Array.isArray(floor.rooms) ? floor.rooms : [], 
        }));
        setFloors(floorsWithRooms);
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message;
        showNotification(`Error fetching floors: ${errorMessage}`, "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFloors();
  }, []);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
    visible: boolean;
  }>({ message: "", type: "success", visible: false });

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleAddFloor = async () => {
    if (!floorName.trim()) {
      showNotification("Please enter a floor name", "error");
      return;
    }

    try {
      const response = await api.admin.addFloor({ name: floorName });
      showNotification(`Floor "${response.name}" added successfully!`, "success");
      setFloorName("");
      setFloors((prevFloors) => [...prevFloors, response]);
      setIsFloorFormActive(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message;
      showNotification(`Error adding floor: ${errorMessage}`, "error");
    }
  };

  const handleAddRoom = async () => {
    if (!roomName.trim()) {
      showNotification("Please enter a room name", "error");
      return;
    }

    if (!selectedFloorId) {
      showNotification("Please select a floor", "error");
      return;
    }

    if (!roomCapacity || roomCapacity <= 0) {
      showNotification("Please enter a valid room capacity", "error");
      return;
    }

    try {
      const selectedFloor = floors.find((floor) => floor.id === selectedFloorId);
      if (!selectedFloor) {
        showNotification("Selected floor not found", "error");
        return;
      }

      const response = await api.admin.addRoom({
        name: roomName,
        floorId: selectedFloorId,
        floorName: selectedFloor.name,
        capacity: roomCapacity,
      });

      showNotification(`Room "${response.name}" added successfully!`, "success");
      setRoomName("");
      setRoomCapacity("");
      setIsRoomFormActive(false);

      // Update the floors state to include the new room
      setFloors((prevFloors) =>
        prevFloors.map((floor) =>
          floor.id === selectedFloorId
            ? { ...floor, rooms: [...floor.rooms, response] }
            : floor
        )
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message;
      showNotification(`Error adding room: ${errorMessage}`, "error");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-yellow-50">
      {/* Left Side - Controls */}
      <div className="w-full md:w-1/3 p-6 bg-white shadow-xl border-r border-yellow-200">
        <h1 className="text-3xl font-bold mb-8 text-yellow-600 flex items-center">
          <svg
            className="w-8 h-8 mr-3 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            ></path>
          </svg>
          Hostel Management
        </h1>

        {/* Action buttons */}
        <div className="flex space-x-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setIsFloorFormActive(true);
              setIsRoomFormActive(false);
            }}
            className={`flex-1 py-4 rounded-lg shadow-md transition-all flex flex-col items-center justify-center ${
              isFloorFormActive
                ? "bg-yellow-400 text-white"
                : "bg-white text-yellow-600 border-2 border-yellow-400 hover:bg-yellow-50"
            }`}
          >
            <svg
              className="w-6 h-6 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"
              ></path>
            </svg>
            Add Floor
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setIsRoomFormActive(true);
              setIsFloorFormActive(false);
            }}
            className={`flex-1 py-4 rounded-lg shadow-md transition-all flex flex-col items-center justify-center ${
              isRoomFormActive
                ? "bg-yellow-400 text-white"
                : "bg-white text-yellow-600 border-2 border-yellow-400 hover:bg-yellow-50"
            }`}
          >
            <svg
              className="w-6 h-6 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              ></path>
            </svg>
            Add Room
          </motion.button>
        </div>

        {/* Add Floor Form */}
        <AnimatePresence>
          {isFloorFormActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 bg-white p-6 rounded-lg shadow-md border-2 border-yellow-200 overflow-hidden"
            >
              <h2 className="text-xl font-semibold mb-4 text-yellow-600">
                Add New Floor
              </h2>
              <div className="flex flex-col space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Floor Name (e.g. Ground Floor)"
                    value={floorName}
                    onChange={(e) => setFloorName(e.target.value)}
                    className="w-full p-4 pl-12 border border-yellow-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-yellow-50"
                  />
                  <svg
                    className="absolute left-3 top-4 w-6 h-6 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"
                    ></path>
                  </svg>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddFloor}
                  className="px-6 py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-md font-medium"
                >
                  Add Floor
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Room Form */}
        <AnimatePresence>
          {isRoomFormActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-6 rounded-lg shadow-md border-2 border-yellow-200 overflow-hidden"
            >
              <h2 className="text-xl font-semibold mb-4 text-yellow-600">
                Add New Room
              </h2>
              <div className="flex flex-col space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Room Name (e.g. Room 101)"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full p-4 pl-12 border border-yellow-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-yellow-50"
                  />
                  <svg
                    className="absolute left-3 top-4 w-6 h-6 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>

                <div className="relative">
                  <select
                    value={selectedFloorId}
                    onChange={(e) => setSelectedFloorId(e.target.value)}
                    className="w-full p-4 pl-12 border border-yellow-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-yellow-50 appearance-none"
                  >
                    <option value="">Select Floor</option>
                    {floors.map((floor) => (
                      <option key={floor.id} value={floor.id}>
                        {floor.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute left-3 top-4 w-6 h-6 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    placeholder="Room Capacity"
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(Number(e.target.value))}
                    className="w-full p-4 pl-12 border border-yellow-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-yellow-50"
                  />
                  <svg
                    className="absolute left-3 top-4 w-6 h-6 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddRoom}
                  className="px-6 py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-md font-medium"
                >
                  Add Room
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floor Summary */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-yellow-600 mb-2">Summary</h3>
          <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between mb-2">
              <span>Total Floors:</span>
              <span className="font-bold">{floors.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Rooms:</span>
              <span className="font-bold">
                {floors.reduce((acc, floor) => acc + (floor.rooms?.length || 0), 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Hostel Visualization */}
      <div className="w-full md:w-2/3 p-6 bg-yellow-50 overflow-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-yellow-600">Hostel Visualization</h2>
            <p className="text-yellow-700">3D Interactive Building View</p>
          </div>
          
          {/* Legend */}
          <div className="bg-white p-3 rounded-lg shadow-md flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-300 rounded-full mr-2"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm">Partially Filled</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-600 rounded-full mr-2"></div>
              <span className="text-sm">Full</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-yellow-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-yellow-500 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : floors.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-10 text-center shadow-xl border-2 border-yellow-100"
          >
            <div className="relative w-32 h-32 mx-auto mb-6">
              <motion.div
                className="absolute inset-0 bg-yellow-100 rounded-full"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              ></motion.div>
              <svg
                className="absolute inset-0 w-32 h-32 mx-auto text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-yellow-600 mb-2">
              Your Hostel Awaits!
            </h3>
            <p className="text-yellow-700 mb-6">
              Start by adding your first floor from the panel on the left
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFloorFormActive(true)}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-md font-medium"
            >
              Add Your First Floor
            </motion.button>
          </motion.div>
        ) : (
          <div className="relative">
            {/* Building base */}
            <motion.div
              className="w-full h-12 bg-yellow-200 rounded-lg shadow-lg mb-2"
              initial={{ opacity: 0, scaleX: 0.9 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5 }}
            ></motion.div>

            {/* 3D Building with floors */}
            <div className="hostel-building relative z-10">
              <AnimatePresence>
                {/* Rendering floors from bottom to top */}
                {[...floors].reverse().map((floor, index) => (
                  <motion.div
                    key={floor.id}
                    className="mb-1 relative"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {/* Floor indicator */}
                    <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 flex items-center">
                      <motion.div
                        className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {floors.length - index}
                      </motion.div>
                      <div className="h-px w-4 bg-yellow-400"></div>
                    </div>

                    {/* Floor container */}
                    <motion.div
                      className="floor-container bg-white rounded-lg shadow-xl overflow-hidden border-2 border-yellow-200"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-3 bg-yellow-100 border-b border-yellow-200 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-yellow-600">
                          {floor.name}
                        </h3>
                        <div className="text-sm text-yellow-600">
                          {floor.rooms?.length || 0} Room
                          {(floor.rooms?.length || 0) !== 1 ? "s" : ""}
                        </div>
                      </div>

                      <div className="p-4">
                        {(floor.rooms || []).length === 0 ? (
                          <div className="text-center py-6 text-yellow-500 italic">
                            No rooms added to this floor yet
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <AnimatePresence>
                              {(floor.rooms || []).map((room, roomIndex) => (
                                <motion.div
                                  key={room.id}
                                  className="room-card bg-white border-2 border-yellow-100 p-4 rounded-lg shadow-md relative overflow-hidden group"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  whileHover={{ 
                                    y: -5, 
                                    boxShadow: "0 12px 20px -6px rgba(250, 204, 21, 0.3)" 
                                  }}
                                  transition={{ duration: 0.3, delay: roomIndex * 0.05 }}
                                >
                                  {/* Room status indicator (random for demo) */}
                                  <div className={`absolute top-0 right-0 w-3 h-8 
                                    ${roomIndex % 3 === 0 ? "bg-yellow-300" : 
                                      roomIndex % 3 === 1 ? "bg-yellow-500" : "bg-yellow-600"}`}>
                                  </div>
                                  
                                  {/* Room details */}
                                  <div className="flex flex-col">
                                    <div className="flex items-center mb-2">
                                      <svg
                                        className="w-5 h-5 text-yellow-500 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                        ></path>
                                      </svg>
                                      <span className="font-medium text-yellow-800">
                                        {room.name}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center text-sm text-yellow-600">
                                      <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        ></path>
                                      </svg>
                                      Capacity: {room.capacity}
                                    </div>
                                  </div>
                                  
                                  {/* Hover effect shine */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100 to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Animated building decorations */}
            <div className="building-decorations absolute -left-8 inset-y-0 w-4">
              <motion.div
                className="absolute top-0 left-0 w-4 h-full bg-yellow-500 rounded-l-lg"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              ></motion.div>
              <motion.div
                className="absolute top-1/4 left-4 w-2 h-1/2 bg-yellow-400 rounded-l-lg"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              ></motion.div>
            </div>

            {/* Animated sun decoration */}
            <motion.div
              className="absolute -right-12 top-10 w-20 h-20 bg-yellow-300 rounded-full opacity-30"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            ></motion.div>
          </div>
        )}
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification.visible && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
              notification.type === "success" ? "bg-yellow-500" : "bg-red-500"
            } text-white max-w-sm z-50 flex items-center`}
          >
            <div className="mr-3">
              {notification.type === "success" ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              )}
            </div>
            <div>{notification.message}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddFloorAndRoomPage;