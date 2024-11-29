const mongoose = require('mongoose');
const { Schema } = mongoose;

const budgetSchema = new mongoose.Schema({
    _id: { type: Number, default: 1 },
    budget : { type: Number, default : 0 },
  },{collection: 'Budgets'});
  
module.exports = mongoose.model('Budgets', budgetSchema);