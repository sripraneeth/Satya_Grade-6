// Content Scanner - Client-side version for GitHub Pages

class ContentScanner {
    constructor() {
        this.subjects = {};
        this.manifest = null;
    }

    async loadManifest() {
        try {
            const response = await fetch('manifest.json');
            this.manifest = await response.json();
            return this.manifest;
        } catch (error) {
            console.error('Error loading manifest:', error);
            // Fallback: try to load from Subjects directory directly
            return this.discoverContent();
        }
    }

    async discoverContent() {
        // For GitHub Pages, we need a manifest file
        // This is a fallback that tries to load known content
        const defaultManifest = {
            subjects: [
                {
                    name: "Social Studies",
                    topics: [
                        {
                            title: "Ancient Mesopotamia Study Guide",
                            file: "Subjects/Social Studies/Ancient Mesopotamia Study Guide.md"
                        }
                    ]
                }
            ]
        };
        this.manifest = defaultManifest;
        return defaultManifest;
    }

    async scanSubjects() {
        if (!this.manifest) {
            await this.loadManifest();
        }

        this.subjects = {};

        for (const subject of this.manifest.subjects) {
            this.subjects[subject.name] = [];

            for (const topic of subject.topics) {
                try {
                    const topicData = await this.loadTopicFile(topic.file);
                    if (topicData) {
                        this.subjects[subject.name].push({
                            title: topic.title,
                            file: topic.file,
                            ...topicData
                        });
                    }
                } catch (error) {
                    console.error(`Error loading topic ${topic.title}:`, error);
                }
            }
        }

        return this.subjects;
    }

    async loadTopicFile(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}`);
            }
            const content = await response.text();
            return this.parseMarkdownContent(content);
        } catch (error) {
            console.error('Error loading topic file:', error);
            return null;
        }
    }

    parseMarkdownContent(content) {
        // Extract title
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : 'Untitled';

        // Parse sections
        const sections = this.parseSections(content);

        // Extract key terms
        const keyTerms = this.extractKeyTerms(content, sections);

        // Extract quiz questions
        const quizQuestions = this.extractQuizQuestions(content);

        // Convert to HTML using marked.js
        const htmlContent = marked.parse(content);

        return {
            title,
            content,
            htmlContent,
            sections,
            keyTerms,
            quizQuestions,
            wordCount: content.split(/\s+/).length
        };
    }

    parseSections(content) {
        const sections = [];
        const sectionRegex = /^##\s+(.+)$/gm;
        const matches = [...content.matchAll(sectionRegex)];

        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const sectionTitle = match[1].trim();
            const start = match.index + match[0].length;
            const end = i + 1 < matches.length ? matches[i + 1].index : content.length;
            const sectionContent = content.substring(start, end).trim();

            sections.push({
                title: sectionTitle,
                content: sectionContent,
                subsections: this.parseSubsections(sectionContent)
            });
        }

        return sections;
    }

    parseSubsections(content) {
        const subsections = [];
        const subsectionRegex = /^###\s+(.+)$/gm;
        const matches = [...content.matchAll(subsectionRegex)];

        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const subsectionTitle = match[1].trim();
            const start = match.index + match[0].length;
            const end = i + 1 < matches.length ? matches[i + 1].index : content.length;
            const subsectionContent = content.substring(start, end).trim();

            subsections.push({
                title: subsectionTitle,
                content: subsectionContent
            });
        }

        return subsections;
    }

    extractKeyTerms(content, sections) {
        const keyTerms = [];

        // Look for sections with "KEY TERMS" or "VOCABULARY" in the title
        for (const section of sections) {
            if (section.title.toUpperCase().includes('KEY TERMS') ||
                section.title.toUpperCase().includes('VOCABULARY')) {
                for (const subsection of section.subsections) {
                    const term = subsection.title.replace(/[*_]/g, '').trim();
                    const definition = subsection.content;
                    keyTerms.push({ term, definition });
                }
            }
        }

        // Also extract bold terms with definitions
        const boldTermRegex = /\*\*([^*]+)\*\*[:\s]*([^\n]+)/g;
        const matches = [...content.matchAll(boldTermRegex)];
        for (const match of matches) {
            const term = match[1].trim();
            const definition = match[2].trim();
            if (definition.length > 10 && !keyTerms.some(kt => kt.term === term)) {
                keyTerms.push({ term, definition });
            }
        }

        return keyTerms;
    }

    extractQuizQuestions(content) {
        const quizQuestions = [];
        const questionRegex = /^\d+\.\s+(.+?)\s+\*\*(.+?)\*\*/gm;
        const matches = [...content.matchAll(questionRegex)];

        for (const match of matches) {
            quizQuestions.push({
                question: match[1].trim(),
                answer: match[2].trim(),
                source: 'embedded'
            });
        }

        return quizQuestions;
    }

    getTopicContent(subject, topicTitle) {
        if (this.subjects[subject]) {
            return this.subjects[subject].find(topic => topic.title === topicTitle);
        }
        return null;
    }

    getFormattedSubjects() {
        const formatted = [];
        for (const [subjectName, topics] of Object.entries(this.subjects)) {
            formatted.push({
                name: subjectName,
                topics: topics.map(topic => ({
                    title: topic.title,
                    sectionsCount: topic.sections?.length || 0,
                    keyTermsCount: topic.keyTerms?.length || 0,
                    wordCount: topic.wordCount || 0
                }))
            });
        }
        return formatted;
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.ContentScanner = ContentScanner;
}
