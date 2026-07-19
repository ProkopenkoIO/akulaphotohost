#!/usr/bin/env python3
import json, os, subprocess, sys

IMAGES_DIR = "images"
IMAGES_JSON = "images.json"
EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".bmp", ".svg"}

def scan():
    if not os.path.isdir(IMAGES_DIR):
        print(f"Помилка: папка '{IMAGES_DIR}' не знайдена")
        sys.exit(1)
    items = []
    for f in os.listdir(IMAGES_DIR):
        ext = os.path.splitext(f)[1].lower()
        if ext in EXTENSIONS:
            items.append({"filename": f, "title": os.path.splitext(f)[0]})
    items.sort(key=lambda x: x["filename"].lower())
    return items

def write_json(items):
    with open(IMAGES_JSON, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    print(f"OK — знайдено {len(items)} фото, оновлено {IMAGES_JSON}")

def git_push(msg):
    try:
        subprocess.run(["git", "add", IMAGES_DIR, IMAGES_JSON], check=True, capture_output=True)
        r = subprocess.run(["git", "commit", "-m", msg], capture_output=True, text=True)
        if r.returncode != 0 and "nothing to commit" not in r.stderr and "nothing to commit" not in r.stdout:
            print(f"git commit: {r.stderr.strip()}")
            return
        subprocess.run(["git", "push"], check=True, capture_output=True)
        print("OK — зміни запушено на GitHub")
    except subprocess.CalledProcessError as e:
        print(f"git помилка: {e.stderr.decode() if e.stderr else e}")

if __name__ == "__main__":
    no_push = "--no-push" in sys.argv
    commit_msg = "update: додано фото"
    for a in sys.argv[1:]:
        if not a.startswith("--"):
            commit_msg = a
            break
    items = scan()
    if not items:
        print("У папці images/ немає зображень")
        sys.exit(1)
    write_json(items)
    if not no_push:
        git_push(commit_msg)
    else:
        print("--no-push: git пропущено")
