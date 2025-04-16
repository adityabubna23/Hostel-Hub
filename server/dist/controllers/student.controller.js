"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitRoomChangeRequest = exports.submitComplaint = exports.getUploadedDocuments = exports.uploadDocuments = void 0;
const client_1 = require("@prisma/client");
const superbase_1 = __importDefault(require("../utils/superbase"));
const uuid_1 = require("uuid"); // Import UUID for generating unique complaint numbers
const prisma = new client_1.PrismaClient();
const uploadDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId, documentTypes } = req.body; // `documentTypes` should be an array of document types
        const files = req.files;
        if (!files || files.length === 0) {
            res.status(400).json({ error: "No documents uploaded." });
            return;
        }
        if (!Array.isArray(documentTypes) || documentTypes.length !== files.length) {
            res.status(400).json({ error: "Document types must match the number of uploaded files." });
            return;
        }
        const studentExists = yield prisma.user.findUnique({
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
            const { data: uploadData, error: uploadError } = yield superbase_1.default.storage
                .from("upload") // Replace with your bucket name
                .upload(filePath, file.buffer, {
                contentType: file.mimetype,
            });
            if (uploadError) {
                console.error("Error uploading file to Supabase:", uploadError.message);
                res.status(500).json({ error: "Failed to upload document." });
                return;
            }
            const { data: publicUrlData } = superbase_1.default.storage.from("upload").getPublicUrl(filePath);
            // Save document details in the database
            const document = yield prisma.studentDocument.create({
                data: {
                    studentId,
                    documentUrl: publicUrlData.publicUrl,
                    documentType,
                },
            });
            uploadedDocuments.push(document);
        }
        res.status(201).json({ message: "Documents uploaded successfully.", uploadedDocuments });
    }
    catch (error) {
        console.error("Error in uploadDocuments:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.uploadDocuments = uploadDocuments;
const getUploadedDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId } = req.params;
        // Check if the student exists
        const studentExists = yield prisma.user.findUnique({
            where: { id: studentId },
        });
        if (!studentExists) {
            res.status(404).json({ error: "Student not found." });
            return;
        }
        // Fetch all documents for the student
        const documents = yield prisma.studentDocument.findMany({
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
    }
    catch (error) {
        console.error("Error in getUploadedDocuments:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.getUploadedDocuments = getUploadedDocuments;
const submitComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId, complaint } = req.body;
        if (!studentId || !complaint) {
            res.status(400).json({ error: "Student ID and complaint are required." });
            return;
        }
        // Check if the student exists
        const studentExists = yield prisma.user.findUnique({
            where: { id: studentId },
        });
        if (!studentExists) {
            res.status(404).json({ error: "Student not found." });
            return;
        }
        // Generate a unique complaint number
        const complaintNumber = `CMP-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`;
        // Save the complaint
        const newComplaint = yield prisma.messComplaint.create({
            data: {
                studentId,
                complaint,
                complaintNumber,
            },
        });
        res.status(201).json({ message: "Complaint submitted successfully.", newComplaint });
    }
    catch (error) {
        console.error("Error in submitComplaint:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.submitComplaint = submitComplaint;
const submitRoomChangeRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId, reason, currentRoom, desiredRoom } = req.body;
        if (!studentId || !reason || !currentRoom || !desiredRoom) {
            res.status(400).json({ error: "Student ID, reason, current room, and desired room are required." });
            return;
        }
        // Check if the student exists
        const studentExists = yield prisma.user.findUnique({
            where: { id: studentId },
        });
        if (!studentExists) {
            res.status(404).json({ error: "Student not found." });
            return;
        }
        // Check if the student already has a pending room change request
        const existingRequest = yield prisma.roomChangeRequest.findFirst({
            where: { studentId, status: "Pending" },
        });
        if (existingRequest) {
            res.status(400).json({ error: "You already have a pending room change request." });
            return;
        }
        // Create a new room change request
        const newRequest = yield prisma.roomChangeRequest.create({
            data: {
                studentId,
                reason,
                currentRoom,
                desiredRoom,
            },
        });
        res.status(201).json({ message: "Room change request submitted successfully.", newRequest });
    }
    catch (error) {
        console.error("Error in submitRoomChangeRequest:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.submitRoomChangeRequest = submitRoomChangeRequest;
