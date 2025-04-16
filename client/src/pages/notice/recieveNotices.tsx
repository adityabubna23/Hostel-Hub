import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Download, 
  Inbox, 
  AlertCircle, 
  Loader2, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  X,
  Eye,
  Calendar
} from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string | null;
  documentUrl: string | null;
  createdAt: string;
}

const ReceiveNoticesPage = ({ initialRole = "student" }: { initialRole?: string }) => {
  const [selectedRole ] = useState(initialRole);
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");

  // Fetch notices for the selected role
  const { data, isLoading, error, refetch } = useQuery<Notice[]>({
    queryKey: ["notices", selectedRole],
    queryFn: () => api.message.getNotices(selectedRole),
  });

  // Refetch when role changes
  useEffect(() => {
    refetch();
  }, [selectedRole, refetch]);

  const notices = data || [];
  const hasNotices = notices.length > 0;

  const toggleExpandNotice = (id: string) => {
    setExpandedNotice(expandedNotice === id ? null : id);
  };

  const handlePreview = async (url: string) => {
    try {
      const urlObj = new URL(url.trim());
      const fileName = urlObj.searchParams.get("fileName") || "Document";
      setPreviewFileName(fileName);
      
      // For PDF preview - assuming document is accessible via URL
      setPreviewUrl(urlObj.origin + urlObj.pathname);
    } catch (error) {
      console.error("Error previewing the file:", error);
    }
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewFileName("");
  };

  const handleDownload = async (url: string) => {
    try {
      const urlObj = new URL(url.trim());
      const fileName = urlObj.searchParams.get("fileName") || "Document";
      
      const response = await axios.get(urlObj.origin + urlObj.pathname, {
        responseType: "blob",
      });
      
      const fileExtension = fileName.split(".").pop()?.toLowerCase();
      const mimeType = fileExtension === "pdf"
        ? "application/pdf"
        : response.headers["content-type"] || "application/octet-stream";
      
      const blob = new Blob([response.data], { type: mimeType });
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  // Function to get file extension from filename
  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  // Function to get thumbnail/icon based on file type
  const getDocumentThumbnail = (url: string) => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url.trim());
      const fileName = urlObj.searchParams.get("fileName") || "Document";
      const extension = getFileExtension(fileName);
      
      // Return different SVG based on file type
      return (
        <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg h-32 w-full">
          {extension === 'pdf' ? (
            <div className="flex flex-col items-center">
              <FileText className="h-12 w-12 text-red-500" />
              <span className="text-xs mt-2 text-gray-600">{fileName}</span>
            </div>
          ) : extension === 'doc' || extension === 'docx' ? (
            <div className="flex flex-col items-center">
              <FileText className="h-12 w-12 text-blue-500" />
              <span className="text-xs mt-2 text-gray-600">{fileName}</span>
            </div>
          ) : extension === 'xls' || extension === 'xlsx' ? (
            <div className="flex flex-col items-center">
              <FileText className="h-12 w-12 text-green-500" />
              <span className="text-xs mt-2 text-gray-600">{fileName}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FileText className="h-12 w-12 text-gray-500" />
              <span className="text-xs mt-2 text-gray-600">{fileName}</span>
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error("Error parsing document URL:", error);
      return (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg h-32">
          <FileText className="h-12 w-12 text-gray-400" />
        </div>
      );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header with gradient background */}
      <motion.div 
        className="bg-gradient-to-r from-yellow-400 to-yellow-200 p-6 shadow-md"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Bell className="h-8 w-8 text-yellow-800" />
              <h1 className="text-3xl font-bold text-yellow-800">Notifications Center</h1>
            </motion.div>
            
            {/* Role Indicator */}
            <motion.div 
              className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-md text-yellow-800 font-medium"
              initial={{ x: 20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span>Role: {initialRole.charAt(0).toUpperCase() + initialRole.slice(1)}</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {isLoading ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="h-12 w-12 text-yellow-500 animate-spin mb-4" />
            <p className="text-gray-500 text-lg">Loading notices...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-red-700 font-medium text-lg">Error</h3>
              <p className="text-red-600">Failed to load notices. Please try again later.</p>
            </div>
          </motion.div>
        ) : !hasNotices ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Inbox className="h-16 w-16 text-yellow-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No notices available</h2>
            <p className="text-gray-500 max-w-md">There are currently no notifications available for the {selectedRole} role.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-500" />
              You have {notices.length} notification{notices.length !== 1 ? 's' : ''}
            </h2>
            
            {/* Card Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {notices.map((notice, index) => (
                  <motion.div
                    key={notice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-yellow-100"
                  >
                    {/* Card Header */}
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-white border-b border-yellow-100">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{notice.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(notice.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    {/* Document Preview Thumbnails (if available) */}
                    {notice.documentUrl && (
                      <div className="p-4 border-b border-yellow-100 bg-gray-50">
                        <div className="grid grid-cols-2 gap-2">
                          {notice.documentUrl.split(",").slice(0, 2).map((url, urlIndex) => {
                           
                            
                            
                            return (
                              <div 
                                key={urlIndex} 
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handlePreview(url)}
                              >
                                {getDocumentThumbnail(url)}
                              </div>
                            );
                          })}
                          
                          {notice.documentUrl.split(",").length > 2 && (
                            <div className="flex items-center justify-center bg-gray-100 rounded-lg h-32 col-span-2">
                              <span className="text-gray-600 font-medium">
                                +{notice.documentUrl.split(",").length - 2} more file(s)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Card Body - Preview of Content */}
                    <div className="p-4">
                      {notice.content ? (
                        <p className="text-gray-600 line-clamp-3 text-sm">
                          {notice.content}
                        </p>
                      ) : (
                        <p className="text-gray-400 italic text-sm">No content provided.</p>
                      )}
                    </div>
                    
                    {/* Card Footer with Actions */}
                    <div className="p-4 bg-gray-50 border-t border-yellow-100 flex justify-between items-center">
                      <motion.button
                        onClick={() => toggleExpandNotice(notice.id)}
                        className="flex items-center gap-1 text-yellow-700 text-sm font-medium hover:text-yellow-800 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {expandedNotice === notice.id ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            <span>Hide details</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            <span>View details</span>
                          </>
                        )}
                      </motion.button>
                      
                      {notice.documentUrl && (
                        <motion.button
                          onClick={() => handlePreview(notice.documentUrl?.split(",")[0] || "")}
                          className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye className="h-4 w-4" />
                          <span>Preview</span>
                        </motion.button>
                      )}
                    </div>
                    
                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedNotice === notice.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-yellow-100 bg-yellow-50 p-4"
                        >
                          {notice.content ? (
                            <p className="text-gray-700 whitespace-pre-line mb-4">{notice.content}</p>
                          ) : (
                            <p className="text-gray-500 italic mb-4">No content provided.</p>
                          )}

                          {notice.documentUrl && (
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-yellow-600" />
                                Attachments
                              </h4>
                              <div className="space-y-2">
                                {notice.documentUrl.split(",").map((url, urlIndex) => {
                                  const urlObj = new URL(url.trim());
                                  const fileName = urlObj.searchParams.get("fileName") || `Document_${urlIndex + 1}`;
                                  
                                  return (
                                    <div key={urlIndex} className="flex flex-wrap gap-2">
                                      <motion.button
                                        onClick={() => handlePreview(url)}
                                        className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-3 py-2 text-blue-700 hover:bg-blue-50 transition-colors"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                      >
                                        <Eye className="h-4 w-4" />
                                        <span className="text-sm">Preview</span>
                                      </motion.button>
                                      
                                      <motion.button
                                        onClick={() => handleDownload(url)}
                                        className="flex items-center gap-2 bg-white border border-yellow-200 rounded-lg px-3 py-2 text-yellow-700 hover:bg-yellow-50 transition-colors"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                      >
                                        <Download className="h-4 w-4" />
                                        <span className="text-sm">{fileName}</span>
                                      </motion.button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-screen flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-medium text-lg text-gray-800 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-yellow-600" />
                  {previewFileName}
                </h3>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => handleDownload(previewUrl)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Download className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    onClick={closePreview}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
              
              {/* Modal Content - Document Preview */}
              <div className="flex-1 overflow-auto bg-gray-100 p-4">
                {/* For PDF files */}
                {previewFileName.toLowerCase().endsWith('.pdf') ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <iframe 
                      src={previewUrl} 
                      className="w-full h-full min-h-96 rounded-lg shadow-md bg-white"
                      title={previewFileName}
                    />
                  </div>
                ) : (
                  /* For other file types - fallback to placeholder */
                  <div className="h-full w-full flex flex-col items-center justify-center gap-4 p-8">
                    <FileText className="h-20 w-20 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-700">{previewFileName}</h3>
                    <p className="text-gray-500 text-center">
                      Preview is not available for this file type.
                      <br/>Use the download button to view this file.
                    </p>
                    <motion.button
                      onClick={() => handleDownload(previewUrl)}
                      className="mt-4 flex items-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-full hover:bg-yellow-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="h-5 w-5" />
                      <span>Download</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReceiveNoticesPage;