function analyzeTask() {
  const text = document.getElementById("taskInput").value.trim();
  const output = document.getElementById("output");

  if (!text) {
    alert("يرجى إدخال نص المهمة التنظيمية");
    return;
  }

  // أفعال تنظيمية شائعة
  const regulatoryVerbs = [
    "تنظيم","مراقبة","إشراف","حوكمة","ترخيص","تصنيف",
    "اعتماد","تقييم","رقابة","إدارة","تطوير","تحسين"
  ];

  // أدوات تنظيمية شائعة
  const regulatoryTools = [
    "من خلال","وفق","بموجب","استنادًا إلى",
    "سياسات","معايير","أطر","لوائح","ضوابط","اشتراطات"
  ];

  // مخرجات محتملة
  const outputs = [
    "تقرير","قرار","مستوى","نتائج","توصيات",
    "تصنيف","اعتماد","إطار","قياس","تحديد"
  ];

  // التحقق
  const hasVerb = regulatoryVerbs.some(v => text.includes(v));
  const hasTool = regulatoryTools.some(t => text.includes(t));
  const hasOutput = outputs.some(o => text.includes(o));

  // المجال: نفترض وجوده إذا وُجد اسم جهة/نطاق بعد الفعل
  const hasDomain = text.split(" ").length >= 4;

  let missing = [];
  if (!hasVerb) missing.push("فعل تنظيمي واضح");
  if (!hasDomain) missing.push("مجال واضح للمهمة");
  if (!hasTool) missing.push("أداة تنظيمية");
  if (!hasOutput) missing.push("مخرج للمهمة");

  // النتيجة
  if (missing.length === 0) {
    output.innerHTML = `
      <strong style="color:green">✔ الصياغة صحيحة ومنضبطة منهجيًا</strong><br><br>
      تحتوي المهمة على:
      <ul>
        <li>فعل تنظيمي</li>
        <li>مجال واضح</li>
        <li>أداة تنظيمية</li>
        <li>مخرج للمهمة</li>
      </ul>
    `;
  } else {
    output.innerHTML = `
      <strong style="color:red">✖ الصياغة غير مكتملة</strong><br><br>
      العناصر الناقصة:
      <ul>
        ${missing.map(m => `<li>${m}</li>`).join("")}
      </ul>
    `;
  }
}
