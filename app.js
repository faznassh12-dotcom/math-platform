// JSON الرابط السحابي المباشر لقراءة جدول بياناتك النكي بصيغة
const sheetUrl = "https://docs.google.com/spreadsheets/d/18JIvC98d1Xi6tCJD0OfdwwdZwVwN-unDFIPM1RGVmPQ/gviz/tq?tqx=out:json&sheet=Feuille1";

async function showlevel(level) {
    document.querySelector('.grid-years').style.display = 'none';
    const contentArea = document.getElementById('content-area');
    const dynamicContent = document.getElementById('dynamic-content');

    contentArea.style.display = 'block';
    dynamicContent.innerHTML = "<h2>... جاري تحميل الدروس والتمارين من الأستاذ </h2>";

    try {
        // تم تصحيح الرابط هنا لاستخدام المتغير sheetUrl بدلاً من google.com
        const response = await fetch(sheetUrl);
        const text = await response.text();

        // استخراج وتنظيف البيانات القادمة من جوجل
        const jsonText = text.substring(text.indexOf("("), text.lastIndexOf(")") + 1);
        const data = JSON.parse(jsonText);
        const rows = data.table.rows;

        // قراءة الأعمدة بالترتيب الصحيح لجدولك (A=0, B=1, C=2, D=3)
        let lessons = rows.map(row => {
            return {
                level: row.c && row.c[0] ? String(row.c[0].v).trim() : '',
                title: row.c && row.c[1] ? String(row.c[1].v).trim() : '',
                content: row.c && row.c[2] ? String(row.c[2].v).trim() : '',
                video: row.c && row.c[3] ? String(row.c[3].v).trim() : ''
            };
        });

        // تصفية الدروس حسب المستوى المختار وعرضها
        const filteredLessons = lessons.filter(item => item.level === level);
        
        if (filteredLessons.length === 0) {
            dynamicContent.innerHTML = "<p>لا توجد دروس مضافة لهذا المستوى حالياً.</p>";
            return;
        }

        let htmlOutput = "";
        filteredLessons.forEach(lesson => {
            htmlOutput += `
                <div class="lesson-card">
                    <h3>${lesson.title}</h3>
                    <div class="lesson-body">${lesson.content}</div>
                    ${lesson.video ? <div class="lesson-video">${lesson.video}</div> : ''}
                </div>
            `;
        });

        dynamicContent.innerHTML = htmlOutput;

    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        dynamicContent.innerHTML = "<p class='error-msg'>حدث خطا أثناء جلب الدروس. تأكد من اتصالك بالإنترنت وصلاحية الجدول.</p>";
    }
}
