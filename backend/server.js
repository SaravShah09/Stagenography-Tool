const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const User = require('./userModel');
const { Resend } = require('resend');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors({
    origin: ["https://stagenography-tool.vercel.app"],  // Correct frontend origin
    methods: ["POST", "GET"],
    credentials: true
}));
app.use(express.json());

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('MongoDB connected');
    } catch (e) {
        console.log(e.message);
    }
};

connectDB();
const resend = new Resend(process.env.RESEND_API_KEY);
async function insert(userEmail, userPassword, userName, userDOB, role) {
    try {
        await User.create({
            email: userEmail,
            password: userPassword,
            name: userName,
            dob: userDOB,
            role: role,
            logs: []
        });
    } catch (err) {
        console.error('Error inserting user:', err);
    }
}

app.post('/signup', async (req, res) => {
    const data = {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        dob: req.body.dob,
        role: req.body.role
    };

    try {
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            if (existingUser.role === 'block') {
                return res.status(403).json({ message: 'User already exists but the account has been blocked by the admin. Try contacting admin' });
            }
            return res.status(400).json({ message: "User already exists with this email." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        await insert(data.email, hashedPassword, data.name, data.dob, data.role);
        res.status(201).send("Signup successful");
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("An error occurred during signup.");
    }
});

app.post('/otp', async (req, res) => {
  const { email, otp } = req.body;
  console.log('OTP request:', { email, otp });

  try {
    const { data, error } = await resend.emails.send({
      from: 'Steganography Tool <no-reply@yourapp.com>', // or your verified sender
      to: email,
      subject: 'Steganography Tool Login OTP',
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    });

    if (error) {
      console.error('Error sending OTP via Resend:', error);
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

    console.log('OTP sent successfully via Resend:', data);
    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('General OTP error via Resend:', err);
    return res.status(500).json({ message: 'An error occurred during sending OTP' });
  }
});


app.post('/login', async (req, res) => {
    const data = {
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
    };

    try {
        const user = await User.findOne({ email: data.email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (data.role === "admin" && user.role !== "admin") {
            return res.status(400).json({ message: "Invalid admin credentials" });
        }

        if (user.role === 'block') {
            return res.status(403).json({ message: 'Your account has been blocked by the admin. Try contacting admin' });
        }

        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.status(201).send("Login successful");
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("An error occurred during login.");
    }
});

app.post('/logActivity', async (req, res) => {
    const { email, log } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.updateOne(
            { email },
            { $push: { logs: log } }
        );

        res.status(200).json({ message: "Activity logged successfully" });
    } catch (error) {
        console.error("Error logging activity:", error);
        res.status(500).json({ message: "Failed to log activity" });
    }
});

app.get('/logs', async (req, res) => {
    try {
        const users = await User.find({}, { email: 1, logs: 1 })
            .sort({ "logs.time": -1 })
            .lean();

        const allLogs = users.flatMap(user =>
            user.logs.map(log => ({
                email: user.email,
                type: log.type,
                message: log.message,
                time: log.time,
                mediaType: log.mediaType || "Image"
            }))
        );

        res.status(200).json(allLogs);
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).send("Error fetching logs.");
    }
});

app.post('/admin/blockUser', async (req, res) => {
    const { email } = req.body;

    try {
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { role: 'block' },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User blocked successfully', user: updatedUser });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'Server error while blocking user' });
    }
});

app.post('/admin/unblockUser', async (req, res) => {
    const { email } = req.body;

    try {
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { role: 'user' },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User unblocked successfully', user: updatedUser });
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ message: 'Server error while unblocking user' });
    }
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
