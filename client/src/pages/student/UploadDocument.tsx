import React, { useState } from "react";
import { api } from "../../lib/api"; // Import the API object

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
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (documentType: string, file: File | null) => {
    setFiles((prev) => ({
      ...prev,
      [documentType]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required documents
    const missingDocuments = requiredDocuments
      .filter((doc) => doc.required && !files[doc.type])
      .map((doc) => doc.type);

    if (missingDocuments.length > 0) {
      setErrors(missingDocuments);
      alert(`Please upload the following required documents: ${missingDocuments.join(", ")}`);
      return;
    }

    const formData = new FormData();
    Object.entries(files).forEach(([documentType, file]) => {
      if (file) {
        formData.append("documents", file);
        formData.append("documentTypes[]", documentType);
      }
    });
    formData.append("studentId", "student-id"); // Replace with actual student ID

    try {
      const response = await api.student.uploadDocuments(formData);
      console.log("Upload response:", response);
       // Use the API method
      alert("Documents uploaded successfully!");
      setFiles({});
      setErrors([]);
    } catch (error) {
      console.error("Error uploading documents:", error);
      alert("Failed to upload documents.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {requiredDocuments.map((doc) => (
        <div key={doc.type}>
          <label>
            {doc.type} {doc.required && <span style={{ color: "red" }}>*</span>}:
            <input
              type="file"
              onChange={(e) => handleFileChange(doc.type, e.target.files?.[0] || null)}
            />
          </label>
          {errors.includes(doc.type) && (
            <p style={{ color: "red" }}>This document is required.</p>
          )}
        </div>
      ))}
      <button type="submit">Upload</button>
    </form>
  );
};

export default UploadDocuments;