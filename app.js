// الرابط السحابي المختصر لجدول بياناتك لمنع أي خطأ أثناء النسخ
const sheetId = "18JIvC98d1Xi6tCJDO0fdwwdZvvWn-unDFlPM1RGVmPQ";
const sheetUrl = "https://docs.google.com/spreadsheets/d/" + sheetId + "/gviz/tq?tqx=out:json";

async function showLevel(level) {
    document.querySelector('.grid-years').style.display = 'none';
    const contentArea = document.getElementById('content-area');
    const dynamicContent = document.getElementById('dynamic-content');

    contentArea.style.display = 'block';
    dynamicContent.innerHTML = "<h2>🔄 جاري تحميل الدروس والتمارين من الأستاذ...</h2>";

    try {
        const response = await fetch(sheetUrl);
        const text = await response.text();

        // استخراج وتنظيف البيانات القادمة من جوجل بنجاح
        const jsonText = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
        const data = JSON.parse(jsonText);
        const rows = data.table.rows;

        // قراءة الأعمدة بطريقة آمنة تماماً تمنع انهيار الموقع بسبب الخانات الفارغة
        let lessons = rows.map(row => {
            if (!row || !row.c) return null;
            return {
                level: row.c[0] && row.c[0].v ? String(row.c[0].v).trim() : '',
                title: row.c[1] && row.c[1].v ? String(row.c[1].v).trim() : '',
                content: row.c[2] && row.c[2].v ? String(row.c[2].v).trim() : '',
                video: row.c[3] && row.c[3].v ? String(row.c[3].v).trim() : ''
            };
        }).filter(lesson => lesson !== null && lesson.level.toUpperCase() === level.toUpperCase());

        if (lessons.length === 0) {
            dynamicContent.innerHTML = ` <h2>سيتم رفع دروس وتمارين هذا المستوى من طرف الأساتذة..قريباً!</h2>`;
            return;
        }

        dynamicContent.innerHTML =` <h2>مستوى التعليم المتوسط (${level})</h2>`;

        // عرض الدروس والتمارين التفاعلية للطلاب
        lessons.forEach(lesson => {
            let videoHTML = '';
            if (lesson.video) {
                let embedUrl = lesson.video;
                if (lesson.video.includes("watch?v=")) {
                    embedUrl = lesson.video.replace("watch?v=", "embed/");
                } else if (lesson.video.includes("youtu.be/")) {
                    embedUrl = lesson.video.replace("youtu.be/", "youtube.com/embed/");
                }
                videoHTML = `
                    <div style="margin-top: 15px; text-align: center; max-width: 560px; margin-left: auto; margin-right: auto;">
                        <iframe width="100%" height="315" src="${embedUrl}" frameborder="0" allowfullscreen style="border-radius: 8px;"></iframe>
                    </div>
                `;
            }

            dynamicContent.innerHTML += `
                <div class="math-exercise">
                    <h3>📋 درس: ${lesson.title}</h3>
                    <p>${lesson.content.replace(/\n/g, '<br>')}</p>
                    ${videoHTML}
                </div>
            `;
        });

        // تشغيل محرك الرياضيات فوراً لتنظيم الرموز
        if (window.MathJax) {
            MathJax.typesetPromise();
        }

    } catch (error) {
        dynamicContent.innerHTML = "<h2>❌ حدث خطأ أثناء جلب الدروس. تأكد من اتصالك بالإنترنت وصلاحية الجدول.</h2>";
        console.error(error);
    }
}

function hideContent() {
    document.getElementById('content-area').style.display = 'none';
    document.querySelector('.grid-years').style.display = 'grid';
}

