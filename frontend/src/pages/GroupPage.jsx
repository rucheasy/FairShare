import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UserPlus, PlusCircle, Activity, PiggyBank, Download, CheckCircle2 } from 'lucide-react';
import { getGroup, getGroupExpenses, getBalances, addExpense, addMember, settleDebt } from '../services/api';
import NetworkGraph from '../components/NetworkGraph';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const GroupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, balances
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseData, setExpenseData] = useState({ paid_by: '', amount: '', description: '', category: 'Food' });
  
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const groupData = await getGroup(id);
      setGroup(groupData.group);
      
      if (groupData.group.members.length > 0) {
        setExpenseData(prev => ({ ...prev, paid_by: groupData.group.members[0] }));
      }
      
      const [expensesData, balancesData] = await Promise.all([
        getGroupExpenses(id),
        getBalances(id)
      ]);
      
      setExpenses(expensesData.expenses);
      setSettlements(balancesData.settlements);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await addExpense({
        group_id: id,
        ...expenseData,
        amount: parseFloat(expenseData.amount),
        split_between: group.members // Defaulting to equal split among all for simplicity
      });
      setIsExpenseModalOpen(false);
      setExpenseData({ ...expenseData, amount: '', description: '' });
      fetchData();
    } catch (error) {
      console.error("Error adding expense", error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    try {
      await addMember(id, newMemberName);
      setIsMemberModalOpen(false);
      setNewMemberName('');
      fetchData();
    } catch (error) {
      console.error("Error adding member", error);
    }
  };

  const handleSettle = async (settlement) => {
    try {
      await settleDebt({
        group_id: id,
        from: settlement.from,
        to: settlement.to,
        amount: settlement.amount
      });
      fetchData();
    } catch (error) {
      console.error("Error settling debt", error);
    }
  };

  if (!group) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  // Calculate chart data
  const chartData = expenses.reduce((acc, exp) => {
    if (exp.is_settlement) return acc;
    const existing = acc.find(item => item.name === exp.category);
    if (existing) {
      existing.value += exp.amount;
    } else {
      acc.push({ name: exp.category, value: exp.amount });
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-10 px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 glass-panel hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{group.name}</h1>
            <p className="text-sm text-slate-400">Created {new Date(group.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => setIsMemberModalOpen(true)} className="glass-button glass-button-secondary flex items-center gap-2 text-sm">
            <UserPlus size={16} /> Add Member
          </button>
          <button onClick={() => setIsExpenseModalOpen(true)} className="glass-button glass-button-primary flex items-center gap-2 shadow-purple-500/20 shadow-lg">
            <PlusCircle size={18} /> Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex p-1 space-x-1 glass-panel rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'timeline' ? 'bg-purple-600/20 text-purple-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Activity size={16} /> Timeline
            </button>
            <button
              onClick={() => setActiveTab('balances')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'balances' ? 'bg-blue-600/20 text-blue-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <PiggyBank size={16} /> Balances
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {expenses.length === 0 ? (
                  <div className="text-center py-16 glass-panel border-dashed">
                     <p className="text-slate-400">No expenses yet. Add one to get started!</p>
                  </div>
                ) : (
                  expenses.map((expense, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={expense._id}
                      className="glass-panel p-5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${expense.is_settlement ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}>
                          {expense.paid_by.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white text-lg">{expense.description}</p>
                          <p className="text-sm text-slate-400">
                            {expense.is_settlement ? (
                              <span className="text-green-400">{expense.paid_by} settled with {expense.split_between[0]}</span>
                            ) : (
                              <span>{expense.paid_by} paid • {expense.category}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${expense.is_settlement ? 'text-green-400' : 'text-white'}`}>
                          ₹{expense.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'balances' && (
              <motion.div
                key="balances"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="glass-panel p-6">
                  <h3 className="text-xl font-semibold mb-6">Who owes whom?</h3>
                  <NetworkGraph settlements={settlements} />
                </div>
                
                {settlements.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white">Suggested Settlements</h3>
                    <div className="space-y-3">
                      {settlements.map((s, i) => (
                        <div key={i} className="glass-panel p-4 flex items-center justify-between bg-slate-900">
                           <div className="flex items-center gap-3">
                              <span className="font-semibold text-red-400">{s.from}</span>
                              <span className="text-slate-500 text-sm">pays</span>
                              <span className="font-semibold text-green-400">{s.to}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="font-bold">₹{s.amount.toFixed(2)}</span>
                              <button 
                                onClick={() => handleSettle(s)}
                                className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                              >
                                <CheckCircle2 size={16} /> Settle
                              </button>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-4">Members</h3>
            <div className="flex flex-wrap gap-3">
              {group.members.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-lg">
                      {m.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-300">{m}</span>
                </div>
              ))}
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                 {chartData.map((entry, idx) => (
                   <div key={idx} className="flex items-center gap-1 text-xs text-slate-400">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                     {entry.name}
                   </div>
                 ))}
              </div>
            </div>
          )}
          
          <a 
            href={`http://localhost:5000/api/export/${id}`}
            download
            className="w-full glass-panel p-4 flex justify-center items-center gap-2 text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Download size={18} /> Export Report PDF
          </a>
        </div>
      </div>

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel w-full max-w-md p-6 bg-slate-900 border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <input type="text" value={expenseData.description} onChange={(e) => setExpenseData({...expenseData, description: e.target.value})} className="w-full glass-input" placeholder="e.g. Dinner at Taj" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Amount (₹)</label>
                  <input type="number" step="0.01" value={expenseData.amount} onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})} className="w-full glass-input" placeholder="0.00" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                  <select value={expenseData.category} onChange={(e) => setExpenseData({...expenseData, category: e.target.value})} className="w-full glass-input bg-slate-800">
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Rent</option>
                    <option>Groceries</option>
                    <option>Misc</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Paid By</label>
                <select value={expenseData.paid_by} onChange={(e) => setExpenseData({...expenseData, paid_by: e.target.value})} className="w-full glass-input bg-slate-800">
                  {group.members.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="glass-button glass-button-secondary">Cancel</button>
                <button type="submit" className="glass-button glass-button-primary">Save Expense</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Member Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel w-full max-w-sm p-6 bg-slate-900 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="mb-6">
                <input type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="w-full glass-input" placeholder="Member Name" autoFocus required />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsMemberModalOpen(false)} className="glass-button glass-button-secondary py-1.5 px-4">Cancel</button>
                <button type="submit" className="glass-button glass-button-primary py-1.5 px-4">Add</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GroupPage;
