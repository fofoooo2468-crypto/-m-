const VERBS = ["مراقبة","متابعة","تفتيش","تقييم","إشراف","حوكمة","إدارة","تنظيم","اعتماد","تصنيف","ترخيص","تطوير","حل"];
const TOOLS = ["معايير","سياسات","لوائح","أطر"];
const OUTPUTS = ["تقرير","نتائج","مستوى","توصيات"];

const norm = s =>
  (s||"")
  .replace(/[إأآا]/g,"ا")
  .replace(/ى/g,"ي")
  .replace(/ة/g,"ه");

const uniq = a => [...new Set(a.filter(Boolean))];

function findVerbs(text){
  const n = norm(text);
  return uniq(VERBS.filter(v => n.includes(norm(v))));
}

function splitDomains(text, verbs){
  let t = text;
  verbs.forEach(v => t = t.replace(new RegExp(v,"g"),""));
  return uniq(
    t.split(/[,،]|(?:\sو\s)/)
     .map(s=>s.trim())
     .filter(s=>s.split(" ").length >= 2)
  );
}

const detect = (arr,text) => arr.find(k => text.includes(k)) || "";

function buildSentence(v,d,tool,out){
  return `${v||"مراقبة"} ${d||"المجال"} ` +
         `${tool?`من خلال ${tool}`:"من خلال معايير تنظيمية معتمدة"} ` +
         `${out?`بما ينتج عنه ${out}`:"بما ينتج عنه إعداد تقرير إشرافي"}`;
}

function analyze(){
  const input = taskInput.value.trim();
  if(!input){ output.innerHTML="يرجى إدخال مهمة"; return; }

  output.innerHTML = input
    .split(/\n+/)
    .map((t,i)=>renderCard(t,i))
    .join("");

  bindApprove();
}

function renderCard(text,i){
  const v = findVerbs(text);
  const d = splitDomains(text,v);
  const tool = detect(TOOLS,text);
  const out  = detect(OUTPUTS,text);

  const suggestions=[];
  (v.length?v:["مراقبة"]).forEach(x=>{
    (d.length?d:["المجال"]).forEach(y=>{
      suggestions.push(buildSentence(x,y,tool,out));
    });
  });

  return `
  <div class="task-card">
    <h2>المهمة ${i+1}</h2>
    <table>
      <tr><th>الأفعال</th><th>المجالات</th><th>الأداة</th><th>المخرج</th></tr>
      <tr>
        <td>${v.join("،")||"-"}</td>
        <td>${d.join(" | ")||"-"}</td>
        <td>${tool||"-"}</td>
        <td>${out||"-"}</td>
      </tr>
    </table>

    <h3>مقترحات صياغة:</h3>
    ${suggestions.map(s=>`
      <div class="suggest">
        <span>${s}</span>
        <button class="btn btn-secondary approve" data-text="${encodeURIComponent(s)}">اعتماد</button>
      </div>`).join("")}
  </div>`;
}

function bindApprove(){
  document.querySelectorAll(".approve").forEach(b=>{
    b.onclick=()=> {
      const card=document.createElement("div");
      card.className="approved-card";
      card.textContent=decodeURIComponent(b.dataset.text);
      approvedList.appendChild(card);
    };
  });
}

analyzeBtn.onclick = analyze;
clearBtn.onclick = ()=>{ taskInput.value=""; output.innerHTML=""; };
copyBtn.onclick = ()=> {
  navigator.clipboard.writeText(output.innerText);
  alert("تم النسخ");
};
