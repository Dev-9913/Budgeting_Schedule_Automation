#!/usr/bin/env python3
"""
PDF to Text Converter
Extracts text from PDF files and saves it as a text file.
"""

import sys
import argparse
from pathlib import Path

try:
    import pdfplumber
    PDF_LIBRARY = 'pdfplumber'
except ImportError:
    try:
        import PyPDF2
        PDF_LIBRARY = 'PyPDF2'
    except ImportError:
        print("Error: No PDF library found. Please install one:")
        print("  pip install pdfplumber")
        print("  or")
        print("  pip install PyPDF2")
        sys.exit(1)


def extract_text_pdfplumber(pdf_path):
    """Extract text using pdfplumber (recommended)."""
    text_content = []

    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"Processing {total_pages} pages...")

        for i, page in enumerate(pdf.pages, 1):
            print(f"  Page {i}/{total_pages}", end='\r')
            text = page.extract_text()
            if text:
                text_content.append(f"\n{'='*80}\n")
                text_content.append(f"PAGE {i}\n")
                text_content.append(f"{'='*80}\n\n")
                text_content.append(text)

        print()  # New line after progress

    return ''.join(text_content)


def extract_text_pypdf2(pdf_path):
    """Extract text using PyPDF2 (fallback)."""
    text_content = []

    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        total_pages = len(pdf_reader.pages)
        print(f"Processing {total_pages} pages...")

        for i in range(total_pages):
            print(f"  Page {i+1}/{total_pages}", end='\r')
            page = pdf_reader.pages[i]
            text = page.extract_text()
            if text:
                text_content.append(f"\n{'='*80}\n")
                text_content.append(f"PAGE {i+1}\n")
                text_content.append(f"{'='*80}\n\n")
                text_content.append(text)

        print()  # New line after progress

    return ''.join(text_content)


def convert_pdf_to_text(pdf_path, output_path=None):
    """Convert a PDF file to text format."""
    pdf_path = Path(pdf_path)

    if not pdf_path.exists():
        print(f"Error: File '{pdf_path}' not found.")
        return False

    if not pdf_path.suffix.lower() == '.pdf':
        print(f"Error: File '{pdf_path}' is not a PDF file.")
        return False

    # Determine output path
    if output_path is None:
        output_path = pdf_path.with_suffix('.txt')
    else:
        output_path = Path(output_path)

    print(f"Converting: {pdf_path.name}")
    print(f"Using library: {PDF_LIBRARY}")

    try:
        # Extract text based on available library
        if PDF_LIBRARY == 'pdfplumber':
            text = extract_text_pdfplumber(pdf_path)
        else:
            text = extract_text_pypdf2(pdf_path)

        # Save to file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text)

        print(f"\nSuccess! Text saved to: {output_path}")
        print(f"Output file size: {output_path.stat().st_size / 1024 / 1024:.2f} MB")

        return True

    except Exception as e:
        print(f"\nError during conversion: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Convert PDF files to text format',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s input.pdf
  %(prog)s input.pdf -o output.txt
  %(prog)s "Managerial Accounting by Hilton 9e BOOK.pdf"
        """
    )

    parser.add_argument('pdf_file', help='Path to the PDF file')
    parser.add_argument('-o', '--output', help='Output text file path (default: same name as PDF with .txt extension)')

    args = parser.parse_args()

    success = convert_pdf_to_text(args.pdf_file, args.output)
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()

