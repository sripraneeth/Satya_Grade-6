import os
import re
from pathlib import Path
from typing import Dict, List
import markdown

class ContentScanner:
    """Scans the Subjects folder and extracts structured content from markdown files."""

    def __init__(self, subjects_path: str = None):
        if subjects_path is None:
            # Default to Subjects folder in parent directory
            self.subjects_path = Path(__file__).parent.parent.parent / "Subjects"
        else:
            self.subjects_path = Path(subjects_path)

    def scan_subjects(self) -> Dict:
        """Scan all subjects and topics in the Subjects folder."""
        subjects = {}

        if not self.subjects_path.exists():
            return subjects

        for subject_folder in self.subjects_path.iterdir():
            if subject_folder.is_dir():
                subject_name = subject_folder.name
                subjects[subject_name] = self._scan_subject_folder(subject_folder)

        return subjects

    def _scan_subject_folder(self, folder: Path) -> List[Dict]:
        """Scan a subject folder for markdown files."""
        topics = []

        for file in folder.iterdir():
            if file.suffix.lower() in ['.md', '.markdown']:
                topic_data = self._parse_markdown_file(file)
                if topic_data:
                    topics.append(topic_data)

        return topics

    def _parse_markdown_file(self, file_path: Path) -> Dict:
        """Parse a markdown file and extract structured content."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract title (first H1)
            title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
            title = title_match.group(1) if title_match else file_path.stem

            # Parse sections
            sections = self._parse_sections(content)

            # Extract key terms and vocabulary
            key_terms = self._extract_key_terms(content, sections)

            # Extract quiz questions if present
            quiz_questions = self._extract_quiz_questions(content)

            return {
                'title': title,
                'file_path': str(file_path),
                'content': content,
                'html_content': markdown.markdown(content, extensions=['tables', 'fenced_code']),
                'sections': sections,
                'key_terms': key_terms,
                'quiz_questions': quiz_questions,
                'word_count': len(content.split())
            }
        except Exception as e:
            print(f"Error parsing {file_path}: {e}")
            return None

    def _parse_sections(self, content: str) -> List[Dict]:
        """Extract sections from markdown content."""
        sections = []

        # Split by H2 headers
        section_pattern = r'^##\s+(.+?)$'
        matches = list(re.finditer(section_pattern, content, re.MULTILINE))

        for i, match in enumerate(matches):
            section_title = match.group(1).strip()
            start = match.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(content)
            section_content = content[start:end].strip()

            sections.append({
                'title': section_title,
                'content': section_content,
                'subsections': self._parse_subsections(section_content)
            })

        return sections

    def _parse_subsections(self, content: str) -> List[Dict]:
        """Extract subsections (H3) from section content."""
        subsections = []

        subsection_pattern = r'^###\s+(.+?)$'
        matches = list(re.finditer(subsection_pattern, content, re.MULTILINE))

        for i, match in enumerate(matches):
            subsection_title = match.group(1).strip()
            start = match.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(content)
            subsection_content = content[start:end].strip()

            subsections.append({
                'title': subsection_title,
                'content': subsection_content
            })

        return subsections

    def _extract_key_terms(self, content: str, sections: List[Dict]) -> List[Dict]:
        """Extract key terms and their definitions."""
        key_terms = []

        # Look for bold terms followed by definitions
        # Pattern: **TERM** or ### TERM

        # From H3 subsections (like **SUMERIANS**)
        for section in sections:
            if 'KEY TERMS' in section['title'].upper() or 'VOCABULARY' in section['title'].upper():
                for subsection in section.get('subsections', []):
                    term = subsection['title'].strip('*').strip()
                    definition = subsection['content']
                    key_terms.append({
                        'term': term,
                        'definition': definition
                    })

        # Also extract from bullet points with bold terms
        bold_term_pattern = r'\*\*([^*]+)\*\*[:\s]*([^\n]+)'
        matches = re.findall(bold_term_pattern, content)
        for term, definition in matches:
            if len(definition) > 10:  # Only meaningful definitions
                key_terms.append({
                    'term': term.strip(),
                    'definition': definition.strip()
                })

        return key_terms

    def _extract_quiz_questions(self, content: str) -> List[Dict]:
        """Extract existing quiz questions from the content."""
        quiz_questions = []

        # Look for numbered questions with answers (like "1. Question? **Answer**")
        question_pattern = r'^\d+\.\s+(.+?)\s+\*\*(.+?)\*\*'
        matches = re.findall(question_pattern, content, re.MULTILINE)

        for question, answer in matches:
            quiz_questions.append({
                'question': question.strip(),
                'answer': answer.strip(),
                'source': 'embedded'
            })

        return quiz_questions

    def get_topic_content(self, subject: str, topic_title: str) -> Dict:
        """Get detailed content for a specific topic."""
        subjects = self.scan_subjects()

        if subject in subjects:
            for topic in subjects[subject]:
                if topic['title'] == topic_title:
                    return topic

        return None


if __name__ == "__main__":
    # Test the scanner
    scanner = ContentScanner()
    subjects = scanner.scan_subjects()

    print("Found subjects:", list(subjects.keys()))
    for subject, topics in subjects.items():
        print(f"\n{subject}:")
        for topic in topics:
            print(f"  - {topic['title']} ({len(topic['sections'])} sections, {len(topic['key_terms'])} key terms)")
