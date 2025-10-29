// Question Generator - Client-side version

class QuestionGenerator {
    constructor() {
        this.questionTemplates = {
            who: [
                "Who was {entity}?",
                "Who created {entity}?",
                "Who was known for {achievement}?",
                "Who ruled {place}?"
            ],
            what: [
                "What was {term}?",
                "What is {term}?",
                "What did {entity} accomplish?",
                "What were the main achievements of {entity}?",
                "What was {entity} known for?"
            ],
            when: [
                "When did {event} occur?",
                "When was {entity} in power?",
                "When did {entity} rule?"
            ],
            where: [
                "Where was {place} located?",
                "Where did {entity} rule?",
                "Where was the {term}?"
            ]
        };
    }

    generateQuestions(topicData, difficulty = 'medium', count = 10) {
        let questions = [];

        // Use embedded quiz questions first
        if (topicData.quizQuestions && topicData.quizQuestions.length > 0) {
            questions.push(...this.formatEmbeddedQuestions(topicData.quizQuestions));
        }

        // Generate from key terms
        if (topicData.keyTerms && topicData.keyTerms.length > 0) {
            questions.push(...this.generateFromKeyTerms(topicData.keyTerms, difficulty));
        }

        // Generate from sections
        if (topicData.sections && topicData.sections.length > 0) {
            questions.push(...this.generateFromSections(topicData.sections, difficulty));
        }

        // Shuffle questions
        questions = this.shuffleArray(questions);

        // Adjust for difficulty
        questions = this.adjustForDifficulty(questions, difficulty);

        // Return requested count
        return questions.slice(0, count);
    }

    formatEmbeddedQuestions(quizQuestions) {
        return quizQuestions.map(q => ({
            question: q.question,
            answer: q.answer,
            type: 'short_answer',
            difficulty: 'medium',
            source: 'embedded'
        }));
    }

    generateFromKeyTerms(keyTerms, difficulty) {
        const questions = [];

        for (const termData of keyTerms) {
            const term = termData.term;
            const definition = termData.definition;

            // Basic definition question
            questions.push({
                question: `What is/are ${term}?`,
                answer: definition.substring(0, 200),
                type: 'definition',
                difficulty: 'easy',
                term: term
            });

            // Extract facts
            const facts = this.extractFacts(definition);
            for (const fact of facts.slice(0, 2)) {
                if (difficulty !== 'easy') {
                    questions.push({
                        question: `What did ${term} accomplish or create?`,
                        answer: fact,
                        type: 'fact',
                        difficulty: 'medium',
                        term: term
                    });
                }
            }

            // Fill-in-the-blank for hard questions
            if (difficulty === 'hard') {
                const fillBlank = this.createFillBlank(term, definition);
                if (fillBlank) {
                    questions.push(fillBlank);
                }
            }
        }

        return questions;
    }

    generateFromSections(sections, difficulty) {
        const questions = [];

        for (const section of sections) {
            const sectionTitle = section.title;
            const content = section.content;

            // Extract entities
            const entities = this.extractEntities(content).slice(0, 3);

            // Extract dates
            const dates = this.extractDates(content).slice(0, 2);

            // Extract achievements
            const achievements = this.extractAchievements(content).slice(0, 2);

            // Generate questions
            for (const entity of entities) {
                questions.push({
                    question: `Who or what was ${entity}?`,
                    answer: this.findContext(entity, content),
                    type: 'identification',
                    difficulty: 'easy',
                    section: sectionTitle
                });
            }

            for (const [date, event] of dates) {
                questions.push({
                    question: `What happened in ${date}?`,
                    answer: event,
                    type: 'timeline',
                    difficulty: 'medium',
                    section: sectionTitle
                });
            }

            for (const achievement of achievements) {
                questions.push({
                    question: `What was significant about ${achievement.subject}?`,
                    answer: achievement.detail,
                    type: 'significance',
                    difficulty: 'medium',
                    section: sectionTitle
                });
            }
        }

        return questions;
    }

