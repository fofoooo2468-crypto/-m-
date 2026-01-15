
const VERBS = ["مراقبة","متابعة","تفتيش","تقييم","إشراف","حوكمة","إدارة","تنظيم","اعتماد","تصنيف","ترخيص","تطوير","حل"];
const TOOL_KW = ["معايير","سياسات","لوائح","أطر"];
const OUT_KW = ["تقرير","نتائج","مستوى","توصيات"];

function norm(s){return (s||"").replace(/[إأآا]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").trim();}

function analyzeTask(){
  const input = document.getElementById("taskInput").value.trim();
  const out = document.getElementById("output");
  if(!input){ out.innerHTML = "<div>يرجى إدخال مهمة</div>"; return; }

  const tasks = input.split(/\r?\n/).filter(Boolean);
  out.innerHTML = tasks.map((t,i)=>analyzeSingleTask(t,i)).join("");
}

function analyzeSingleTask(text,index){
  const verbsFound = VERBS.filter(v => norm(text).includes(norm(v)));
  const domain = extractDomain(text);
  const tool = TOOL_KW.find(k => text.includes(k)) || "-";
  const output = OUT_KW.find(k => text.includes(k)) || "-";

  const table = `
    <table border="1" style="width:100%;margin-top:8px;text-align:center">
      <tr><th>الأفعال</th><th>المجال</th><th>الأداة</th><th>المخرج</th></tr>
      <tr><td>${verbsFound.join("، ")||"-"}</td><td>${domain||"-"}</td><td>${tool}</td><td>${output}</td></tr>
    </table>
  `;

  const suggestions = buildSuggestions(verbsFound, domain);

  return `
    <div class="task-card">
      <h2>المهمة ${index+1}</h2>
      ${table}
      <h3>مقترحات صياغة:</h3>
      ${suggestions.map((s,i)=>`
        <div class="suggest">
          ${s}
          <button class="btn btn-secondary" onclick="approveSuggestion('${s}')">اعتماد</button>
        </div>
      `).join("")}
    </div>
  `;
}

function extractDomain(text){
  const words = text.split(" ");
  return words.slice(1,5).join(" ");
}

function buildSuggestions(verbs, domain){
  if(verbs.length === 0) verbs = ["مراقبة"];
  return verbs.map(v => `${v} ${domain} من خلال معايير تنظيمية معتمدة بما ينتج عنه إعداد تقرير إشرافي`);
}

function approveSuggestion(s){
  const list = document.getElementById("approvedList");
  const card = document.createElement("div");
  card.className = "approved-card";
  card.textContent = s;
  list.appendChild(card);
}

document.getElementById("analyzeBtn").onclick = analyzeTask;
document.getElementById("clearBtn").onclick = () => {
  document.getElementById("taskInput").value="";
  document.getElementById("output").innerHTML="";
};
document.getElementById("copyBtn").onclick = async () => {
  const txt = document.getElementById("output").innerText;
  await navigator.clipboard.writeText(txt);
  alert("تم النسخ");
};
