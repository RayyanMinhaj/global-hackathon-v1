"""
Enhanced PDF Generator for technical documents with professional styling and Mermaid diagram support
"""

import os
import tempfile
import subprocess
import logging
from io import BytesIO
from typing import Optional, Tuple, List, Dict
import re
import markdown2
from datetime import datetime
import json
import struct
import imghdr
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, 
    Table, TableStyle, KeepTogether, Flowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from markdown_utils import get_markdown_parser

logger = logging.getLogger(__name__)

# Check if mmdc (Mermaid CLI) is available
def check_mmdc_available():
    """Check if mmdc CLI tool is available"""
    try:
        subprocess.run(['mmdc', '--version'], check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

# Set availability flag
MMDC_AVAILABLE = check_mmdc_available()
if MMDC_AVAILABLE:
    logger.info("mmdc CLI is available for Mermaid diagram generation")
else:
    logger.warning("mmdc CLI not found - install with: npm install -g @mermaid-js/mermaid-cli")

class HeaderFooterCanvas(canvas.Canvas):
    """Custom canvas class for adding headers and footers"""
    
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []
        self.page_count = 0

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()
        self.page_count += 1

    def save(self):
        num_pages = len(self._saved_page_states)
        for (page_num, state) in enumerate(self._saved_page_states):
            self.__dict__.update(state)
            self.draw_page_number(page_num + 1, num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_num, total_pages):
        """Draw page number and header/footer"""
        # Draw header line
        self.setStrokeColor(HexColor('#22D3EE'))
        self.setLineWidth(2)
        self.line(72, letter[1] - 50, letter[0] - 72, letter[1] - 50)
        
        # Draw footer
        self.setFont('Helvetica', 8)
        self.setFillColor(HexColor('#666666'))
        
        # Left footer - Generated date
        self.drawString(72, 30, f"Generated on {datetime.now().strftime('%B %d, %Y')}")
        
        # Right footer - Page number
        self.drawRightString(letter[0] - 72, 30, f"Page {page_num} of {total_pages}")
        
        # Center footer - Document title
        self.drawCentredString(letter[0] / 2, 30, "Technical Design Document")

class GradientBackground(Flowable):
    """Custom flowable for gradient backgrounds"""
    
    def __init__(self, width, height, color1, color2):
        self.width = width
        self.height = height
        self.color1 = color1
        self.color2 = color2

    def draw(self):
        """Draw gradient background"""
        # Simple colored rectangle for now (gradient requires more complex implementation)
        self.canv.setFillColor(self.color1)
        self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)

