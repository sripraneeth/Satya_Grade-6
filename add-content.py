#!/usr/bin/env python3
"""
Helper script to add new study guide content to the app.
This script automatically:
1. Copies markdown files from Subjects/ to docs/Subjects/
2. Updates the manifest.json file
"""

import os
import json
import shutil
from pathlib import Path

def scan_subjects_folder():
    """Scan the Subjects folder and return the structure."""
    subjects = {}
    subjects_path = Path("Subjects")

    if not subjects_path.exists():
        print("Error: Subjects folder not found!")
        return subjects

    for subject_folder in subjects_path.iterdir():
        if subject_folder.is_dir():
            subject_name = subject_folder.name
            subjects[subject_name] = []

            for file in subject_folder.iterdir():
                if file.suffix.lower() in ['.md', '.markdown']:
                    subjects[subject_name].append({
                        "title": file.stem,
                        "file": str(file).replace('\\', '/')
                    })

    return subjects

def copy_content_to_docs():
    """Copy all markdown files from Subjects/ to docs/Subjects/."""
    subjects_path = Path("Subjects")
    docs_subjects_path = Path("docs/Subjects")

    # Remove old content
    if docs_subjects_path.exists():
        shutil.rmtree(docs_subjects_path)

    # Copy new content
    if subjects_path.exists():
        shutil.copytree(subjects_path, docs_subjects_path)
        print(f"✓ Copied content to docs/Subjects/")
    else:
        print("Error: Subjects folder not found!")

def update_manifest():
    """Update the manifest.json file."""
    subjects = scan_subjects_folder()

    manifest = {
        "subjects": [
            {
                "name": subject_name,
                "topics": topics
            }
            for subject_name, topics in subjects.items()
        ]
    }

    manifest_path = Path("docs/manifest.json")
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"✓ Updated manifest.json")

    # Print summary
    print("\n📚 Content Summary:")
    for subject in manifest["subjects"]:
        print(f"  {subject['name']}:")
        for topic in subject["topics"]:
            print(f"    - {topic['title']}")

def main():
    print("=" * 60)
    print("  Study Guide App - Content Sync Tool")
    print("=" * 60)
    print()

    # Check if we're in the right directory
    if not Path("Subjects").exists() or not Path("docs").exists():
        print("Error: Please run this script from the repository root directory")
        return

    print("Syncing content from Subjects/ to docs/...")
    print()

    # Copy content
    copy_content_to_docs()

    # Update manifest
    update_manifest()

    print()
    print("=" * 60)
    print("✓ Sync complete!")
    print()
    print("Next steps:")
    print("1. Review the changes")
    print("2. git add .")
    print("3. git commit -m 'Update study content'")
    print("4. git push")
    print()
    print("Your app will automatically update on GitHub Pages!")
    print("=" * 60)

if __name__ == "__main__":
    main()
