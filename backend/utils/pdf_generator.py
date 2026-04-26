from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
from datetime import datetime

def generate_expense_report(group, expenses, settlements):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    p.setFont("Helvetica-Bold", 16)
    
    # Title
    p.drawString(100, 750, f"Expense Report: {group['name']}")
    p.setFont("Helvetica", 12)
    p.drawString(100, 730, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    
    # Members
    p.drawString(100, 700, f"Members: {', '.join(group['members'])}")
    
    y = 660
    p.setFont("Helvetica-Bold", 14)
    p.drawString(100, y, "Expenses")
    y -= 20
    
    p.setFont("Helvetica", 12)
    for exp in expenses:
        if y < 100:
            p.showPage()
            y = 750
        
        date_str = exp['date'].strftime('%Y-%m-%d')
        desc = exp['description']
        amount = exp['amount']
        paid_by = exp['paid_by']
        
        text = f"{date_str} - {paid_by} paid Rs. {amount:.2f} for {desc}"
        p.drawString(100, y, text)
        y -= 20
        
    y -= 20
    if y < 150:
        p.showPage()
        y = 750
        
    p.setFont("Helvetica-Bold", 14)
    p.drawString(100, y, "Settlements (Who owes whom)")
    y -= 20
    
    p.setFont("Helvetica", 12)
    if not settlements:
        p.drawString(100, y, "All settled up!")
    else:
        for s in settlements:
            if y < 100:
                p.showPage()
                y = 750
            text = f"{s['from']} pays {s['to']} Rs. {s['amount']:.2f}"
            p.drawString(100, y, text)
            y -= 20
            
    p.save()
    buffer.seek(0)
    return buffer
