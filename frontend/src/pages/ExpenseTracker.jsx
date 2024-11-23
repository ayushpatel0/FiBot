import { useState, useEffect } from 'react';
import axios from 'axios';

const ExpenseTracker = ({ userId }) => {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(1000); // Common budget
  const [totalSpent, setTotalSpent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [tips, setTips] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        // Fetch expenses
        const expensesRes = await axios.get(`http://localhost:3005/api/expense/${userId}`);
        setExpenses(expensesRes.data);

        // Fetch budget status
        const budgetRes = await axios.get(`http://localhost:3005/api/expense/budget/${userId}`);
        setBudget(budgetRes.data.budget);
        setTotalSpent(budgetRes.data.totalSpent);
        setRemaining(budgetRes.data.remaining);

        // Update tips based on remaining budget
        const expenseTips = [
          'Consider cooking at home instead of dining out.',
          'Cut down on subscription services you don’t use.',
          'Shop for essentials in bulk to save money.',
        ];
        if (budgetRes.data.remaining < 0) {
          expenseTips.push('You’ve exceeded your budget. Focus on immediate cost-cutting measures.');
        }
        setTips(expenseTips);
      } catch (err) {
        console.error(err);
      }
    };

    fetchExpenses();
  }, [userId]);

  return (
    <div className="expense-tracker">
      <h1>Expense Tracker</h1>

      <div className="budget-summary">
        <h2>Budget Summary</h2>
        <p>Total Budget: ${budget}</p>
        <p>Total Spent: ${totalSpent}</p>
        <p>Remaining: ${remaining}</p>
      </div>

      <div className="expense-list">
        <h2>Expenses</h2>
        {expenses.length > 0 ? (
          <ul>
            {expenses.map((expense) => (
              <li key={expense._id}>
                {expense.description} - ${expense.amount} ({expense.category}) on{' '}
                {new Date(expense.date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No expenses recorded yet.</p>
        )}
      </div>

      <div className="tips">
        <h2>Tips to Reduce Expenses</h2>
        <ul>
          {tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExpenseTracker;
