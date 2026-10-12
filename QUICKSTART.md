# 🚀 התחלה מהירה - Maaser Manager

## שלב 1️⃣: הורדה וסידור

```bash
# 1. פתח Terminal/Command Prompt

# 2. הלך לתיקייה בה אתה רוצה את הפרויקט:
cd ~/Projects
# או:
cd C:\Users\YourName\Projects

# 3. Clone מ-GitHub (אם כבר יצרת repository):
git clone https://github.com/yourusername/maaser-manager.git
cd maaser-manager

# או: הורד את ה-ZIP ופתח אותו
```

## שלב 2️⃣: הרץ מקומי

### אפשרות A: Python (הכי פשוט)
```bash
# בתיקיית maaser-manager
python3 -m http.server 8000

# פתח בדפדפן: http://localhost:8000
# עצור עם Ctrl+C
```

### אפשרות B: פתח ישירות
```bash
# פשוט כפול-לחץ על index.html
# או: right-click → "Open with Browser"
```

## שלב 3️⃣: שמור בGit (ראשון פעם)

```bash
git config user.name "Your Name"
git config user.email "your@email.com"
git add .
git commit -m "Initial commit"
```

## שלב 4️⃣: העלה לGitHub

```bash
# יוצר repository חדש ב-GitHub (עם אותו שם)

git remote add origin https://github.com/yourusername/maaser-manager.git
git branch -M main
git push -u origin main
```

## שלב 5️⃣: Deploy ל-GitHub Pages (אפשרי)

ב-GitHub:
1. Settings → Pages
2. Branch: main, Folder: / (root)
3. Save
4. חכה 2 דקות
5. כתובת: https://yourusername.github.io/maaser-manager/

## 📝 שימוש בעתיד

```bash
# עריכה → שמור בקובץ

# בדיקה בדפדפן (אם הרץ):
# http://localhost:8000 (Refresh: Ctrl+Shift+R)

# שדר לGitHub:
git add .
git commit -m "Your change description"
git push

# בGitHub Pages - עדכון אוטומטי תוך דקות!
```

## 🐢 צעדים בטיחותיים

```bash
# ראה השינויים לפני commit:
git status
git diff

# ביטול שינוי אחרון:
git reset --hard HEAD

# ביטול Commit אחרון (לפני push):
git reset --soft HEAD~1
```

## ✅ רשימת בדיקה

- [ ] Python/Browser פתוח
- [ ] index.html עובד בדפדפן
- [ ] Navigator תחתון רואים
- [ ] Dashboard מופיע
- [ ] Git initialized
- [ ] GitHub repo יצור
- [ ] Push הראשון עבר
- [ ] GitHub Pages מוגדר

---

**כל שאלה? בדוק את README.md**

**יותר הוראות → תלך ל-GitHub Desktop או VS Code עם Git Extension** 💡
