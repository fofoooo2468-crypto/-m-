function analyzeTask() {
  const text = document.getElementById("taskInput").value.trim();
  const output = document.getElementById("output");

  if (!text) {
    alert("يرجى إدخال نص المهمة التنظيمية");
    return;
  }

  // أفعال تنظيمية
  const regulatoryVerbs = [
    "تنظيم","مراقبة","إشراف","حوكمة","ترخيص",
    "تصنيف","اعتماد","تقييم","رقابة","إدارة","تطوير"
  ];

  // أدوات تنظيمية
  const regulatoryTools = [
    "من خلال","وفق","بموجب","استنادًا إلى",
    "معايير","سياسات","أطر","لوائح","ضوابط"
  ];

  // مخرجات
  const outputs = [
    "تقرير","قرار","مستوى","نتائج",
    "توصيات","تصنيف","اعتماد","إطار"
  ];

  const hasVerb = regulatoryVerbs.some(v => text.includes(v));
  const hasTool = regulatoryTools.some(t => text.includes(t));
  const hasOutput = outputs.some(o => text.includes(o));
  const hasDomain = text.split(" ").length >= 3;

  let missing = [];
  if (!hasVerb) missing.push("فعل تنظيمي");
  if (!hasDomain) missing.push("مجال واضح");
  if (!hasTool) missing.push("أداة تنظيمية");
  if (!hasOutput) missing.push("مخرج للمهمة");

  // استخراج المجال (بشكل مبسط)
  const words = text.split(" ");
  const domain = words.slice(-2).join(" ");

  // بناء اقتراح تلقائي
  const suggestedTask =
    `مراقبة ${domain} من خلال معايير تنظيمية معتمدة بما ينتج عنه إعداد تقرير إشرافي.`;

  if (missing.length === 0) {
    output.innerHTML = `
      <strong style="color:green">✔ الصياغة صحيحة ومنضبطة منهجيًا</strong><br><br>
      تحتوي المهمة على جميع العناصر التنظيمية المطلوبة.
    `;
  } else {
    output.innerHTML = `
      <strong style="color:red">✖ الصياغة غير مكتملة</strong><br><br>
      <b>العناصر الناقصة:</b>
      <ul>
        ${missing.map(m => `<li>${m}</li>`).join("")}
      </ul>
      <br>
      <b>مقترح صياغة منضبطة:</b><br>
      <div style="background:#f5f5f5;padding:10px;margin-top:5px">
        ${suggestedTask}
      </div>
    `;
  }
}
