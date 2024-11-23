const { containerBootstrap } = require('@nlpjs/core');
const { Nlp } = require('@nlpjs/nlp');
const { LangEn } = require('@nlpjs/lang-en-min');

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const gga = require('@google/generative-ai');
const Expenses = require("./models/Expenses");
const User = require('./models/User')
const Budget = require("./models/Budgets");
const cors = require('cors');
app.use(cors());
const PORT = process.env.PORT || 3005;

app.use(bodyParser.json());
app.use(express.json());

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
    if(answer != "YES" && !prompt.toLowerCase().includes(answer.toLowerCase())) {
        answer = '';
    }
    if (answer == '' || answer == null || answer == undefined || answer == 'LUN') {
        const result = await betterCallGemini(prompt, true);
        res.status(200).send(result);
    } else {
        if (answer === "YES") {
            const response2 = await betterCallGemini2(prompt);
            // const result = extractJsonData(response);
            console.log("inside yes : ", JSON.stringify(response2));
            await Expenses.create({data: response2});
            const data = arr[Math.floor(Math.random() * arr.length)];
            
            const data2 = { response : { candidates:[{content: { parts :[{text : data}]}}]}};
            //data.response.candidates[0].content.parts[0].text
            res.status(200).send(data2);
        } else {
            const budgetDoc = await Budget.findById(1); // ID is fixed to '1'
            if (!budgetDoc) {
                throw new Error('Budget document with ID 1 not found');
            }
            const budget = budgetDoc.budget;

            const now = new Date();
            var last24Hours = now.getTime() - 24 * 60 * 60 * 1000;
            if(answer === "TODAY"){
                 last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            }else if(answer === "MONTHLY"){
                last24Hours = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }else {
                last24Hours = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            }

            const expenses = await Expenses.find({
                date: { $gte: last24Hours },
            }).select() // Exclude the document ID (_id)
            .sort({ date: 1 });

            const response = await betterCallGemini(`Generate detailed report for ${answer} data for user expenses and the budget is ${budget}, the report must contain all transactions(serial no, date(11-12-2024),type('debit or credit')),and print this net expense, debit total, credit total, Total budget after table leaving two line and must be displayed in tabular format & use these (|:-------------|:------------:|) for formatting and column spacing, data : ${expenses}`, true);
            console.log("Report REsponse :: ", response);
            res.status(200).send(response);
        }
    }
    // console.log(response.answer);

});

function extractJsonData(input) {
    // Remove the backticks and "json" label
    const cleaned = input.replace(/```json|```/g, '').trim();
  
    // Parse the cleaned string into a JSON object
    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Invalid JSON format:', error);
      return null;
    }
  }

async function betterCallGemini(prompt, isNotQuery) {

    const result = await model.generateContent(prompt);
    console.log(result.response.candidates[0].content.parts[0].text);
    if (isNotQuery && result) {
        return result;
    } else {
        return result.response.candidates[0].content.parts[0].text;
    }

}

async function betterCallGemini2(prompt) {

    const result = await jsonModel.generateContent(prompt);
    console.log("inside gemini 2 : ",result.response.candidates[0].content.parts[0].text);
    console.log("inside gemini 2 : ",result.response.candidates[0].content);
    console.log("inside gemini 2 : ",result.response.candidates[0].content.parts[0]);
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
    const response = await nlp.process('en', 'i spent 50$ on groceries');
    res.status(200).send(response.answer);
})


async function runNLP(prompt) {

}
(async () => {
    const container = await containerBootstrap();
    container.use(Nlp);
    container.use(LangEn);
    nlp = container.get('nlp');
    nlp.settings.autoSave = false;
    // nlp.settings.threshold = 0.7;
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

    nlp.addDocument('en', 'Give me the weekly report', 'report.weekly');
    nlp.addDocument('en', 'Show me the weekly report', 'report.weekly');
    nlp.addDocument('en', 'Can I see the report for this week?', 'report.weekly');
    // Add more variations for weekly...

    nlp.addDocument('en', 'Give me the monthly report', 'report.monthly');
    nlp.addDocument('en', 'Show me the monthly report', 'report.monthly');
    nlp.addDocument('en', 'What’s the summary for this month?', 'report.monthly');
    // Add more variations for monthly...

    nlp.addDocument('en', 'Give me today’s report', 'report.today');
    nlp.addDocument('en', 'What are today’s transactions?', 'report.today');
    nlp.addDocument('en', 'Show me today’s report', 'report.today');
    nlp.addDocument('en', 'What' , 'report.LUN');
    nlp.addDocument('en', 'Can we buy stock' , 'report.LUN');
    nlp.addDocument('en', 'will stock go up or down' , 'report.LUN');
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