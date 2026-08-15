// الرابط السحابي المباشر والمكتمل لجدول بياناتك الذكي بصيغة JSON
const sheetId = "18JIvC98d1Xi6tCJDO0fdwwdZvvWn-unDF1PM1RGVmPQ";
// ملاحظة مهمة: هذا الرابط يقرأ افتراضياً الورقة (tab) الأولى فقط في ملف جوجل شيت (gid=0).
// إذا كان "درس الجذور" في ورقة (Sheet) مختلفة عن الورقة الأولى، لن يظهر أبداً مهما كان الكود صحيحاً.
// إن كانت الدروس في ورقة أخرى، أضف "&gid=رقم_الورقة" في نهاية الرابط (يظهر رقم الـ gid في شريط عنوان جوجل شيت).
const sheetUrl = "https://docs.google.com/spreadsheets/d/" + sheetId + "/gviz/tq?tqx=out:json";

// دالة مساعدة لتنظيف النصوص من المسافات الزائدة والرموز الخفية (مثل علامات الاتجاه RTL/LTR)
// هذه الرموز غير مرئية للعين لكنها تكسر المطابقة بين قيمة العمود وقيمة المستوى المطلوب
function normalize(str) {
  return String(str)
    .replace(/[\u200e\u200f\u202a-\u202e]/g, '') // إزالة رموز التحكم بالاتجاه الخفية
    .trim()
    .toUpperCase();
}

async function showLevel(level) {
  document.querySelector('.grid-years').style.display = 'none';
  const contentArea = document.getElementById('content-area');
  const dynamicContent = document.getElementById('dynamic-content');

  contentArea.style.display = 'block';
  dynamicContent.innerHTML = "<h2>🔄 جاري تحميل الدروس والتمارين من الأستاذ...</h2>";

  // تحديد رقم ملف الـ PDF المرفوع والاسم المناسب حسب المستوى المختار
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

    // قراءة الأعمدة بالترتيب الدقيق والصحيح (0=A, 1=B, 2=C, 3=D) مع حماية الخانات الفارغة
    let allLessons = rows.map(row => {
      if (!row || !row.c) return null;
      return {
        level: row.c[0] && row.c[0].v !== null && row.c[0].v !== undefined ? String(row.c[0].v).trim() : '',
        title: row.c[1] && row.c[1].v !== null && row.c[1].v !== undefined ? String(row.c[1].v).trim() : '',
        content: row.c[2] && row.c[2].v !== null && row.c[2].v !== undefined ? String(row.c[2].v).trim() : '',
        video: row.c[3] && row.c[3].v !== null && row.c[3].v !== undefined ? String(row.c[3].v).trim() : ''
      };
    }).filter(lesson => lesson !== null && lesson.level !== '');

    // المطابقة الآن تستعمل normalize() بدل toUpperCase() المباشر، لتفادي مشاكل المسافات والرموز الخفية
    let lessons = allLessons.filter(lesson => normalize(lesson.level) === normalize(level));

    // بناء الهيدر الداخلي للمستوى مع زر تحميل الـ PDF المخصص والمربوط بملفاتك الحقيقية
    let htmlOutput = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px;">
        <h2 style="color: #0056b3; margin-bottom: 15px;">مستوى التعليم المتوسط (${levelName})</h2>
        <a href="lesson${fileNum}.pdf" download class="btn-download" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.3s; margin-bottom: 15px;">📥 تحميل ملخص مطبوعة ${levelName} (PDF)</a>
      </div>
    `;

    if (lessons.length === 0) {
      // رسالة تشخيصية: تعرض للمستخدم/المطوّر ما هي قيم "المستوى" الموجودة فعلياً في الجدول
      // هذا يساعد على اكتشاف الخطأ الإملائي فوراً بدل التخمين
      const foundLevels = [...new Set(allLessons.map(l => l.level))];
      console.log("المستوى المطلوب:", level);
      console.log("القيم الموجودة فعلياً في عمود المستوى بالجدول:", foundLevels);

      htmlOutput += `<h3 style="text-align:center; color:#666;">قريباً.. سيتم رفع دروس وتمارين إضافية لهذا المستوى من طرف الأساتذة عبر جدول جوجل!</h3>`;
      dynamicContent.innerHTML = htmlOutput;
      return;
    }

    // عرض الدروس القادمة من جدول جوجل بعد قراءتها بالأعمدة الصحيحة
    lessons.forEach(lesson => {
      let videoHTML = '';
      if (lesson.video) {
        let embedUrl = lesson.video;
        if (lesson.video.includes("watch?v=")) {
          embedUrl = lesson.video.replace("watch?v=", "embed/");
        } else if (lesson.video.includes("youtu.be/")) {
          const videoId = lesson.video.split("youtu.be/")[1].split(/[?&]/)[0];
          embedUrl = "https://www.youtube.com/embed/" + videoId;
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

    // تشغيل محرك الرياضيات فوراً لتنظيم الرموز والكسور والجذور
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
