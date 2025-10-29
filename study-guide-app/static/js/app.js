// Study Guide App - Main JavaScript

class StudyGuideApp {
    constructor() {
        this.currentSubject = null;
        this.currentTopic = null;
        this.currentTopicData = null;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.quizAnswers = [];
        this.quizStartTime = null;
        this.timerInterval = null;
        this.currentFlashcards = [];
        this.currentFlashcardIndex = 0;
        this.flashcardStartTime = null;

        this.init();
    }

    init() {
        this.loadSubjects();
        this.setupEventListeners();
        this.checkAPIStatus();
    }

    setupEventListeners() {
        // Progress button
        document.getElementById('progress-btn').addEventListener('click', () => {
            this.showProgressScreen();
        });

        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettingsModal();
        });

        document.getElementById('close-settings').addEventListener('click', () => {
            this.hideSettingsModal();
        });

        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
        });

        // Topic actions
        document.getElementById('study-mode-btn').addEventListener('click', () => {
            this.showStudyMode();
        });

        document.getElementById('quiz-mode-btn').addEventListener('click', () => {
            this.showQuizMode();
        });

        document.getElementById('flashcard-mode-btn').addEventListener('click', () => {
            this.showFlashcardMode();
        });

        // Quiz controls
        document.getElementById('start-quiz-btn').addEventListener('click', () => {
            this.startQuiz();
        });

        document.getElementById('prev-question-btn').addEventListener('click', () => {
            this.previousQuestion();
        });

        document.getElementById('next-question-btn').addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('submit-quiz-btn').addEventListener('click', () => {
            this.submitQuiz();
        });

        document.getElementById('quit-quiz-btn').addEventListener('click', () => {
            this.quitQuiz();
        });

        document.getElementById('review-answers-btn').addEventListener('click', () => {
            this.showAnswerReview();
        });

        document.getElementById('retake-quiz-btn').addEventListener('click', () => {
            this.showQuizMode();
        });

        document.getElementById('back-to-topic-btn').addEventListener('click', () => {
            this.showTopicScreen();
        });

        // Flashcard controls
        document.getElementById('start-flashcards-btn').addEventListener('click', () => {
            this.startFlashcards();
        });

        document.getElementById('flashcard').addEventListener('click', () => {
            this.flipFlashcard();
        });

        document.getElementById('prev-flashcard-btn').addEventListener('click', () => {
            this.previousFlashcard();
        });

        document.getElementById('next-flashcard-btn').addEventListener('click', () => {
            this.nextFlashcard();
        });

        document.getElementById('quit-flashcard-btn').addEventListener('click', () => {
            this.quitFlashcards();
        });

        // Progress screen
        document.getElementById('close-progress-btn').addEventListener('click', () => {
            this.hideProgressScreen();
        });
    }

    async loadSubjects() {
        try {
            const response = await fetch('/api/subjects');
            const data = await response.json();

            if (data.success) {
                this.renderSubjects(data.subjects);
            } else {
                console.error('Error loading subjects:', data.error);
            }
        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    }

    renderSubjects(subjects) {
        const subjectsList = document.getElementById('subjects-list');
        subjectsList.innerHTML = '';

        subjects.forEach(subject => {
            const subjectDiv = document.createElement('div');
            subjectDiv.className = 'subject-item';

            const subjectHeader = document.createElement('div');
            subjectHeader.className = 'subject-header';
            subjectHeader.textContent = subject.name;

            const topicsList = document.createElement('div');
            topicsList.className = 'topics-list';

            subject.topics.forEach(topic => {
                const topicItem = document.createElement('div');
                topicItem.className = 'topic-item';
                topicItem.textContent = topic.title;
                topicItem.dataset.subject = subject.name;
                topicItem.dataset.topic = topic.title;

                topicItem.addEventListener('click', () => {
                    this.selectTopic(subject.name, topic.title);
                });

                topicsList.appendChild(topicItem);
            });

            subjectDiv.appendChild(subjectHeader);
            subjectDiv.appendChild(topicsList);
            subjectsList.appendChild(subjectDiv);
        });
    }

    async selectTopic(subject, topic) {
        this.currentSubject = subject;
        this.currentTopic = topic;

        // Update active state
        document.querySelectorAll('.topic-item').forEach(item => {
            item.classList.remove('active');
        });
        event.target.classList.add('active');

        // Load topic data
        try {
            const response = await fetch(`/api/topic/${encodeURIComponent(subject)}/${encodeURIComponent(topic)}`);
            const data = await response.json();

            if (data.success) {
                this.currentTopicData = data.topic;
                this.showTopicScreen();
            } else {
                console.error('Error loading topic:', data.error);
            }
        } catch (error) {
            console.error('Error loading topic:', error);
        }
    }

    showTopicScreen() {
        this.hideAllScreens();
        const topicScreen = document.getElementById('topic-screen');
        topicScreen.classList.remove('hidden');

        document.getElementById('topic-title').textContent = this.currentTopicData.title;
        this.showStudyMode();
    }

    showStudyMode() {
        document.getElementById('topic-content').innerHTML = this.currentTopicData.html_content;
    }

    showQuizMode() {
        this.hideAllScreens();
        document.getElementById('quiz-screen').classList.remove('hidden');
        document.getElementById('quiz-setup').classList.remove('hidden');
        document.getElementById('quiz-questions').classList.add('hidden');
        document.getElementById('quiz-results').classList.add('hidden');
    }

    async startQuiz() {
        const difficulty = document.getElementById('quiz-difficulty').value;
        const count = parseInt(document.getElementById('quiz-count').value);
        const timedQuiz = document.getElementById('timed-quiz').checked;
        const generator = document.getElementById('quiz-generator').value;

        // Generate questions
        try {
            const response = await fetch('/api/questions/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: this.currentSubject,
                    topic: this.currentTopic,
                    difficulty: difficulty,
                    count: count,
                    use_api: generator !== 'local',
                    api_provider: generator
                })
            });

            const data = await response.json();

            if (data.success && data.questions.length > 0) {
                this.currentQuestions = data.questions;
                this.quizAnswers = new Array(this.currentQuestions.length).fill('');
                this.currentQuestionIndex = 0;
                this.quizStartTime = Date.now();

                document.getElementById('quiz-setup').classList.add('hidden');
                document.getElementById('quiz-questions').classList.remove('hidden');

                if (timedQuiz) {
                    this.startTimer();
                    document.getElementById('quiz-timer').classList.remove('hidden');
                } else {
                    document.getElementById('quiz-timer').classList.add('hidden');
                }

                this.showQuestion();
            } else {
                alert('Failed to generate questions. Please try again.');
            }
        } catch (error) {
            console.error('Error starting quiz:', error);
            alert('Error starting quiz. Please try again.');
        }
    }

    showQuestion() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        document.getElementById('current-question').textContent = question.question;
        document.getElementById('answer-input').value = this.quizAnswers[this.currentQuestionIndex];
        document.getElementById('quiz-question-counter').textContent =
            `Question ${this.currentQuestionIndex + 1} of ${this.currentQuestions.length}`;

        // Show/hide navigation buttons
        document.getElementById('prev-question-btn').disabled = this.currentQuestionIndex === 0;

        if (this.currentQuestionIndex === this.currentQuestions.length - 1) {
            document.getElementById('next-question-btn').classList.add('hidden');
            document.getElementById('submit-quiz-btn').classList.remove('hidden');
        } else {
            document.getElementById('next-question-btn').classList.remove('hidden');
            document.getElementById('submit-quiz-btn').classList.add('hidden');
        }
    }

    previousQuestion() {
        this.saveCurrentAnswer();
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
        }
    }

    nextQuestion() {
        this.saveCurrentAnswer();
        if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        }
    }

    saveCurrentAnswer() {
        const answer = document.getElementById('answer-input').value;
        this.quizAnswers[this.currentQuestionIndex] = answer;
    }

    async submitQuiz() {
        this.saveCurrentAnswer();
        this.stopTimer();

        const timeTaken = Math.floor((Date.now() - this.quizStartTime) / 1000);

        // Submit to backend
        try {
            const response = await fetch('/api/progress/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: this.currentSubject,
                    topic: this.currentTopic,
                    difficulty: document.getElementById('quiz-difficulty').value,
                    questions: this.currentQuestions,
                    answers: this.quizAnswers,
                    time_taken_seconds: timeTaken
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showQuizResults(data.result);
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
        }
    }

    showQuizResults(result) {
        document.getElementById('quiz-questions').classList.add('hidden');
        document.getElementById('quiz-results').classList.remove('hidden');

        document.getElementById('quiz-score').textContent = `${result.score_percentage}%`;
        document.getElementById('correct-count').textContent = result.correct_answers;
        document.getElementById('incorrect-count').textContent = result.total_questions - result.correct_answers;

        const minutes = Math.floor(result.time_taken_seconds / 60);
        const seconds = result.time_taken_seconds % 60;
        document.getElementById('time-taken').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    showAnswerReview() {
        const reviewDiv = document.getElementById('answer-review');
        reviewDiv.classList.remove('hidden');
        reviewDiv.innerHTML = '';

        this.currentQuestions.forEach((question, index) => {
            const isCorrect = this.quizAnswers[index].trim().toLowerCase().includes(
                question.answer.toLowerCase().trim()
            );

            const reviewItem = document.createElement('div');
            reviewItem.className = `review-item ${isCorrect ? 'correct' : 'incorrect'}`;
            reviewItem.innerHTML = `
                <h4>Question ${index + 1}</h4>
                <p><strong>Q:</strong> ${question.question}</p>
                <p><strong>Your Answer:</strong> ${this.quizAnswers[index] || '(No answer)'}</p>
                <p><strong>Correct Answer:</strong> ${question.answer}</p>
                ${question.explanation ? `<p><strong>Explanation:</strong> ${question.explanation}</p>` : ''}
            `;
            reviewDiv.appendChild(reviewItem);
        });
    }

    quitQuiz() {
        this.stopTimer();
        this.showTopicScreen();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.quizStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('quiz-timer').textContent =
                `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    showFlashcardMode() {
        this.hideAllScreens();
        document.getElementById('flashcard-screen').classList.remove('hidden');
        document.getElementById('flashcard-setup').classList.remove('hidden');
        document.getElementById('flashcard-display').classList.add('hidden');
    }

    async startFlashcards() {
        const generator = document.getElementById('flashcard-generator').value;

        try {
            const response = await fetch('/api/flashcards/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: this.currentSubject,
                    topic: this.currentTopic,
                    use_api: generator !== 'local',
                    api_provider: generator
                })
            });

            const data = await response.json();

            if (data.success && data.flashcards.length > 0) {
                this.currentFlashcards = data.flashcards;
                this.currentFlashcardIndex = 0;
                this.flashcardStartTime = Date.now();

                document.getElementById('flashcard-setup').classList.add('hidden');
                document.getElementById('flashcard-display').classList.remove('hidden');

                this.showFlashcard();
            } else {
                alert('Failed to generate flashcards. Please try again.');
            }
        } catch (error) {
            console.error('Error starting flashcards:', error);
        }
    }

    showFlashcard() {
        const flashcard = this.currentFlashcards[this.currentFlashcardIndex];
        document.getElementById('flashcard-front').textContent = flashcard.front;
        document.getElementById('flashcard-back').textContent = flashcard.back;
        document.getElementById('flashcard-counter').textContent =
            `Card ${this.currentFlashcardIndex + 1} of ${this.currentFlashcards.length}`;

        // Reset flip
        document.getElementById('flashcard').classList.remove('flipped');

        // Update navigation buttons
        document.getElementById('prev-flashcard-btn').disabled = this.currentFlashcardIndex === 0;
        document.getElementById('next-flashcard-btn').disabled =
            this.currentFlashcardIndex === this.currentFlashcards.length - 1;
    }

    flipFlashcard() {
        document.getElementById('flashcard').classList.toggle('flipped');
    }

    previousFlashcard() {
        if (this.currentFlashcardIndex > 0) {
            this.currentFlashcardIndex--;
            this.showFlashcard();
        }
    }

    nextFlashcard() {
        if (this.currentFlashcardIndex < this.currentFlashcards.length - 1) {
            this.currentFlashcardIndex++;
            this.showFlashcard();
        }
    }

    async quitFlashcards() {
        const timeTaken = Math.floor((Date.now() - this.flashcardStartTime) / 1000);

        // Record session
        try {
            await fetch('/api/progress/flashcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: this.currentSubject,
                    topic: this.currentTopic,
                    cards_reviewed: this.currentFlashcardIndex + 1,
                    time_taken_seconds: timeTaken
                })
            });
        } catch (error) {
            console.error('Error recording flashcard session:', error);
        }

        this.showTopicScreen();
    }

    async showProgressScreen() {
        this.hideAllScreens();
        document.getElementById('progress-screen').classList.remove('hidden');

        try {
            const response = await fetch('/api/progress/stats');
            const data = await response.json();

            if (data.success) {
                this.renderProgressStats(data);
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }

    renderProgressStats(data) {
        const stats = data.overall_stats;
        document.getElementById('total-quizzes').textContent = stats.total_quizzes;
        document.getElementById('avg-score').textContent = `${stats.average_score}%`;
        document.getElementById('total-questions').textContent = stats.total_questions_answered;
        document.getElementById('study-time').textContent = `${Math.round(stats.study_time_minutes)}m`;

        // Recent quizzes
        const recentQuizzes = document.getElementById('recent-quizzes');
        recentQuizzes.innerHTML = '';
        data.recent_quizzes.forEach(quiz => {
            const quizItem = document.createElement('div');
            quizItem.className = 'quiz-item';
            quizItem.innerHTML = `
                <div><strong>${quiz.topic}</strong></div>
                <div>Score: ${quiz.score_percentage}% | ${new Date(quiz.timestamp).toLocaleDateString()}</div>
            `;
            recentQuizzes.appendChild(quizItem);
        });

        // Strengths and weaknesses
        const swDiv = document.getElementById('strengths-weaknesses');
        swDiv.innerHTML = '';

        if (data.strengths_weaknesses.strengths.length > 0) {
            swDiv.innerHTML += '<h4>Strengths</h4><ul>';
            data.strengths_weaknesses.strengths.forEach(topic => {
                swDiv.innerHTML += `<li>${topic.topic} - ${topic.average_score}%</li>`;
            });
            swDiv.innerHTML += '</ul>';
        }

        if (data.strengths_weaknesses.weaknesses.length > 0) {
            swDiv.innerHTML += '<h4>Needs Practice</h4><ul>';
            data.strengths_weaknesses.weaknesses.forEach(topic => {
                swDiv.innerHTML += `<li>${topic.topic} - ${topic.average_score}%</li>`;
            });
            swDiv.innerHTML += '</ul>';
        }
    }

    hideProgressScreen() {
        document.getElementById('progress-screen').classList.add('hidden');
        if (this.currentTopicData) {
            this.showTopicScreen();
        } else {
            document.getElementById('welcome-screen').classList.remove('hidden');
        }
    }

    showSettingsModal() {
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    hideSettingsModal() {
        document.getElementById('settings-modal').classList.add('hidden');
    }

    saveSettings() {
        const openaiKey = document.getElementById('openai-key').value;
        const anthropicKey = document.getElementById('anthropic-key').value;

        if (openaiKey) localStorage.setItem('openai_api_key', openaiKey);
        if (anthropicKey) localStorage.setItem('anthropic_api_key', anthropicKey);

        alert('Settings saved! (Note: For full API integration, you need to configure the .env file on the server)');
        this.hideSettingsModal();
    }

    async checkAPIStatus() {
        try {
            const response = await fetch('/api/config/api-status');
            const data = await response.json();

            if (data.success) {
                const statusMessage = document.getElementById('api-status-message');
                if (data.api_status.openai) {
                    statusMessage.textContent = 'OpenAI API available';
                    statusMessage.style.color = 'green';
                } else if (data.api_status.anthropic) {
                    statusMessage.textContent = 'Anthropic API available';
                    statusMessage.style.color = 'green';
                } else {
                    statusMessage.textContent = 'Using local generation (API keys not configured)';
                    statusMessage.style.color = 'orange';
                }
            }
        } catch (error) {
            console.error('Error checking API status:', error);
        }
    }

    hideAllScreens() {
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('topic-screen').classList.add('hidden');
        document.getElementById('quiz-screen').classList.add('hidden');
        document.getElementById('flashcard-screen').classList.add('hidden');
        document.getElementById('progress-screen').classList.add('hidden');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StudyGuideApp();
});
