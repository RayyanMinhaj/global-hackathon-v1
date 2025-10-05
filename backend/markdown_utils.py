"""
Markdown utilities for parsing content and generating table of contents
"""

import re
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class MarkdownParser:
    """Parse markdown content and extract structure for TOC generation"""
    
    def __init__(self):
        # Regex patterns for markdown elements
        self.heading_pattern = re.compile(r'^(#{1,6})\s+(.+)$', re.MULTILINE)
        self.table_pattern = re.compile(r'^\|(.+\|)+\s*$', re.MULTILINE)
        self.table_separator_pattern = re.compile(r'^\|[\s\-\|:]+\|?\s*$', re.MULTILINE)
        self.mermaid_pattern = re.compile(r'```mermaid\n(.*?)\n```', re.DOTALL)
        self.code_block_pattern = re.compile(r'```(\w+)?\n(.*?)\n```', re.DOTALL)
        
    def extract_headings(self, content: str) -> List[Dict[str, any]]:
        """Extract all headings from markdown content with their levels and positions"""
        headings = []
        
        for match in self.heading_pattern.finditer(content):
            level = len(match.group(1))  # Count the # symbols
            title = match.group(2).strip()
            position = match.start()
            
            # Create anchor-friendly ID
            heading_id = self._create_heading_id(title)
            
            headings.append({
                'level': level,
                'title': title,
                'id': heading_id,
                'position': position
            })
        
        return headings
    
    def generate_toc_markdown(self, content: str) -> str:
        """Generate table of contents in markdown format"""
        headings = self.extract_headings(content)
        
        if not headings:
            return ""
        
        toc_lines = ["# Table of Contents\n"]
        
        for heading in headings:
            # Skip the main title if it exists
            if heading['level'] == 1 and any(word in heading['title'].lower() 
                                           for word in ['technical', 'design', 'document', 'title']):
                continue
            
            # Create indentation based on heading level (start from level 1)
            indent = "  " * (heading['level'] - 1)
            
            # Create markdown link
            toc_line = f"{indent}- [{heading['title']}](#{heading['id']})"
            toc_lines.append(toc_line)
        
        return "\n".join(toc_lines) + "\n"
    
    def add_toc_to_content(self, content: str, position: str = "after_title") -> str:
        """Add table of contents to markdown content at specified position"""
        toc = self.generate_toc_markdown(content)
        
        if not toc:
            return content
        
        if position == "after_title":
            # Find the first heading and insert TOC after it
            lines = content.split('\n')
            insert_position = 0
            
            for i, line in enumerate(lines):
                if line.strip().startswith('#'):
                    # Found first heading, insert TOC after it (with some spacing)
                    insert_position = i + 1
                    break
            
            # Insert TOC with proper spacing
            lines.insert(insert_position, "")
            lines.insert(insert_position + 1, toc.strip())
            lines.insert(insert_position + 2, "")
            
            return '\n'.join(lines)
        
        elif position == "beginning":
            return toc + "\n" + content
        
        else:
            return content + "\n" + toc
    
    def parse_markdown_tables(self, content: str) -> List[Dict[str, any]]:
        """Parse markdown tables and extract structured data"""
        tables = []
        lines = content.split('\n')
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Check if this line starts a table
            if self._is_table_row(line):
                table_data = []
                headers = self._parse_table_row(line)
                table_data.append(headers)
                i += 1
                
                # Skip separator row if present
                if i < len(lines) and self._is_table_separator(lines[i]):
                    i += 1
                
                # Parse table rows
                while i < len(lines) and self._is_table_row(lines[i].strip()):
                    row = self._parse_table_row(lines[i].strip())
                    table_data.append(row)
                    i += 1
                
                if len(table_data) >= 2:  # Has headers and at least one row
                    tables.append({
                        'headers': table_data[0],
                        'rows': table_data[1:],
                        'raw_data': table_data
                    })
            else:
                i += 1
        
        return tables
    
    def _create_heading_id(self, title: str) -> str:
        """Create a URL-friendly ID from heading title"""
        # Convert to lowercase and replace spaces with hyphens
        heading_id = title.lower()
        
        # Remove special characters except hyphens and alphanumeric
        heading_id = re.sub(r'[^a-z0-9\s\-]', '', heading_id)
        
        # Replace spaces with hyphens
        heading_id = re.sub(r'\s+', '-', heading_id)
        
        # Remove multiple consecutive hyphens
        heading_id = re.sub(r'-+', '-', heading_id)
        
        # Remove leading/trailing hyphens
        heading_id = heading_id.strip('-')
        
        return heading_id or 'heading'
    
    def _is_table_row(self, line: str) -> bool:
        """Check if a line is a markdown table row"""
        return line.startswith('|') and line.endswith('|') and '|' in line[1:-1]
    
    def _is_table_separator(self, line: str) -> bool:
        """Check if a line is a markdown table separator (header separator)"""
        line = line.strip()
        if not (line.startswith('|') and line.endswith('|')):
            return False
        
        # Check if it contains only |, -, :, and whitespace
        content = line[1:-1]  # Remove outer pipes
        cells = content.split('|')
        
        for cell in cells:
            cell = cell.strip()
            if not re.match(r'^[\-:]+$', cell):
                return False
        
        return True
    
    def _parse_table_row(self, line: str) -> List[str]:
        """Parse a table row and return cell contents"""
        # Remove outer pipes and split by |
        if line.startswith('|'):
            line = line[1:]
        if line.endswith('|'):
            line = line[:-1]
        
        cells = [cell.strip() for cell in line.split('|')]
        return cells
    
    def clean_markdown_for_pdf(self, content: str) -> str:
        """Clean markdown content for better PDF rendering"""
        lines = content.split('\n')
        cleaned_lines = []
        
        in_table = False
        table_buffer = []
        
        for line in lines:
            stripped_line = line.strip()
            
            # Handle tables specially
            if self._is_table_row(stripped_line):
                if not in_table:
                    in_table = True
                    table_buffer = []
                table_buffer.append(line)
            elif self._is_table_separator(stripped_line):
                if in_table:
                    table_buffer.append(line)
            else:
                # End of table or not a table line
                if in_table:
                    # Process the table buffer
                    cleaned_table = self._clean_table_markdown(table_buffer)
                    cleaned_lines.extend(cleaned_table)
                    in_table = False
                    table_buffer = []
                
                # Clean other markdown elements
                cleaned_line = self._clean_markdown_line(line)
                cleaned_lines.append(cleaned_line)
        
        # Handle any remaining table
        if in_table and table_buffer:
            cleaned_table = self._clean_table_markdown(table_buffer)
            cleaned_lines.extend(cleaned_table)
        
        return '\n'.join(cleaned_lines)
    
    def _clean_table_markdown(self, table_lines: List[str]) -> List[str]:
        """Clean markdown table syntax for better PDF rendering"""
        if not table_lines:
            return []
        
        # Parse the table
        table_data = []
        has_separator = False
        
        for line in table_lines:
            if self._is_table_separator(line.strip()):
                has_separator = True
                continue
            
            if self._is_table_row(line.strip()):
                row = self._parse_table_row(line.strip())
                table_data.append(row)
        
        if not table_data:
            return table_lines
        
        # Create clean table representation
        cleaned_lines = []
        
        # Add headers
        if table_data:
            header_row = table_data[0]
            cleaned_lines.append('| ' + ' | '.join(header_row) + ' |')
            
            # Add separator
            separator_cells = ['---' for _ in header_row]
            cleaned_lines.append('| ' + ' | '.join(separator_cells) + ' |')
            
            # Add data rows
            for row in table_data[1:]:
                # Ensure row has same number of columns as header
                while len(row) < len(header_row):
                    row.append('')
                row = row[:len(header_row)]  # Trim extra columns
                
                cleaned_lines.append('| ' + ' | '.join(row) + ' |')
        
        return cleaned_lines
    
    def _clean_markdown_line(self, line: str) -> str:
        """Clean individual markdown line"""
        # Fix bold markdown
        line = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line)
        
        # Fix italic markdown
        line = re.sub(r'\*(.*?)\*', r'<i>\1</i>', line)
        
        # Fix inline code
        line = re.sub(r'`(.*?)`', r'<code>\1</code>', line)
        
        return line


# Global parser instance
_markdown_parser = None

def get_markdown_parser() -> MarkdownParser:
    """Get or create global markdown parser instance"""
    global _markdown_parser
    if _markdown_parser is None:
        _markdown_parser = MarkdownParser()
    return _markdown_parser