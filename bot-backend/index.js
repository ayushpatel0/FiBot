const { containerBootstrap } = require('@nlpjs/core');
const { Nlp } = require('@nlpjs/nlp');
const { LangEn } = require('@nlpjs/lang-en-min');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
require('dotenv').config();
const gga = require('@google/generative-ai');
const Expenses = require("./models/Expenses");
const Budget = require("./models/Budgets");
const User = require("./models/User");
const cors = require('cors');
const Budgets = require('./models/Budgets');
const express = require('express');
const app = express();

const corsOptions = {
    origin: '*', // Allow all origins (can be replaced with a specific domain or array of domains)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());
app.timeout = 30000;

const PORT = process.env.PORT || 3005;

let nlp = null;
const password = encodeURIComponent(process.env.PASSWORD);
const username = encodeURIComponent(process.env.DB_USERNAME);
console.log(username, password);
const uri = "mongodb+srv://" + username + ":" + password + "@cluster0.5sihj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Error connecting to MongoDB", err));


const genAI = new gga.GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "tunedModels/financial-advisor-djp15w8gggrf" });
const jsonModel = genAI.getGenerativeModel({ model: "tunedModels/json-model-9ol75qko7yja" });
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
const arr = ["Got it, Noted", "Got it!", "Noted! Any other transactions?", "Fine, Got it!"];

app.post('/api/trainedmodel', async (req, res) => {
    const prompt = req.body.prompt;
    if (!prompt) {
        return res.status(400).json({ error: 'Missing required prompt field' });
    }

    const response = await nlp.process('en', prompt);
    console.log(response);
    let answer = response.answer;
    console.log(answer);
    if (prompt.toLowerCase().includes("what") && prompt.toLowerCase().includes("my") && prompt.toLowerCase().includes("budget")) {
        const budgetDoc = await Budget.findById(1); // ID is fixed to '1'
        if (!budgetDoc) {
            throw new Error('Budget document with ID 1 not found');
        }
        const budget = budgetDoc.budget;
        const data2 = { response: { candidates: [{ content: { parts: [{ text: `The budget is ${budget}$` }] } }] } };

        res.status(200).send(data2);
        return;
    }
    if (answer == '' || answer == null || answer == undefined || answer == 'LUN') {
        const result = await betterCallGemini(prompt, true);
        res.status(200).send(result);
    } else if (answer != "YES" && !prompt.toLowerCase().includes(answer.toLowerCase())) {
        answer = '';
        const result = await betterCallGemini(prompt, true);
        res.status(200).send(result);
    } else {
        if (answer === "YES") {
            const response2 = await betterCallGemini2(prompt);
            console.log("inside yes : ", JSON.stringify(response2));
            await Expenses.create({ data: response2 });
            const data = arr[Math.floor(Math.random() * arr.length)];

            const data2 = { response: { candidates: [{ content: { parts: [{ text: data }] } }] } };
            res.status(200).send(data2);
        } else {
            const budgetDoc = await Budget.findById(1); // ID is fixed to '1'
            if (!budgetDoc) {
                throw new Error('Budget document with ID 1 not found');
            }
            const budget = budgetDoc.budget;

            const now = new Date();
            var last24Hours = now.getTime() - 24 * 60 * 60 * 1000;
            if (answer === "TODAY") {
                last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            } else if (answer === "MONTHLY") {
                last24Hours = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            } else {
                last24Hours = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            }

            const expenses = await Expenses.find({
                date: { $gte: last24Hours },
            }).select()
                .sort({ date: 1 });

            const response = await betterCallOG(`You are professional Charted Accountant that answer question with professionalism, do not speak more unnecessarily just point to point, user asked you this question : 
Generate a detailed report in Markdown format for ${answer} unstructured data on user expenses. The budget is ${budget}.  
The report should include:

1. A table listing:
   - Serial No.
   - Date (formatted as '11-12-2024')
   - Type ('debit for out' or 'credit for in')
   - Category
   - Amount

2. A summary section below the table with:
   - Net Expense
   - Total Debit 
   - Total Credit 
   - Remaining Budget 

Use the following formatting guidelines:
- Bold text: Use '**'.  
- Italic text: Use '*'.  
- Tables: Use '|' for columns and '-' for headers.  
- Unordered lists: Use '-' for bullet points.  
- Ordered lists: Use numbers followed by a period ('1.').  
- Line breaks: Use two spaces followed by Enter.
- Do not use any other tactics than this formatting.

Data to analyze:  
${answer} Unstructured Data: ${expenses} 
`, true);
            // console.log("Report REsponse :: ", response);
            // console.log("query ::: ", resonse);
            res.status(200).send(response);
        }
    }

});

