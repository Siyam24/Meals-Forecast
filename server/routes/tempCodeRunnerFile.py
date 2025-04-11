from flask import Blueprint, jsonify, request, make_response
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
import datetime
from models import SalesData # Import your SalesData model
from extensions import db, jwt_required

report_bp = Blueprint('report', __name__)

@report_bp.route('/generate/<int:month>', methods=['GET'])
@jwt_required()
def generate_report(month):
    try:
        # Get current year
        current_year = datetime.datetime.now().year
        
        # Query sales data for the specified month and year
        month_sales = SalesData.query.filter(
            db.func.extract('month', db.func.to_date(SalesData.date, 'YYYY-MM-DD')) == month,
            db.func.extract('year', db.func.to_date(SalesData.date, 'YYYY-MM-DD')) == current_year
        ).all()
        
        if not month_sales:
            return jsonify({"error": "No data for this month"}), 404

        # Calculate totals
        total_sales = sum(sale.totalSales for sale in month_sales)
        total_items = sum(sale.quantitySold for sale in month_sales)

        # Create PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        month_name = datetime.date(1900, month, 1).strftime('%B')
        elements.append(Paragraph(
            f"{month_name} {current_year} Sales Report", 
            styles['Title']
        ))
        
        # Summary
        summary_data = [
            ["Total Sales", f"LKR {total_sales:.2f}"],
            ["Total Items Sold", str(total_items)],
            ["Number of Transactions", str(len(month_sales))]
        ]
        
        summary_table = Table(summary_data)
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(summary_table)
        
        # Detailed data
        detailed_data = [["Date", "Item", "Category", "Price", "Qty", "Total"]]
        for sale in month_sales:
            detailed_data.append([
                sale.date,
                sale.item,
                sale.category,
                f"{sale.price:.2f}",
                str(sale.quantitySold),
                f"{sale.totalSales:.2f}"
            ])
        
        detailed_table = Table(detailed_data)
        detailed_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 0), (-1, -1), 8)
        ]))
        elements.append(detailed_table)
        
        doc.build(elements)
        
        buffer.seek(0)
        response = make_response(buffer.read())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = (
            f'attachment; filename=sales_report_{month}_{current_year}.pdf'
        )
        
        return response
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500