    extractFacts(text) {
        const facts = [];

        // Extract bullet points
        const bulletRegex = /[-•]\s*(.+?)(?=\n|$)/g;
        const bullets = [...text.matchAll(bulletRegex)];
        for (const match of bullets) {
            if (match[1].length > 20) {
                facts.push(match[1].trim());
            }
        }

        // Extract achievement patterns
        const achievementRegex = /(created|built|founded|conquered|developed|invented)\s+(.+?)(?=[.!?\n])/gi;
        const achievements = [...text.matchAll(achievementRegex)];
        for (const match of achievements) {
            facts.push(`${match[1]} ${match[2]}`);
        }

        return facts.slice(0, 5);
    }

    extractEntities(text) {
        const entityRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b/g;
        const matches = [...text.matchAll(entityRegex)];
        const entities = matches.map(m => m[1]).filter(e =>
            e.length > 3 && !['The', 'This', 'That', 'These', 'Those'].includes(e)
        );
        return [...new Set(entities)].slice(0, 10);
    }

    extractDates(text) {
        const dates = [];
        const dateRegex = /(c\.\s*)?(\d{1,4}(?:\s*-\s*\d{1,4})?)\s*(BCE?|CE?|BC|AD)/g;
        const matches = [...text.matchAll(dateRegex)];

        for (const match of matches) {
            const date = match[0];
            const start = Math.max(0, match.index - 50);
            const end = Math.min(text.length, match.index + match[0].length + 50);
            const context = text.substring(start, end).trim();
            dates.push([date, context]);
        }

        return dates.slice(0, 5);
    }

    extractAchievements(text) {
        const achievements = [];
        const markers = ['created', 'built', 'founded', 'conquered', 'developed', 'invented', 'established'];

        for (const marker of markers) {
            const regex = new RegExp(`(\\w+(?:\\s+\\w+){0,2})\\s+${marker}\\s+(.+?)(?=[.!?\\n])`, 'gi');
            const matches = [...text.matchAll(regex)];
            for (const match of matches) {
                achievements.push({
                    subject: match[1].trim(),
                    action: marker,
                    detail: match[2].trim().substring(0, 100)
                });
            }
        }

        return achievements.slice(0, 5);
    }

    findContext(entity, text, window = 100) {
        const index = text.indexOf(entity);
        if (index === -1) return '';
        const start = Math.max(0, index - window);
        const end = Math.min(text.length, index + entity.length + window);
        return text.substring(start, end).trim();
    }

    createFillBlank(term, definition) {
        const sentences = definition.split(/[.!?]/);

        for (const sentence of sentences) {
            if (sentence.split(/\s+/).length > 5) {
                const words = sentence.split(/\s+/);
                const importantWords = words.filter(w => w.length > 5 || /^[A-Z]/.test(w));

                if (importantWords.length > 0) {
                    const wordToBlank = importantWords[Math.floor(Math.random() * importantWords.length)];
                    const questionText = sentence.replace(wordToBlank, '______');

                    return {
                        question: `Fill in the blank: ${questionText}`,
                        answer: wordToBlank.replace(/[.,!?]/g, ''),
                        type: 'fill_blank',
                        difficulty: 'hard'
                    };
                }
            }
        }

        return null;
    }

    adjustForDifficulty(questions, difficulty) {
        let priorityTypes;

        if (difficulty === 'easy') {
            priorityTypes = ['definition', 'identification', 'embedded'];
        } else if (difficulty === 'medium') {
            priorityTypes = ['fact', 'timeline', 'significance', 'embedded'];
        } else {
            priorityTypes = ['fill_blank', 'significance', 'fact'];
        }

        const prioritized = questions.filter(q => priorityTypes.includes(q.type));
        const others = questions.filter(q => !priorityTypes.includes(q.type));

        return [...prioritized, ...others];
    }

    generateFlashcards(topicData) {
        const flashcards = [];

        // From key terms
        if (topicData.keyTerms) {
            for (const termData of topicData.keyTerms) {
                flashcards.push({
                    front: termData.term,
                    back: termData.definition,
                    type: 'term_definition'
                });
            }
        }

        // From quiz questions
        if (topicData.quizQuestions) {
            for (const q of topicData.quizQuestions.slice(0, 10)) {
                flashcards.push({
                    front: q.question,
                    back: q.answer,
                    type: 'qa'
                });
            }
        }

        return flashcards;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.QuestionGenerator = QuestionGenerator;
}
