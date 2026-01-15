
const VERBS = ["مراقبة","متابعة","تفتيش","تقييم","إشراف","حوكمة","إدارة","تنظيم","اعتماد","تصنيف","ترخيص","تطوير","حل"];
const TOOL_KW = ["معايير","سياسات","لوائح","أطر"];
const OUT_KW = ["تقرير","نتائج","مستوى","توصيات"];

function norm(s){return (s||"").replace(/[إأآا]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").trim();}
function uniq(arr){return [...new Set(arr.filter(Boolean))];}

function findAllVerbs(text){
  const n = norm(text);
  return uniq(VERBS.filter(v => n.includes(norm(v))));
}

function splitDomains(text, verbsFound){
  let n = text;
  verbsFound.forEach(v => n = n.replace(new RegExp(v,"g"), ""));
  const parts = n.split(/[,،]|(?:\sو\s)/g).map(s=>s.trim()).filter(s=>s.split(/\s+/).length>=2);
  return uniq(parts);
}

function detectTool(text){ return TOOL_KW.find(k => text.includes(k)) || ""; }
function detectOutput(text){ return OUT_KW.find(k => text.includes(k)) || ""; }

function unifySentence(verb, domain, toolPhrase, outPhrase){
  const v = verb || "مراقبة";
  const d = domain || "المجال";
  const tool = toolPhrase ? `من خلال ${toolPhrase}` : "من خلال معايير تنظيمية معتمدة";
  const out  = outPhrase ? `بما ينتج عنه ${outPhrase}` : "بما ينتج عنه إعداد تقرير إشرافي";
  return `${v} ${d} ${tool} ${out}`;
}

function analyzeTask(){
  const input = document.getElementById("taskInput").value.trim();
  const out = document.getElementById("output");
  if(!input){ out.innerHTML = "<div>يرجى إدخال مهمة</div>"; return; }

  const tasks = input.split(/\r?\n/).filter(Boolean);
  out.innerHTML = tasks.map((t,i)=>renderTaskCard(t,i)).join("");
}

function renderTaskCard(text,index){
  const verbsFound = findAllVerbs(text);
  const domains = splitDomains(text, verbsFound);
  const toolPhrase = detectTool(text);
  const outPhrase  = detectOutput(text);

  const table = `
    <table border="1" style="width:100%;margin-top:8px;text-align:center">
      <tr><th>الأفعال</th><th>المجالات</th><th>الأداة</th><th>المخرج</th></tr>
      <tr><td>${verbsFound.join("، ")||"-"}</td><td>${domains.join(" | ")||"-"}</td><td>${toolPhrase||"-"}</td><td>${outPhrase||"-"}</td></tr>
    </table>
  `;

  const suggestions = [];
  const vList = verbsFound.length ? verbsFound : ["مراقبة"];
  const dList = domains.length ? domains : ["المجال"];
  vList.forEach(v=>{
    dList.forEach(d=>{
      suggestions.push(unifySentence(v,d,toolPhrase,outPhrase));
    });
  });

  return `
    <div class="task-card">
      <h2>المهمة ${index+1}</h2>
      ${table}
      <h3>مقترحات صياغة منضبطة:</h3>
      ${suggestions.map(s=>`
        <div class="suggest">
          ${s}
          <button class="btn btn-secondary" onclick="approveSuggestion('${s}')">اعتماد</button>
        </div>
      `).join("")}
    </div>
  `;
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
