const mongoose = require('mongoose');
const { Schema } = mongoose;

const expenseSchema = new mongoose.Schema({
    date: { type: Date, required: true, default: Date.now },
    data: { type: String, required: true }
  },{collection: 'Expenses'});
  
module.exports = mongoose.model('Expenses', expenseSchema);
  

// amount: { type: Number, required: true,  },
//     category: { type: String, required: true },
//     type: { type: String, required: true }