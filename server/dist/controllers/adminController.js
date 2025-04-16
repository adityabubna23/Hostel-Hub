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
exports.getAllRoomChangeRequests = exports.updateRoomChangeRequestStatus = exports.getAllComplaints = exports.verifyDocument = exports.getStudentDocuments = exports.createNotice = exports.getFloors = exports.assignStudent = exports.checkRoomAssigned = exports.addRoom = exports.addFloor = void 0;
const client_1 = require("@prisma/client");
const emailService_1 = __importDefault(require("../utils/emailService"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const superbase_1 = __importDefault(require("../utils/superbase"));
const prisma = new client_1.PrismaClient();
// Add Floor
const addFloor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        // Check if floor already exists
        const existingFloor = yield prisma.floor.findUnique({ where: { name } });
        if (existingFloor) {
            res.status(400).json({ error: "Floor already exists!" });
            return;
        }
        const floor = yield prisma.floor.create({ data: { name } });
        res.status(201).json(floor);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.addFloor = addFloor;
// Add Room and Assign to Floor
const addRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, floorId, floorName, capacity } = req.body;
        if (!capacity || capacity <= 0) {
            res.status(400).json({ error: "Room capacity must be a positive number!" });
            return;
        }
        // Find floor by ID or name
        let floor = null;
        if (floorId) {
            floor = yield prisma.floor.findUnique({ where: { id: floorId } });
        }
        else if (floorName) {
            floor = yield prisma.floor.findUnique({ where: { name: floorName } });
        }
        if (!floor) {
            res.status(404).json({ error: "Floor not found!" });
            return;
        }
        // Check if room already exists
        const existingRoom = yield prisma.room.findUnique({ where: { name } });
        if (existingRoom) {
            res.status(400).json({ error: "Room already exists!" });
            return;
        }
        // Create new room
        const room = yield prisma.room.create({
            data: {
                name,
                floorId: floor.id, // Ensure we use the correct floor ID
                capacity,
            },
        });
        res.status(201).json(room);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.addRoom = addRoom;
// Check If Room Is Assigned
const checkRoomAssigned = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { roomId } = req.params;
        // Remove the leading colon (:) if present
        if (roomId.startsWith(":")) {
            roomId = roomId.substring(1);
        }
        console.log("Fixed roomId:", roomId); // Debugging log
        const assignedRoom = yield prisma.studentRoom.findFirst({
            where: { roomId },
        });
        console.log("Found assignedRoom:", assignedRoom);
        res.status(200).json({ assigned: !!assignedRoom });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.checkRoomAssigned = checkRoomAssigned;
// Assign Student to Room
/* export const assignStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, roomName, studentId, studentName } = req.body;

    // Find the room by ID or name
    let room = null;
    if (roomId) {
      room = await prisma.room.findUnique({ where: { id: roomId } });
    } else if (roomName) {
      room = await prisma.room.findUnique({ where: { name: roomName } });
    }

    if (!room) {
      res.status(404).json({ error: "Room not found!" });
      return ;
    }

    // Find the student by ID or name
    let student = null;
    if (studentId) {
      student = await prisma.user.findUnique({ where: { id: studentId } });
    } else if (studentName) {
      student = await prisma.user.findFirst({ where: { name: studentName } });
    }

    if (!student) {
      res.status(404).json({ error: "Student not found!" });
      return ;
    }

    // Check if student is already assigned to a room
    const existingAssignment = await prisma.studentRoom.findUnique({
      where: { studentId: student.id },
    });

    if (existingAssignment) {
      res.status(400).json({ error: "Student is already assigned to a room!" });
      return ;
    }

    // Assign the student to the room
    const assignment = await prisma.studentRoom.create({
      data: {
        studentId: student.id,
        roomId: room.id,
      },
    });

    res.status(201).json({ message: "Room assigned successfully!", assignment });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}; */
const assignStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId, roomName, studentId, studentName, studentEmail } = req.body;
        // Find the room by ID or name
        let room = null;
        if (roomId) {
            room = yield prisma.room.findUnique({ where: { id: roomId } });
        }
        else if (roomName) {
            room = yield prisma.room.findUnique({ where: { name: roomName } });
        }
        if (!room) {
            res.status(404).json({ error: "Room not found!" });
            return;
        }
        // Check if the room is full
        const currentOccupancy = yield prisma.studentRoom.count({
            where: { roomId: room.id },
        });
        if (currentOccupancy >= room.capacity) {
            res.status(400).json({ error: "Room is already full!" });
            return;
        }
        // Check if the student exists
        let student = yield prisma.user.findUnique({ where: { email: studentEmail } });
        let defaultPassword = null; // Store the generated password if a new user is created
        if (!student) {
            // If the student does not exist, create the user
            defaultPassword = Math.random().toString(36).slice(-8); // Generate a random password
            const hashedPassword = yield bcrypt_1.default.hash(defaultPassword, 10);
            student = yield prisma.user.create({
                data: {
                    name: studentName,
                    email: studentEmail,
                    password: hashedPassword,
                    role: {
                        connect: { name: "Student" }, // Ensure "Student" role exists in your database
                    },
                },
            });
        }
        // Check if the student is already assigned to a room
        const existingAssignment = yield prisma.studentRoom.findUnique({
            where: { studentId: student.id },
        });
        if (existingAssignment) {
            res.status(400).json({ error: "Student is already assigned to a room!" });
            return;
        }
        // Assign the student to the room
        const assignment = yield prisma.studentRoom.create({
            data: {
                studentId: student.id,
                roomId: room.id,
            },
        });
        const updatedOccupancy = yield prisma.studentRoom.count({
            where: { roomId: room.id },
        });
        // Send Email Notification
        const emailSubject = "Hostel Room Assignment Confirmation";
        const emailBody = `
      <h2>Hello ${student.name},</h2>
      <p>You have been assigned to the following room:</p>
      <ul>
        <li><strong>Room Name:</strong> ${room.name}</li>
        <li><strong>Room Capacity:</strong> ${room.capacity}</li>
      </ul>
      <p>Your account details are as follows:</p>
      <ul>
        <li><strong>Email:</strong> ${student.email}</li>
        ${defaultPassword
            ? `<li><strong>Password:</strong> ${defaultPassword}</li>`
            : `<li><strong>Password:</strong> (Your existing password)</li>`}
      </ul>
      <p>Please log in and change your password immediately if this is your first login.</p>
      <br/>
      <p>For any queries, please contact the hostel management.</p>
      <br/>
      <p>Regards,<br/>Hostel Management Team</p>
    `;
        yield (0, emailService_1.default)(student.email, emailSubject, emailBody);
        res.status(201).json({ message: "Room assigned successfully! Email sent.", assignment });
    }
    catch (error) {
        console.error("Error in assignStudent:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.assignStudent = assignStudent;
// Get All Floors with Rooms
const getFloors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const floors = yield prisma.floor.findMany({
            include: { rooms: true },
        });
        res.status(200).json(floors);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getFloors = getFloors;
//send notices
//send notices
const createNotice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content, targetRoles } = req.body;
        // Parse targetRoles if it's a JSON string
        const parsedTargetRoles = typeof targetRoles === "string" ? JSON.parse(targetRoles) : targetRoles;
        // Validate title and targetRoles
        if (!title || !parsedTargetRoles || !Array.isArray(parsedTargetRoles)) {
            res.status(400).json({ error: "Invalid input. Please provide title and targetRoles." });
            return;
        }
        // Access the uploaded files
        const files = req.files;
        // Validate content or files
        if (!content && (!files || files.length === 0)) {
            res.status(400).json({ error: "Please provide either content or upload at least one document." });
            return;
        }
        let documentUrls = [];
        // Upload each file to Supabase
        if (files && files.length > 0) {
            for (const file of files) {
                const fileExtension = file.originalname.split(".").pop(); // Extract the file extension
                const fileNameWithoutExtension = file.originalname.split(".").slice(0, -1).join(".");
                const uniqueFileName = `${fileNameWithoutExtension}_${Date.now()}.${fileExtension}`; // Ensure unique file name
                const filePath = `notices/${uniqueFileName}`; // Path in the Supabase bucket
                // Upload the file
                const { data: uploadData, error: uploadError } = yield superbase_1.default.storage
                    .from("upload") // Replace "uploads" with your Supabase bucket name
                    .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                });
                if (uploadError) {
                    console.error("Error uploading file to Supabase:", uploadError.message);
                    res.status(500).json({ error: "Failed to upload file to Supabase." });
                    return;
                }
                // Generate a public URL for the uploaded file
                const { data: publicUrlData } = superbase_1.default.storage.from("upload").getPublicUrl(filePath);
                if (!publicUrlData || !publicUrlData.publicUrl) {
                    throw new Error("Failed to generate public URL for the uploaded file.");
                }
                const publicUrl = publicUrlData.publicUrl;
                // Append the secure URL with the original file name and extension
                const fullFileName = `${fileNameWithoutExtension}.${fileExtension}`; // Combine name and extension
                documentUrls.push(`${publicUrl}?fileName=${encodeURIComponent(fullFileName)}`);
            }
        }
        // Create the notice
        const notice = yield prisma.notice.create({
            data: {
                title,
                content: content || null,
                documentUrl: documentUrls.join(","), // Store URLs as a comma-separated string
                targetRoles: parsedTargetRoles, // Use the parsed targetRoles array
            },
        });
        res.status(201).json({ message: "Notice created successfully!", notice });
    }
    catch (error) {
        console.error("Error in createNotice:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.createNotice = createNotice;
const getStudentDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const documents = yield prisma.studentDocument.findMany({
            include: { student: true },
        });
        res.status(200).json(documents);
    }
    catch (error) {
        console.error("Error in getStudentDocuments:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.getStudentDocuments = getStudentDocuments;
const verifyDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId, status } = req.body;
        if (!["Verified", "Rejected"].includes(status)) {
            res.status(400).json({ error: "Invalid status." });
            return;
        }
        const updatedDocument = yield prisma.studentDocument.update({
            where: { id: documentId },
            data: { status },
        });
        res.status(200).json({ message: "Document status updated successfully.", updatedDocument });
    }
    catch (error) {
        console.error("Error in verifyDocument:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.verifyDocument = verifyDocument;
const getAllComplaints = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const complaints = yield prisma.messComplaint.findMany({
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(complaints);
    }
    catch (error) {
        console.error("Error in getAllComplaints:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.getAllComplaints = getAllComplaints;
const updateRoomChangeRequestStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requestId, status, alternateRoom } = req.body;
        if (!requestId || !status) {
            res.status(400).json({ error: "Request ID and status are required." });
            return;
        }
        // Validate status
        if (!["Approved", "Rejected"].includes(status)) {
            res.status(400).json({ error: "Invalid status. Allowed values are 'Approved' or 'Rejected'." });
            return;
        }
        // Fetch the room change request
        const roomChangeRequest = yield prisma.roomChangeRequest.findUnique({
            where: { id: requestId },
            include: { student: true },
        });
        if (!roomChangeRequest) {
            res.status(404).json({ error: "Room change request not found." });
            return;
        }
        // If approved, update the student's room
        if (status === "Approved") {
            let roomToAssign = roomChangeRequest.desiredRoom;
            // If an alternate room is provided, use it instead
            if (alternateRoom) {
                roomToAssign = alternateRoom;
            }
            // Check if the room exists
            const newRoom = yield prisma.room.findUnique({
                where: { name: roomToAssign },
            });
            if (!newRoom) {
                res.status(404).json({ error: `Room '${roomToAssign}' not found.` });
                return;
            }
            // Check if the room has capacity
            const currentOccupancy = yield prisma.studentRoom.count({
                where: { roomId: newRoom.id },
            });
            if (currentOccupancy >= newRoom.capacity) {
                res.status(400).json({ error: `The room '${roomToAssign}' is already full.` });
                return;
            }
            // Update the student's room assignment
            yield prisma.studentRoom.update({
                where: { studentId: roomChangeRequest.studentId },
                data: { roomId: newRoom.id },
            });
            // Send an email notification to the student
            const emailSubject = "Room Change Request Approved";
            const emailBody = `
        <h2>Hello ${roomChangeRequest.student.name},</h2>
        <p>Your room change request has been approved. You have been assigned to the following room:</p>
        <ul>
          <li><strong>Room Name:</strong> ${newRoom.name}</li>
          <li><strong>Room Capacity:</strong> ${newRoom.capacity}</li>
        </ul>
        <p>Please contact the hostel management for further details.</p>
        <br/>
        <p>Regards,<br/>Hostel Management Team</p>
      `;
            yield (0, emailService_1.default)(roomChangeRequest.student.email, emailSubject, emailBody);
        }
        // Update the room change request status
        const updatedRequest = yield prisma.roomChangeRequest.update({
            where: { id: requestId },
            data: { status },
        });
        res.status(200).json({ message: `Room change request ${status.toLowerCase()} successfully.`, updatedRequest });
    }
    catch (error) {
        console.error("Error in updateRoomChangeRequestStatus:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.updateRoomChangeRequestStatus = updateRoomChangeRequestStatus;
const getAllRoomChangeRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield prisma.roomChangeRequest.findMany({
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        // Add current room and desired room details
        const enrichedRequests = yield Promise.all(requests.map((request) => __awaiter(void 0, void 0, void 0, function* () {
            const currentRoom = yield prisma.room.findUnique({
                where: { name: request.currentRoom },
            });
            const desiredRoom = yield prisma.room.findUnique({
                where: { name: request.desiredRoom },
            });
            return Object.assign(Object.assign({}, request), { currentRoomDetails: currentRoom || null, desiredRoomDetails: desiredRoom || null });
        })));
        res.status(200).json(enrichedRequests);
    }
    catch (error) {
        console.error("Error in getAllRoomChangeRequests:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.getAllRoomChangeRequests = getAllRoomChangeRequests;
