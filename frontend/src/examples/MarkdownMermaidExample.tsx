import React from 'react';
import MarkdownMermaidViewer from '../components/MarkdownMermaidViewer';

const MarkdownMermaidExample: React.FC = () => {
  const sampleContent = `# Mermaid Diagram Examples

## 1. Flowchart Example

Here's a simple flowchart:

\`\`\`mermaid
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> A
    C --> E[End]
\`\`\`

## 2. Entity Relationship Diagram

\`\`\`mermaid
erDiagram
    USER {
        int id PK
        string username
        string email
    }
    POST {
        int id PK
        int user_id FK
        string title
        text content
    }
    
    USER ||--o{ POST : creates
\`\`\`

## 3. Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Submit form
    Frontend->>Backend: API request
    Backend->>Database: Query data
    Database-->>Backend: Return results
    Backend-->>Frontend: JSON response
    Frontend-->>User: Display results
\`\`\`

## 4. Regular Markdown Content

This component also renders **regular markdown** content beautifully:

- List item 1
- List item 2
- List item 3

### Code Blocks

\`\`\`javascript
function example() {
  console.log("This is a code block");
  return "Hello World";
}
\`\`\`

> This is a blockquote with some *emphasis* and **strong** text.

### Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Mermaid | ✅ | Working |
| Markdown | ✅ | Working |
| Themes | ✅ | Customizable |
`;

  const customTheme = {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#2563EB',
    background: '#1E293B',
    text: '#F1F5F9',
    border: '#475569',
    code: '#0F172A'
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '2rem' }}>
        MarkdownMermaidViewer Component Example
      </h1>
      
      <MarkdownMermaidViewer 
        content={sampleContent}
        colorTheme={customTheme}
        className="example-viewer"
      />
    </div>
  );
};

export default MarkdownMermaidExample;