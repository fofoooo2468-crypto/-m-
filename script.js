
function analyzeSingleTask(text, index) {
  // (اختياري) تطبيع بسيط لتقليل تأثير اختلاف الهمزات والألف المقصورة/التاء المربوطة
  const norm = (s) => s
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();

  const rawText = text;
  const normalizedText = norm(text);

  // أفعال تنظيمية مع تصنيفها
  const verbs = {
    رقابي: ["مراقبه","رقابه","تفتيش","متابعه"],
    إشرافي: ["اشراف","حوكمه","اداره"],
    تنظيمي: ["تنظيم","اعتماد","تصنيف","ترخيص"],
    تطويري: ["تطوير","تحسين","تقييم"]
  };

  const tools = ["من خلال","وفق","بموجب","استنادا الى","معايير","سياسات","اطر","لوائح"]
    .map(norm);
  const outputs = ["تقرير","قرار","مستوى","نتائج","توصيات","تصنيف","اعتماد","اطار"]
    .map(norm);

  let detectedVerb = "";
  let verbType = "";

  // ابحث عن أول فعل مطابق وتوقف
  outer:
  for (const type in verbs) {
    for (const v of verbs[type]) {
      if (normalizedText.includes(norm(v))) {
        detectedVerb = v.replace(/ه$/, 'ة'); // إرجاع التاء المربوطة للعرض فقط
        verbType = type;
        break outer;
      }
    }
  }

  const hasVerb   = detectedVerb !== "";
  const hasTool   = tools.some(t => normalizedText.includes(t));
  const hasOutput = outputs.some(o => normalizedText.includes(o));
  const hasDomain = rawText.split(/\s+/).length >= 3;

  const missing = [];
  if (!hasVerb)   missing.push("فعل تنظيمي");
  if (!hasDomain) missing.push("مجال واضح");
  if (!hasTool)   missing.push("أداة تنظيمية");
  if (!hasOutput) missing.push("مخرج للمهمة");

  // استخراج المجال (آخر كلمتين كحل بسيط)
  const words = rawText.trim().split(/\s+/);
  const domain = words.slice(-2).join(" ");

  // اقتراحات متعددة حسب نوع الفعل
  const suggestions = [
    `مراقبة <span class="domain">${domain}</span> من خلال <span class="tool">معايير تنظيمية معتمدة</span> بما ينتج عنه <span class="output">إعداد تقرير إشرافي</span>.`,
    `إشراف <span class="domain">${domain}</span> وفق <span class="tool">أطر حوكمية معتمدة</span> بما يحقق <span class="output">ضبط الممارسات</span>.`,
    `تنظيم <span class="domain">${domain}</span> بموجب <span class="tool">سياسات معتمدة</span> بما ينتج عنه <span class="output">إطار تنظيمي واضح</span>.`
  ];

  const isValid = missing.length === 0;

  return `
  <div style="border:1px solid #ccc; padding:15px; margin-top:15px">
    <strong>المهمة ${index + 1}</strong><br><br>

    ${isValid ? 
      `<span style="color:green">✔ الصياغة صحيحة ومنضبطة</span>` :
      `<span style="color:red">✖ الصياغة غير مكتملة</span>`
    }

    <br><br>

    ${!isValid ? `
      <b>العناصر الناقصة:</b>
      <ul>
        ${missing.map(m => `<li>${m}</li>`).join("")}
      </ul>

      <b>مقترحات صياغة منضبطة:</b><br><br>

      ${suggestions.map((s, i) => `
        <div style="background:#f5f5f5;padding:10px;margin-bottom:8px" data-suggestion-block>
          <div data-s-text>${s}</div>
          <br>
          <button onclick="applySuggestion(${index}, ${i})">
            اعتماد هذه الصياغة
          </button>
        </div>
      `).join("")}
    ` : `
      <div style="background:#eef;padding:10px">
        <span class="verb">${detectedVerb}</span> /
        <span class="domain">المجال واضح</span> /
        <span class="tool">أداة تنظيمية</span> /
        <span class="output">مخرج محدد</span>
      </div>
    `}
  </div>
  `;
}
