# הפעלת הפרויקט על RENDER

## דרישות מוקדמות
- חשבון RENDER
- Git repository עם הקוד

## שלבי הפעלה

### 1. העלאה ל-GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. יצירת שירות ב-RENDER
1. היכנס ל-RENDER Dashboard
2. לחץ על "New +" → "Web Service"
3. בחר "Build and deploy from a Git repository"
4. חבר את ה-GitHub repository
5. בחר את ה-branch (main)
6. הגדר:
   - **Name**: vocal-remover-studio
   - **Environment**: Docker
   - **Dockerfile Path**: ./Dockerfile
   - **Plan**: Starter (או יותר גבוה)
   - **Region**: Oregon (או הקרוב אליך)

### 3. הגדרות סביבה
הוסף את המשתנים הבאים ב-RENDER:
- `NODE_ENV`: production
- `PORT`: 3001

### 4. הגדרות דיסק
הוסף Persistent Disk:
- **Name**: audio-storage
- **Mount Path**: /app/uploads
- **Size**: 1GB (או יותר)

## הערות חשובות
- הפרויקט דורש זמן עיבוד ארוך (עד 10 דקות)
- RENDER עלול לעצור תהליכים ארוכים - שקול להשתמש ב-Plan גבוה יותר
- קבצי אודיו נשמרים בדיסק הזמני

## פתרון בעיות
- אם השרת לא עולה, בדוק את הלוגים ב-RENDER
- אם Demucs לא נמצא, בדוק שהתלויות Python מותקנות
- אם FFmpeg לא עובד, בדוק שהחבילה מותקנת

## עלויות
- Starter Plan: $7/חודש
- Disk Storage: $0.25/GB/חודש
- Bandwidth: $0.10/GB