app.post('/api/setBudget', async (req, res) => {
    const budget = req.body.budget;
    if (!budget) {
        return res.status(400).json({ error: 'Missing required budget field' });
    }
    try {
        // Find if a budget document exists
        const existingBudget = await Budget.findOne();

        if (existingBudget) {
            // Update the budget
            existingBudget.budget = budget;
            await existingBudget.save();
            res.send({ message: 'Budget updated successfully', budget: existingBudget });
        } else {
            // Create a new budget
            const newBudget = await Budget.create({ budget });
            res.status(200).send({ message: 'Budget set successfully', budget: newBudget });
        }
    } catch (error) {
        console.error('Error setting budget:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

//for first model call
async function betterCallGemini(prompt, isNotQuery) {

    const result = await model.generateContent(prompt);
    console.log(result.response.candidates[0].content.parts[0].text);
    if (isNotQuery && result) {
        return result;
    } else {
        return result.response.candidates[0].content.parts[0].text;
    }

}

async function betterCallOG(prompt, isNotQuery) {

    const result = await geminiModel.generateContent(prompt);
    console.log(result.response.candidates[0].content.parts[0].text);
    if (isNotQuery && result) {
        return result;
    } else {
        return result.response.candidates[0].content.parts[0].text;
    }

}

//for second model call
async function betterCallGemini2(prompt) {

    const result = await jsonModel.generateContent(prompt);
    console.log("inside gemini 2 : ", result.response.candidates[0].content.parts[0].text);
    console.log("inside gemini 2 : ", result.response.candidates[0].content);
    console.log("inside gemini 2 : ", result.response.candidates[0].content.parts[0]);
    return result.response.candidates[0].content.parts[0].text;

}

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


app.get('/', async (req, res) => {
    res.send('Hello, User!');
});

(async () => {
    const container = await containerBootstrap();
    container.use(Nlp);
    container.use(LangEn);
    nlp = container.get('nlp');
    nlp.settings.autoSave = false;
    nlp.settings.threshold = 0.7;
    nlp.addLanguage('en');

    // Adds the utterances and intents for the NLP
    nlp.addDocument('en', 'I spent %amount% on %category%', 'transaction.spent');
    nlp.addDocument('en', 'I earned %amount% from %category%', 'transaction.earned');
    nlp.addDocument('en', 'I paid %amount% for %category%', 'transaction.spent');
    nlp.addDocument('en', 'I received %amount% from %category%', 'transaction.earned');
    nlp.addDocument('en', 'Spent %amount% on %category%', 'transaction.spent');
    nlp.addDocument('en', 'Earned %amount% from %category%', 'transaction.earned');
    nlp.addDocument('en', 'I just spent %amount% on %category%', 'transaction.spent');
    nlp.addDocument('en', 'I just earned %amount% from %category%', 'transaction.earned');
    nlp.addDocument('en', 'I paid out %amount% for %category%', 'transaction.spent');
    nlp.addDocument('en', 'I got %amount% from %category%', 'transaction.earned');
    nlp.addDocument('en', 'I spent %amount% buying %category%', 'transaction.spent');
    nlp.addDocument('en', 'I earned %amount% by selling %category%', 'transaction.earned');
    nlp.addDocument('en', 'Add %amount% to portfolio', 'transaction.earned');
    nlp.addDocument('en', 'Add %amount% to expense', 'transaction.earned');
    nlp.addDocument('en', 'Subtract %amount% from portfolio', 'transaction.earned');
    nlp.addDocument('en', 'subtract %amount% from expense', 'transaction.earned');


    nlp.addDocument('en', 'Give me the weekly report', 'report.weekly');
    nlp.addDocument('en', 'Give me weekly report', 'report.weekly'); //yaha pe changes hai extra line hai
    nlp.addDocument('en', 'Show me the weekly report', 'report.weekly');
    nlp.addDocument('en', 'Can I see the report for this week?', 'report.weekly');
    // Add more variations for weekly...

    nlp.addDocument('en', 'Give me the monthly report', 'report.monthly');
    nlp.addDocument('en', 'Give me monthly report', 'report.monthly'); //yaha pe changes hai extra line hai
    nlp.addDocument('en', 'Show me the monthly report', 'report.monthly');
    nlp.addDocument('en', 'What’s the summary for this month?', 'report.monthly');
    nlp.addDocument('en', 'What’s the report for this month?', 'report.monthly'); //yaha pe changes hai extra line hai
    // Add more variations for monthly...

    // Weekly
    nlp.addDocument('en', 'Show me last week’s report', 'report.weekly');
    nlp.addDocument('en', 'I need the report for the past week', 'report.weekly');
    nlp.addDocument('en', 'What happened this week?', 'report.weekly');

    // Monthly
    nlp.addDocument('en', 'Give me a report for this month', 'report.monthly');
    nlp.addDocument('en', 'I need a summary of the month', 'report.monthly');
    nlp.addDocument('en', 'What’s the breakdown for the month?', 'report.monthly');

    // Today
    nlp.addDocument('en', 'What are today’s expenses?', 'report.today');
    nlp.addDocument('en', 'Can you summarize today’s report?', 'report.today');
    nlp.addDocument('en', 'What transactions happened today?', 'report.today');


    nlp.addDocument('en', 'Give me today’s report', 'report.today'); //yaha pe changes hai extra line hai
    nlp.addDocument('en', 'Give me the today’s report', 'report.today');
    nlp.addDocument('en', 'What are today’s transactions?', 'report.today');
    nlp.addDocument('en', 'Show me today’s report', 'report.today');
    nlp.addDocument('en', 'What', 'report.LUN'); //delete kar denge 
    nlp.addDocument('en', 'Can we buy stock', 'report.LUN'); //delete kar denge
    nlp.addDocument('en', 'will stock go up or down', 'report.LUN'); // delete kar denge 

    // Add more variations for today...

    nlp.addAnswer('en', 'report.weekly', "WEEKLY");
    nlp.addAnswer('en', 'report.monthly', "MONTHLY");
    nlp.addAnswer('en', 'report.today', "TODAY");

    nlp.addAnswer('en', 'transaction.LUN', 'LUN')
    nlp.addAnswer('en', 'transaction.spent', "YES");
    nlp.addAnswer('en', 'transaction.earned', "YES");
    nlp.addAnswer('en', 'transaction.spent', "YES");
    nlp.addAnswer('en', 'transaction.earned', "YES");
    nlp.addAnswer('en', 'transaction.spent', "YES");
    nlp.addAnswer('en', 'transaction.earned', "YES");
    await nlp.train();



})();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
