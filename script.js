function analyzeTask() {
  const text = document.getElementById("taskInput").value;

  if (!text) {
    alert("يرجى إدخال نص المهمة");
    return;
  }

  document.getElementById("output").innerHTML = `
  <strong>ناتج التحليل:</strong><br><br>
  • الفعل التنظيمي: <br>
  • المجال: <br>
  • الأداة التنظيمية: <br>
  • المخرج:
  `;
}
