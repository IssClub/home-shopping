# קניות הבית (PWA)

רשימת קניות משותפת שמותקנת על הנייד, עם השוואת מחירים ומבצעים אמיתיים מאושר עד קרית אונו ומיוחננוף חולון.

## מבנה
- `web/` האפליקציה (HTML/JS סטטי, PWA עם service worker, עובדת גם בלי אינטרנט).
- `sync/` סקריפט שמושך מחירים ומבצעים מקבצי שקיפות המחירים וכותב ל-Firestore.
- `.github/workflows/sync.yml` הרצה לילית (כ-03:17 בישראל) ובדיקה כל 10 דקות אם ביקשו "רענון מחירים" באפליקציה.
- `.github/workflows/pages.yml` פרסום האתר ב-GitHub Pages.
- `firestore.rules` כללי אבטחה: רק האימיילים של בני הבית.

## הקמה (פעם אחת)
1. **Firebase**: ב-console.firebase.google.com צרו פרויקט.
   - Build, Authentication, Sign-in method: הפעילו Email/Password. תחת Users הוסיפו משתמש משותף לבית (או אחד לכל אחד).
   - Build, Firestore Database: Create database (מצב production).
   - Rules: הדביקו את `firestore.rules` אחרי שהחלפתם את האימייל באימיילים של המשתמשים, ולחצו Publish.
   - Project settings, Your apps, Web: צרו אפליקציה והעתיקו את ה-config אל `web/firebase-config.js`.
   - Project settings, Service accounts, Generate new private key: שמרו את קובץ ה-JSON (לא להעלות ל-git).
2. **GitHub**: העלו את התיקייה לריפו.
   - Settings, Pages, Source: GitHub Actions.
   - Settings, Secrets and variables, Actions: צרו secret בשם `FIREBASE_SERVICE_ACCOUNT` עם כל תוכן קובץ ה-JSON.
   - Actions, price-sync, Run workflow, כדי לבדוק שהמשיכה עובדת.
3. **התקנה בנייד**: פתחו את כתובת האתר.
   - אנדרואיד (Chrome): תפריט, Install app.
   - אייפון (Safari): שיתוף, Add to Home Screen.

## הערות
- כתבו שמות מדויקים ("חלב תנובה 3% 1 ליטר") כדי שההתאמה למוצר ברשת תהיה טובה. אפשר לתקן מחיר ידנית בלחיצה על מוצר.
- חצי חינם מוגן ב-Cloudflare ולכן מחיריו מוזנים ידנית.
- GitHub מכבה הרצות מתוזמנות אחרי 60 יום בלי פעילות בריפו. דחיפה קטנה אחת מחדשת אותן.
