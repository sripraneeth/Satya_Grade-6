import os
from typing import List, Dict, Optional
import json

class APIQuestionGenerator:
    """Generates questions using AI APIs (OpenAI or Anthropic)."""

    def __init__(self, api_key: Optional[str] = None, provider: str = 'openai'):
        """
        Initialize the API question generator.

        Args:
            api_key: API key for the service (or set via environment variable)
            provider: 'openai' or 'anthropic'
        """
        self.provider = provider
        self.api_key = api_key or os.getenv(
            'OPENAI_API_KEY' if provider == 'openai' else 'ANTHROPIC_API_KEY'
        )
        self.client = None

        if self.api_key:
            self._initialize_client()

    def _initialize_client(self):
        """Initialize the appropriate API client."""
        try:
            if self.provider == 'openai':
                import openai
                self.client = openai.OpenAI(api_key=self.api_key)
            elif self.provider == 'anthropic':
                import anthropic
                self.client = anthropic.Anthropic(api_key=self.api_key)
        except ImportError:
            print(f"Warning: {self.provider} library not installed. Install with: pip install {self.provider}")
        except Exception as e:
            print(f"Error initializing {self.provider} client: {e}")

    def is_available(self) -> bool:
        """Check if API is available and configured."""
        return self.client is not None and self.api_key is not None

    def generate_questions(self, topic_data: Dict, difficulty: str = 'medium', count: int = 10) -> List[Dict]:
        """Generate questions using AI API."""
        if not self.is_available():
            print("API not available. Please configure API key.")
            return []

        content_summary = self._prepare_content_summary(topic_data)

        prompt = self._create_prompt(content_summary, difficulty, count)

        try:
            if self.provider == 'openai':
                return self._generate_with_openai(prompt)
            elif self.provider == 'anthropic':
                return self._generate_with_anthropic(prompt)
        except Exception as e:
            print(f"Error generating questions with {self.provider}: {e}")
            return []

    def _prepare_content_summary(self, topic_data: Dict) -> str:
        """Prepare a summary of the content for the AI."""
        summary_parts = []

        # Add title
        summary_parts.append(f"Topic: {topic_data.get('title', 'Unknown')}")

        # Add key sections
        if topic_data.get('sections'):
            summary_parts.append("\nKey Sections:")
            for section in topic_data['sections'][:5]:  # Limit to avoid token limits
                summary_parts.append(f"- {section['title']}")

        # Add key terms
        if topic_data.get('key_terms'):
            summary_parts.append("\nKey Terms:")
            for term in topic_data['key_terms'][:10]:
                summary_parts.append(f"- {term['term']}: {term['definition'][:100]}")

        # Add a portion of the actual content
        if topic_data.get('content'):
            content = topic_data['content']
            # Take first 1000 characters or less
            content_excerpt = content[:1500] if len(content) > 1500 else content
            summary_parts.append(f"\nContent Excerpt:\n{content_excerpt}")

        return "\n".join(summary_parts)

    def _create_prompt(self, content: str, difficulty: str, count: int) -> str:
        """Create the prompt for the AI."""
        difficulty_descriptions = {
            'easy': 'Easy questions focusing on definitions, basic facts, and simple recall.',
            'medium': 'Medium difficulty questions requiring understanding and application of concepts.',
            'hard': 'Challenging questions requiring analysis, synthesis, and deeper understanding.'
        }

        prompt = f"""Based on the following study material, generate {count} {difficulty} level quiz questions.

{difficulty_descriptions[difficulty]}

Study Material:
{content}

Generate questions in the following JSON format:
[
    {{
        "question": "The question text",
        "answer": "The expected answer",
        "type": "multiple_choice|short_answer|true_false",
        "options": ["option1", "option2", "option3", "option4"],
        "difficulty": "{difficulty}",
        "explanation": "Brief explanation of the answer"
    }}
]

For multiple choice questions, include 4 options with the correct answer as one of them.
For short answer questions, provide a concise expected answer.
Mix different question types for variety.

Return ONLY the JSON array, no additional text."""

        return prompt

    def _generate_with_openai(self, prompt: str) -> List[Dict]:
        """Generate questions using OpenAI API."""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Using mini for cost efficiency
                messages=[
                    {"role": "system", "content": "You are an expert educational content creator who generates high-quality quiz questions for students."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )

            content = response.choices[0].message.content
            # Parse JSON response
            questions = json.loads(content)
            return questions

        except json.JSONDecodeError as e:
            print(f"Error parsing JSON from OpenAI response: {e}")
            # Try to extract JSON from the response
            return self._extract_json_from_text(content)
        except Exception as e:
            print(f"Error with OpenAI API: {e}")
            return []

    def _generate_with_anthropic(self, prompt: str) -> List[Dict]:
        """Generate questions using Anthropic Claude API."""
        try:
            response = self.client.messages.create(
                model="claude-3-5-haiku-20241022",  # Using Haiku for cost efficiency
                max_tokens=2000,
                temperature=0.7,
                system="You are an expert educational content creator who generates high-quality quiz questions for students.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            content = response.content[0].text
            # Parse JSON response
            questions = json.loads(content)
            return questions

        except json.JSONDecodeError as e:
            print(f"Error parsing JSON from Claude response: {e}")
            return self._extract_json_from_text(content)
        except Exception as e:
            print(f"Error with Anthropic API: {e}")
            return []

    def _extract_json_from_text(self, text: str) -> List[Dict]:
        """Try to extract JSON array from text that might have extra content."""
        try:
            # Find JSON array in text
            import re
            json_match = re.search(r'\[.*\]', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
        except:
            pass
        return []

    def generate_flashcards(self, topic_data: Dict, count: int = 15) -> List[Dict]:
        """Generate flashcards using AI API."""
        if not self.is_available():
            return []

        content_summary = self._prepare_content_summary(topic_data)

        prompt = f"""Based on the following study material, generate {count} flashcards.

Study Material:
{content_summary}

Generate flashcards in the following JSON format:
[
    {{
        "front": "Term, concept, or question",
        "back": "Definition, explanation, or answer",
        "category": "vocabulary|concept|fact"
    }}
]

Focus on key terms, important concepts, and critical facts.
Return ONLY the JSON array, no additional text."""

        try:
            if self.provider == 'openai':
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are an expert at creating educational flashcards."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=2000
                )
                content = response.choices[0].message.content

            elif self.provider == 'anthropic':
                response = self.client.messages.create(
                    model="claude-3-5-haiku-20241022",
                    max_tokens=2000,
                    temperature=0.7,
                    system="You are an expert at creating educational flashcards.",
                    messages=[{"role": "user", "content": prompt}]
                )
                content = response.content[0].text

            flashcards = json.loads(content)
            return flashcards

        except Exception as e:
            print(f"Error generating flashcards: {e}")
            return []


if __name__ == "__main__":
    # Test (requires API key)
    generator = APIQuestionGenerator(provider='openai')

    if generator.is_available():
        sample_data = {
            'title': 'Ancient Mesopotamia',
            'key_terms': [
                {'term': 'Mesopotamia', 'definition': 'Land between two rivers'}
            ],
            'content': 'Mesopotamia was the cradle of civilization...'
        }

        questions = generator.generate_questions(sample_data, difficulty='easy', count=3)
        print("Generated questions:", json.dumps(questions, indent=2))
    else:
        print("API not configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.")
