# ניהול המעשרות - Maaser Manager

אפליקציית Web אישית לניהול וחישוב מעשר כספים. PWA מלאה עם תמיכה בעברית RTL.

## 🌟 תכונות

- ✅ ממשק בעברית מלא עם RTL
- ✅ חישוב אוטומטי של חוב מעשר חודשי
- ✅ ניהול תרומות וקטגוריות
- ✅ סיכומים חודשיים מפורטים
- ✅ אחסון מקומי בלבד (IndexedDB)
- ✅ PWA - התקנה כאפליקציית מקומית
- ✅ ייצוא וייבוא נתונים (JSON ו-CSV)
- ✅ עובד באופן offline
- ✅ ממשק מגיב ומהיר
- ✅ בלי צורך בשרת Backend

## 📋 דרישות

- דפדפן מודרני (Chrome, Firefox, Safari, Edge)
- Node.js 14+ (לפיתוח בלבד, לא נדרש לשימוש)
- Python 3 (לשרת לוקאלי, אופציוני)

## 🚀 התחלה מהירה

### 1. הורדת הפרויקט

```bash
# Clone the repository
git clone https://github.com/yourusername/maaser-manager.git
cd maaser-manager

# Or download as ZIP and extract
```

### 2. הרצה מקומית

**אפשרות 1: באמצעות Python**
```bash
# Python 3
python3 -m http.server 8000

# ואז פתח את הדפדפן ב:
# http://localhost:8000
```

**אפשרות 2: באמצעות Node.js**
```bash
npm install -g http-server
http-server -p 8000 -c-1
```

**אפשרות 3: פתח את index.html ישירות**
```bash
# פשוט פתח את index.html בדפדפן
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

## 📁 מבנה הפרויקט

```
maaser-manager/
├── index.html           # Entry point
├── manifest.json        # PWA configuration
├── service-worker.js    # Offline support
├── package.json         # Project metadata
├── README.md            # This file
│
├── css/
│   └── main.css         # All styles (responsive, RTL, design system)
│
└── js/
    ├── app.js           # Main application orchestrator
    ├── db.js            # IndexedDB management
    ├── calculations.js  # Maaser calculation logic
    ├── ui.js            # Screen rendering and components
    └── utils.js         # Helper functions
```

## 🔧 תזוזת Git & GitHub

### הגדרה ראשונית

```bash
# תשובות במחשב שלך
git init

# הגדר את הפרטים שלך
git config user.name "Your Name"
git config user.email "your.email@example.com"

# הוסף את כל הקבצים
git add .

# Commit ראשוני
git commit -m "Initial commit: Maaser Manager application"
```

### יצירת Repository ב-GitHub

1. הלך ל-GitHub.com
2. לחץ על ⚙️ וחדש Repository
3. בחר שם: `maaser-manager`
4. בחר "Private" או "Public"
5. **אל תבחר** "Initialize with README" (כבר יש לנו אחד)
6. לחץ "Create repository"

### Push לראשונה

```bash
# הוסף את קישור הרחוק
git remote add origin https://github.com/yourusername/maaser-manager.git

# שנה את שם ה-Branch ל-main (אם צריך)
git branch -M main

# Push לראשונה
git push -u origin main
```

### צעדים יומיומיים - Commit & Push

```bash
# ראה אילו קבצים השתנו
git status

# הוסף קבצים שינו
git add .
# או קבצים ספציפיים:
# git add js/app.js css/main.css

# Commit עם הודעה משמעותית
git commit -m "Add donation edit feature"

# Push לGitHub
git push

# בפעמים הבאות, פשוט:
# git add .
# git commit -m "Your message"
# git push
```

## 🌐 פריסה ל-GitHub Pages

### הגדרה ל-GitHub Pages

1. הלך ל-Settings → Pages (ב-Repository)
2. תחת "Source", בחר "Deploy from a branch"
3. בחר branch: `main` ו-folder: `/ (root)`
4. לחץ "Save"
5. ממתן 2-3 דקות, ואז:
   - האתר שלך יהיה זמין ב: `https://yourusername.github.io/maaser-manager/`

### עדכון homepage ב-package.json

```json
{
  "homepage": "https://yourusername.github.io/maaser-manager",
  ...
}
```

### שינוי שלך אוטומטי יופיע ב-GitHub Pages

```bash
git add .
git commit -m "Update feature"
git push
# כעבור דקות, ההשינויים יופיעו בלייוור
```

## 📱 התקנה כאפליקציית PWA

### ב-Android Chrome

1. פתח את האפליקציה
2. לחץ על ⋮ (תפריט) → "Install app"
3. אישור על מסך הבית

### ב-iPhone Safari

