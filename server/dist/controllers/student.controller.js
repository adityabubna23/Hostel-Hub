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
exports.uploadDocuments = void 0;
const client_1 = require("@prisma/client");
const superbase_1 = __importDefault(require("../utils/superbase"));
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
            const { data: publicUrlData } = superbase_1.default.storage.from("uploads").getPublicUrl(filePath);
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
