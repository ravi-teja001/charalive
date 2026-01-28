#!/usr/bin/env python3
"""
Convert Markdown guides to PDF using Python
"""
import sys
import os

try:
    import markdown
    from weasyprint import HTML, CSS
except ImportError:
    print("Installing required packages...")
    os.system("pip3 install markdown weasyprint --quiet")
    import markdown
    from weasyprint import HTML, CSS

def markdown_to_pdf(md_file, pdf_file):
    """Convert markdown file to PDF"""
    print(f"Converting {md_file} to {pdf_file}...")
    
    # Read markdown file
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Convert markdown to HTML
    html_content = markdown.markdown(md_content, extensions=['extra', 'tables', 'codehilite'])
    
    # Add CSS styling
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{
                size: A4;
                margin: 2cm;
            }}
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 100%;
            }}
            h1 {{
                color: #2c3e50;
                border-bottom: 3px solid #3498db;
                padding-bottom: 10px;
                page-break-after: avoid;
            }}
            h2 {{
                color: #34495e;
                margin-top: 30px;
                border-bottom: 2px solid #ecf0f1;
                padding-bottom: 8px;
                page-break-after: avoid;
            }}
            h3 {{
                color: #555;
                margin-top: 25px;
                page-break-after: avoid;
            }}
            code {{
                background: #f4f4f4;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
            }}
            pre {{
                background: #f4f4f4;
                padding: 15px;
                border-radius: 5px;
                overflow-x: auto;
                page-break-inside: avoid;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
                page-break-inside: avoid;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }}
            th {{
                background-color: #3498db;
                color: white;
            }}
            tr:nth-child(even) {{
                background-color: #f9f9f9;
            }}
            ul, ol {{
                margin: 15px 0;
                padding-left: 30px;
            }}
            li {{
                margin: 8px 0;
            }}
            strong {{
                color: #2c3e50;
                font-weight: 600;
            }}
            p {{
                margin: 10px 0;
            }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    # Convert HTML to PDF
    HTML(string=full_html).write_pdf(pdf_file)
    print(f"✅ Successfully created {pdf_file}")

if __name__ == "__main__":
    guides = ["USER_GUIDE.md", "QUICK_START_GUIDE.md"]
    
    for md_file in guides:
        if os.path.exists(md_file):
            pdf_file = md_file.replace(".md", ".pdf")
            try:
                markdown_to_pdf(md_file, pdf_file)
            except Exception as e:
                print(f"❌ Error converting {md_file}: {e}")
                print("\n💡 Alternative: Use the create_pdf_guides.html file in your browser")
                print("   Just open it and follow the instructions to print to PDF")
        else:
            print(f"⚠️  {md_file} not found, skipping...")
    
    print("\n✅ PDF generation complete!")
