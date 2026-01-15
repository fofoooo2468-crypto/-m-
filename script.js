function analyzeTask() {
  const input = document.getElementById("taskInput").value.trim();
  const output = document.getElementById("output");

  if (!input) {
    alert("يرجى إدخال مهمة واحدة على الأقل");
    return;
  }

  const tasks = input.split("\n").filter(t => t.trim() !== "");
  output.innerHTML = "";

  tasks.forEach((task, index) => {
    output.innerHTML += analyzeSingleTask(task, index);
  });
}

function analyzeSingleTask(text, index) {

  // أفعال تنظيمية مع تصنيفها
  const verbs = {
    رقابي: ["مراقبة","رقابة","تفتيش","متابعة"],
    إشرافي: ["إشراف","حوكمة","إدارة"],
    تنظيمي: ["تنظيم","اعتماد","تصنيف","ترخيص"],
    تطويري: ["تطوير","تحسين","تقييم"]
  };

  const tools = ["من خلال","وفق","بموجب","استنادًا إلى","معايير","سياسات","أطر","لوائح"];
  const outputs = ["تقرير","قرار","مستوى","نتائج","توصيات","تصنيف","اعتماد","إطار"];

  let detectedVerb = "";
  let verbType = "";

  for (const type in verbs) {
    verbs[type].forEach(v => {
      if (text.includes(v)) {
        detectedVerb = v;
        verbType = type;
      }
    });
  }

  const hasVerb = detectedVerb !== "";
  const hasTool = tools.some(t => text.includes(t));
  const hasOutput = outputs.some(o => text.includes(o));
  const hasDomain = text.split(" ").length >= 3;

  let missing = [];
  if (!hasVerb) missing.push("فعل تنظيمي");
  if (!hasDomain) missing.push("مجال واضح");
  if (!hasTool) missing.push("أداة تنظيمية");
  if (!hasOutput) missing.push("مخرج للمهمة");

  // استخراج المجال (آخر كلمتين تقريبًا)
  const words = text.split(" ");
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
        <div style="background:#f5f5f5;padding:10px;margin-bottom:8px">
          ${s}
          <br><br>
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

function applySuggestion(taskIndex, suggestionIndex) {
  alert("تم اعتماد الصياغة المقترحة للمهمة رقم " + (taskIndex + 1));
}
