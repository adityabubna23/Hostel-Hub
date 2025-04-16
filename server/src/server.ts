import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import adminRoutes from "./routes/admin.route";
import messageRoutes from "./routes/messageRouter";
import studentRoutes from "./routes/student.route";

const PORT = process.env.PORT || 5000;

dotenv.config();

const app = express();

// Apply CORS middleware globally with the correct configuration
app.use(
  cors({
    origin: "http://localhost:5173", // Allow the frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/student", studentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
