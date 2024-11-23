const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    },{collection: 'expense'});

module.exports = mongoose.model('Expense', ExpenseSchema);
