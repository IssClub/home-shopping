# קניות הבית (PWA)

רשימת קניות משותפת שמותקנת על הנייד, עם השוואת מחירים ומבצעים אמיתיים מאושר עד קרית אונו ומיוחננוף חולון.

## מבנה
- `web/` האפליקציה (HTML/JS סטטי, PWA עם service worker).
  - `cloud.js` שכבת הנתונים מול Supabase: עותק מקומי במכשיר, תור שינויים לעבודה בלי אינטרנט, ועדכונים בזמן אמת.
  - `supabase-config.js` כתובת הפרויקט והמפתח הציבורי.
- `supabase/schema.sql` הטבלאות וכללי האבטחה (רק האימיילים של בני הבית).
- `sync/` סקריפט שמושך מחירים ומבצעים מקבצי שקיפות המחירים וכותב ל-Supabase. בלי תלויות חיצוניות.
- `.github/workflows/sync.yml` הרצה לילית (כ-03:17 בישראל) ובדיקה כל 10 דקות אם ביקשו "רענון מחירים" באפליקציה.
- `.github/workflows/pages.yml` פרסום האתר ב-GitHub Pages.

## הקמה (פעם אחת)
1. **Supabase**: ב-supabase.com צרו פרויקט (Region: Frankfurt).
   - SQL Editor, New query: הדביקו את כל `supabase/schema.sql` ולחצו Run.
   - Authentication, Sign In / Providers: ודאו ש-Email מופעל, וכבו את **Allow new users to sign up**.
   - Authentication, Users, Add user, Create new user: משתמש לכל אחד מבני הבית (או משתמש משותף), עם **Auto Confirm User**.
   - Table Editor, `household`, Insert row: האימייל של כל משתמש שיצרתם.
   - Project Settings, API: העתיקו את ה-Project URL ואת המפתח הציבורי (anon / publishable) אל `web/supabase-config.js`.
2. **GitHub**:
   - Settings, Pages, Source: GitHub Actions.
   - Settings, Secrets and variables, Actions, New repository secret:
     - `SUPABASE_URL`: ה-Project URL.
     - `SUPABASE_SERVICE_KEY`: המפתח הסודי (service_role / secret). **רק כאן, לעולם לא בקוד ולא בצ'אט.**
   - Actions, price-sync, Run workflow, כדי לבדוק שהמשיכה עובדת.
3. **התקנה בנייד**: פתחו את כתובת האתר.
   - אנדרואיד (Chrome): תפריט, Install app.
   - אייפון (Safari): שיתוף, Add to Home Screen.

## עבודה בלי אינטרנט
מכשיר שהתחבר פעם אחת שומר עותק של הרשימה. שינויים שנעשים בלי חיבור נשמרים בתור ונשלחים כשהחיבור חוזר.
אם שני מכשירים שינו את אותו פריט, השינוי האחרון שהגיע לשרת קובע.

## הערות
- כתבו שמות מדויקים ("חלב תנובה 3% 1 ליטר") כדי שההתאמה למוצר ברשת תהיה טובה. אפשר לתקן מחיר ידנית בלחיצה על מוצר.
- חצי חינם מוגן ב-Cloudflare ולכן מחיריו מוזנים ידנית.
- GitHub מכבה הרצות מתוזמנות אחרי 60 יום בלי פעילות בריפו. דחיפה קטנה אחת מחדשת אותן.
- פרויקט חינמי ב-Supabase מושהה אחרי כשבוע בלי פעילות. הסקריפט הלילי אמור לשמור עליו פעיל.