class PDFGenerator:
    """Generate PDF from markdown content with Mermaid diagrams"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom professional styles for the PDF"""
        
        # Title page style
        self.styles.add(ParagraphStyle(
            name='DocumentTitle',
            parent=self.styles['Title'],
            fontSize=28,
            spaceAfter=30,
            spaceBefore=50,
            textColor=HexColor('#1a1a1a'),
            fontName='Helvetica-Bold',
            alignment=TA_CENTER,
            leading=34
        ))
        
        self.styles.add(ParagraphStyle(
            name='Subtitle',
            parent=self.styles['Normal'],
            fontSize=16,
            spaceAfter=40,
            textColor=HexColor('#666666'),
            fontName='Helvetica',
            alignment=TA_CENTER,
            leading=20
        ))
        
        # Enhanced heading styles with better spacing and colors
        self.styles.add(ParagraphStyle(
            name='CustomHeading1',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=16,
            spaceBefore=20,
            textColor=HexColor('#22D3EE'),
            fontName='Helvetica-Bold',
            leftIndent=0,
            borderWidth=0,
            borderPadding=0,
            leading=28
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomHeading2', 
            parent=self.styles['Heading2'],
            fontSize=18,
            spaceAfter=12,
            spaceBefore=16,
            textColor=HexColor('#2d3748'),
            fontName='Helvetica-Bold',
            leftIndent=0,
            leading=22
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomHeading3',
            parent=self.styles['Heading3'],
            fontSize=14,
            spaceAfter=8,
            spaceBefore=12,
            textColor=HexColor('#4a5568'),
            fontName='Helvetica-Bold',
            leftIndent=0,
            leading=18
        ))
        
        # Enhanced body text
        self.styles.add(ParagraphStyle(
            name='Body',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=8,
            textColor=HexColor('#2d3748'),
            fontName='Helvetica',
            alignment=TA_JUSTIFY,
            leading=14,
            leftIndent=0,
            rightIndent=0
        ))
        
        # Professional code block style
        self.styles.add(ParagraphStyle(
            name='CodeBlock',
            parent=self.styles['Code'],
            fontSize=9,
            spaceAfter=12,
            spaceBefore=8,
            backgroundColor=HexColor('#f7fafc'),
            borderColor=HexColor('#e2e8f0'),
            borderWidth=1,
            borderPadding=12,
            fontName='Courier-Bold',
            textColor=HexColor('#2d3748'),
            leftIndent=0,
            rightIndent=0,
            leading=11
        ))
        
        # Bullet points
        self.styles.add(ParagraphStyle(
            name='BulletPoint',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=4,
            textColor=HexColor('#2d3748'),
            fontName='Helvetica',
            leftIndent=20,
            bulletIndent=10,
            leading=14
        ))
        
        # Emphasis styles
        self.styles.add(ParagraphStyle(
            name='Emphasis',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=HexColor('#22D3EE'),
            fontName='Helvetica-Bold'
        ))
        
        # Quote style
        self.styles.add(ParagraphStyle(
            name='Quote',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=12,
            spaceBefore=8,
            textColor=HexColor('#4a5568'),
            fontName='Helvetica-Oblique',
            leftIndent=30,
            rightIndent=30,
            borderColor=HexColor('#22D3EE'),
            borderWidth=0,
            borderPadding=0,
            leading=14
        ))
    
    def generate_pdf(self, markdown_content: str, filename: str = "technical_document.pdf", session_id: str = None) -> BytesIO:
        """Generate professional PDF from markdown content with enhanced styling"""
        logger.info("Starting enhanced PDF generation")
        
        try:
            # Create a BytesIO buffer for the PDF
            buffer = BytesIO()
            
            # Create PDF document with custom canvas for headers/footers
            doc = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=72,
                leftMargin=72,
                topMargin=90,  # More space for header
                bottomMargin=72,  # More space for footer
                title="Technical Design Document",
                author="MiddleWare"
            )
            
            # Build the story (content)
            story = []
            
            # Add professional title page
            story.extend(self._create_title_page())
            story.append(PageBreak())
            
            # Add dynamic table of contents based on actual content
            story.extend(self._create_dynamic_toc(markdown_content))
            story.append(PageBreak())
            
            # Process markdown content with enhanced styling
            story.extend(self._process_markdown_content(markdown_content, session_id))
            
            # Build PDF with custom canvas
            doc.build(story, canvasmaker=HeaderFooterCanvas)
            
            # Get PDF data
            pdf_data = buffer.getvalue()
            buffer.close()
            
            logger.info("Enhanced PDF generation completed successfully")
            return BytesIO(pdf_data)
            
        except Exception as e:
            logger.error(f"Error generating enhanced PDF: {e}")
            raise
    
    def _create_title_page(self) -> list:
        """Create a professional title page"""
        title_elements = []
        
        # Add some top spacing
        title_elements.append(Spacer(1, 100))
        
        # Main title with enhanced styling
        title_elements.append(Paragraph("Technical Design Document", self.styles['DocumentTitle']))
        
        # Subtitle
        title_elements.append(Paragraph("Comprehensive System Architecture & Implementation Guide", self.styles['Subtitle']))
        
        # Add more spacing
        title_elements.append(Spacer(1, 80))
        
        # Add a professional info table
        info_data = [
            ['Document Type:', 'Technical Specification'],
            ['Generated By:', 'MiddleWare Assistant'],
            ['Date:', datetime.now().strftime('%B %d, %Y')],
            ['Version:', '1.0.0'],
        ]
        
        info_table = Table(info_data, colWidths=[2*inch, 3*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('TEXTCOLOR', (0, 0), (0, -1), HexColor('#4a5568')),
            ('TEXTCOLOR', (1, 0), (1, -1), HexColor('#2d3748')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        title_elements.append(info_table)
        title_elements.append(Spacer(1, 60))
        
        # Add a stylish footer note
        footer_note = Paragraph(
            "This document contains technical specifications and architectural details "
            "generated by advanced AI analysis. All diagrams and code examples are "
            "production-ready and follow industry best practices.",
            self.styles['Quote']
        )
        title_elements.append(footer_note)
        
        return title_elements
    
    def _create_dynamic_toc(self, content: str) -> list:
        """Create dynamic table of contents based on actual content"""
        toc_elements = []
        
        # Parse headings from the content
        parser = get_markdown_parser()
        headings = parser.extract_headings(content)
        
        logger.info(f"Found {len(headings)} headings in content for TOC")
        
        if not headings:
            # Fallback to placeholder if no headings found
            logger.warning("No headings found in content, using TOC placeholder")
            return self._create_toc_placeholder()
        
        toc_elements.append(Paragraph("Table of Contents", self.styles['CustomHeading1']))
        toc_elements.append(Spacer(1, 20))
        
        # Create TOC entries from actual headings
        page_counter = 3  # Start from page 3 (after title and TOC pages)
        
        for i, heading in enumerate(headings):
            # Skip main document title if it looks like a title
            if (heading['level'] == 1 and 
                any(word in heading['title'].lower() for word in ['technical', 'design', 'document', 'title'])):
                logger.info(f"Skipping main title heading: {heading['title']}")
                continue
            
            # Create indentation based on heading level
            indent_level = max(0, heading['level'] - 1)
            
            # Format TOC entry with proper numbering and page reference
            page_ref = str(page_counter + (i // 3))  # Rough page estimation
            
            # Create title with proper length
            title = heading['title']
            if len(title) > 45:
                title = title[:42] + "..."
            
            # Calculate dots for alignment
            base_length = len(title) + len(page_ref) + (indent_level * 2)
            dots_needed = max(3, 55 - base_length)
            dots = "." * dots_needed
            
            # Create TOC entry with indentation
            indent_spaces = "  " * indent_level
            toc_entry = f"{indent_spaces}{title} {dots} {page_ref}"
            
            # Use appropriate style based on heading level
            if heading['level'] == 1:
                style_name = 'TOCLevel1'
                if style_name not in [s.name for s in self.styles.byName.values()]:
                    self.styles.add(ParagraphStyle(
                        name=style_name,
                        parent=self.styles['Normal'],
                        fontSize=11,
                        fontName='Helvetica-Bold',
                        textColor=HexColor('#2d3748'),
                        spaceAfter=4
                    ))
                style = self.styles[style_name]
            elif heading['level'] == 2:
                style_name = 'TOCLevel2'
                if style_name not in [s.name for s in self.styles.byName.values()]:
                    self.styles.add(ParagraphStyle(
                        name=style_name,
                        parent=self.styles['Normal'],
                        fontSize=10,
                        leftIndent=15,
                        textColor=HexColor('#4a5568'),
                        spaceAfter=3
                    ))
                style = self.styles[style_name]
            else:
                style_name = f'TOCLevel{heading["level"]}'
                if style_name not in [s.name for s in self.styles.byName.values()]:
                    self.styles.add(ParagraphStyle(
                        name=style_name,
                        parent=self.styles['Normal'],
                        fontSize=9,
                        leftIndent=15 * (heading['level'] - 1),
                        textColor=HexColor('#666666'),
                        spaceAfter=2
                    ))
                style = self.styles[style_name]
            
            toc_elements.append(Paragraph(toc_entry, style))
            toc_elements.append(Spacer(1, 4))
        
        logger.info(f"Generated TOC with {len(toc_elements)} elements")
        return toc_elements
    
    def _create_toc_placeholder(self) -> list:
        """Create table of contents placeholder when dynamic generation fails"""
        toc_elements = []
        
        toc_elements.append(Paragraph("Table of Contents", self.styles['CustomHeading1']))
        toc_elements.append(Spacer(1, 20))
        
        # Add some sample TOC entries (this could be enhanced to be dynamic)
        toc_entries = [
            "1. Project Overview ......................................................... 3",
            "2. System Architecture .................................................. 5", 
            "3. Technical Implementation ........................................ 8",
            "4. Data Flow Diagrams ................................................ 12",
            "5. Code Examples ........................................................ 15",
            "6. Deployment Strategy ............................................... 18"
        ]
        
        for entry in toc_entries:
            toc_elements.append(Paragraph(entry, self.styles['Normal']))
            toc_elements.append(Spacer(1, 8))
        
        return toc_elements
    
    def _process_markdown_content(self, content: str, session_id: str = None) -> list:
        """Process markdown content with enhanced styling and proper Mermaid rendering"""
        story = []
        
        # Clean markdown content first for better PDF rendering
        parser = get_markdown_parser()
        content = parser.clean_markdown_for_pdf(content)
        print(content)
        # Extract Mermaid diagrams first with better pattern matching
        mermaid_pattern = r'<code></code>`mermaid\n(.*?)\n<code></code>`'
        mermaid_matches = re.findall(mermaid_pattern, content, re.DOTALL)
        
        logger.info(f"Found {len(mermaid_matches)} Mermaid diagrams in content")
        
        # DEBUG: Test the first Mermaid diagram if any
       
    
        # Replace mermaid blocks with numbered placeholders
        mermaid_replacements = {}
        for i, match in enumerate(mermaid_matches):
            placeholder = f'[MERMAID_DIAGRAM_{i}]'
            mermaid_replacements[placeholder] = match
            content = content.replace(f'<code></code>`mermaid\n{match}\n<code></code>`', placeholder, 1)
            logger.info(f"Created placeholder {placeholder} for Mermaid diagram {i+1}")
        
        # Parse and handle tables first
        tables = parser.parse_markdown_tables(content)
        table_replacements = {}
        for i, table in enumerate(tables):
            placeholder = f'[TABLE_{i}]'
            table_replacements[placeholder] = table
            # Remove original table markdown from content
            table_text = self._reconstruct_table_text(table)
            content = content.replace(table_text, placeholder, 1)
        
        # Split content by double newlines for paragraph processing
        sections = content.split('\n\n')
        
        in_code_block = False
        code_block_content = []
        
        for section in sections:
            section = section.strip()
            
            # Check for table placeholders
            if section in table_replacements:
                table_element = self._create_pdf_table(table_replacements[section])
                if table_element:
                    story.append(Spacer(1, 12))
                    story.append(table_element)
                    story.append(Spacer(1, 12))
                continue
            
            # Check for Mermaid diagram placeholders
            if section in mermaid_replacements:
                logger.info(f"Processing Mermaid diagram placeholder: {section}")
                diagram_img = self._generate_mermaid_image(mermaid_replacements[section], session_id)
                if diagram_img:
                    story.append(Spacer(1, 16))
                    # Add diagram title
                    story.append(Paragraph("System Architecture Diagram", self.styles['CustomHeading3']))
                    story.append(Spacer(1, 8))
                    story.append(diagram_img)
                    story.append(Spacer(1, 16))
                    logger.info("✅ Mermaid diagram added to PDF successfully")
                else:
                    # Fallback to text placeholder if image generation failed
                    logger.warning("❌ Mermaid image generation failed, using text placeholder")
                    text_placeholder = f"[Mermaid Diagram]\n{mermaid_replacements[section][:200]}..."
                    story.append(Spacer(1, 12))
                    story.append(Paragraph(text_placeholder, self.styles['CodeBlock']))
                    story.append(Spacer(1, 12))
                continue
            
            # Handle code blocks
            if section.startswith('```') and section.endswith('```'):
                # Single section code block
                lines = section.split('\n')
                if len(lines) >= 2:
                    language = lines[0][3:].strip()
                    code_content = '\n'.join(lines[1:-1])
                    if code_content.strip():
                        story.append(Spacer(1, 8))
                        story.append(Paragraph(code_content, self.styles['CodeBlock']))
                        story.append(Spacer(1, 8))
                continue
            elif section.startswith('```'):
                in_code_block = True
                code_block_content = [section[3:]]
                continue
            elif section.endswith('```'):
                in_code_block = False
                code_block_content.append(section[:-3])
                code_text = '\n'.join(code_block_content).strip()
                if code_text:
                    story.append(Spacer(1, 8))
                    story.append(Paragraph(code_text, self.styles['CodeBlock']))
                    story.append(Spacer(1, 8))
                code_block_content = []
                continue
            elif in_code_block:
                code_block_content.append(section)
                continue
            
            if not section:
                continue
            
            # Process lines within the section
            lines = section.split('\n')
            self._process_markdown_lines(lines, story)
        
        return story
    
    def _process_markdown_lines(self, lines: List[str], story: List) -> None:
        """Process individual lines of markdown content"""
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            if not line:
                i += 1
                continue
                
            # Headers with enhanced styling
            if line.startswith('# '):
                story.append(Spacer(1, 20))
                title = self._process_inline_markdown(line[2:])
                story.append(Paragraph(title, self.styles['CustomHeading1']))
                story.append(Spacer(1, 16))
            elif line.startswith('## '):
                story.append(Spacer(1, 16))
                title = self._process_inline_markdown(line[3:])
                story.append(Paragraph(title, self.styles['CustomHeading2']))
                story.append(Spacer(1, 12))
            elif line.startswith('### '):
                story.append(Spacer(1, 12))
                title = self._process_inline_markdown(line[4:])
                story.append(Paragraph(title, self.styles['CustomHeading3']))
                story.append(Spacer(1, 8))
            elif line.startswith('#### '):
                story.append(Spacer(1, 10))
                title = self._process_inline_markdown(line[5:])
                heading4_style = ParagraphStyle(
                    name='CustomHeading4',
                    parent=self.styles['CustomHeading3'],
                    fontSize=12,
                    spaceAfter=6,
                    spaceBefore=8
                )
                story.append(Paragraph(title, heading4_style))
                story.append(Spacer(1, 6))
            # Enhanced bullet points with better formatting
            elif line.startswith('- ') or line.startswith('* '):
                bullet_text = self._process_inline_markdown(line[2:])
                # Handle nested bullets
                if line.startswith('  - ') or line.startswith('  * '):
                    bullet_text = f"    ◦ {self._process_inline_markdown(line[4:])}"
                else:
                    bullet_text = f"• {bullet_text}"
                story.append(Paragraph(bullet_text, self.styles['BulletPoint']))
            # Numbered lists
            elif re.match(r'^\d+\.\s', line):
                formatted_line = self._process_inline_markdown(line)
                story.append(Paragraph(formatted_line, self.styles['BulletPoint']))
            # Regular paragraphs
            else:
                if line and not line.startswith('```'):
                    formatted_line = self._process_inline_markdown(line)
                    story.append(Paragraph(formatted_line, self.styles['Body']))
                    story.append(Spacer(1, 4))
            
            i += 1
    
    def _process_inline_markdown(self, text: str) -> str:
        """Process inline markdown formatting (bold, italic, code, links)"""
        # Handle bold text (**text**)
        text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
        
        # Handle italic text (*text*)
        text = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'<i>\1</i>', text)
        
        # Handle inline code (`code`)
        text = re.sub(r'`([^`]+)`', r'<font name="Courier"><b>\1</b></font>', text)
        
        # Handle links [text](url) - just show the text for PDF
        text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
        
        # Handle strikethrough (~~text~~)
        text = re.sub(r'~~(.+?)~~', r'<strike>\1</strike>', text)
        
        return text
    
    def _reconstruct_table_text(self, table_data: Dict) -> str:
        """Reconstruct original table markdown text for replacement"""
        lines = []
        
        # Add header row
        if table_data['headers']:
            header_line = '| ' + ' | '.join(table_data['headers']) + ' |'
            lines.append(header_line)
            
            # Add separator
            separator_cells = ['---' for _ in table_data['headers']]
            separator_line = '| ' + ' | '.join(separator_cells) + ' |'
            lines.append(separator_line)
        
        # Add data rows
        for row in table_data['rows']:
            row_line = '| ' + ' | '.join(row) + ' |'
            lines.append(row_line)
        
        return '\n'.join(lines)
    
    def _create_pdf_table(self, table_data: Dict) -> Optional[Table]:
        """Create a properly formatted ReportLab Table from markdown table data"""
        try:
            if not table_data['headers'] or not table_data['rows']:
                return None
            
            # Prepare table data for ReportLab with Paragraph objects for text wrapping
            pdf_table_data = []
            
            # Create a style for table cell text that enables wrapping
            cell_style = ParagraphStyle(
                name='TableCell',
                parent=self.styles['Normal'],
                fontSize=9,
                fontName='Helvetica',
                leading=11,
                alignment=TA_LEFT,
                wordWrap='LTR'
            )
            
            # Create a style for table header text
            header_style = ParagraphStyle(
                name='TableHeader',
                parent=self.styles['Normal'],
                fontSize=10,
                fontName='Helvetica-Bold',
                leading=12,
                alignment=TA_CENTER,
                textColor=HexColor('#ffffff'),
                wordWrap='LTR'
            )
            
            # Add headers as Paragraph objects for text wrapping
            headers = []
            for cell in table_data['headers']:
                processed_cell = self._process_inline_markdown(cell)
                headers.append(Paragraph(processed_cell, header_style))
            pdf_table_data.append(headers)
            
            # Add data rows as Paragraph objects for text wrapping
            for row in table_data['rows']:
                formatted_row = []
                for cell in row:
                    processed_cell = self._process_inline_markdown(cell)
                    formatted_row.append(Paragraph(processed_cell, cell_style))
                
                # Ensure row has same number of columns as header
                while len(formatted_row) < len(headers):
                    formatted_row.append(Paragraph('', cell_style))
                formatted_row = formatted_row[:len(headers)]  # Trim extra columns
                pdf_table_data.append(formatted_row)
            
            # Calculate column widths
            num_cols = len(headers)
            available_width = 6.5 * inch  # Leave margins
            col_width = available_width / num_cols
            
            # Create the table
            table = Table(pdf_table_data, colWidths=[col_width] * num_cols)
            
            # Apply professional table styling
            table.setStyle(TableStyle([
                # Header row styling
                ('BACKGROUND', (0, 0), (-1, 0), HexColor('#22D3EE')),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
                
                # Data rows styling
                ('BACKGROUND', (0, 1), (-1, -1), HexColor('#f8f9fa')),
                ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 1), (-1, -1), 'TOP'),
                
                # Grid and borders
                ('GRID', (0, 0), (-1, -1), 1, HexColor('#e2e8f0')),
                
                # Padding
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                
                # Alternating row colors for better readability
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#ffffff'), HexColor('#f8f9fa')]),
            ]))
            
            return table
            
        except Exception as e:
            logger.error(f"Error creating PDF table: {e}")
            return None
    
    def _generate_mermaid_image(self, mermaid_code: str, session_id: str = None) -> Optional[Image]:
        """Generate PNG image from Mermaid diagram code using mmdc CLI - simplified approach"""
        try:
            logger.info("Generating Mermaid diagram image using mmdc CLI")
            
            if not MMDC_AVAILABLE:
                logger.warning("mmdc CLI not available, showing diagram as text")
                return None
            
            # Clean up the mermaid code
            mermaid_code = mermaid_code.strip()
            
            # Create temporary file for mermaid code
            with tempfile.NamedTemporaryFile(mode='w', suffix='.mmd', delete=False) as f:
                f.write(mermaid_code)
                mermaid_file = f.name
            
            # Output image path
            output_path = mermaid_file.replace('.mmd', '.png')
            
            try:
                logger.info(f"Generating PNG from {mermaid_file} to {output_path}")
                
                # Use mermaid-cli to generate image with optimized settings
                # Ensure Puppeteer environment variables are passed to subprocess
                env = os.environ.copy()
                env.update({
                    'PUPPETEER_SKIP_CHROMIUM_DOWNLOAD': 'true',
                    'PUPPETEER_EXECUTABLE_PATH': '/usr/bin/chromium-browser',
                    'CHROME_BIN': '/usr/bin/chromium-browser',
                    'CHROMIUM_FLAGS': '--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu --disable-extensions',
                    'PUPPETEER_ARGS': '--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu --disable-extensions',
                    'HOME': '/tmp',
                    'TMPDIR': '/tmp'
                })
                
                # Try mmdc with config files - check both locations
                mmdc_config_path = '/app/.mmdc' if os.path.exists('/app/.mmdc') else None
                puppeteer_config_path = '/app/puppeteer-config.json' if os.path.exists('/app/puppeteer-config.json') else None
                
                cmd_args = [
                    'mmdc',
                    '-i', mermaid_file,
                    '-o', output_path,
                    '-t', 'neutral', 
                    '-b', 'white',
                    '--width', '1200',
                    '--height', '900'
                ]
                
                # Try with mmdc config first (includes puppeteer settings)
                if mmdc_config_path:
                    cmd_args.extend(['--configFile', mmdc_config_path])
                    logger.info(f"Using mmdc config file: {mmdc_config_path}")
                elif puppeteer_config_path:
                    cmd_args.extend(['-p', puppeteer_config_path])
                    logger.info(f"Using puppeteer config file: {puppeteer_config_path}")
                else:
                    logger.warning("No config files found, using environment variables and defaults")
                
                result = subprocess.run(cmd_args, capture_output=True, text=True, timeout=60, env=env)
                
                if result.returncode == 0:
                    logger.info(f"Successfully generated Mermaid image: {output_path}")
                    
                    # Verify the file was created and has content
                    if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                        # Process the image for PDF inclusion
                        img = self._process_mermaid_image_simple(output_path)
                        return img
                    else:
                        logger.error(f"Generated PNG file is missing or empty: {output_path}")
                        return None
                else:
                    logger.error(f"mmdc failed with return code {result.returncode}")
                    logger.error(f"stderr: {result.stderr}")
                    logger.error(f"stdout: {result.stdout}")
                    
                    # Try alternative mmdc command with minimal options and explicit Puppeteer args
                    logger.info("Trying mmdc with explicit Puppeteer arguments...")
                    
                    # Create a temporary puppeteer config for this attempt
                    temp_config = {
                        "headless": "new",
                        "args": [
                            "--no-sandbox",
                            "--disable-setuid-sandbox", 
                            "--disable-dev-shm-usage",
                            "--disable-gpu",
                            "--disable-extensions",
                            "--disable-web-security",
                            "--allow-running-insecure-content",
                            "--disable-background-timer-throttling",
                            "--disable-backgrounding-occluded-windows",
                            "--disable-renderer-backgrounding"
                        ],
                        "executablePath": "/usr/bin/chromium-browser"
                    }
                    
                    # Write temporary config
                    temp_config_path = '/tmp/temp-puppeteer-config.json'
                    with open(temp_config_path, 'w') as f:
                        json.dump(temp_config, f)
                    
                    try:
                        result2 = subprocess.run([
                            'mmdc',
                            '-i', mermaid_file,
                            '-o', output_path,
                            '-b', 'white',
                            '-p', temp_config_path
                        ], capture_output=True, text=True, timeout=60, env=env)
                        
                        if result2.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                            logger.info(f"Successfully generated Mermaid image with explicit config: {output_path}")
                            img = self._process_mermaid_image_simple(output_path)
                            return img
                        else:
                            logger.error(f"Explicit config mmdc failed. stderr: {result2.stderr}, stdout: {result2.stdout}")
                            
                            # Final fallback - try with no config at all
                            logger.info("Final attempt with no config files...")
                            result3 = subprocess.run([
                                'mmdc', '-i', mermaid_file, '-o', output_path
                            ], capture_output=True, text=True, timeout=30, env=env)
                            
                            if result3.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                                logger.info(f"Successfully generated Mermaid image with no config: {output_path}")
                                img = self._process_mermaid_image_simple(output_path)
                                return img
                            else:
                                logger.error(f"All mmdc methods failed. Final stderr: {result3.stderr}")
                                logger.warning("All mmdc attempts failed, returning text placeholder")
                                return None
                    finally:
                        # Clean up temp config
                        try:
                            os.unlink(temp_config_path)
                        except:
                            pass
                    
            except subprocess.TimeoutExpired:
                logger.warning("mmdc command timed out after 45 seconds")
                return None
            except subprocess.CalledProcessError as e:
                logger.error(f"mmdc command failed: {e}")
                return None
            except Exception as e:
                logger.error(f"Unexpected error running mmdc: {e}")
                return None
            finally:
                # Clean up temporary files
                try:
                    if os.path.exists(mermaid_file):
                        os.unlink(mermaid_file)
                    if os.path.exists(output_path):
                        # Don't delete yet - we need it for image processing
                        pass
                except Exception as cleanup_error:
                    logger.warning(f"Failed to clean up temp file: {cleanup_error}")
                    
        except Exception as e:
            logger.error(f"Error in Mermaid generation: {e}")
            return None

    def _get_png_dimensions(self, image_path: str) -> Tuple[int, int]:
        """Get PNG image dimensions using native Python (no PIL required)"""
        try:
            with open(image_path, 'rb') as f:
                # PNG signature
                if f.read(8) != b'\x89PNG\r\n\x1a\n':
                    raise ValueError("Not a valid PNG file")
                
                # Read IHDR chunk
                f.read(4)  # chunk length
                if f.read(4) != b'IHDR':
                    raise ValueError("IHDR chunk not found")
                
                # Width and height are the first 8 bytes of IHDR data
                width, height = struct.unpack('>II', f.read(8))
                return width, height
        except Exception as e:
            logger.warning(f"Could not read PNG dimensions: {e}")
            # Return default dimensions if we can't read them
            return 800, 600

    def _process_mermaid_image_simple(self, image_path: str) -> Optional[Image]:
        """Simplified image processing for Mermaid PNG files"""
        try:
            # Verify file exists and has content
            if not os.path.exists(image_path) or os.path.getsize(image_path) == 0:
                logger.warning(f"Image file does not exist or is empty: {image_path}")
                return None
            
            # Validate that it's a valid image file
            image_type = imghdr.what(image_path)
            if image_type not in ['png', 'jpeg', 'gif']:
                logger.warning(f"Unsupported image format: {image_type}")
                return None
            
            logger.info(f"Processing Mermaid image: {image_path} (size: {os.path.getsize(image_path)} bytes)")
            
            # Load image data into memory first
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            # Create BytesIO from the data
            image_buffer = BytesIO(image_data)
            
            try:
                # Get image dimensions for PNG files
                if image_type == 'png':
                    original_width, original_height = self._get_png_dimensions(image_path)
                    logger.info(f"Original image dimensions: {original_width}x{original_height}")
                else:
                    # For other formats, use default dimensions
                    original_width, original_height = 800, 600
                    logger.info(f"Using default dimensions for {image_type} image: {original_width}x{original_height}")
                
                # Calculate optimal size for PDF (maintain aspect ratio)
                # Target dimensions for PDF
                max_width_inches = 6.0 * inch
                max_height_inches = 4.5 * inch
                
                # Calculate scaling to fit within max dimensions
                width_scale = max_width_inches / (original_width / 96.0)  # Assuming 96 DPI
                height_scale = max_height_inches / (original_height / 96.0)
                scale = min(width_scale, height_scale, 1.0)  # Don't scale up
                
                # Calculate final dimensions
                final_width = (original_width / 96.0) * scale
                final_height = (original_height / 96.0) * scale
                
                # Ensure minimum readable size
                min_width = 3.0 * inch
                min_height = 2.0 * inch
                if final_width < min_width:
                    scale_factor = min_width / final_width
                    final_width = min_width
                    final_height = final_height * scale_factor
                if final_height < min_height:
                    scale_factor = min_height / final_height
                    final_height = min_height  
                    final_width = final_width * scale_factor
                
                logger.info(f"Final image dimensions: {final_width:.2f} x {final_height:.2f} inches")
        
            except Exception as dimension_error:
                logger.warning(f"Image dimension calculation failed: {dimension_error}, using default size")
                final_width = 5.0 * inch
                final_height = 3.5 * inch
            
            # Reset buffer position
            image_buffer.seek(0)
            
            # Create ReportLab Image object directly from BytesIO
            try:
                img = Image(image_buffer, width=final_width, height=final_height)
                logger.info("Successfully created ReportLab Image object")
                
                # Clean up the temporary file now that we have the image in memory
                try:
                    os.unlink(image_path)
                except Exception:
                    pass  # Ignore cleanup errors
                
                return img
                
            except Exception as img_error:
                logger.error(f"Failed to create ReportLab Image: {img_error}")
                return None
                
        except Exception as e:
            logger.error(f"Error processing Mermaid image: {e}")
            return None
        finally:
            # Ensure cleanup happens
            try:
                if os.path.exists(image_path):
                    os.unlink(image_path)
            except Exception:
                pass