/***********************
 * قاعدة الأفعال
 ***********************/
const VERBS = [
  "تنظيم","حوكمة","إشراف","مراقبة","متابعة",
  "تقييم","تقويم","اعتماد","تطوير","إدارة"
];

/***********************
 * أدوات محتملة
 ***********************/
const TOOLS = ["لوائح","سياسات","معايير","أطر","أدلة","نماذج"];

/***********************
 * تنظيف النص
 ***********************/
function normalize(text){
  return text
    .replace(/\|/g," ")
    .replace(/\s{2,}/g," ")
    .trim();
}

/***********************
 * استخراج الفعل
 ***********************/
function extractVerb(text){
  const words = text.split(/\s+/);
  for (let w of words){
    if (VERBS.includes(w)) return w;
  }
  return "تنظيم"; // افتراضي ذكي
}

/***********************
 * استخراج المجال (بدون الأثر)
 ***********************/
function extractDomain(text, verb){
  let t = normalize(text);

  // إزالة الفعل
  t = t.replace(new RegExp("^.*?"+verb+"\\s*(على)?"), "").trim();

  // قص العبارات الإنشائية
  t = t
    .replace(/التي\s+تمكن.*$/,"")
    .replace(/بما\s+يعزز.*$/,"")
    .replace(/ويحقق.*$/,"")
    .replace(/ويعزز.*$/,"")
    .replace(/بهدف.*$/,"")
    .replace(/نحو\s+ذلك.*$/,"");

  return t.trim();
}

/***********************
 * أداة ذكية
 ***********************/
function smartTool(verb, text){
  const explicit = TOOLS.find(t => text.includes(t));
  if (explicit) return explicit;

  if (["تنظيم","حوكمة","تطوير"].includes(verb))
    return "أطر ومعايير تنظيمية";

  if (["إشراف","مراقبة","متابعة"].includes(verb))
    return "آليات وإجراءات رقابية";

  if (["تقييم","تقويم"].includes(verb))
    return "نماذج ومعايير تقييم";

  if (verb === "اعتماد")
    return "ضوابط ومعايير اعتماد";

  return "أطر تنظيمية معتمدة";
}

/***********************
 * مخرج ذكي حسب الفعل
 ***********************/
function smartOutput(verb){
  const map = {
    "تنظيم": "تحقيق الاتساق ورفع كفاءة المنظومة",
    "حوكمة": "تعزيز الامتثال والانضباط المؤسسي",
    "إشراف": "رفع تقارير إشرافية دورية",
    "مراقبة": "قياس مستوى الالتزام ومعالجة الانحرافات",
    "متابعة": "ضمان استمرارية التنفيذ وتحقيق المستهدفات",
    "تقييم": "تحديد نقاط القوة والقصور",
    "تقويم": "معالجة أوجه القصور وتحسين الأداء",
    "اعتماد": "إصدار قرارات اعتماد رسمية",
    "تطوير": "رفع الكفاءة وتحسين جودة المخرجات",
    "إدارة": "تحقيق التكامل وكفاءة التشغيل"
  };
  return map[verb] || "تحقيق مستهدفات الجهة";
}

/***********************
 * بناء الصياغة النهائية
 ***********************/
function buildSentence(verb, domain, tool){
  return `${verb} ${domain} وفق ${tool} بما يحقق ${smartOutput(verb)}.`;
}

/***********************
 * التحليل
 ***********************/
function analyze(){
  const input = taskInput.value.trim();
  if (!input){
    output.innerHTML = "يرجى إدخال مهمة";
    return;
  }

  output.innerHTML = input
    .split(/\n+/)
    .map((t,i)=>renderCard(t,i))
    .join("");

  bindApprove();
}

function renderCard(text,index){
  const cleanText = normalize(text);
  const verb = extractVerb(cleanText);
  const domain = extractDomain(cleanText, verb);
  const tool = smartTool(verb, cleanText);
  const out = smartOutput(verb);
  const sentence = buildSentence(verb, domain, tool);

  return `
    <div class="task-card">
      <h2>المهمة ${index+1}</h2>
      <table>
        <tr>
          <th>الفعل</th>
          <th>المجال</th>
          <th>الأداة</th>
          <th>المخرج</th>
        </tr>
        <tr>
          <td>${verb}</td>
          <td>${domain}</td>
          <td>${tool}</td>
          <td>${out}</td>
        </tr>
      </table>

      <h3>صياغة منضبطة ذكية:</h3>
      <div class="suggest">
        <span>${sentence}</span>
        <button class="btn btn-secondary approve"
          data-text="${encodeURIComponent(sentence)}">اعتماد</button>
      </div>
    </div>
  `;
}

function bindApprove(){
  document.querySelectorAll(".approve").forEach(btn=>{
    btn.onclick = ()=>{
      const div = document.createElement("div");
      div.className = "approved-card";
      div.textContent = decodeURIComponent(btn.dataset.text);
      approvedList.appendChild(div);
    };
  });
}

analyzeBtn.onclick = analyze;
clearBtn.onclick = ()=>{ taskInput.value=""; output.innerHTML=""; };
copyBtn.onclick = ()=> {
  navigator.clipboard.writeText(output.innerText);
  alert("تم النسخ");
};
