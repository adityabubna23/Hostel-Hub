import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import sendEmail from "../utils/emailService";
import bcrypt from "bcrypt";
import supabase from "../utils/superbase";


const prisma = new PrismaClient();

// Add Floor
export const addFloor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    // Check if floor already exists
    const existingFloor = await prisma.floor.findUnique({ where: { name } });
    if (existingFloor) {
      res.status(400).json({ error: "Floor already exists!" });
      return;
    }

    const floor = await prisma.floor.create({ data: { name } });
    res.status(201).json(floor);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Add Room and Assign to Floor
export const addRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, floorId, floorName, capacity } = req.body;

    if (!capacity || capacity <= 0) {
      res.status(400).json({ error: "Room capacity must be a positive number!" });
      return;
    }

    // Find floor by ID or name
    let floor = null;
    if (floorId) {
      floor = await prisma.floor.findUnique({ where: { id: floorId } });
    } else if (floorName) {
      floor = await prisma.floor.findUnique({ where: { name: floorName } });
    }

    if (!floor) {
      res.status(404).json({ error: "Floor not found!" });
      return;
    }

    // Check if room already exists
    const existingRoom = await prisma.room.findUnique({ where: { name } });
    if (existingRoom) {
       res.status(400).json({ error: "Room already exists!" });
        return;
    }

    // Create new room
    const room = await prisma.room.create({
      data: {
        name,
        floorId: floor.id, // Ensure we use the correct floor ID
        capacity,
      },
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Check If Room Is Assigned
export const checkRoomAssigned = async (req: Request, res: Response): Promise<void> => {
  try {
    let { roomId } = req.params;

    // Remove the leading colon (:) if present
    if (roomId.startsWith(":")) {
      roomId = roomId.substring(1);
    }

    console.log("Fixed roomId:", roomId); // Debugging log

    const assignedRoom = await prisma.studentRoom.findFirst({
      where: { roomId },
    });

    console.log("Found assignedRoom:", assignedRoom);

    res.status(200).json({ assigned: !!assignedRoom });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

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
export const assignStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, roomName, studentId, studentName, studentEmail } = req.body;

    // Find the room by ID or name
    let room = null;
    if (roomId) {
      room = await prisma.room.findUnique({ where: { id: roomId } });
    } else if (roomName) {
      room = await prisma.room.findUnique({ where: { name: roomName } });
    }

    if (!room) {
      res.status(404).json({ error: "Room not found!" });
      return;
    }

    // Check if the room is full
    const currentOccupancy = await prisma.studentRoom.count({
      where: { roomId: room.id },
    });

    if (currentOccupancy >= room.capacity) {
      res.status(400).json({ error: "Room is already full!" });
      return;
    }

    // Check if the student exists
    let student = await prisma.user.findUnique({ where: { email: studentEmail } });

    let defaultPassword = null; // Store the generated password if a new user is created
    if (!student) {
      // If the student does not exist, create the user
      defaultPassword = Math.random().toString(36).slice(-8); // Generate a random password
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      student = await prisma.user.create({
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
    const existingAssignment = await prisma.studentRoom.findUnique({
      where: { studentId: student.id },
    });

    if (existingAssignment) {
      res.status(400).json({ error: "Student is already assigned to a room!" });
      return;
    }

    // Assign the student to the room
    const assignment = await prisma.studentRoom.create({
      data: {
        studentId: student.id,
        roomId: room.id,
      },
    });

    const updatedOccupancy = await prisma.studentRoom.count({
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
        ${
          defaultPassword
            ? `<li><strong>Password:</strong> ${defaultPassword}</li>`
            : `<li><strong>Password:</strong> (Your existing password)</li>`
        }
      </ul>
      <p>Please log in and change your password immediately if this is your first login.</p>
      <br/>
      <p>For any queries, please contact the hostel management.</p>
      <br/>
      <p>Regards,<br/>Hostel Management Team</p>
    `;

    await sendEmail(student.email, emailSubject, emailBody);

    res.status(201).json({ message: "Room assigned successfully! Email sent.", assignment });
  } catch (error) {
    console.error("Error in assignStudent:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get All Floors with Rooms
export const getFloors = async (req: Request, res: Response) => {
  try {
    const floors = await prisma.floor.findMany({
      include: { rooms: true },
    });

    res.status(200).json(floors);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

//send notices
//send notices


export const createNotice = async (req: Request, res: Response): Promise<void> => {
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
    const files = (req as Request & { files?: Express.Multer.File[] }).files;

    // Validate content or files
    if (!content && (!files || files.length === 0)) {
      res.status(400).json({ error: "Please provide either content or upload at least one document." });
      return;
    }

    let documentUrls: string[] = [];

    // Upload each file to Supabase
    if (files && files.length > 0) {
      for (const file of files) {
        const fileExtension = file.originalname.split(".").pop(); // Extract the file extension
        const fileNameWithoutExtension = file.originalname.split(".").slice(0, -1).join(".");
        const uniqueFileName = `${fileNameWithoutExtension}_${Date.now()}.${fileExtension}`; // Ensure unique file name
        const filePath = `notices/${uniqueFileName}`; // Path in the Supabase bucket

        // Upload the file
        const { data: uploadData, error: uploadError } = await supabase.storage
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
        const { data: publicUrlData } = supabase.storage.from("upload").getPublicUrl(filePath);

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
    const notice = await prisma.notice.create({
      data: {
        title,
        content: content || null,
        documentUrl: documentUrls.join(","), // Store URLs as a comma-separated string
        targetRoles: parsedTargetRoles, // Use the parsed targetRoles array
      },
    });

    res.status(201).json({ message: "Notice created successfully!", notice });
  } catch (error) {
    console.error("Error in createNotice:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getStudentDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const documents = await prisma.studentDocument.findMany({
      include: { student: true },
    });

    res.status(200).json(documents);
  } catch (error) {
    console.error("Error in getStudentDocuments:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const verifyDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId, status } = req.body;

    if (!["Verified", "Rejected"].includes(status)) {
      res.status(400).json({ error: "Invalid status." });
      return;
    }

    const updatedDocument = await prisma.studentDocument.update({
      where: { id: documentId },
      data: { status },
    });

    res.status(200).json({ message: "Document status updated successfully.", updatedDocument });
  } catch (error) {
    console.error("Error in verifyDocument:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getAllComplaints = async (req: Request, res: Response): Promise<void> => {
  try {
    const complaints = await prisma.messComplaint.findMany({
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
  } catch (error) {
    console.error("Error in getAllComplaints:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateRoomChangeRequestStatus = async (req: Request, res: Response): Promise<void> => {
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
    const roomChangeRequest = await prisma.roomChangeRequest.findUnique({
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
      const newRoom = await prisma.room.findUnique({
        where: { name: roomToAssign },
      });

      if (!newRoom) {
        res.status(404).json({ error: `Room '${roomToAssign}' not found.` });
        return;
      }

      // Check if the room has capacity
      const currentOccupancy = await prisma.studentRoom.count({
        where: { roomId: newRoom.id },
      });

      if (currentOccupancy >= newRoom.capacity) {
        res.status(400).json({ error: `The room '${roomToAssign}' is already full.` });
        return;
      }

      // Update the student's room assignment
      await prisma.studentRoom.update({
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

      await sendEmail(roomChangeRequest.student.email, emailSubject, emailBody);
    }

    // Update the room change request status
    const updatedRequest = await prisma.roomChangeRequest.update({
      where: { id: requestId },
      data: { status },
    });

    res.status(200).json({ message: `Room change request ${status.toLowerCase()} successfully.`, updatedRequest });
  } catch (error) {
    console.error("Error in updateRoomChangeRequestStatus:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getAllRoomChangeRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.roomChangeRequest.findMany({
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
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const currentRoom = await prisma.room.findUnique({
          where: { name: request.currentRoom },
        });

        const desiredRoom = await prisma.room.findUnique({
          where: { name: request.desiredRoom },
        });

        return {
          ...request,
          currentRoomDetails: currentRoom || null,
          desiredRoomDetails: desiredRoom || null,
        };
      })
    );

    res.status(200).json(enrichedRequests);
  } catch (error) {
    console.error("Error in getAllRoomChangeRequests:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
