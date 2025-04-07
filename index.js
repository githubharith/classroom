import express from "express";
import dotenv from "dotenv";
import DBcon from "./utils/db.js";
import AuthRoutes from "./routes/Auth.js";
import ClassRoutes from "./routes/Class.js";
import OTPRoutes from "./routes/otp.js";
import AttendanceRoutes from "./routes/attendance.js";
import cors from 'cors';
import StudentRoutes from "./routes/students.js";
import path from 'path'; 
import job from "./lib/cron.js";


dotenv.config();

job.start();
const app = express();
const PORT = process.env.PORT || 3000;

DBcon();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8081',
    'https://classroom-lime-mu.vercel.app',
    'https://classroom-798mphos9-sabarevijays-projects.vercel.app', 
    'https://accounts.google.com' 
];

app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        const normalizedOrigin = origin && origin.endsWith('/') ? origin.slice(0, -1) : origin;
        if (!origin || allowedOrigins.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            // console.log(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true ,
    
}));
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
  });

  app.use('/images', express.static(path.join(path.resolve(), 'public/images')));

app.get("/", (req, res) => {
    res.send("Hello from classroom backend");
});

app.use('/auth', AuthRoutes);
app.use('/class', ClassRoutes);
app.use('/otp', OTPRoutes);
app.use('/attendance', AttendanceRoutes);
app.use('/students', StudentRoutes);

app.listen(PORT, () => {
    console.log(`App is Running on the Port ${PORT}`);
});
