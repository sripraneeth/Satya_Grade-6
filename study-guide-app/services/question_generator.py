import re
import random
from typing import List, Dict

class LocalQuestionGenerator:
    """Generates questions from content using pattern matching and templates."""

    def __init__(self):
        self.question_templates = {
            'who': [
                "Who was {entity}?",
                "Who created/founded {entity}?",
                "Who was known for {achievement}?",
                "Who ruled {place}?",
            ],
            'what': [
                "What was {term}?",
                "What is {term}?",
                "What did {entity} accomplish?",
                "What were the main achievements of {entity}?",
                "What was {entity} known for?",
            ],
            'when': [
                "When did {event} occur?",
                "When was {entity} in power?",
                "When did {entity} rule?",
            ],
            'where': [
                "Where was {place} located?",
                "Where did {entity} rule?",
                "Where was the {term}?",
            ],
            'why': [
                "Why was {entity} important?",
                "Why did {event} happen?",
                "Why was {term} significant?",
            ],
            'how': [
                "How did {entity} come to power?",
                "How did {event} change things?",
            ]
        }

    def generate_questions(self, topic_data: Dict, difficulty: str = 'medium', count: int = 10) -> List[Dict]:
        """Generate questions based on topic content and difficulty."""
        questions = []

        # Use embedded quiz questions first
        if topic_data.get('quiz_questions'):
            questions.extend(self._format_quiz_questions(topic_data['quiz_questions']))

        # Generate from key terms
        if topic_data.get('key_terms'):
            questions.extend(self._generate_from_key_terms(topic_data['key_terms'], difficulty))

        # Generate from sections
        if topic_data.get('sections'):
            questions.extend(self._generate_from_sections(topic_data['sections'], difficulty))

        # Shuffle and limit to requested count
        random.shuffle(questions)

        # Adjust based on difficulty
        questions = self._adjust_for_difficulty(questions, difficulty)

        return questions[:count]

    def _format_quiz_questions(self, quiz_questions: List[Dict]) -> List[Dict]:
        """Format embedded quiz questions."""
        formatted = []
        for q in quiz_questions:
            formatted.append({
                'question': q['question'],
                'answer': q['answer'],
                'type': 'short_answer',
                'difficulty': 'medium',
                'source': 'embedded'
            })
        return formatted

    def _generate_from_key_terms(self, key_terms: List[Dict], difficulty: str) -> List[Dict]:
        """Generate questions from key terms."""
        questions = []

        for term_data in key_terms:
            term = term_data['term']
            definition = term_data['definition']

            # Basic definition question
            questions.append({
                'question': f"What is/are {term}?",
                'answer': definition[:200] + "..." if len(definition) > 200 else definition,
                'type': 'definition',
                'difficulty': 'easy',
                'term': term
            })

            # Extract specific facts for more detailed questions
            facts = self._extract_facts(definition)
            for fact in facts:
                if difficulty in ['medium', 'hard']:
                    questions.append({
                        'question': f"What did {term} accomplish/create?",
                        'answer': fact,
                        'type': 'fact',
                        'difficulty': 'medium',
                        'term': term
                    })

            # Create fill-in-the-blank for hard questions
            if difficulty == 'hard' and len(definition.split()) > 10:
                blank_question = self._create_fill_blank(term, definition)
                if blank_question:
                    questions.append(blank_question)

        return questions

    def _generate_from_sections(self, sections: List[Dict], difficulty: str) -> List[Dict]:
        """Generate questions from content sections."""
        questions = []

        for section in sections:
            section_title = section['title']
            content = section['content']

            # Extract entities (proper nouns, key figures)
            entities = self._extract_entities(content)

            # Extract dates and events
            dates = self._extract_dates(content)

            # Extract achievements and important facts
            achievements = self._extract_achievements(content)

            # Generate who/what/when questions
            for entity in entities[:3]:  # Limit per section
                questions.append({
                    'question': f"Who/What was {entity}?",
                    'answer': self._find_context(entity, content),
                    'type': 'identification',
                    'difficulty': 'easy',
                    'section': section_title
                })

            for date, event in dates[:2]:
                questions.append({
                    'question': f"What happened in {date}?",
                    'answer': event,
                    'type': 'timeline',
                    'difficulty': 'medium',
                    'section': section_title
                })

            for achievement in achievements[:2]:
                questions.append({
                    'question': f"What was significant about {achievement['subject']}?",
                    'answer': achievement['detail'],
                    'type': 'significance',
                    'difficulty': 'medium',
                    'section': section_title
                })

        return questions

    def _extract_facts(self, text: str) -> List[str]:
        """Extract factual statements from text."""
        facts = []

        # Look for bullet points
        bullets = re.findall(r'[-•]\s*(.+?)(?=\n|$)', text)
        facts.extend([b.strip() for b in bullets if len(b.strip()) > 20])

        # Look for sentences with achievements
        achievement_pattern = r'(created|built|founded|conquered|developed|invented)\s+(.+?)(?=[.!?\n])'
        matches = re.findall(achievement_pattern, text, re.IGNORECASE)
        facts.extend([f"{verb} {obj}" for verb, obj in matches])

        return facts[:5]  # Limit facts

    def _extract_entities(self, text: str) -> List[str]:
        """Extract proper nouns and key entities."""
        # Look for capitalized words/phrases (2-4 words)
        entity_pattern = r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b'
        entities = re.findall(entity_pattern, text)

        # Filter out common words and very short entities
        filtered = [e for e in entities if len(e) > 3 and e not in ['The', 'This', 'That', 'These', 'Those']]

        return list(set(filtered))[:10]  # Unique entities, limited

    def _extract_dates(self, text: str) -> List[tuple]:
        """Extract dates and associated events."""
        dates = []

        # Pattern for dates like "1792 BCE", "490 BC", "c. 2300 BC"
        date_pattern = r'(c\.\s*)?(\d{1,4}(?:\s*-\s*\d{1,4})?)\s*(BCE?|CE?|BC|AD)'

        # Find dates with context
        matches = re.finditer(date_pattern, text)
        for match in matches:
            date = match.group(0)
            # Get surrounding context (50 chars before and after)
            start = max(0, match.start() - 50)
            end = min(len(text), match.end() + 50)
            context = text[start:end].strip()

            dates.append((date, context))

        return dates[:5]

    def _extract_achievements(self, text: str) -> List[Dict]:
        """Extract achievements and accomplishments."""
        achievements = []

        # Look for achievement markers
        achievement_markers = ['created', 'built', 'founded', 'conquered', 'developed', 'invented', 'established']

        for marker in achievement_markers:
            pattern = rf'(\w+(?:\s+\w+){{0,2}})\s+{marker}\s+(.+?)(?=[.!?\n])'
            matches = re.findall(pattern, text, re.IGNORECASE)
            for subject, detail in matches:
                achievements.append({
                    'subject': subject.strip(),
                    'action': marker,
                    'detail': detail.strip()[:100]
                })

        return achievements[:5]

    def _find_context(self, entity: str, text: str, window: int = 100) -> str:
        """Find contextual information about an entity."""
        # Find the entity in text and return surrounding context
        match = re.search(re.escape(entity), text)
        if match:
            start = max(0, match.start() - window)
            end = min(len(text), match.end() + window)
            return text[start:end].strip()
        return ""

    def _create_fill_blank(self, term: str, definition: str) -> Dict:
        """Create a fill-in-the-blank question."""
        # Find a sentence with the term
        sentences = re.split(r'[.!?]', definition)

        for sentence in sentences:
            if len(sentence.split()) > 5:
                # Replace the term or a key word with a blank
                words = sentence.split()
                # Find important words (capitalized or longer than 5 chars)
                important_words = [w for w in words if len(w) > 5 or w[0].isupper()]

                if important_words:
                    word_to_blank = random.choice(important_words)
                    question_text = sentence.replace(word_to_blank, '______')

                    return {
                        'question': f"Fill in the blank: {question_text}",
                        'answer': word_to_blank.strip('.,!?'),
                        'type': 'fill_blank',
                        'difficulty': 'hard'
                    }

        return None

    def _adjust_for_difficulty(self, questions: List[Dict], difficulty: str) -> List[Dict]:
        """Filter and adjust questions based on difficulty level."""
        if difficulty == 'easy':
            # Prefer definition and identification questions
            priority_types = ['definition', 'identification', 'embedded']
        elif difficulty == 'medium':
            # Mix of all types
            priority_types = ['fact', 'timeline', 'significance', 'embedded']
        else:  # hard
            # Prefer complex questions
            priority_types = ['fill_blank', 'significance', 'fact']

        # Sort questions to prioritize certain types
        prioritized = [q for q in questions if q.get('type') in priority_types]
        others = [q for q in questions if q.get('type') not in priority_types]

        return prioritized + others

    def generate_flashcards(self, topic_data: Dict) -> List[Dict]:
        """Generate flashcards from key terms."""
        flashcards = []

        if topic_data.get('key_terms'):
            for term_data in topic_data['key_terms']:
                flashcards.append({
                    'front': term_data['term'],
                    'back': term_data['definition'],
                    'type': 'term_definition'
                })

        # Also create flashcards from quiz questions
        if topic_data.get('quiz_questions'):
            for q in topic_data['quiz_questions'][:10]:
                flashcards.append({
                    'front': q['question'],
                    'back': q['answer'],
                    'type': 'qa'
                })

        return flashcards


if __name__ == "__main__":
    # Test with sample data
    sample_data = {
        'key_terms': [
            {'term': 'Mesopotamia', 'definition': 'Land between the rivers, between Tigris and Euphrates Rivers'}
        ],
        'quiz_questions': [
            {'question': 'Who created the first empire?', 'answer': 'Sargon the Great'}
        ]
    }

    generator = LocalQuestionGenerator()
    questions = generator.generate_questions(sample_data, difficulty='medium', count=5)
    for q in questions:
        print(f"Q: {q['question']}")
        print(f"A: {q['answer']}\n")
