const sheetUrl = "https://docs.google.com/spreadsheets/d/18JIvC98d1Xi6tCJD0OfdwwdZwVwN-unDFIPM1RGVmPQ/gviz/tq?tqx=out:json";

async function showlevel(level) {
    document.querySelector('.grid-years').style.display = 'none';
    const contentArea = document.getElementById('content-area');
    const dynamicContent = document.getElementById('dynamic-content');

    contentArea.style.display = 'block';
    dynamicContent.innerHTML = "<h2>... جاري تحميل الدروس والتمارين من الأستاذ </h2>";

    try {
        const response = await fetch(sheetUrl);
        const text = await response.text();

        // تنظيف الاستجابة واستخراج الجيوسنص بدقة
        const startIndex = text.indexOf("{");
        const endIndex = text.lastIndexOf(")");
        
        if (startIndex === -1 || endIndex === -1) {
            throw new Error("تنسيق استجابة جدول البيانات غير صحيح.");
        }

        const jsonText = text.substring(startIndex, endIndex);
        const data = JSON.parse(jsonText);
        
        if (!data.table || !data.table.rows) {
            dynamicContent.innerHTML = "<p>الجدول فارغ أو لا يحتوي على صفوف بيانات.</p>";
            return;
        }

        const rows = data.table.rows;

        let lessons = rows.map(row => {
            return {
                level: row.c && row.c[0] && row.c[0].v !== null ? String(row.c[0].v).trim() : '',
                title: row.c && row.c[1] && row.c[1].v !== null ? String(row.c[1].v).trim() : '',
                content: row.c && row.c[2] && row.c[2].v !== null ? String(row.c[2].v).trim() : '',
                video: row.c && row.c[3] && row.c[3].v !== null ? String(row.c[3].v).trim() : ''
            };
        });

        // تصفية الدروس حسب المستوى
        const filteredLessons = lessons.filter(item => item.level.toLowerCase() === level.toLowerCase());
        
        if (filteredLessons.length === 0) {
            dynamicContent.innerHTML = <p>لا توجد دروس مضافة لهذا المستوى حالياً (${level}).</p>;
            return;
        }

        let htmlOutput = "";
        filteredLessons.forEach(lesson => {
            htmlOutput += `
                <div class="lesson-card" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                    <h3>${lesson.title}</h3>
                    <div class="lesson-body">${lesson.content}</div>
                    ${lesson.video ? <div class="lesson-video" style="margin-top: 10px;">${lesson.video}</div> : ''}
                </div>
            `;
        });

        dynamicContent.innerHTML = htmlOutput;

    } catch (error) {
        console.error("خطأ تفصيلي:", error);
        dynamicContent.innerHTML = "<p style='color: red;'>حدث خطأ أثناء جلب الدروس. تأكد أن جدول Google Sheets منشور للعامة وأن الأعمدة مرتبة بشكل صحيح.</p>";
    }
}
