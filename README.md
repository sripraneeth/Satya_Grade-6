# Study Guide Agent - Grade 6 📚

An intelligent, interactive study guide application that automatically recognizes educational content and provides multiple learning modes including study guides, quizzes, and flashcards.

**Live Demo:** Once deployed, access at `https://YOUR-USERNAME.github.io/Satya_Grade-6/`

## ✨ Features

- 📖 **Study Mode** - Read comprehensive, well-formatted study guides
- ❓ **Quiz Mode** - Auto-generated questions with 3 difficulty levels
- 🎴 **Flashcard Mode** - Interactive flashcards for quick review
- 📊 **Progress Tracking** - Track scores, study time, and improvements
- ⏱️ **Timed Quizzes** - Optional timer for test simulation
- 🌐 **Online Access** - Available anywhere via GitHub Pages
- 📱 **Mobile Friendly** - Works on all devices

## 🚀 Quick Start

### Option 1: Use Online (Recommended for Students)

1. Visit the deployed app at: `https://YOUR-USERNAME.github.io/Satya_Grade-6/`
2. Select a subject and topic from the sidebar
3. Start learning!

### Option 2: Run Locally (for Development)

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/Satya_Grade-6.git
cd Satya_Grade-6

# Open the app
cd docs
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

### Option 3: Run Flask Version (Advanced Features)

```bash
cd study-guide-app
pip install -r requirements.txt
python app.py
# Open http://localhost:5000
```

## 📁 Repository Structure

```
Satya_Grade-6/
├── docs/                          # GitHub Pages app (deployed online)
│   ├── index.html
│   ├── manifest.json             # Content index
│   ├── css/, js/                 # App files
│   └── Subjects/                 # Study content (web copy)
│
├── Subjects/                      # Original study content
│   ├── Social Studies/
│   │   └── Ancient Mesopotamia Study Guide.md
│   ├── Math/
│   ├── Science/
│   └── ...
│
├── study-guide-app/              # Flask version (optional, local use)
│   ├── app.py
│   ├── services/
│   └── ...
│
├── .github/workflows/            # Auto-deployment config
│   └── deploy.yml
│
├── add-content.py                # Helper script to add content
├── DEPLOYMENT_GUIDE.md           # Deployment instructions
└── README.md                     # This file
```

## 📝 Adding New Content

### Easy Method (Using Helper Script):

```bash
# 1. Add markdown files to Subjects/ folder
# 2. Run the sync script
python add-content.py

# 3. Commit and push
git add .
git commit -m "Add new study content"
git push
```

The app will automatically update on GitHub Pages in 1-2 minutes!

### Manual Method:

1. Create markdown file in `Subjects/[Subject Name]/`
2. Copy it to `docs/Subjects/[Subject Name]/`
3. Update `docs/manifest.json`:

```json
{
  "subjects": [
    {
      "name": "Social Studies",
      "topics": [
        {
          "title": "Ancient Mesopotamia Study Guide",
          "file": "Subjects/Social Studies/Ancient Mesopotamia Study Guide.md"
        }
      ]
    }
  ]
}
```

4. Commit and push changes

## 📖 Content Format

Create markdown files with this structure:

```markdown
# Topic Title

## Section 1

Content here...

### Subsection

More detailed content...

## Key Terms

### Term Name
Definition of the term...

### Another Term
Another definition...

## Quick Quiz

1. Question text? **Answer**
2. Another question? **Another answer**
```

The app automatically extracts:
- Sections and subsections
- Key terms and definitions
- Embedded quiz questions
- Important facts and dates

## 🌐 Deployment to GitHub Pages

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete instructions.

**Quick steps:**

1. Push this repository to GitHub
2. Enable GitHub Pages in repository settings
3. Select "GitHub Actions" as the source
4. Done! Your app is live at `https://USERNAME.github.io/Satya_Grade-6/`

## 🎯 How to Use the App

### Study Mode
1. Select a topic from the sidebar
2. Click "📖 Study"
3. Read the formatted content

### Quiz Mode
1. Click "❓ Quiz"
2. Choose difficulty, number of questions, and timer options
3. Answer questions
4. Review your score and correct answers

### Flashcard Mode
1. Click "🎴 Flashcards"
2. Read the front of the card
3. Click to flip and see the answer
4. Navigate through cards

### Progress Tracking
1. Click "View Progress" in the header
2. See overall statistics
3. Review recent quizzes
4. Identify strengths and weaknesses

## 🔧 Technical Details

### Static Version (docs/)
- **Frontend**: HTML, CSS, JavaScript
- **Libraries**: marked.js for markdown parsing
- **Storage**: localStorage for progress tracking
- **Hosting**: GitHub Pages (free)

### Flask Version (study-guide-app/)
- **Backend**: Python Flask
- **Features**: API endpoints, server-side processing
- **Optional**: OpenAI/Claude API integration for better questions

## 📊 Features Comparison

| Feature | Static (docs/) | Flask (study-guide-app/) |
|---------|---------------|--------------------------|
| Online Access | ✅ GitHub Pages | ❌ Requires server |
| Question Generation | ✅ Local | ✅ Local + AI APIs |
| Progress Tracking | ✅ Browser storage | ✅ File storage |
| Setup Difficulty | ⭐ Easy | ⭐⭐ Medium |
| Cost | 🆓 Free | 🆓 Free (💰 paid for AI APIs) |

## 🛠️ Development

### Testing Locally

```bash
# Static version
cd docs
python -m http.server 8000

# Flask version
cd study-guide-app
pip install -r requirements.txt
python app.py
```

### Adding Features

- Edit `docs/js/app.js` for app logic
- Edit `docs/css/style.css` for styling
- Edit `docs/js/questionGenerator.js` for quiz logic

## 📚 Documentation

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - How to deploy to GitHub Pages
- [study-guide-app/README.md](study-guide-app/README.md) - Flask version docs
- [study-guide-app/QUICK_START.md](study-guide-app/QUICK_START.md) - Quick setup guide

## 🔒 Privacy & Data

- **Content**: Stored in your GitHub repository
- **Progress**: Saved locally in browser (localStorage)
- **No tracking**: No analytics or data collection
- **Offline capable**: Works without internet after first load

## 🎓 Perfect For

- Grade 6 students (and other grades!)
- Homeschooling
- Test preparation
- Self-paced learning
- Quick review sessions

## 🤝 Contributing

Want to improve the app?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📜 License

This project is created for educational purposes. Feel free to use and modify for your own learning needs.

## ⭐ Show Your Support

If this helps your studies, give it a star on GitHub!

---

**Made with ❤️ for Grade 6 Learning**

Happy Studying! 📚✨
