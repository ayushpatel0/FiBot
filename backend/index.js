const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const gga = require('@google/generative-ai');
const User = require("../backend/models/User");
const cors = require('cors');
app.use(cors());
const PORT = process.env.PORT || 3002;

app.use(bodyParser.json());
app.use(express.json());

const genAI = new gga.GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/trainedmodel', async(req, res) =>  {
    const prompt = req.body.prompt;
    if (!prompt) {
        return res.status(400).json({ error: 'Missing required prompt field' });
    }


    const updatedPrompt = "Imagine you're a highly experienced financial advisor with years of expertise in personal finance, stock market analysis, and investment strategies. Your goal is to provide clear, actionable, and well-reasoned advice to individuals seeking guidance on financial matters. Approach every question with professionalism, keeping in mind the financial goals of the user, and consider risks carefully when discussing any financial options. Think logically and be empathetic to the user’s situation. When providing your response: Use ## for main headings. Use ### for subheadings. Use regular paragraphs for content. Use unordered lists with - or ordered lists with numbers (1., 2.). For bold text, use **text**. For emphasis, use _text_. Insert two line breaks where line breaks are needed (<br><br> in rendered markdown). Avoid including any HTML tags in your response. Now, here's the user’s question:'"+prompt + "'.";


    const result = await model.generateContent(updatedPrompt);
    console.log(result.toString());
    console.log(result);
    if(result){
        res.status(200).send(result);
    }

});

// MongoDB Connection
const password = encodeURIComponent(process.env.PASSWORD);
const username = encodeURIComponent(process.env.DB_USERNAME);
const uri = "mongodb+srv://" + username + ":" + password + "@cluster0.5sihj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Error connecting to MongoDB", err));

// Sign-Up Route
app.post('/api/signup', async (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password || password === undefined || password === null) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    console.log(username, email, password);
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(200).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user', details: error.stack });
    }
});

// Sign-In Route
app.post('/api/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

        // Return user data
        res.status(200).json({
            message: 'Login successful!',
            userId: user._id,
            username: user.username
        });
    } catch (error) {
        res.status(500).json({ error: 'Error signing in', details: error });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