1. פתח את האפליקציה
2. לחץ שיתוף 📤 → "Add to Home Screen"
3. שם: "מעשרות" (או שם אחר)
4. הוסף

## 🏗️ פיתוח וביצוע שינויים

### הוספת תכונה חדשה

```bash
# 1. צור branch חדש
git checkout -b feature/category-stats

# 2. עשה שינויים לקבצים
# (ערוך בעורך של בחירתך)

# 3. בדוק בדפדפן (אם הרץ python):
# http://localhost:8000

# 4. Commit
git add .
git commit -m "Add category statistics to history screen"

# 5. Push
git push origin feature/category-stats

# 6. ב-GitHub, לחץ "Compare & pull request"
# 7. כתוב תיאור, לחץ "Create pull request"
# 8. לחץ "Merge pull request"
# 9. לחץ "Delete branch"
```

### Merge ממנו branches חזרה ל-main

```bash
# חזור ל-main
git checkout main

# סנכרן עם GitHub
git pull origin main
```

## 🗂️ מאגר גיבוי על ענן (אופציוני)

### הוסף .gitignore

```bash
# צור קובץ .gitignore
echo "node_modules/" > .gitignore
echo ".DS_Store" >> .gitignore
echo "*.log" >> .gitignore
```

### סנכרון עם Vercel (חלופה ל-GitHub Pages)

1. הלך ל-Vercel.com
2. Sign up עם GitHub
3. לחץ "New Project"
4. בחר את ה-Repository
5. לחץ "Deploy"
6. הסתיים! האתר שלך יהיה זמין ב-URL מהיר

```
https://maaser-manager.vercel.app
```

כל `git push` יפעיל auto-deployment.

## 📊 כיצד להשתמש בתכנית

### 1. הוסף תרומה
- לחץ על כפתור "➕ תרומה" במסך הראשי
- מלא את הפרטים (סכום, שם המוטב, תאריך וכו')
- לחץ "שמור תרומה"
- היתרה תעדכן באופן אוטומטי

### 2. צפה בהיסטוריה
- לחץ על "📊 היסטוריה"
- סנן לפי חודש, קטגוריה או חיפוש
- ייצא CSV לאקסל או JSON לגיבוי

### 3. ניהול הגדרות
- לחץ על "⚙️ הגדרות"
- שנה סכום חוב בסיסי
- נהל קטגוריות
- ייצא/ייבא נתונים

## 🔐 נתונים בטוחים

- **אחסון מקומי בלבד**: כל הנתונים שלך נשמרים במכשיר שלך
- **ללא שרת**: אין שום שידור לענן
- **HTTPS**: כשאתה משתמש ב-GitHub Pages או Vercel, הכל מוצפן
- **ניתן להורדה**: ייצא את הכל ל-JSON בכל עת

## 🐛 תיקון באגים

### הבעיה: הנתונים לא שומרים
**פתרון:**
```bash
# נקה את LocalStorage/IndexedDB:
# בכלים למפתחים (F12) → Console:
indexedDB.deleteDatabase('MaaserManagerDB');
# טעינה חדשה של הדף (Ctrl+Shift+R)
```

### הבעיה: הגדרות לא עובדות
```bash
# בדוק את ה-console לשגיאות:
# F12 → Console
# תראה הודעות "Error" לאדום
```

## 📝 תיעוד קוד

כל מודול תיועד היטב:

- **db.js**: IndexedDB מלא עם CRUD
- **calculations.js**: לוגיקת חישוב מעשר
- **ui.js**: רינדור כל המסכים
- **utils.js**: פונקציות עזר

## 🚀 אופטימיזציות ב-Production

```bash
# מזעור CSS (אופציוני עם build tool):
# npm install -g csso-cli
# csso css/main.css -o css/main.min.css

# Lighthouse בדיקה:
# F12 → Lighthouse → Generate report
```

## 📞 תמיכה

- בדוק את console (F12) להודעות שגיאה
- התבונן ב-Network tab אם משהו לא נטען
- קרא את הקודים בעברית - הם מתוענים היטב

## 📄 רישיון

MIT License - השתמש בחופש!

## 🎯 תוכנית עתידית

- [ ] עריכת תרומות
- [ ] סינון מתקדם
- [ ] ייבוא מ-Excel
- [ ] Dark mode
- [ ] דוחות תשלומים
- [ ] הודעות התזכור
- [ ] Sync עם Google Drive

---

**זכור**: כל שינוי שאתה עושה נשמר בהתחייבויות שלך ב-Git. תמיד אפשר לחזור לגרסה קודמת:

```bash
git log  # ראה את כל ה-commits
git checkout <commit-hash>  # חזור לגרסה קודמת
git checkout main  # חזור לאחרון
```

**הנאה בשימוש!** 🎉
