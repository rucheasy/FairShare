import React from 'react';
import { motion } from 'framer-motion';

const NetworkGraph = ({ settlements }) => {
  if (!settlements || settlements.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 glass-panel border-dashed">
        All settled up! No one owes anything.
      </div>
    );
  }

  // To build a nice visual, let's just create a list of animated connection cards 
  // since a dynamic physics-based network graph is too heavy without D3.
  // The user asked for "Nodes = users, Arrows = who owes whom".
  
  return (
    <div className="space-y-4">
      {settlements.map((settlement, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-4 glass-panel bg-gradient-to-r from-red-500/5 to-green-500/5"
        >
          {/* Debtor Node */}
          <div className="flex flex-col items-center gap-2 w-1/3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center font-bold text-red-200">
              {settlement.from.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-300 truncate max-w-full">{settlement.from}</span>
          </div>

          {/* Flow Arrow */}
          <div className="flex flex-col items-center justify-center w-1/3 relative">
            <div className="text-xs font-bold text-slate-300 mb-1 absolute -top-4">
              ₹{settlement.amount.toFixed(2)}
            </div>
            <div className="w-full h-1 relative overflow-hidden bg-slate-800 rounded-full">
               <motion.div 
                 className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-red-500/50 via-purple-500/50 to-green-500/50"
                 initial={{ x: "-100%" }}
                 animate={{ x: "100%" }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
               />
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="absolute -right-3 text-green-500/50">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Creditor Node */}
          <div className="flex flex-col items-center gap-2 w-1/3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center font-bold text-green-200">
              {settlement.to.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-300 truncate max-w-full">{settlement.to}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default NetworkGraph;
