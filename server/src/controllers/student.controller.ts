import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import supabase from "../utils/superbase";
import { v4 as uuidv4 } from "uuid"; // Import UUID for generating unique complaint numbers

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

    const studentExists = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!studentExists) {
      res.status(404).json({ error: "Student not found." });
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

      const { data: publicUrlData } = supabase.storage.from("upload").getPublicUrl(filePath);

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

export const getUploadedDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    // Check if the student exists
    const studentExists = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!studentExists) {
      res.status(404).json({ error: "Student not found." });
      return;
    }

    // Fetch all documents for the student
    const documents = await prisma.studentDocument.findMany({
      where: { studentId },
      select: {
        id: true,
        documentUrl: true,
        documentType: true,
        status: true,
        uploadedAt: true,
      },
    });

    res.status(200).json({ documents });
  } catch (error) {
    console.error("Error in getUploadedDocuments:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};


export const submitComplaint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, complaint } = req.body;

    if (!studentId || !complaint) {
      res.status(400).json({ error: "Student ID and complaint are required." });
      return;
    }

    // Check if the student exists
    const studentExists = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!studentExists) {
      res.status(404).json({ error: "Student not found." });
      return;
    }

    // Generate a unique complaint number
    const complaintNumber = `CMP-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Save the complaint
    const newComplaint = await prisma.messComplaint.create({
      data: {
        studentId,
        complaint,
        complaintNumber,
      },
    });

    res.status(201).json({ message: "Complaint submitted successfully.", newComplaint });
  } catch (error) {
    console.error("Error in submitComplaint:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const submitRoomChangeRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, reason, currentRoom, desiredRoom } = req.body;

    if (!studentId || !reason || !currentRoom || !desiredRoom) {
      res.status(400).json({ error: "Student ID, reason, current room, and desired room are required." });
      return;
    }

    // Check if the student exists
    const studentExists = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!studentExists) {
      res.status(404).json({ error: "Student not found." });
      return;
    }

    // Check if the student already has a pending room change request
    const existingRequest = await prisma.roomChangeRequest.findFirst({
      where: { studentId, status: "Pending" },
    });

    if (existingRequest) {
      res.status(400).json({ error: "You already have a pending room change request." });
      return;
    }

    // Create a new room change request
    const newRequest = await prisma.roomChangeRequest.create({
      data: {
        studentId,
        reason,
        currentRoom,
        desiredRoom,
      },
    });

    res.status(201).json({ message: "Room change request submitted successfully.", newRequest });
  } catch (error) {
    console.error("Error in submitRoomChangeRequest:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};