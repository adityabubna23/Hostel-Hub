import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

const UploadDocuments = () => {
  const requiredDocuments = [
    { type: "Aadhaar Card", required: true },
    { type: "PAN Card", required: false },
    { type: "Voter Card", required: false },
    { type: "10th Mark Sheet", required: true },
    { type: "12th Mark Sheet", required: true },
    { type: "Bonafide Certificate", required: true },
    { type: "Passport Size Photo", required: true },
    { type: "Signature", required: true },
  ];

  const [files, setFiles] = useState<{ [key: string]: File | null }>({});

  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: string }>({});
  const [uploadedDocuments, setUploadedDocuments] = useState<
    { id: string; documentUrl: string; documentType: string; status: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [modalDocument, setModalDocument] = useState<string | null>(null);

  const fetchUploadedDocuments = async () => {
    const token = localStorage.getItem("auth-storage");
    if (!token) {
      console.error("No authentication token found.");
      return;
    }

    try {
      const decodedToken: { userId: string } = jwtDecode(token);
      const studentId = decodedToken.userId;

      const response = await api.student.getUploadedDocuments(studentId);
      setUploadedDocuments(response.documents || []);
    } catch (error) {
      console.error("Error fetching uploaded documents:", error);
    }
  };

  const handleFileChange = async (documentType: string, file: File | null) => {
    if (file) {
      setIsLoading(prev => ({ ...prev, [documentType]: true }));
      const formData = new FormData();

      const token = localStorage.getItem("auth-storage");
      if (!token) {
        console.error("No authentication token found.");
        setIsLoading(prev => ({ ...prev, [documentType]: false }));
        return;
      }

      try {
        const decodedToken: { userId: string } = jwtDecode(token);
        const studentId = decodedToken.userId;

        formData.append("documents", file);
        formData.append("documentTypes[]", documentType);
        formData.append("studentId", studentId);

        const response = await api.student.uploadDocuments(formData);
        console.log(`Upload response for ${documentType}:`, response);

        setUploadStatus((prev) => ({
          ...prev,
          [documentType]: "Uploaded successfully!",
        }));

        // Update files state
        setFiles(prev => ({
          ...prev,
          [documentType]: file
        }));

        // Refresh the uploaded documents list
        await fetchUploadedDocuments();
      } catch (error) {
        console.error(`Error uploading ${documentType}:`, error);
        setUploadStatus((prev) => ({
          ...prev,
          [documentType]: "Failed to upload.",
        }));
      } finally {
        setIsLoading(prev => ({ ...prev, [documentType]: false }));
      }
    }
  };

  useEffect(() => {
    fetchUploadedDocuments();
  }, []);

  const getDocumentStatus = (documentType: string) => {
    const document = uploadedDocuments.find((doc) => doc.documentType === documentType);
    return document ? document.status : null;
  };

  const isUploadDisabled = (documentType: string) => {
    const status = getDocumentStatus(documentType);
    return status === "Verified" || status === "Processing" || status === "Pending";
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return "#666";
    
    switch (status) {
      case "Verified": return "#4CAF50";
      case "Processing": return "#2196F3";
      case "Pending": return "#FF9800";
      case "Rejected": return "#F44336"; 
      default: return "#666";
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <motion.h2 
        className="text-2xl font-bold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Document Upload Center
      </motion.h2>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6"
      >
        {requiredDocuments.map((doc) => {
          const status = getDocumentStatus(doc.type);
          const isDisabled = isUploadDisabled(doc.type);
          const documentFile = files[doc.type];
          const document = uploadedDocuments.find(d => d.documentType === doc.type);
          
          return (
            <motion.div 
              key={doc.type} 
              variants={itemVariants}
              className={`p-4 rounded-lg border-2 ${isDisabled ? 'bg-gray-50' : 'bg-amber-50'} ${status === 'Rejected' ? 'border-red-300' : 'border-amber-200'}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center">
                    <h3 className="font-semibold text-gray-800">
                      {doc.type} {doc.required && <span className="text-red-500">*</span>}
                    </h3>
                    
                    {status && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-3 px-3 py-1 text-xs font-medium rounded-full"
                        style={{ 
                          backgroundColor: `${getStatusColor(status)}20`,
                          color: getStatusColor(status)
                        }}
                      >
                        {status}
                      </motion.span>
                    )}
                  </div>
                  
                  {document && (
  <div className="mt-2 text-sm">
    <button
      onClick={() => setModalDocument(document.documentUrl)}
      className="text-blue-600 hover:underline flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      View Document
    </button>
  </div>
)}
                  
                  {documentFile && !document && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {documentFile.name.length > 20 ? `${documentFile.name.substring(0, 20)}...` : documentFile.name}
                    </p>
                  )}
                  
                  {status === 'Rejected' && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-600 text-sm mt-1"
                    >
                      Document rejected. Please upload again.
                    </motion.p>
                  )}
                </div>
                
                <div>
                  <input
                    type="file"
                    id={`file-${doc.type}`}
                    className="hidden"
                    onChange={(e) => handleFileChange(doc.type, e.target.files?.[0] || null)}
                    disabled={isDisabled || isLoading[doc.type]}
                    ref={fileInputRef}
                  />
                  
                  <motion.label
                    htmlFor={`file-${doc.type}`}
                    whileHover={!isDisabled ? { scale: 1.05 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    className={`inline-flex items-center px-4 py-2 rounded-md cursor-pointer transition-colors ${
                      isDisabled 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-amber-400 hover:bg-amber-500 text-white'
                    }`}
                  >
                    {isLoading[doc.type] ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {status === 'Rejected' ? 'Upload Again' : isDisabled ? 'Uploaded' : 'Upload'}
                  </motion.label>
                </div>
              </div>
              
              {uploadStatus[doc.type] && !isDisabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2"
                >
                  <p className={uploadStatus[doc.type] === "Uploaded successfully!" ? "text-green-600" : "text-red-600"}>
                    {uploadStatus[doc.type]}
                  </p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200"
      >
        <h3 className="font-semibold text-gray-800 mb-2">Document Status Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Pending', 'Processing', 'Verified', 'Rejected'].map(status => {
            const count = uploadedDocuments.filter(doc => doc.status === status).length;
            return (
              <motion.div 
                key={status}
                whileHover={{ y: -2 }}
                className="p-3 rounded-lg bg-white shadow-sm"
              >
                <div className="text-xs font-medium" style={{ color: getStatusColor(status) }}>{status}</div>
                <div className="text-xl font-bold text-gray-800">{count}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
      {modalDocument && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded-lg shadow-lg max-w-3xl w-full">
      <button
        onClick={() => setModalDocument(null)}
        className="text-gray-500 hover:text-gray-800 float-right"
      >
        Close
      </button>
      <iframe
        src={modalDocument}
        title="Document Viewer"
        className="w-full h-96"
      ></iframe>
    </div>
  </div>
)}
    </div>
  );
  
};

export default UploadDocuments;