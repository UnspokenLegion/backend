import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function App() {
  const [categories, setCategories] = useState([])
  const [categoryName, setCategoryName] = useState('')
  const [categoryType, setCategoryType] = useState('Expense')
  const [isGlobal, setIsGlobal] = useState(false)
  const [limitAmount, setLimitAmount] = useState('')

  const [transactions, setTransactions] = useState([])
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')

  const [budgets, setBudgets] = useState([])

  const currentMonthString = new Date().toISOString().slice(0, 7)

  const fetchData = () => {
    fetch('http://localhost:8080/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))

    fetch('http://localhost:8080/api/transactions')
      .then(res => res.json())
      .then(data => setTransactions(data))

    fetch('http://localhost:8080/api/budget')
      .then(res => res.json())
      .then(data => setBudgets(data))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCategorySubmit = (e) => {
    e.preventDefault()
    const newCategory = { name: categoryName, type: categoryType, isGlobal }

    fetch('http://localhost:8080/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory)
    })
      .then(res => res.json())
      .then(savedCategory => {
        if (categoryType === 'Expense' && limitAmount) {
          const newBudget = {
            monthlyLimit: parseFloat(limitAmount),
            alertThreshold: parseFloat(limitAmount) * 0.9,
            category: { id: savedCategory.id },
            user: { id: 1 }
          }
          return fetch('http://localhost:8080/api/budget', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBudget)
          })
        }
      })
      .then(() => {
        fetchData()
        setCategoryName('')
        setLimitAmount('')
      })
      .catch(err => console.error("Error saving category/budget:", err))
  }

  const handleTransactionSubmit = (e) => {
    e.preventDefault()

    const categoryIdInt = parseInt(selectedCategoryId)
    const txAmount = parseFloat(amount)
    const selectedCat = categories.find(c => c.id === categoryIdInt)

    if (selectedCat && selectedCat.type === 'Expense') {
      const categoryBudget = budgets.find(b => b.category.id === categoryIdInt)
      if (categoryBudget) {
        const currentSpent = transactions
          .filter(tx => tx.category.id === categoryIdInt && tx.date.startsWith(currentMonthString))
          .reduce((sum, tx) => sum + tx.amount, 0)

        const projectedTotal = currentSpent + txAmount

        if (projectedTotal >= categoryBudget.alertThreshold) {
          const isOverLimit = projectedTotal > categoryBudget.monthlyLimit
          const message = isOverLimit
            ? `⚠️ WARNING: This transaction puts you OVER your monthly limit!\n\nLimit: $${categoryBudget.monthlyLimit.toFixed(2)}\nProjected Total: $${projectedTotal.toFixed(2)}\n\nDo you still want to log this?`
            : `⚠️ HEADS UP: You are crossing your 90% warning threshold.\n\nProjected Total: $${projectedTotal.toFixed(2)}\n\nDo you still want to log this?`

          const proceed = window.confirm(message)
          if (!proceed) return
        }
      }
    }

    const newTransaction = {
      amount: txAmount,
      date: date,
      description: description,
      category: { id: categoryIdInt },
      user: { id: 1 }
    }

    fetch('http://localhost:8080/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTransaction)
    }).then(() => {
      fetchData()
      setAmount('')
      setDate('')
      setDescription('')
      setSelectedCategoryId('')
    })
  }

  const handleDeleteTransaction = (id) => {
    fetch(`http://localhost:8080/api/transactions/${id}`, { method: 'DELETE' })
      .then(() => fetchData())
  }

  const handleDeleteCategory = (id) => {
    fetch(`http://localhost:8080/api/categories/${id}`, { method: 'DELETE' })
      .then(() => fetchData())
  }

  // --- MATH ENGINE ---
  const monthlySpending = categories
    .filter(cat => cat.type === 'Expense')
    .map(cat => {
      const spent = transactions
        .filter(tx => tx.category.id === cat.id && tx.date.startsWith(currentMonthString))
        .reduce((sum, tx) => sum + tx.amount, 0)

      const categoryBudget = budgets.find(b => b.category.id === cat.id)
      const limit = categoryBudget ? categoryBudget.monthlyLimit : 0
      const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0

      return { ...cat, spent, limit, percentage }
    })

  const currentMonthTransactions = transactions.filter(tx => tx.date.startsWith(currentMonthString));

  const totalExpense = currentMonthTransactions
    .filter(tx => tx.category.type === 'Expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalIncome = currentMonthTransactions
    .filter(tx => tx.category.type === 'Income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netCashFlow = totalIncome - totalExpense;

  const pieChartData = [
    { name: 'Income', value: totalIncome, color: '#10B981' }, // Tailwind Emerald-500
    { name: 'Expenses', value: totalExpense, color: '#EF4444' } // Tailwind Red-500
  ].filter(item => item.value > 0);

  // --- STYLES SYSTEM ---
  const styles = {
    app: { padding: '40px', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', backgroundColor: '#0B0F19', minHeight: '100vh', width: '100%', color: '#F1F5F9', boxSizing: 'border-box' },
    container: { maxWidth: '1200px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' },
    card: { backgroundColor: '#111827', padding: '24px', borderRadius: '16px', border: '1px solid #1F2937', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    cardHeader: { margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#1F2937', color: '#F9FAFB', boxSizing: 'border-box', marginBottom: '12px', outline: 'none', transition: 'border 0.2s' },
    btnPrimary: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#3B82F6', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' },
    btnSuccess: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#10B981', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' },
    label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#9CA3AF', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    divider: { height: '1px', backgroundColor: '#1F2937', margin: '32px 0' },
    badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none', cursor: 'pointer' }
  }

  return (
    <div style={styles.app}>
      <div style={styles.container}>

        {/* HEADER */}
        <header style={styles.header}>
          <div>
            <h1 style={{ margin: '0', fontSize: '32px', fontWeight: '700', color: '#FFFFFF' }}>Money Saver</h1>
            <p style={{ margin: '8px 0 0 0', color: '#9CA3AF', fontSize: '14px' }}>Dashboard • {currentMonthString}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: '500' }}>Net Cash Flow</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: netCashFlow >= 0 ? '#10B981' : '#EF4444' }}>
              {netCashFlow >= 0 ? '+' : '-'}${Math.abs(netCashFlow).toFixed(2)}
            </div>
          </div>
        </header>

        {/* MAIN LAYOUT GRID (2 Columns) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>

          {/* LEFT COLUMN: Data & Visualization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* CASH FLOW CARD */}
            <div style={styles.card}>
              <h3 style={styles.cardHeader}>Cash Flow Overview</h3>
              {pieChartData.length === 0 ? (
                <p style={{ color: '#6B7280', textAlign: 'center', margin: '40px 0' }}>Log transactions to visualize data.</p>
              ) : (
                <div style={{ height: '240px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} stroke="none">
                        {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F9FAFB' }}
                        itemStyle={{ color: '#F9FAFB' }}
                        formatter={(value) => `$${value.toFixed(2)}`}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* BUDGET TRACKER CARD */}
            <div style={styles.card}>
              <h3 style={styles.cardHeader}>Monthly Budgets</h3>
              {monthlySpending.length === 0 ? (
                <p style={{ color: '#6B7280', textAlign: 'center' }}>No budgets set.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {monthlySpending.map(budget => {
                    const isDanger = budget.percentage > 90;
                    const isWarning = budget.percentage > 75;
                    const barColor = isDanger ? '#EF4444' : (isWarning ? '#F59E0B' : '#10B981');

                    return (
                      <div key={budget.id}>
                        <div style={{ ...styles.flexBetween, marginBottom: '8px' }}>
                          <strong style={{ fontSize: '15px' }}>{budget.name}</strong>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#9CA3AF' }}>
                              <span style={{ color: '#F8FAFC' }}>${budget.spent.toFixed(2)}</span> / ${budget.limit.toFixed(2)}
                            </span>
                            <button onClick={() => handleDeleteCategory(budget.id)} style={styles.badge}>✕</button>
                          </div>
                        </div>
                        {/* Custom Modern Progress Bar */}
                        <div style={{ width: '100%', backgroundColor: '#1F2937', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                          <div style={{ width: `${budget.percentage}%`, backgroundColor: barColor, height: '100%', borderRadius: '999px', transition: 'width 0.5s ease' }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Actions & History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* QUICK ACTIONS CARD */}
            <div style={styles.card}>

              {/* Add Transaction Section */}
              <h3 style={styles.cardHeader}>Log Transaction</h3>
              <form onSubmit={handleTransactionSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={styles.label}>Amount</label>
                    <input type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required style={styles.input}/>
                  </div>
                  <div>
                    <label style={styles.label}>Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={styles.input}/>
                  </div>
                </div>

                <label style={styles.label}>Description</label>
                <input type="text" placeholder="e.g., Target Run" value={description} onChange={e => setDescription(e.target.value)} required style={styles.input}/>

                <label style={styles.label}>Category</label>
                <select value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)} required style={styles.input}>
                  <option value="" disabled>Select a Category...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name} ({cat.type})</option>
                  ))}
                </select>
                <button type="submit" style={{ ...styles.btnSuccess, marginTop: '8px' }}>Save Transaction</button>
              </form>

              <div style={styles.divider}></div>

              {/* Add Category Section */}
              <h3 style={styles.cardHeader}>Create Category</h3>
              <form onSubmit={handleCategorySubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={styles.label}>Name</label>
                    <input type="text" placeholder="e.g., Gas" value={categoryName} onChange={e => setCategoryName(e.target.value)} required style={styles.input}/>
                  </div>
                  <div>
                    <label style={styles.label}>Type</label>
                    <select value={categoryType} onChange={e => setCategoryType(e.target.value)} style={styles.input}>
                      <option value="Expense">Expense</option>
                      <option value="Income">Income</option>
                    </select>
                  </div>
                </div>

                {categoryType === 'Expense' && (
                  <div>
                    <label style={styles.label}>Monthly Limit</label>
                    <input type="number" step="0.01" placeholder="0.00" value={limitAmount} onChange={e => setLimitAmount(e.target.value)} required style={styles.input}/>
                  </div>
                )}
                <button type="submit" style={{ ...styles.btnPrimary, marginTop: '8px' }}>Add Category</button>
              </form>
            </div>

            {/* RECENT TRANSACTIONS CARD */}
            <div style={styles.card}>
              <h3 style={styles.cardHeader}>Recent History</h3>
              {transactions.length === 0 ? (
                <p style={{ color: '#6B7280', textAlign: 'center' }}>No transactions yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {transactions.map(tx => {
                    const isIncome = tx.category.type === 'Income';
                    return (
                      <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#1F2937', borderRadius: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#F9FAFB', fontSize: '15px' }}>{tx.description}</div>
                          <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
                            {tx.category.name} • {tx.date}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: isIncome ? '#10B981' : '#F9FAFB' }}>
                            {isIncome ? '+' : '-'}${tx.amount.toFixed(2)}
                          </span>
                          <button onClick={() => handleDeleteTransaction(tx.id)} style={{ background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default App
