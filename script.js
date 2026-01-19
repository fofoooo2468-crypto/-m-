const VERBS = [
  "إشراف","مراقبة","متابعة","تقييم","تقويم",
  "تنظيم","اعتماد","ترخيص","تصنيف","حوكمة","تطوير","إدارة"
];

const TOOLS = ["لوائح","سياسات","معايير","أطر","أدلة"];

function extractVerb(text){
  const first = text.trim().split(/\s+/)[0];
  return VERBS.includes(first) ? first : "";
}

function extractDomain(text, verb){
  let t = text.trim();

  if (verb) {
    t = t.replace(new RegExp("^" + verb + "\\s*(على)?"), "").trim();
  }

  return t
    .replace(/^ال\s+/,"")
    .replace(/\s{2,}/g," ");
}

function detectTool(text){
  return TOOLS.find(t => text.includes(t)) || "";
}

function smartOutput(verb){
  const map = {
    "إشراف": "رفع تقارير إشرافية دورية",
    "مراقبة": "قياس مستوى الالتزام",
    "متابعة": "ضمان استمرارية التنفيذ",
    "تقييم": "تحديد نقاط القوة والقصور",
    "تقويم": "معالجة أوجه القصور وتعزيز الضبط",
    "اعتماد": "إصدار قرارات اعتماد رسمية",
    "تنظيم": "توحيد الإجراءات وتحقيق الاتساق",
    "تطوير": "رفع الكفاءة وتحسين الأداء",
    "حوكمة": "تعزيز الامتثال والانضباط المؤسسي"
  };
  return map[verb] || "تحقيق مستهدفات الجهة";
}

function buildSentence(verb, domain, tool){
  return `${verb} ${domain} ` +
         `${tool ? "وفق " + tool : "وفق أطر تنظيمية معتمدة"} ` +
         `بما يحقق ${smartOutput(verb)}`;
}

function analyze(){
  const input = taskInput.value.trim();
  if (!input) {
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
  const verb = extractVerb(text) || "مراقبة";
  const domain = extractDomain(text, verb);
  const tool = detectTool(text);
  const sentence = buildSentence(verb, domain, tool);

  return `
    <div class="task-card">
      <h2>المهمة ${index+1}</h2>
      <table>
        <tr><th>الفعل</th><th>المجال</th><th>الأداة</th><th>المخرج</th></tr>
        <tr>
          <td>${verb}</td>
          <td>${domain}</td>
          <td>${tool || "-"}</td>
          <td>${smartOutput(verb)}</td>
        </tr>
      </table>

      <h3>صياغة منضبطة:</h3>
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
