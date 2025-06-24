// .env ဖိုင်ထဲက Environment Variables တွေကို အသုံးပြုနိုင်ဖို့ load လုပ်ခြင်း
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Password hashing အတွက်
const jwt = require('jsonwebtoken'); // JWT token ဖန်တီးဖို့
const path = require('path'); // Static files တွေကို serve လုပ်ဖို့

const auth = require('./middleware/auth'); // NEW: authentication middleware ကို import လုပ်ခြင်း

const app = express(); // Express application ကို စတင်ခြင်း
const PORT = process.env.PORT || 5000; // Server port ကို .env ကနေယူ၊ မရှိရင် 5000 ကို သုံး

// --- Middleware များ ---
// JSON format နဲ့ ရောက်လာတဲ့ request body ကို parse လုပ်နိုင်ဖို့
app.use(express.json());
// 'public' directory ထဲက static files (HTML, CSS, JS) တွေကို serve လုပ်ဖို့
app.use(express.static(path.join(__dirname, 'public')));

// NEW: Serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Database ချိတ်ဆက်ခြင်း ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully')) // ချိတ်ဆက်မှု အောင်မြင်ရင် message ပြ
    .catch(err => console.error('MongoDB connection error:', err)); // အမှားရှိရင် message ပြ

// --- User Schema (Model) ---
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^\S+@\S+\.\S+$/
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

// --- Routes ---

// @route   POST /api/register
// @desc    Register new user
// @access  Public
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User with that email already exists' });
        }

        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'Username already taken' });
        }

        user = new User({
            username,
            email,
            password
        });

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ msg: 'User registered successfully', token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/login
// @desc    Authenticate user & get token
// @access  Public
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ msg: 'Login successful', token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// NEW PROTECTED ROUTE:
// @route   GET /api/auth/me
// @desc    Get logged in user data (Protected)
// @access  Private
app.get('/api/auth/me', auth, async (req, res) => { // 'auth' middleware ကို ဒီ Route အတွက် သုံးထားတယ်
    try {
        // req.user က auth middleware ကနေ ထည့်ပေးလိုက်တဲ့ user ID ဖြစ်တယ်
        const user = await User.findById(req.user.id).select('-password'); // password မပါဘဲ user data ယူ
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Server Listener ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));