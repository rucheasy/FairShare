import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ArrowRight } from 'lucide-react';
import { getGroups, createGroup } from '../services/api';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await getGroups();
      setGroups(data.groups);
    } catch (error) {
      console.error("Failed to fetch groups", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    try {
      await createGroup(newGroupName, ["You"]); // Default member
      setNewGroupName('');
      setIsModalOpen(false);
      fetchGroups();
    } catch (error) {
      console.error("Failed to create group", error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">
            Your Groups
          </h1>
          <p className="text-slate-400">Manage your shared expenses</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 glass-button glass-button-primary"
        >
          <Plus size={20} />
          <span>New Group</span>
        </motion.button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-panel h-48 animate-pulse bg-white/5"></div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20 glass-panel border-dashed">
          <div className="bg-purple-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No groups yet</h3>
          <p className="text-slate-400 mb-6">Create a group to start splitting expenses with friends.</p>
          <button onClick={() => setIsModalOpen(true)} className="text-purple-400 hover:text-purple-300 font-medium">
            + Create your first group
          </button>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {groups.map((group) => (
            <motion.div
              key={group._id}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => navigate(`/group/${group._id}`)}
              className="glass-panel p-6 cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
              
              <h3 className="text-xl font-semibold mb-1 group-hover:text-purple-300 transition-colors">{group.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{group.members?.length || 0} members</p>
              
              <div className="flex items-center justify-between mt-6">
                <div className="flex -space-x-2">
                  {group.members?.slice(0, 3).map((m, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-medium">
                      {m.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {(group.members?.length || 0) > 3 && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-400">
                      +{group.members.length - 3}
                    </div>
                  )}
                </div>
                
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                  <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-md p-6 bg-slate-900"
          >
            <h2 className="text-2xl font-bold mb-6">Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">Group Name</label>
                <input
                  type="text"
                  autoFocus
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full glass-input"
                  placeholder="e.g. Goa Trip 2026"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="glass-button glass-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-button glass-button-primary"
                >
                  Create Group
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
