import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List

class ProgressTracker:
    """Tracks student progress, quiz scores, and learning analytics."""

    def __init__(self, data_dir: str = None):
        if data_dir is None:
            self.data_dir = Path(__file__).parent.parent / "data"
        else:
            self.data_dir = Path(data_dir)

        self.data_dir.mkdir(exist_ok=True)
        self.progress_file = self.data_dir / "progress.json"
        self.progress_data = self._load_progress()

    def _load_progress(self) -> Dict:
        """Load progress data from JSON file."""
        if self.progress_file.exists():
            try:
                with open(self.progress_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading progress: {e}")
                return self._initialize_progress_data()
        else:
            return self._initialize_progress_data()

    def _initialize_progress_data(self) -> Dict:
        """Initialize empty progress data structure."""
        return {
            'quizzes': [],
            'flashcard_sessions': [],
            'topics_studied': {},
            'overall_stats': {
                'total_quizzes': 0,
                'total_questions_answered': 0,
                'total_correct': 0,
                'average_score': 0,
                'study_time_minutes': 0
            }
        }

    def _save_progress(self):
        """Save progress data to JSON file."""
        try:
            with open(self.progress_file, 'w') as f:
                json.dump(self.progress_data, f, indent=2)
        except Exception as e:
            print(f"Error saving progress: {e}")

    def record_quiz(self, subject: str, topic: str, difficulty: str, questions: List[Dict], answers: List[str], time_taken_seconds: int):
        """Record a completed quiz."""
        # Calculate score
        correct_count = 0
        total_questions = len(questions)

        for i, question in enumerate(questions):
            if i < len(answers):
                user_answer = answers[i].strip().lower()
                correct_answer = str(question.get('answer', '')).strip().lower()

                # Basic answer matching (can be improved)
                if user_answer == correct_answer or user_answer in correct_answer:
                    correct_count += 1

        score_percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0

        # Create quiz record
        quiz_record = {
            'timestamp': datetime.now().isoformat(),
            'subject': subject,
            'topic': topic,
            'difficulty': difficulty,
            'total_questions': total_questions,
            'correct_answers': correct_count,
            'score_percentage': round(score_percentage, 2),
            'time_taken_seconds': time_taken_seconds,
            'questions_and_answers': [
                {
                    'question': q['question'],
                    'user_answer': answers[i] if i < len(answers) else '',
                    'correct_answer': q.get('answer', ''),
                    'was_correct': i < len(answers) and answers[i].strip().lower() in str(q.get('answer', '')).strip().lower()
                }
                for i, q in enumerate(questions)
            ]
        }

        # Add to quiz history
        self.progress_data['quizzes'].append(quiz_record)

        # Update topic stats
        topic_key = f"{subject}_{topic}"
        if topic_key not in self.progress_data['topics_studied']:
            self.progress_data['topics_studied'][topic_key] = {
                'subject': subject,
                'topic': topic,
                'times_studied': 0,
                'total_questions': 0,
                'total_correct': 0,
                'average_score': 0,
                'last_studied': None
            }

        topic_stats = self.progress_data['topics_studied'][topic_key]
        topic_stats['times_studied'] += 1
        topic_stats['total_questions'] += total_questions
        topic_stats['total_correct'] += correct_count
        topic_stats['average_score'] = round(
            (topic_stats['total_correct'] / topic_stats['total_questions'] * 100),
            2
        )
        topic_stats['last_studied'] = quiz_record['timestamp']

        # Update overall stats
        overall = self.progress_data['overall_stats']
        overall['total_quizzes'] += 1
        overall['total_questions_answered'] += total_questions
        overall['total_correct'] += correct_count
        overall['average_score'] = round(
            (overall['total_correct'] / overall['total_questions_answered'] * 100) if overall['total_questions_answered'] > 0 else 0,
            2
        )
        overall['study_time_minutes'] += round(time_taken_seconds / 60, 2)

        self._save_progress()
        return quiz_record

    def record_flashcard_session(self, subject: str, topic: str, cards_reviewed: int, time_taken_seconds: int):
        """Record a flashcard study session."""
        session = {
            'timestamp': datetime.now().isoformat(),
            'subject': subject,
            'topic': topic,
            'cards_reviewed': cards_reviewed,
            'time_taken_seconds': time_taken_seconds
        }

        self.progress_data['flashcard_sessions'].append(session)

        # Update overall study time
        self.progress_data['overall_stats']['study_time_minutes'] += round(time_taken_seconds / 60, 2)

        self._save_progress()
        return session

    def get_overall_stats(self) -> Dict:
        """Get overall statistics."""
        return self.progress_data['overall_stats']

    def get_topic_stats(self, subject: str = None, topic: str = None) -> Dict:
        """Get statistics for specific topic or all topics."""
        if subject and topic:
            topic_key = f"{subject}_{topic}"
            return self.progress_data['topics_studied'].get(topic_key, {})
        else:
            return self.progress_data['topics_studied']

    def get_recent_quizzes(self, limit: int = 10) -> List[Dict]:
        """Get recent quiz results."""
        quizzes = self.progress_data['quizzes']
        return sorted(quizzes, key=lambda x: x['timestamp'], reverse=True)[:limit]

    def get_quiz_history_by_topic(self, subject: str, topic: str) -> List[Dict]:
        """Get quiz history for a specific topic."""
        return [
            quiz for quiz in self.progress_data['quizzes']
            if quiz['subject'] == subject and quiz['topic'] == topic
        ]

    def get_performance_trend(self, subject: str = None, topic: str = None, days: int = 30) -> List[Dict]:
        """Get performance trend over time."""
        from datetime import datetime, timedelta

        cutoff_date = datetime.now() - timedelta(days=days)

        quizzes = self.progress_data['quizzes']

        # Filter by date and optionally by subject/topic
        filtered = [
            q for q in quizzes
            if datetime.fromisoformat(q['timestamp']) >= cutoff_date
            and (not subject or q['subject'] == subject)
            and (not topic or q['topic'] == topic)
        ]

        # Sort by date
        return sorted(filtered, key=lambda x: x['timestamp'])

    def get_strengths_and_weaknesses(self) -> Dict:
        """Analyze strengths and weaknesses across topics."""
        topics = self.progress_data['topics_studied']

        if not topics:
            return {'strengths': [], 'weaknesses': [], 'needs_review': []}

        # Sort topics by performance
        sorted_topics = sorted(
            topics.values(),
            key=lambda x: x.get('average_score', 0),
            reverse=True
        )

        # Categorize
        strengths = [t for t in sorted_topics if t.get('average_score', 0) >= 80]
        weaknesses = [t for t in sorted_topics if t.get('average_score', 0) < 60]
        needs_review = [t for t in sorted_topics if 60 <= t.get('average_score', 0) < 80]

        return {
            'strengths': strengths[:5],
            'weaknesses': weaknesses[:5],
            'needs_review': needs_review[:5]
        }

    def reset_progress(self):
        """Reset all progress data (use with caution)."""
        self.progress_data = self._initialize_progress_data()
        self._save_progress()


if __name__ == "__main__":
    # Test the tracker
    tracker = ProgressTracker()

    # Simulate a quiz
    sample_questions = [
        {'question': 'Who was Hammurabi?', 'answer': 'Babylonian king who created a law code'},
        {'question': 'What is Mesopotamia?', 'answer': 'Land between rivers'}
    ]
    sample_answers = ['Babylonian king', 'Land between rivers']

    tracker.record_quiz(
        subject='Social Studies',
        topic='Ancient Mesopotamia',
        difficulty='medium',
        questions=sample_questions,
        answers=sample_answers,
        time_taken_seconds=120
    )

    print("Overall stats:", tracker.get_overall_stats())
    print("Recent quizzes:", tracker.get_recent_quizzes(limit=1))
