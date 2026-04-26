def minimize_transactions(expenses):
    """
    Given a list of expenses, calculates the minimum number of transactions
    required to settle all debts.
    
    expenses: list of dicts with 'paid_by', 'amount', 'split_between' (list of user ids)
    """
    balances = {}
    
    # Calculate net balances for each user
    for expense in expenses:
        paid_by = expense['paid_by']
        amount = expense['amount']
        split_between = expense['split_between']
        
        if not split_between:
            continue
            
        split_amount = amount / len(split_between)
        
        # User who paid gets positive balance
        balances[paid_by] = balances.get(paid_by, 0) + amount
        
        # Everyone who was part of the split owes money (negative balance)
        for user in split_between:
            balances[user] = balances.get(user, 0) - split_amount

    # Separate into debtors (negative balance) and creditors (positive balance)
    debtors = []
    creditors = []
    
    for user, balance in balances.items():
        # Round to avoid floating point precision issues
        balance = round(balance, 2)
        if balance < 0:
            debtors.append({'user': user, 'amount': -balance})
        elif balance > 0:
            creditors.append({'user': user, 'amount': balance})
            
    # Sort them by amount descending
    debtors.sort(key=lambda x: x['amount'], reverse=True)
    creditors.sort(key=lambda x: x['amount'], reverse=True)
    
    transactions = []
    
    i = 0 # Debtors index
    j = 0 # Creditors index
    
    while i < len(debtors) and j < len(creditors):
        debtor = debtors[i]
        creditor = creditors[j]
        
        settle_amount = min(debtor['amount'], creditor['amount'])
        
        transactions.append({
            'from': debtor['user'],
            'to': creditor['user'],
            'amount': round(settle_amount, 2)
        })
        
        debtor['amount'] -= settle_amount
        creditor['amount'] -= settle_amount
        
        if round(debtor['amount'], 2) == 0:
            i += 1
        if round(creditor['amount'], 2) == 0:
            j += 1
            
    return transactions
