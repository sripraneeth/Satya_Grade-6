// Progress Tracker - Client-side using localStorage

class ProgressTracker {
    constructor() {
        this.storageKey = 'studyGuideProgress';
        this.progressData = this.loadProgress();
    }

    loadProgress() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
        return this.initializeProgressData();
    }

    initializeProgressData() {
        return {
            quizzes: [],
            flashcardSessions: [],
            topicsStudied: {},
            overallStats: {
                totalQuizzes: 0,
                totalQuestionsAnswered: 0,
                totalCorrect: 0,
                averageScore: 0,
                studyTimeMinutes: 0
            }
        };
    }

    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progressData));
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    recordQuiz(subject, topic, difficulty, questions, answers, timeTakenSeconds) {
        // Calculate score
        let correctCount = 0;
        const totalQuestions = questions.length;

        for (let i = 0; i < questions.length; i++) {
            if (i < answers.length) {
                const userAnswer = answers[i].trim().toLowerCase();
                const correctAnswer = String(questions[i].answer || '').trim().toLowerCase();

                if (userAnswer === correctAnswer || correctAnswer.includes(userAnswer) || userAnswer.includes(correctAnswer)) {
                    correctCount++;
                }
            }
        }

        const scorePercentage = totalQuestions > 0 ? (correctCount / totalQuestions * 100) : 0;

        // Create quiz record
        const quizRecord = {
            timestamp: new Date().toISOString(),
            subject: subject,
            topic: topic,
            difficulty: difficulty,
            totalQuestions: totalQuestions,
            correctAnswers: correctCount,
            scorePercentage: Math.round(scorePercentage * 100) / 100,
            timeTakenSeconds: timeTakenSeconds,
            questionsAndAnswers: questions.map((q, i) => ({
                question: q.question,
                userAnswer: answers[i] || '',
                correctAnswer: q.answer || '',
                wasCorrect: i < answers.length &&
                    (answers[i].trim().toLowerCase() === String(q.answer || '').trim().toLowerCase() ||
                     String(q.answer || '').trim().toLowerCase().includes(answers[i].trim().toLowerCase()))
            }))
        };

        // Add to quiz history
        this.progressData.quizzes.push(quizRecord);

        // Update topic stats
        const topicKey = `${subject}_${topic}`;
        if (!this.progressData.topicsStudied[topicKey]) {
            this.progressData.topicsStudied[topicKey] = {
                subject: subject,
                topic: topic,
                timesStudied: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                averageScore: 0,
                lastStudied: null
            };
        }

        const topicStats = this.progressData.topicsStudied[topicKey];
        topicStats.timesStudied += 1;
        topicStats.totalQuestions += totalQuestions;
        topicStats.totalCorrect += correctCount;
        topicStats.averageScore = Math.round(
            (topicStats.totalCorrect / topicStats.totalQuestions * 100) * 100
        ) / 100;
        topicStats.lastStudied = quizRecord.timestamp;

        // Update overall stats
        const overall = this.progressData.overallStats;
        overall.totalQuizzes += 1;
        overall.totalQuestionsAnswered += totalQuestions;
        overall.totalCorrect += correctCount;
        overall.averageScore = overall.totalQuestionsAnswered > 0
            ? Math.round((overall.totalCorrect / overall.totalQuestionsAnswered * 100) * 100) / 100
            : 0;
        overall.studyTimeMinutes += Math.round(timeTakenSeconds / 60 * 100) / 100;

        this.saveProgress();
        return quizRecord;
    }

    recordFlashcardSession(subject, topic, cardsReviewed, timeTakenSeconds) {
        const session = {
            timestamp: new Date().toISOString(),
            subject: subject,
            topic: topic,
            cardsReviewed: cardsReviewed,
            timeTakenSeconds: timeTakenSeconds
        };

        this.progressData.flashcardSessions.push(session);
        this.progressData.overallStats.studyTimeMinutes += Math.round(timeTakenSeconds / 60 * 100) / 100;

        this.saveProgress();
        return session;
    }

    getOverallStats() {
        return this.progressData.overallStats;
    }

    getTopicStats(subject = null, topic = null) {
        if (subject && topic) {
            const topicKey = `${subject}_${topic}`;
            return this.progressData.topicsStudied[topicKey] || {};
        }
        return this.progressData.topicsStudied;
    }

    getRecentQuizzes(limit = 10) {
        return this.progressData.quizzes
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    getQuizHistoryByTopic(subject, topic) {
        return this.progressData.quizzes.filter(
            quiz => quiz.subject === subject && quiz.topic === topic
        );
    }

    getStrengthsAndWeaknesses() {
        const topics = Object.values(this.progressData.topicsStudied);

        if (topics.length === 0) {
            return { strengths: [], weaknesses: [], needsReview: [] };
        }

        const sorted = [...topics].sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));

        const strengths = sorted.filter(t => (t.averageScore || 0) >= 80).slice(0, 5);
        const weaknesses = sorted.filter(t => (t.averageScore || 0) < 60).slice(0, 5);
        const needsReview = sorted.filter(t => (t.averageScore || 0) >= 60 && (t.averageScore || 0) < 80).slice(0, 5);

        return { strengths, weaknesses, needsReview };
    }

    clearProgress() {
        if (confirm('Are you sure you want to clear all progress? This cannot be undone.')) {
            this.progressData = this.initializeProgressData();
            this.saveProgress();
            return true;
        }
        return false;
    }

    exportProgress() {
        const dataStr = JSON.stringify(this.progressData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `study-guide-progress-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    importProgress(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (imported.quizzes && imported.overallStats) {
                    this.progressData = imported;
                    this.saveProgress();
                    alert('Progress imported successfully!');
                    location.reload();
                } else {
                    alert('Invalid progress file format.');
                }
            } catch (error) {
                alert('Error importing progress: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.ProgressTracker = ProgressTracker;
}
