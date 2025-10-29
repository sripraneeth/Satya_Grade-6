from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import services
from services.content_scanner import ContentScanner
from services.question_generator import LocalQuestionGenerator
from services.api_question_generator import APIQuestionGenerator
from services.progress_tracker import ProgressTracker

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize services
scanner = ContentScanner()
local_generator = LocalQuestionGenerator()
api_generator_openai = APIQuestionGenerator(provider='openai')
api_generator_anthropic = APIQuestionGenerator(provider='anthropic')
progress_tracker = ProgressTracker()

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')


@app.route('/')
def index():
    """Serve the main application page."""
    return render_template('index.html')


@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    """Get all available subjects and topics."""
    try:
        subjects = scanner.scan_subjects()

        # Format response
        formatted = []
        for subject_name, topics in subjects.items():
            formatted.append({
                'name': subject_name,
                'topics': [
                    {
                        'title': topic['title'],
                        'sections_count': len(topic.get('sections', [])),
                        'key_terms_count': len(topic.get('key_terms', [])),
                        'word_count': topic.get('word_count', 0)
                    }
                    for topic in topics
                ]
            })

        return jsonify({
            'success': True,
            'subjects': formatted
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/topic/<subject>/<topic_title>', methods=['GET'])
def get_topic(subject, topic_title):
    """Get detailed content for a specific topic."""
    try:
        topic_data = scanner.get_topic_content(subject, topic_title)

        if not topic_data:
            return jsonify({
                'success': False,
                'error': 'Topic not found'
            }), 404

        return jsonify({
            'success': True,
            'topic': {
                'title': topic_data['title'],
                'html_content': topic_data['html_content'],
                'sections': topic_data['sections'],
                'key_terms': topic_data['key_terms'],
                'quiz_questions': topic_data.get('quiz_questions', [])
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/questions/generate', methods=['POST'])
def generate_questions():
    """Generate quiz questions for a topic."""
    try:
        data = request.json
        subject = data.get('subject')
        topic_title = data.get('topic')
        difficulty = data.get('difficulty', 'medium')
        count = data.get('count', 10)
        use_api = data.get('use_api', False)
        api_provider = data.get('api_provider', 'local')

        # Get topic content
        topic_data = scanner.get_topic_content(subject, topic_title)

        if not topic_data:
            return jsonify({
                'success': False,
                'error': 'Topic not found'
            }), 404

        # Generate questions based on preference
        questions = []

        if use_api and api_provider in ['openai', 'anthropic']:
            # Use API generator
            if api_provider == 'openai' and api_generator_openai.is_available():
                questions = api_generator_openai.generate_questions(topic_data, difficulty, count)
            elif api_provider == 'anthropic' and api_generator_anthropic.is_available():
                questions = api_generator_anthropic.generate_questions(topic_data, difficulty, count)
            else:
                # Fallback to local if API not available
                questions = local_generator.generate_questions(topic_data, difficulty, count)
        else:
            # Use local generator
            questions = local_generator.generate_questions(topic_data, difficulty, count)

        return jsonify({
            'success': True,
            'questions': questions,
            'generated_with': api_provider if use_api else 'local'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/flashcards/generate', methods=['POST'])
def generate_flashcards():
    """Generate flashcards for a topic."""
    try:
        data = request.json
        subject = data.get('subject')
        topic_title = data.get('topic')
        use_api = data.get('use_api', False)
        api_provider = data.get('api_provider', 'local')

        # Get topic content
        topic_data = scanner.get_topic_content(subject, topic_title)

        if not topic_data:
            return jsonify({
                'success': False,
                'error': 'Topic not found'
            }), 404

        # Generate flashcards
        flashcards = []

        if use_api and api_provider in ['openai', 'anthropic']:
            if api_provider == 'openai' and api_generator_openai.is_available():
                flashcards = api_generator_openai.generate_flashcards(topic_data)
            elif api_provider == 'anthropic' and api_generator_anthropic.is_available():
                flashcards = api_generator_anthropic.generate_flashcards(topic_data)
            else:
                flashcards = local_generator.generate_flashcards(topic_data)
        else:
            flashcards = local_generator.generate_flashcards(topic_data)

        return jsonify({
            'success': True,
            'flashcards': flashcards,
            'generated_with': api_provider if use_api else 'local'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/progress/quiz', methods=['POST'])
def record_quiz_progress():
    """Record quiz completion and results."""
    try:
        data = request.json
        subject = data.get('subject')
        topic = data.get('topic')
        difficulty = data.get('difficulty')
        questions = data.get('questions')
        answers = data.get('answers')
        time_taken = data.get('time_taken_seconds', 0)

        result = progress_tracker.record_quiz(
            subject, topic, difficulty, questions, answers, time_taken
        )

        return jsonify({
            'success': True,
            'result': result
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/progress/flashcards', methods=['POST'])
def record_flashcard_progress():
    """Record flashcard study session."""
    try:
        data = request.json
        subject = data.get('subject')
        topic = data.get('topic')
        cards_reviewed = data.get('cards_reviewed')
        time_taken = data.get('time_taken_seconds', 0)

        result = progress_tracker.record_flashcard_session(
            subject, topic, cards_reviewed, time_taken
        )

        return jsonify({
            'success': True,
            'result': result
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/progress/stats', methods=['GET'])
def get_progress_stats():
    """Get overall progress statistics."""
    try:
        overall = progress_tracker.get_overall_stats()
        recent_quizzes = progress_tracker.get_recent_quizzes(limit=5)
        strengths_weaknesses = progress_tracker.get_strengths_and_weaknesses()

        return jsonify({
            'success': True,
            'overall_stats': overall,
            'recent_quizzes': recent_quizzes,
            'strengths_weaknesses': strengths_weaknesses
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/progress/topic/<subject>/<topic>', methods=['GET'])
def get_topic_progress(subject, topic):
    """Get progress for a specific topic."""
    try:
        stats = progress_tracker.get_topic_stats(subject, topic)
        history = progress_tracker.get_quiz_history_by_topic(subject, topic)

        return jsonify({
            'success': True,
            'stats': stats,
            'history': history
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/config/api-status', methods=['GET'])
def get_api_status():
    """Check which API providers are available."""
    return jsonify({
        'success': True,
        'api_status': {
            'openai': api_generator_openai.is_available(),
            'anthropic': api_generator_anthropic.is_available()
        }
    })


if __name__ == '__main__':
    # Create data directory if it doesn't exist
    data_dir = Path(__file__).parent / 'data'
    data_dir.mkdir(exist_ok=True)

    # Get port from environment variable (for production) or use 5000 (for local)
    port = int(os.environ.get('PORT', 5000))

    # Check if we're in production (e.g., Render sets PORT env var)
    is_production = 'PORT' in os.environ

    # Run the app
    if not is_production:
        print("\n" + "="*60)
        print("  Study Guide App - Starting Server")
        print("="*60)
        print(f"  Access the app at: http://localhost:{port}")
        print(f"  Press CTRL+C to quit")
        print("="*60 + "\n")

    app.run(debug=not is_production, host='0.0.0.0', port=port)
