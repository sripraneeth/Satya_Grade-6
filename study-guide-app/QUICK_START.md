# Quick Start Guide

Get started with the Study Guide App in 3 simple steps!

## Step 1: Install Dependencies

Open a terminal in the `study-guide-app` folder and run:

```bash
pip install -r requirements.txt
```

This will install all required Python packages.

## Step 2: Start the Server

Run the application:

```bash
python app.py
```

You should see:
```
==============================================================
  Study Guide App - Starting Server
==============================================================
  Access the app at: http://localhost:5000
```

## Step 3: Open in Browser

Open your web browser and go to:
```
http://localhost:5000
```

That's it! You're ready to study!

## First Steps in the App

1. **Browse Topics**: Look at the sidebar - you'll see "Social Studies" with "Ancient Mesopotamia Study Guide"
2. **Click on a Topic**: Click "Ancient Mesopotamia Study Guide"
3. **Try Study Mode**: Click the "📖 Study" button to read the content
4. **Try a Quiz**: Click the "❓ Quiz" button, select settings, and start a quiz!
5. **Try Flashcards**: Click the "🎴 Flashcards" button for quick review

## Adding Your Own Content

To add more study materials:

1. Go to the `Subjects` folder (one level up from study-guide-app)
2. Create a subject folder if needed (e.g., "Math", "Science")
3. Add markdown (.md) files with your study content
4. Restart the server
5. Your new content will automatically appear!

## Example Content Structure

```
Subjects/
├── Social Studies/
│   └── Ancient Mesopotamia Study Guide.md  (already exists!)
├── Math/
│   └── Algebra.md  (you can add this)
└── Science/
    └── Biology.md  (you can add this)
```

## Need Help?

Check the full README.md for detailed information, troubleshooting, and tips!

---

Happy learning! 📚
