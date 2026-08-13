function showLevel(level) {
    document.querySelector('.grid-years').style.display = 'none';
    const contentArea = document.getElementById('content-area');
    const dynamicContent = document.getElementById('dynamic-content');
    
    contentArea.style.display = 'block';
    
    if(level === '4AM') {
        // استخدام String.raw لمنع المتصفح من تخريب الرموز المائلة للرياضيات
        dynamicContent.innerHTML = String.raw`
            <h2>مستوى السنة الرابعة متوسط (BEM)</h2>
            <div class="math-exercise">
                <h3>📋 درس نموذجي: القاسم المشترك الأكبر (PGCD)</h3>
                <p>لحساب $PGCD(105, 45)$ نستخدم خوارزمية إقليدس (القسمات المتتالية):</p>
                <p>$$105 = 45 \times 2 + 15$$</p>
                <p>$$45 = 15 \times 3 + 0$$</p>
                <p>إذن الباقي الأخير غير المعدوم هو: **$$PGCD(105, 45) = 15$$**</p>
            </div>
        `;
        
        // أمر إجباري للمتصفح لتحديث وعرض المعادلات الرياضية فوراً
        if (window.MathJax) {
            MathJax.typesetPromise();
        }
    } else {
        dynamicContent.innerHTML = `<h2>قريباً.. سيتم رفع دروس وتمارين هذا المستوى من طرف الأساتذة!</h2>`;
    }
}

function hideContent() {
    document.getElementById('content-area').style.display = 'none';
    document.querySelector('.grid-years').style.display = 'grid';
}
