# Study Guide Agent

An intelligent, interactive study guide application that automatically recognizes educational content and provides multiple learning modes including study guides, quizzes, and flashcards.

## Features

- **Auto-Discovery**: Automatically scans and recognizes any markdown content in the Subjects folder
- **Study Mode**: Read comprehensive study guides with formatted content
- **Quiz Mode**: Generate random questions with three difficulty levels (Easy, Medium, Hard)
- **Flashcard Mode**: Interactive flashcards for quick review
- **Progress Tracking**: Track scores, study time, and identify strengths/weaknesses
- **Timed Quizzes**: Optional timer for test simulation
- **Dual AI Support**: Works offline with local generation OR use OpenAI/Claude APIs for better quality
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Web browser (Chrome, Firefox, Edge, Safari)

## Installation

### 1. Install Python Dependencies

Navigate to the study-guide-app directory and install required packages:

```bash
cd study-guide-app
pip install -r requirements.txt
```

### 2. Configure API Keys (Optional)

The app works without API keys using local question generation. For better quality AI-generated questions:

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API keys:
   ```
   # For OpenAI (GPT-4)
   OPENAI_API_KEY=sk-your-key-here

   # For Anthropic (Claude)
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

**Getting API Keys:**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/

## Running the Application

### Start the Server

From the study-guide-app directory:

```bash
python app.py
```

You should see:
```
==============================================================
  Study Guide App - Starting Server
==============================================================
  Access the app at: http://localhost:5000
  Press CTRL+C to quit
==============================================================
```

### Access the Application

Open your web browser and go to:
```
http://localhost:5000
```

## Adding New Content

The app automatically detects any content you add to the Subjects folder!

### Folder Structure

```
Subjects/
├── Social Studies/
│   ├── Ancient Mesopotamia Study Guide.md
│   └── World War II.md
├── Science/
│   ├── Biology - Cells.md
│   └── Chemistry - Periodic Table.md
└── Math/
    └── Algebra Basics.md
```

### Content Format

Create markdown (.md) files with this structure:

```markdown
# Topic Title

## Section 1

Content here...

### Subsection

More detailed content...

- Bullet points
- Are supported

**Bold terms** will be recognized as key terms.

## Key Terms

### Term Name
Definition of the term...

### Another Term
Another definition...

## Quick Quiz

1. Question text? **Answer**
2. Another question? **Another answer**
```

**Tips:**
- Use H1 (`#`) for the main title
- Use H2 (`##`) for sections
- Use H3 (`###`) for subsections or key terms
- Bold important terms with `**term**`
- The app will automatically extract and use this structure

## How to Use

### 1. Select a Topic

- Browse subjects in the left sidebar
- Click on any topic to view it

### 2. Study Mode

- Click "📖 Study" to read the full content
- All markdown formatting is preserved
- Great for initial learning

### 3. Quiz Mode

- Click "❓ Quiz" to start a quiz
- **Settings:**
  - **Difficulty**: Easy, Medium, or Hard
  - **Number of Questions**: 5-20 questions
  - **Timed Quiz**: Optional timer
  - **Generator**: Local (free) or AI (better quality)
- Answer questions one by one
- Review your results and see correct answers

### 4. Flashcard Mode

- Click "🎴 Flashcards" for quick review
- Click the card to flip between question and answer
- Navigate with Previous/Next buttons

### 5. Track Progress

- Click "View Progress" in the header
- See overall statistics:
  - Total quizzes taken
  - Average score
  - Total questions answered
  - Study time
- Review recent quizzes
- Identify strengths and weaknesses

## Understanding Question Generation

### Local Generation (Free, No API Key Required)

**How it works:**
- Extracts key information from your study guides
- Uses pattern matching to identify important facts
- Creates questions based on templates

**Best for:**
- Basic recall questions
- Definition questions
- Quick practice
- When offline or without API access

