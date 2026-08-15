// الرابط السحابي المختصر لجدول بياناتك لمنع أي خطأ أثناء النسخ
const sheetId = "18JIvC98d1Xi6tCJDO0fdwwdZvvWn-unDFlPM1RGVmPQ";
const sheetUrl = "https://google.com" + sheetId + "/gviz/tq?tqx=out:json";

async function showLevel(level) {
    document.querySelector('.grid-years').style.display = 'none';
    const contentArea = document.getElementById('content-area');
    const dynamicContent = document.getElementById('dynamic-content');
    
    contentArea.style.display = 'block';
    dynamicContent.innerHTML = "<h2>🔄 جاري تحميل الدروس والتمارين من الأستاذ...</h2>";

    // تحديد رقم الملف والاسم المناسب حسب المستوى الذي ضغط عليه الطالب
    let fileNum = "1";
    let levelName = "السنة 1 متوسط";
    
    if (level === "2AM") { fileNum = "2"; levelName = "السنة 2 متوسط"; }
    else if (level === "3AM") { fileNum = "3"; levelName = "السنة 3 متوسط"; }
    else if (level === "4AM") { fileNum = "4"; levelName = "السنة 4 متوسط (BEM)"; }

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

        // بناء الهيدر الداخلي للمستوى مع زر تحميل الـ PDF المخصص له في المقدمة
        let htmlOutput = `
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 2px;">
                <h2 style="color: #0056b3; margin-bottom: 15px;">مستوى التعليم المتوسط (${levelName})</h2>
                <a href="lesson${fileNum}.pdf" download class="btn-download" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.3s; margin-bottom: 15px;">📥 تحميل ملخص مطبوعة ${levelName} (PDF)</a>
            </div>
        `;

        if (lessons.length === 0) {
            htmlOutput += `<h3 style="text-align:center; color:#666;">قريباً.. سيتم رفع دروس وتمارين إضافية لهذا المستوى من طرف الأساتذة عبر جدول جوجل!</h3>`;
            dynamicContent.innerHTML = htmlOutput;
            return;
        }
        
        // عرض الدروس القادمة من جدول جوجل تحت زر الـ PDF مباشرة
        lessons.forEach(lesson => {
            let videoHTML = '';
            if (lesson.video) {
                let embedUrl = lesson.video;
                if (lesson.video.includes("watch?v=")) {
                    embedUrl = lesson.video.replace("watch?v=", "embed/");
                } else if (lesson.video.includes("youtu.be/")) {
                    embedUrl = lesson.video.replace("youtu.be/", "://youtube.com");
                }
                videoHTML = `
                    <div style="margin-top: 15px; text-align: center; max-width: 560px; margin-left: auto; margin-right: auto;">
                        <iframe width="100%" height="315" src="${embedUrl}" frameborder="0" allowfullscreen style="border-radius: 8px;"></iframe>
                    </div>
                `;
            }

            htmlOutput += `
                <div class="math-exercise">
                    <h3>📋 درس: ${lesson.title}</h3>
                    <p>${lesson.content.replace(/\n/g, '<br>')}</p>
                    ${videoHTML}
                </div>
            `;
        });

        dynamicContent.innerHTML = htmlOutput;

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
