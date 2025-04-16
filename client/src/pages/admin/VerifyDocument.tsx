import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { CheckCircle, XCircle, AlertCircle, FileText, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StudentDocument {
  id: string;
  student: {
    name: string;
    email: string;
  };
  documentUrl: string;
  documentType: string;
  status: "Pending" | "Verified" | "Rejected";
  uploadedAt: string;
}

interface ToastProps {
  message: string;
  type: "success" | "error";
}

interface DocumentModalProps {
  documentUrl: string;
  documentType: string;
  studentName: string;
  onClose: () => void;
}

const Toast = ({ message, type }: ToastProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
        type === "success" ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      {type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      {message}
    </motion.div>
  );
};

const DocumentModal = ({ documentUrl, documentType, studentName, onClose }: DocumentModalProps) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const getEmbedContent = () => {
    // Based on document type or URL, render appropriate embed content
    const fileExtension = documentUrl.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'pdf') {
      return (
        <iframe
          src={documentUrl}
          className="w-full h-full rounded"
          title={`${studentName}'s document`}
        />
      );
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '')) {
      return (
        <img
          src={documentUrl}
          alt={`${studentName}'s document`}
          className="max-w-full max-h-full object-contain"
        />
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <FileText size={64} className="text-yellow-500 mb-4" />
          <p className="text-lg font-medium">This document type cannot be previewed</p>
          <a 
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Download Document
          </a>
        </div>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-800">
              {studentName}'s {documentType}
            </h3>
            <p className="text-sm text-gray-500">Document Preview</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 min-h-[60vh]">
          {getEmbedContent()}
        </div>
      </motion.div>
    </motion.div>
  );
};

const VerifyDocuments = () => {
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<StudentDocument | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.admin.getStudentDocuments();
      setDocuments(data);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (documentId: string, status: "Verified" | "Rejected") => {
    try {
      await api.admin.verifyDocument({ documentId, status });
      setToast({
        message: `Document ${status.toLowerCase()} successfully.`,
        type: "success",
      });
      fetchDocuments(); // Refresh the document list
    } catch (err) {
      console.error("Error verifying document:", err);
      setToast({
        message: "Failed to update document status.",
        type: "error",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={14} className="mr-1" /> Verified
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={14} className="mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle size={14} className="mr-1" /> Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 size={48} className="text-yellow-500 animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg p-8">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <p className="text-red-800 text-lg font-medium">{error}</p>
        <button
          onClick={fetchDocuments}
          className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-6">
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      <AnimatePresence>
        {selectedDocument && (
          <DocumentModal
            documentUrl={selectedDocument.documentUrl}
            documentType={selectedDocument.documentType}
            studentName={selectedDocument.student.name}
            onClose={() => setSelectedDocument(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center mb-8">
          <FileText size={32} className="text-yellow-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Verify Student Documents</h1>
        </div>

        {documents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-yellow-50 border border-yellow-100 rounded-lg p-12 text-center"
          >
            <FileText size={64} className="text-yellow-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No documents available for verification.</p>
          </motion.div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-yellow-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-yellow-50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Student Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Document Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Uploaded At</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-100">
                  {documents.map((doc, index) => (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-yellow-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{doc.student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{doc.student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="capitalize">{doc.documentType}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(doc.uploadedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedDocument(doc)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors inline-flex items-center"
                        >
                          View
                        </motion.button>
                        {doc.status === "Pending" && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleVerify(doc.id, "Verified")}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors inline-flex items-center"
                            >
                              <CheckCircle size={14} className="mr-1" /> Verify
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleVerify(doc.id, "Rejected")}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors inline-flex items-center"
                            >
                              <XCircle size={14} className="mr-1" /> Reject
                            </motion.button>
                          </>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-right text-gray-500 text-sm"
        >
          Showing {documents.length} document{documents.length !== 1 ? "s" : ""}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyDocuments;