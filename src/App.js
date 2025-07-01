import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, MessageSquare, Upload, Moon, Sun } from 'lucide-react';


// Sample transaction data
  const sampleTransactions = [
    { id: 1, date: '2024-05-01', amount: -85.50, category: 'Groceries', description: 'Whole Foods Market', merchant: 'Whole Foods' },
    { id: 2, date: '2024-05-02', amount: -12.99, category: 'Subscriptions', description: 'Netflix subscription', merchant: 'Netflix' },
    { id: 3, date: '2024-05-03', amount: -45.00, category: 'Dining', description: 'Dinner at Italian restaurant', merchant: 'Olive Garden' },
    { id: 4, date: '2024-05-05', amount: -120.00, category: 'Utilities', description: 'Electric bill payment', merchant: 'ConEd' },
    { id: 5, date: '2024-05-07', amount: -35.75, category: 'Transportation', description: 'Gas station fill-up', merchant: 'Shell' },
    { id: 6, date: '2024-05-08', amount: -250.00, category: 'Shopping', description: 'Clothing purchase', merchant: 'Macys' },
    { id: 7, date: '2024-05-10', amount: 2500.00, category: 'Income', description: 'Salary deposit', merchant: 'Employer' },
    { id: 8, date: '2024-05-12', amount: -75.20, category: 'Groceries', description: 'Weekly groceries', merchant: 'Safeway' },
    { id: 9, date: '2024-05-15', amount: -200.00, category: 'Healthcare', description: 'Doctor visit copay', merchant: 'Medical Center' },
    { id: 10, date: '2024-05-18', amount: -60.00, category: 'Entertainment', description: 'Movie tickets and snacks', merchant: 'AMC Theaters' }
  ];

const FinanceAdvisor = () => {
  const [transactions, setTransactions] = useState(sampleTransactions);
  const [analysis, setAnalysis] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };


  const analyzeSpending = useCallback((txns) => {
  const expenses = txns.filter(t => t.amount < 0);
  const income = txns.filter(t => t.amount > 0);

  const categoryTotals = expenses.reduce((acc, t) => {
    if (t.category === 'Income') return acc;
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount: parseFloat(amount.toFixed(2)),
    percentage: ((amount / expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)) * 100).toFixed(1)
  }));

  const dailySpending = expenses.reduce((acc, t) => {
    const date = t.date;
    acc[date] = (acc[date] || 0) + Math.abs(t.amount);
    return acc;
  }, {});

  const trendData = Object.entries(dailySpending).map(([date, amount]) => ({
    date,
    amount: parseFloat(amount.toFixed(2))
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : '0.0';

  const topCategory = categoryData.length > 0 ? categoryData.reduce((max, cat) => cat.amount > max.amount ? cat : max, categoryData[0]) : { category: "N/A", amount: 0, percentage: 0 };

  setAnalysis({
    categoryData,
    trendData,
    totalIncome,
    totalExpenses,
    savingsRate,
    topCategory,
    insights: generateInsights(categoryData, savingsRate, topCategory)
  });
}, []);

useEffect(() => {
  analyzeSpending(transactions);
}, [analyzeSpending, transactions]);

  const generateInsights = (categoryData, savingsRate, topCategory) => {
    const insights = [];
    
    if (parseFloat(savingsRate) < 20) {
      insights.push({
        type: 'warning',
        title: 'Low Savings Rate',
        message: `Your savings rate is ${savingsRate}%. Financial experts recommend saving at least 20% of income.`,
        recommendation: 'Consider reducing discretionary spending or finding additional income sources.'
      });
    } else {
      insights.push({
        type: 'success',
        title: 'Good Savings Rate',
        message: `Great job! Your savings rate of ${savingsRate}% is above the recommended 20%.`,
        recommendation: 'Keep up the good work and consider investing your surplus.'
      });
    }

    if (topCategory && topCategory.percentage > 30) {
      insights.push({
        type: 'warning',
        title: 'High Category Spending',
        message: `${topCategory.category} accounts for ${topCategory.percentage}% of your spending.`,
        recommendation: `Look for ways to optimize your ${topCategory.category.toLowerCase()} expenses.`
      });
    }

    // Dining out analysis
    const diningCategory = categoryData.find(c => c.category === 'Dining');
    if (diningCategory && diningCategory.amount > 200) {
      insights.push({
        type: 'tip',
        title: 'Dining Optimization',
        message: `You spent $${diningCategory.amount} on dining out this month.`,
        recommendation: 'Consider meal prepping or cooking at home more often to save money.'
      });
    }

    return insights;
  };

  const processNLPQuery = (query) => {
  const lowerQuery = query.toLowerCase();

  const intents = [
    {
      name: "savings",
      keywords: ["savings", "save", "saving rate", "how to save"],
      response: () =>
        `Your savings rate is ${analysis.savingsRate}%. ${
          parseFloat(analysis.savingsRate) >= 20
            ? "Great job! You're above the recommended 20%."
            : "Consider aiming for at least 20% to build stability."
        }`,
    },
    {
      name: "total_spending",
      keywords: ["total", "spent", "overall expenses", "total spending", "how much did i spend"],
      response: () =>
        `You spent $${analysis.totalExpenses.toFixed(
          2
        )}. Your income was $${analysis.totalIncome.toFixed(2)}.`,
    },
    {
      name: "top_category",
      keywords: [
        "top", "most", "highest", "category",
        "biggest expense", "most spent", "largest spending", "where did i spend the most"
      ],
      response: () =>
        `Your highest spending category is ${analysis.topCategory.category} at $${analysis.topCategory.amount}.`,
    },
    {
      name: "budget_advice",
      keywords: ["advice", "recommend", "tip", "optimize", "budget", "suggestions"],
      response: () => {
        const tips = analysis.insights
          .filter((i) => i.type !== "success")
          .map((i) => i.recommendation);
        return tips.length
          ? `Here are some tips: ${tips.join(" ")}`
          : "Your budget looks great. No changes needed!";
      },
    },
    {
      name: "groceries_vs_dining",
      keywords: ["groceries", "food", "dining", "compare groceries", "groceries vs dining"],
      response: () => {
        const groceries = analysis.categoryData.find(
          (c) => c.category === "Groceries"
        );
        const dining = analysis.categoryData.find(
          (c) => c.category === "Dining"
        );
        return `You spent $${groceries?.amount || 0} on groceries and $${dining?.amount || 0} on dining. ${
          dining?.amount > groceries?.amount
            ? "Try cooking more to reduce costs."
            : "Nice balance between eating in and out!"
        }`;
      },
    },
  ];
  
  const bannedWords = ["sex", "kill", "hate", "bomb"];
  if (bannedWords.some((word) => lowerQuery.includes(word))) {
    return "⚠️ Let's keep things respectful. I'm here to help with your finances.";
  }

  for (const intent of intents) {
    if (intent.keywords.some((kw) => lowerQuery.includes(kw))) {
      return intent.response();
    }
  }
    return "I can help you analyze your spending patterns. Try asking about your spending categories, savings rate, or budget recommendations!";
  };

  const handleChatSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!userInput.trim() || !analysis) return;
    
    setLoading(true);
    const userMessage = { type: 'user', message: userInput };
    setChatMessages(prev => [...prev, userMessage]);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const response = processNLPQuery(userInput);
      const aiMessage = { type: 'ai', message: response };
      setChatMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
    
    setUserInput('');
  };

  const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'text/csv') {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target.result;
      const parsed = parseBankCSV(csvData);
      setTransactions(parsed); // This line uses setTransactions
      analyzeSpending(parsed);
    };
    reader.readAsText(file);
  } else {
    alert("Please upload a valid CSV file.");
  }
};

const parseBankCSV = (csvText) => {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];
  
  const [headerLine, ...dataLines] = lines;
  const headers = headerLine.split(",").map(h => h.trim().toLowerCase().replace(/"/g, ''));

  const assignCategory = (desc) => {
    const d = desc.toLowerCase();
    if (d.includes("grocery") || d.includes("whole foods") || d.includes("safeway") || d.includes("supermarket")) return "Groceries";
    if (d.includes("netflix") || d.includes("spotify") || d.includes("subscription")) return "Subscriptions";
    if (d.includes("restaurant") || d.includes("dining") || d.includes("olive garden") || d.includes("mcdonalds")) return "Dining";
    if (d.includes("gas") || d.includes("uber") || d.includes("transport") || d.includes("shell") || d.includes("exxon")) return "Transportation";
    if (d.includes("electric") || d.includes("bill") || d.includes("water") || d.includes("coned") || d.includes("utility")) return "Utilities";
    if (d.includes("doctor") || d.includes("clinic") || d.includes("hospital") || d.includes("medical")) return "Healthcare";
    if (d.includes("movie") || d.includes("amc") || d.includes("ticket") || d.includes("entertainment")) return "Entertainment";
    if (d.includes("macys") || d.includes("store") || d.includes("shopping") || d.includes("amazon") || d.includes("target")) return "Shopping";
    if (d.includes("salary") || d.includes("payroll") || d.includes("deposit") || d.includes("income") || d.includes("wages")) return "Income";
    return "Other";
  };

  return dataLines.map((line, idx) => {
    // Handle CSV with potential commas in quoted fields
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/"/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/"/g, ''));

    // Create entry object mapping headers to values
    const entry = {};
    headers.forEach((key, i) => {
      entry[key] = values[i] || '';
    });

    // Try to find amount field with various possible names
    let amount = 0;
    const amountFields = ['amount', 'debit', 'credit', 'transaction amount', 'value', 'sum'];
    const debitFields = ['debit', 'withdrawal', 'out', 'expense'];
    const creditFields = ['credit', 'deposit', 'in', 'income'];
    
    // First try to find a general amount field
    for (const field of amountFields) {
      if (entry[field] && entry[field] !== '') {
        const parsedAmount = parseFloat(entry[field].replace(/[^-0-9.]/g, ''));
        if (!isNaN(parsedAmount)) {
          amount = parsedAmount;
          break;
        }
      }
    }
    
    // If no general amount found, try debit/credit separately
    if (amount === 0) {
      let debitAmount = 0;
      let creditAmount = 0;
      
      for (const field of debitFields) {
        if (entry[field] && entry[field] !== '') {
          const parsedAmount = parseFloat(entry[field].replace(/[^0-9.]/g, ''));
          if (!isNaN(parsedAmount)) {
            debitAmount = parsedAmount;
            break;
          }
        }
      }
      
      for (const field of creditFields) {
        if (entry[field] && entry[field] !== '') {
          const parsedAmount = parseFloat(entry[field].replace(/[^0-9.]/g, ''));
          if (!isNaN(parsedAmount)) {
            creditAmount = parsedAmount;
            break;
          }
        }
      }
      
      // Set amount based on which field has a value
      if (creditAmount > 0) {
        amount = creditAmount; // Positive for income
      } else if (debitAmount > 0) {
        amount = -debitAmount; // Negative for expenses
      }
    }

    // Try to find date field
    let date = '';
    const dateFields = ['date', 'transaction date', 'posting date', 'value date'];
    for (const field of dateFields) {
      if (entry[field] && entry[field] !== '') {
        date = entry[field];
        break;
      }
    }

    // Try to find description field
    let description = '';
    const descFields = ['description', 'details', 'transaction', 'memo', 'reference', 'payee'];
    for (const field of descFields) {
      if (entry[field] && entry[field] !== '') {
        description = entry[field];
        break;
      }
    }

    // If amount is positive and description suggests it's income, keep it positive
    // If amount is positive but description suggests expense, make it negative
    const category = assignCategory(description);
    if (amount > 0 && category !== 'Income') {
      // This might be an expense recorded as positive, make it negative
      amount = -amount;
    }

    return {
      id: idx + 1,
      date: date,
      amount: amount,
      category: category,
      description: description,
      merchant: description.split(" ")[0] || "Unknown"
    };
  }).filter(entry => entry.date && !isNaN(entry.amount) && entry.amount !== 0);
};

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  const DARK_COLORS = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#6EE7B7'];

  const currentColors = darkMode ? DARK_COLORS : COLORS;

  if (!analysis) {
    return (
      <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        Loading financial analysis...
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    } p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 relative">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`absolute top-0 right-0 p-3 rounded-full transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            } shadow-lg hover:shadow-xl`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          
          <h1 className={`text-4xl font-bold mb-2 flex items-center justify-center gap-3 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <img
              src="/applogo.png"
              alt="MoneyMentor Logo"
              className="h-8 w-8 object-contain"
            />
            MONEY MENTOR
          </h1>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            Grow Smarter. Spend Wiser
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-lg p-6 shadow-lg transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Income</p>
                <p className="text-2xl font-bold text-green-600">${analysis.totalIncome.toFixed(2)}</p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </div>
          
          <div className={`rounded-lg p-6 shadow-lg transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">${analysis.totalExpenses.toFixed(2)}</p>
              </div>
              <TrendingDown className="text-red-600" size={32} />
            </div>
          </div>
          
          <div className={`rounded-lg p-6 shadow-lg transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Savings Rate</p>
                <p className="text-2xl font-bold text-blue-600">{analysis.savingsRate}%</p>
              </div>
              <DollarSign className="text-blue-600" size={32} />
            </div>
          </div>
          
          <div className={`rounded-lg p-6 shadow-lg transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Top Category</p>
                <p className="text-lg font-bold text-purple-600">{analysis.topCategory.category}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>${analysis.topCategory.amount}</p>
              </div>
              <AlertTriangle className="text-purple-600" size={32} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Spending by Category */}
          <div className={`rounded-lg p-6 shadow-lg transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Spending by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysis.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({category, percentage}) => `${category} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {analysis.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={currentColors[index % currentColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    border: darkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    borderRadius: '6px',
                    color: darkMode ? '#ffffff' : '#000000'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Spending Trends */}
          <div className={`rounded-lg p-6 shadow-lg transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Daily Spending Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analysis.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4B5563' : '#E5E7EB'} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: darkMode ? '#D1D5DB' : '#6B7280' }}
                />
                <YAxis 
                  tick={{ fill: darkMode ? '#D1D5DB' : '#6B7280' }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    border: darkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    borderRadius: '6px',
                    color: darkMode ? '#ffffff' : '#000000'
                  }}
                />
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className={`rounded-lg p-6 shadow-lg mb-8 transition-colors duration-300 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            AI-Generated Insights
          </h3>
          <div className="space-y-4">
            {analysis.insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'warning' 
                  ? `border-yellow-400 ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}` :
                insight.type === 'success' 
                  ? `border-green-400 ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}` :
                  `border-blue-400 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`
              }`}>
                <div className="flex items-start gap-3">
                  {insight.type === 'warning' ? <AlertTriangle className="text-yellow-600 mt-1" size={20} /> :
                   insight.type === 'success' ? <CheckCircle className="text-green-600 mt-1" size={20} /> :
                   <MessageSquare className="text-blue-600 mt-1" size={20} />}
                  <div>
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {insight.title}
                    </h4>
                    <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {insight.message}
                    </p>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {insight.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CSV Upload */}
        <div className="mb-6 flex justify-center">
          <label
            className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg shadow transition-colors duration-300 ${
              darkMode
                ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                : 'bg-white text-blue-600 hover:bg-gray-100'
            }`}
          >
        <Upload className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Upload CSV</span>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        </label>
      </div>

        {/* Chat Interface */}
        <div className={`rounded-lg p-6 shadow-lg transition-colors duration-300 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <MessageSquare className="text-blue-600" />
            Ask Your AI Finance Advisor
          </h3>
          
          {/* Quick Questions Buttons */}
          <div className="mb-4">
            <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quick Questions:</p>
            <div className="flex flex-col gap-2">
              {[
                "What’s my biggest expense?",
                "How can I save more?",
                "Give me budget tips",
                "Compare groceries vs dining"
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setUserInput(q);
                    handleChatSubmit({ preventDefault: () => {} });
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors duration-300 ${
                    darkMode
                      ? 'bg-blue-900 text-blue-300 hover:bg-blue-800'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Message Window */}
          <div className={`h-64 overflow-y-auto mb-4 p-4 rounded-lg transition-colors duration-300 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            {chatMessages.length === 0 ? (
              <div className={`text-center mt-20 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>Ask me anything about your finances!</p>
                <p className="text-sm mt-2">Try: "What's my biggest spending category?" or "How can I save more money?"</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : `border ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-200 text-gray-800'}`
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className={`border px-4 py-2 rounded-lg ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-white border-gray-200 text-gray-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Analyzing...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`w-full text-center py-4 text-sm border-t mt-6 transition-colors duration-300 ${
            darkMode ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'
          }`}>
            Crafted with precision by <span className="font-semibold text-blue-500">Harshavardhan Kandula</span> · © 2025
          </div>
          </div>
        </div>
      </div>
  );
};

export default FinanceAdvisor;
