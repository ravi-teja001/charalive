# 📄 How to Create PDFs from Guides

## Quick Method (Recommended)

### Step 1: Open the HTML Files
I've created an HTML helper file: **`create_pdf_guides.html`**

Double-click it to open in your browser.

### Step 2: Print to PDF
1. Click one of the buttons in the opened page
2. The guide will open in a formatted view
3. Press **Cmd+P** (Mac) or **Ctrl+P** (Windows/Linux)
4. Select **"Save as PDF"** from the printer dropdown
5. Click **"Save"**

---

## Alternative: Direct Markdown to PDF

### Method 1: Using Browser (Easiest)
1. Open the markdown file (USER_GUIDE.md or QUICK_START_GUIDE.md) in a markdown viewer
   - GitHub: Just view the file on GitHub and print
   - VS Code: Use a markdown preview extension
   - Online: Use https://dillinger.io or https://stackedit.io
2. Print to PDF using Cmd+P / Ctrl+P
3. Select "Save as PDF"

### Method 2: Using Online Tools
1. Go to: https://www.markdowntopdf.com/
2. Upload USER_GUIDE.md or QUICK_START_GUIDE.md
3. Click "Convert" and download the PDF

### Method 3: Using VS Code Extension
1. Install "Markdown PDF" extension in VS Code
2. Open the .md file
3. Right-click → "Markdown PDF: Export (pdf)"

---

## Files Ready for PDF Creation

✅ **USER_GUIDE.md** - Complete detailed guide (11 KB)  
✅ **QUICK_START_GUIDE.md** - Quick 5-minute guide (4.2 KB)  
✅ **create_pdf_guides.html** - Browser-based PDF creator

---

## Quick Command (Mac Terminal)
If you have `grip` or `md2pdf` installed:

```bash
# Using grip (requires GitHub)
grip USER_GUIDE.md
# Then print from browser

# Using pandoc (if installed)
pandoc USER_GUIDE.md -o USER_GUIDE.pdf
```

---

**Easiest Method**: Just open `create_pdf_guides.html` in your browser and follow the instructions!
