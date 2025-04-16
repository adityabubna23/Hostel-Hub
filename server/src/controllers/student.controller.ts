import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import supabase from "../utils/superbase";

const prisma = new PrismaClient();

export const uploadDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, documentTypes } = req.body; // `documentTypes` should be an array of document types
    const files = (req as Request & { files?: Express.Multer.File[] }).files;

    if (!files || files.length === 0) {
      res.status(400).json({ error: "No documents uploaded." });
      return;
    }

    if (!Array.isArray(documentTypes) || documentTypes.length !== files.length) {
      res.status(400).json({ error: "Document types must match the number of uploaded files." });
      return;
    }

    const uploadedDocuments = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const documentType = documentTypes[i];

      const fileExtension = file.originalname.split(".").pop();
      const uniqueFileName = `${studentId}_${documentType}_${Date.now()}.${fileExtension}`;
      const filePath = `student-documents/${uniqueFileName}`;

      // Upload to Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("upload") // Replace with your bucket name
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        console.error("Error uploading file to Supabase:", uploadError.message);
        res.status(500).json({ error: "Failed to upload document." });
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("uploads").getPublicUrl(filePath);

      // Save document details in the database
      const document = await prisma.studentDocument.create({
        data: {
          studentId,
          documentUrl: publicUrlData.publicUrl,
          documentType,
        },
      });

      uploadedDocuments.push(document);
    }

    res.status(201).json({ message: "Documents uploaded successfully.", uploadedDocuments });
  } catch (error) {
    console.error("Error in uploadDocuments:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};