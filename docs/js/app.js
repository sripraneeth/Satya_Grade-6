// Study Guide App - Static Version for GitHub Pages
class StudyGuideApp {
    constructor() {
        this.scanner = new ContentScanner();
        this.questionGenerator = new QuestionGenerator();
        this.progressTracker = new ProgressTracker();
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

    async init() {
        await this.loadSubjects();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('progress-btn').addEventListener('click', () => this.showProgressScreen());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettingsModal());
        document.getElementById('close-settings').addEventListener('click', () => this.hideSettingsModal());
        document.getElementById('save-settings-btn').addEventListener('click', () => this.saveSettings());
        document.getElementById('clear-progress-btn').addEventListener('click', () => {
            if (this.progressTracker.clearProgress()) this.showProgressScreen();
        });
        document.getElementById('study-mode-btn').addEventListener('click', () => this.showStudyMode());
        document.getElementById('quiz-mode-btn').addEventListener('click', () => this.showQuizMode());
        document.getElementById('flashcard-mode-btn').addEventListener('click', () => this.showFlashcardMode());
        document.getElementById('start-quiz-btn').addEventListener('click', () => this.startQuiz());
        document.getElementById('prev-question-btn').addEventListener('click', () => this.previousQuestion());
        document.getElementById('next-question-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('submit-quiz-btn').addEventListener('click', () => this.submitQuiz());
        document.getElementById('quit-quiz-btn').addEventListener('click', () => this.quitQuiz());
        document.getElementById('review-answers-btn').addEventListener('click', () => this.showAnswerReview());
        document.getElementById('retake-quiz-btn').addEventListener('click', () => this.showQuizMode());
        document.getElementById('back-to-topic-btn').addEventListener('click', () => this.showTopicScreen());
        document.getElementById('flashcard').addEventListener('click', () => this.flipFlashcard());
        document.getElementById('prev-flashcard-btn').addEventListener('click', () => this.previousFlashcard());
        document.getElementById('next-flashcard-btn').addEventListener('click', () => this.nextFlashcard());
        document.getElementById('quit-flashcard-btn').addEventListener('click', () => this.quitFlashcards());
        document.getElementById('close-progress-btn').addEventListener('click', () => this.hideProgressScreen());
    }

    async loadSubjects() {
        try {
            await this.scanner.scanSubjects();
            this.renderSubjects(this.scanner.getFormattedSubjects());
        } catch (error) {
            console.error('Error loading subjects:', error);
            document.getElementById('subjects-list').innerHTML = '<div class="error">Error loading subjects.</div>';
        }
    }

    renderSubjects(subjects) {
        const list = document.getElementById('subjects-list');
        list.innerHTML = '';
        subjects.forEach(subject => {
            const div = document.createElement('div');
            div.className = 'subject-item';
            div.innerHTML = `<div class="subject-header">${subject.name}</div><div class="topics-list"></div>`;
            const topicsList = div.querySelector('.topics-list');
            subject.topics.forEach(topic => {
                const item = document.createElement('div');
                item.className = 'topic-item';
                item.textContent = topic.title;
                item.addEventListener('click', () => this.selectTopic(subject.name, topic.title));
                topicsList.appendChild(item);
            });
            list.appendChild(div);
        });
    }

    selectTopic(subject, topic) {
        this.currentSubject = subject;
        this.currentTopic = topic;
        document.querySelectorAll('.topic-item').forEach(i => i.classList.remove('active'));
        event.target.classList.add('active');
        this.currentTopicData = this.scanner.getTopicContent(subject, topic);
        if (this.currentTopicData) this.showTopicScreen();
    }

    showTopicScreen() {
        this.hideAllScreens();
        document.getElementById('topic-screen').classList.remove('hidden');
        document.getElementById('topic-title').textContent = this.currentTopicData.title;
        this.showStudyMode();
    }

    showStudyMode() {
        document.getElementById('topic-content').innerHTML = this.currentTopicData.htmlContent;
    }

    showQuizMode() {
        this.hideAllScreens();
        document.getElementById('quiz-screen').classList.remove('hidden');
        document.getElementById('quiz-setup').classList.remove('hidden');
        document.getElementById('quiz-questions').classList.add('hidden');
        document.getElementById('quiz-results').classList.add('hidden');
    }

    startQuiz() {
        const difficulty = document.getElementById('quiz-difficulty').value;
        const count = parseInt(document.getElementById('quiz-count').value);
        const timed = document.getElementById('timed-quiz').checked;
        this.currentQuestions = this.questionGenerator.generateQuestions(this.currentTopicData, difficulty, count);
        if (this.currentQuestions.length > 0) {
            this.quizAnswers = new Array(this.currentQuestions.length).fill('');
            this.currentQuestionIndex = 0;
            this.quizStartTime = Date.now();
            document.getElementById('quiz-setup').classList.add('hidden');
            document.getElementById('quiz-questions').classList.remove('hidden');
            if (timed) {
                this.startTimer();
                document.getElementById('quiz-timer').classList.remove('hidden');
            } else {
                document.getElementById('quiz-timer').classList.add('hidden');
            }
            this.showQuestion();
        } else alert('Failed to generate questions.');
    }

    showQuestion() {
        const q = this.currentQuestions[this.currentQuestionIndex];
        document.getElementById('current-question').textContent = q.question;
        document.getElementById('answer-input').value = this.quizAnswers[this.currentQuestionIndex];
        document.getElementById('quiz-question-counter').textContent = `Question ${this.currentQuestionIndex + 1} of ${this.currentQuestions.length}`;
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
        this.quizAnswers[this.currentQuestionIndex] = document.getElementById('answer-input').value;
    }

    submitQuiz() {
        this.saveCurrentAnswer();
        this.stopTimer();
        const time = Math.floor((Date.now() - this.quizStartTime) / 1000);
        const result = this.progressTracker.recordQuiz(this.currentSubject, this.currentTopic,
            document.getElementById('quiz-difficulty').value, this.currentQuestions, this.quizAnswers, time);
        this.showQuizResults(result);
    }

    showQuizResults(result) {
        document.getElementById('quiz-questions').classList.add('hidden');
        document.getElementById('quiz-results').classList.remove('hidden');
        document.getElementById('quiz-score').textContent = `${result.scorePercentage}%`;
        document.getElementById('correct-count').textContent = result.correctAnswers;
        document.getElementById('incorrect-count').textContent = result.totalQuestions - result.correctAnswers;
        const m = Math.floor(result.timeTakenSeconds / 60), s = result.timeTakenSeconds % 60;
        document.getElementById('time-taken').textContent = `${m}:${s.toString().padStart(2, '0')}`;
    }

    showAnswerReview() {
        const div = document.getElementById('answer-review');
        div.classList.remove('hidden');
        div.innerHTML = '';
        this.currentQuestions.forEach((q, i) => {
            const ua = this.quizAnswers[i].trim().toLowerCase();
            const ca = String(q.answer).trim().toLowerCase();
            const correct = ua === ca || ca.includes(ua) || ua.includes(ca);
            const item = document.createElement('div');
            item.className = `review-item ${correct ? 'correct' : 'incorrect'}`;
            item.innerHTML = `<h4>Question ${i + 1}</h4><p><strong>Q:</strong> ${q.question}</p>
                <p><strong>Your:</strong> ${this.quizAnswers[i] || '(No answer)'}</p>
                <p><strong>Correct:</strong> ${q.answer}</p>`;
            div.appendChild(item);
        });
    }

    quitQuiz() {
        this.stopTimer();
        this.showTopicScreen();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const e = Math.floor((Date.now() - this.quizStartTime) / 1000);
            const m = Math.floor(e / 60), s = e % 60;
            document.getElementById('quiz-timer').textContent = `Time: ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    showFlashcardMode() {
        this.hideAllScreens();
        document.getElementById('flashcard-screen').classList.remove('hidden');
        this.currentFlashcards = this.questionGenerator.generateFlashcards(this.currentTopicData);
        this.currentFlashcardIndex = 0;
        this.flashcardStartTime = Date.now();
        this.showFlashcard();
    }

    showFlashcard() {
        if (this.currentFlashcards.length === 0) {
            alert('No flashcards available.');
            return;
        }
        const fc = this.currentFlashcards[this.currentFlashcardIndex];
        document.getElementById('flashcard-front').textContent = fc.front;
        document.getElementById('flashcard-back').textContent = fc.back;
        document.getElementById('flashcard-counter').textContent = `Card ${this.currentFlashcardIndex + 1} of ${this.currentFlashcards.length}`;
        document.getElementById('flashcard').classList.remove('flipped');
        document.getElementById('prev-flashcard-btn').disabled = this.currentFlashcardIndex === 0;
        document.getElementById('next-flashcard-btn').disabled = this.currentFlashcardIndex === this.currentFlashcards.length - 1;
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

    quitFlashcards() {
        const time = Math.floor((Date.now() - this.flashcardStartTime) / 1000);
        this.progressTracker.recordFlashcardSession(this.currentSubject, this.currentTopic, this.currentFlashcardIndex + 1, time);
        this.showTopicScreen();
    }

    showProgressScreen() {
        this.hideAllScreens();
        document.getElementById('progress-screen').classList.remove('hidden');
        const s = this.progressTracker.getOverallStats();
        document.getElementById('total-quizzes').textContent = s.totalQuizzes;
        document.getElementById('avg-score').textContent = `${s.averageScore}%`;
        document.getElementById('total-questions').textContent = s.totalQuestionsAnswered;
        document.getElementById('study-time').textContent = `${Math.round(s.studyTimeMinutes)}m`;
        const rq = this.progressTracker.getRecentQuizzes(5);
        const rd = document.getElementById('recent-quizzes');
        rd.innerHTML = rq.length === 0 ? '<p>No quizzes yet</p>' : '';
        rq.forEach(q => {
            const i = document.createElement('div');
            i.className = 'quiz-item';
            i.innerHTML = `<div><strong>${q.topic}</strong></div><div>Score: ${q.scorePercentage}% | ${new Date(q.timestamp).toLocaleDateString()}</div>`;
            rd.appendChild(i);
        });
        const sw = this.progressTracker.getStrengthsAndWeaknesses();
        const swd = document.getElementById('strengths-weaknesses');
        swd.innerHTML = '';
        if (sw.strengths.length > 0) {
            swd.innerHTML += '<h4>Strengths</h4><ul>';
            sw.strengths.forEach(t => swd.innerHTML += `<li>${t.topic} - ${t.averageScore}%</li>`);
            swd.innerHTML += '</ul>';
        }
        if (sw.weaknesses.length > 0) {
            swd.innerHTML += '<h4>Needs Practice</h4><ul>';
            sw.weaknesses.forEach(t => swd.innerHTML += `<li>${t.topic} - ${t.averageScore}%</li>`);
            swd.innerHTML += '</ul>';
        }
        if (sw.strengths.length === 0 && sw.weaknesses.length === 0) {
            swd.innerHTML = '<p>Take more quizzes to see your progress!</p>';
        }
    }

    hideProgressScreen() {
        document.getElementById('progress-screen').classList.add('hidden');
        if (this.currentTopicData) this.showTopicScreen();
        else document.getElementById('welcome-screen').classList.remove('hidden');
    }

    showSettingsModal() {
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    hideSettingsModal() {
        document.getElementById('settings-modal').classList.add('hidden');
    }

    saveSettings() {
        alert('Settings saved!');
        this.hideSettingsModal();
    }

    hideAllScreens() {
        ['welcome-screen', 'topic-screen', 'quiz-screen', 'flashcard-screen', 'progress-screen'].forEach(id =>
            document.getElementById(id).classList.add('hidden')
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new StudyGuideApp();
});
