
/* ===================== أدوات مساعدة ===================== */
function norm(s) {
  return (s || "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\u0600-\u06FF0-9A-Za-z\s]/g, "") // إزالة الرموز
    .trim();
}

function escapeHTML(s) {
  return (s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// تفكيك نص لاكتشاف موقع أدوات الربط "من خلال/وفق/بموجب/استناداً إلى"
const toolConnectors = [
  "من خلال","وفق","بموجب","استنادًا إلى","استنادا إلى","بالاعتماد على","استنادا الى","استنادًا الى"
];
const outputConnectors = [
  "بما ينتج عنه","بما يحقق","بهدف","لتحقيق","ليتم","لـ","لقياس"
];

// قوائم العناصر
const verbsList = [
  "مراقبة","متابعة","تفتيش","تقييم", // رقابي/تطويري
  "إشراف","حوكمة","إدارة",           // إشرافي
  "تنظيم","اعتماد","تصنيف","ترخيص"    // تنظيمي
];

const toolsKeywords = [
  "معايير","سياسات","لوائح","ضوابط","أطر","أدلة","إجراءات","مرجعيات",
  "معايير الامتثال","مؤشرات الأداء","أطر الحوكمة","التشريعات"
];

const outputsKeywords = [
  "تقرير","تقارير","قرار","مستوى","نتائج","توصيات",
  "تصنيف","اعتماد","إطار","مؤشرات","قياس","رفع"
];

/* ===================== استخراج المجال والأداة والمخرج ===================== */
function extractPieces(raw) {
  const txt = raw.trim();
  const n = norm(txt);
  let verb = "";
  let domain = "";
  let toolPhrase = "";
  let outputPhrase = "";

  // 1) اكتشاف الفعل
  let vIndex = -1;
  for (const v of verbsList) {
    const nv = norm(v);
    const idx = n.indexOf(nv);
    if (idx > -1 && (vIndex === -1 || idx < vIndex)) {
      vIndex = idx; verb = v;
    }
  }

  // 2) حدد مواقع الموصلات
  let tConn = null, tIdx = -1;
  for (const c of toolConnectors) {
    const idx = n.indexOf(norm(c));
    if (idx > -1 && (tIdx === -1 || idx < tIdx)) { tIdx = idx; tConn = c; }
  }

  let oConn = null, oIdx = -1;
  for (const c of outputConnectors) {
    const idx = n.indexOf(norm(c));
    if (idx > -1 && (oIdx === -1 || idx < oIdx)) { oIdx = idx; oConn = c; }
  }

  // 3) المجال = ما بعد الفعل حتى أول موصل أداة أو موصل مخرج
  const startAfterVerb = vIndex > -1 ? vIndex + norm(verb).length : 0;
  const firstBreak = [tIdx, oIdx].filter(x => x > -1).sort((a,b)=>a-b)[0] ?? n.length;
  domain = txt.substring(
    charIndexFromNorm(txt, startAfterVerb),
    charIndexFromNorm(txt, firstBreak)
  ).replace(/^[\s:،.-]+|[\s:،.-]+$/g, "");

  // في حال لم نلتقط مجال مفهوم، خذي آخر 2-4 كلمات
  if (domain.split(/\s+/).filter(Boolean).length < 2) {
    const words = txt.split(/\s+/).filter(Boolean);
    domain = words.slice(-4).join(" ");
  }

  // 4) عبارة الأداة = من موصل الأداة حتى موصل المخرج أو نهاية النص
  if (tIdx > -1) {
    const end = (oIdx > -1 && oIdx > tIdx) ? oIdx : n.length;
    toolPhrase = txt.substring(
      charIndexFromNorm(txt, tIdx),
      charIndexFromNorm(txt, end)
    ).trim();
  }

  // 5) عبارة المخرج = من موصل المخرج حتى نهاية النص
  if (oIdx > -1) {
    outputPhrase = txt.substring(
      charIndexFromNorm(txt, oIdx)
    ).trim();
  } else {
    // إذا لم توجد، جرّبي التقاط نمط قياس/مستوى/تقرير
    const hasOut = outputsKeywords.some(k => n.includes(norm(k)));
    if (hasOut) {
      // خذي ما بعد آخر كلمة من هذه الكلمات
      outputPhrase = "بإصدار تقرير أو قياس مستوى الأداء وفق مؤشرات معتمدة";
    }
  }

  return { verb, domain, toolPhrase, outputPhrase, tConn, oConn };
}

// تحويل فهرس نص مُطبّع إلى فهرس النص الأصلي (تقريبي لكنه كافٍ هنا)
function charIndexFromNorm(original, normIndex) {
  // نتقدم في النص الأصلي حتى نصل لطول مكافئ تقريبًا لطول normIndex
  // (حل عملي بسيط بدون تعقيد التطبيع العكسي)
  let o = 0, count = 0;
  while (o < original.length && count < normIndex) {
    const ch = original[o];
    const mapped = norm(ch);
    count += mapped.length ? 1 : 0;
    o++;
  }
  return o;
}

/* ===================== التحقق وبناء المقترحات ===================== */
function hasToolPhrase(text) {
  const n = norm(text);
  return toolConnectors.some(c => n.includes(norm(c))) ||
         toolsKeywords.some(k => n.includes(norm(k)));
}

function hasOutputPhrase(text) {
  const n = norm(text);
  return outputConnectors.some(c => n.includes(norm(c))) ||
         outputsKeywords.some(k => n.includes(norm(k)));
}

function buildSuggestions({ verb, domain }) {
  const v = verb || "مراقبة";
  const d = escapeHTML(domain);

  // 3 مقترحات منضبطة
  const s1 = `${v} <span class="domain">${d}</span> من خلال <span class="tool">معايير الامتثال المعتمدة</span> لقياس <span class="output">مستوى الالتزام بها</span> وفق <span class="tool">مؤشرات معتمدة</span>.`;
  const s2 = `${v === "مراقبة" ? "إشراف" : "مراقبة"} <span class="domain">${d}</span> وفق <span class="tool">أطر الحوكمة والسياسات المعتمدة</span> بما يحقق <span class="output">ضبط الممارسات وإصدار تقارير دورية</span>.`;
  const s3 = `تنظيم <span class="domain">${d}</span> بموجب <span class="tool">لوائح وتعليمات معتمدة</span> بما ينتج عنه <span class="output">إطار تنظيمي واضح وقرارات تنفيذية</span>.`;

  return [s1, s2, s3];
}

/* ===================== الواجهة الرئيسية ===================== */
function analyzeTask() {
  const input = document.getElementById("taskInput").value.trim();
  const output = document.getElementById("output");

  if (!input) {
    output.innerHTML = '<span class="badge-bad">يرجى إدخال مهمة واحدة على الأقل</span>';
    return;
  }

  const tasks = input.split(/\r?\n/).map(t => t.trim()).filter(Boolean);
  output.innerHTML = "";

  tasks.forEach((task, index) => {
    output.innerHTML += analyzeSingleTask(task, index);
  });
}

function analyzeSingleTask(text, index) {
  const { verb, domain, toolPhrase, outputPhrase } = extractPieces(text);

  const okVerb   = !!verb;
  const okDom    = (domain || "").split(/\s+/).filter(Boolean).length >= 2;
  const okTool   = hasToolPhrase(toolPhrase || text);
  const okOutput = hasOutputPhrase(outputPhrase || text);

  const missing = [];
  if (!okVerb)   missing.push("فعل تنظيمي");
  if (!okDom)    missing.push("مجال واضح");
  if (!okTool)   missing.push("أداة تنظيمية");
  if (!okOutput) missing.push("مخرج للمهمة");

  const isValid = missing.length === 0;

  const suggestions = buildSuggestions({ verb, domain });

  return `
    <div style="border:1px solid #ccc; padding:15px; margin-top:15px">
      <strong>المهمة ${index + 1}</strong><br><br>

      ${isValid
        ? `<span class="badge-ok">✔ الصياغة صحيحة ومنضبطة (${escapeHTML(verb)} + مجال + أداة + مخرج)</span>`
        : `<span class="badge-bad">✖ الصياغة غير مكتملة</span>`}

      <br><br>

      ${!isValid ? `
        <b>العناصر الناقصة:</b>
        <ul>${missing.map(m => `<li>${m}</li>`).join("")}</ul>

        <b>مقترحات صياغة منضبطة:</b><br><br>
        ${suggestions.map((s, i) => `
          <div style="background:#f5f5f5;padding:10px;margin-bottom:8px" data-suggestion-block>
            <div data-s-text>${s}</div>
            <br>
            <button onclick="applySuggestion(${index}, ${i})">اعتماد هذه الصياغة</button>
          </div>
        `).join("")}
      ` : `
        <div style="background:#eef;padding:10px">
          <span class="verb">${escapeHTML(verb || "—")}</span> /
          <span class="domain">${okDom ? "المجال واضح" : "—"}</span> /
          <span class="tool">${okTool ? "أداة تنظيمية" : "—"}</span> /
          <span class="output">${okOutput ? "مخرج محدد" : "—"}</span>
        </div>
      `}
    </div>
  `;
}

/* اعتماد الصياغة: استبدال سطر المهمة بالنص المقترح (بدون وسوم) وإعادة التحليل */
function applySuggestion(taskIndex, suggestionIndex) {
  const inputEl  = document.getElementById('taskInput');
  const blocks   = document.querySelectorAll('[data-suggestion-block]');
  // كل مهمة لديها 3 اقتراحات مرتبة
  const block = blocks[taskIndex * 3 + suggestionIndex];
  if (!block) return alert('تعذر العثور على الصياغة.');

  const html = block.querySelector('[data-s-text]')?.innerHTML || '';
  const plain = html.replace(/<[^>]+>/g, '') // إزالة الوسوم
                    .replace(/\s*\.\s*$/, ''); // شطب النقطة النهائية

  const lines = inputEl.value.split(/\r?\n/);
  lines[taskIndex] = plain;
  inputEl.value = lines.join('\n');

  analyzeTask();
}

/* فضلاً: اجعل الدالة متاحة في النطاق العام (بعض البيئات تتطلب ذلك) */
window.analyzeTask = analyzeTask;
window.applySuggestion = applySuggestion;