**Question Types:**
- What is [term]?
- Who was [person]?
- When did [event] occur?
- Fill in the blank

### AI Generation (Requires API Key)

**How it works:**
- Sends content to OpenAI or Anthropic
- AI understands context and creates intelligent questions
- Generates more varied and nuanced questions

**Best for:**
- Complex comprehension questions
- Application and analysis questions
- More natural language questions
- Better quality overall

**Question Types:**
- Multiple choice with distractors
- Short answer with detailed expected answers
- True/false with explanations
- Application and analysis questions

## Troubleshooting

### App won't start

**Error: `ModuleNotFoundError`**
- Solution: Install requirements: `pip install -r requirements.txt`

**Error: `Port already in use`**
- Solution: Change port in app.py line 258: `app.run(debug=True, port=5001)`

### No subjects showing up

- Check that the Subjects folder exists at: `D:\ADO\GitHub\Satya_Grade-6\Subjects`
- Verify markdown files have `.md` extension
- Restart the server after adding new content

### Questions not generating

**Local generation:**
- Make sure your content has clear structure (headings, terms, facts)
- Add more detailed content if questions are too vague

**API generation:**
- Check that API key is correctly set in `.env`
- Verify you have API credits/quota available
- Check console for error messages

### Progress not saving

- Progress is saved in `study-guide-app/data/progress.json`
- Make sure the app has write permissions to this folder
- Don't delete this file or your progress will be lost

## File Structure

```
study-guide-app/
├── app.py                          # Main Flask application
├── requirements.txt                # Python dependencies
├── .env                           # API keys (create from .env.example)
├── .env.example                   # Template for environment variables
├── README.md                      # This file
├── services/
│   ├── content_scanner.py         # Scans and parses markdown content
│   ├── question_generator.py      # Local question generation
│   ├── api_question_generator.py  # AI-powered question generation
│   └── progress_tracker.py        # Tracks learning progress
├── static/
│   ├── css/
│   │   └── style.css             # Application styles
│   └── js/
│       └── app.js                # Frontend JavaScript
├── templates/
│   └── index.html                # Main HTML template
└── data/
    └── progress.json             # Saved progress data
```

## Tips for Best Results

### Creating Content

1. **Use Clear Headings**: Help the app understand structure
2. **Bold Key Terms**: Makes them easier to extract
3. **Include Definitions**: Write clear definitions for terms
4. **Add Context**: More context = better questions
5. **Include Dates/Names**: Great for generating timeline questions

### Studying

1. **Start with Study Mode**: Read content first
2. **Use Flashcards**: Quick daily review
3. **Progress Gradually**: Easy → Medium → Hard quizzes
4. **Review Mistakes**: Check answer reviews carefully
5. **Track Progress**: Monitor improvement over time

## Privacy & Data

- **All content stays local**: Your study materials never leave your computer
- **Progress data**: Stored locally in `data/progress.json`
- **API Keys**: Only used when making API calls to generate questions
- **No tracking**: No analytics or user tracking

## Cost Information

### Free Components
- All local features are 100% free
- No limits on quizzes, flashcards, or study time

### Paid Components (Optional)
- **OpenAI API**: ~$0.01-0.02 per quiz generation (with gpt-4o-mini)
- **Anthropic API**: ~$0.01-0.02 per quiz generation (with claude-haiku)
- You only pay when using AI generation; local generation is always free

## Support

Having issues? Here's how to get help:

1. **Check the Troubleshooting section** above
2. **Look at the console** for error messages (in terminal and browser developer tools)
3. **Verify your setup**: Make sure all files are in the right place

## Future Enhancements

Potential features for future versions:
- Multiple choice question support
- Image support in flashcards
- Export progress reports
- Study schedules and reminders
- Collaborative features
- More question types
- Better AI prompts for specific subjects

## License

This is an educational project created for personal use. Feel free to modify and extend it for your own needs.

---

**Made for Grade 6 Learning** 📚✨

Happy Studying!
