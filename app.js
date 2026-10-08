const $=id=>document.getElementById(id), qs=DATA.questions, profiles=DATA.profiles;
const TOTAL=qs.length;
let current=0,answers=Array(TOTAL).fill(null),pending=0;
const chapters=["Mindset","Social","Decision","Drive","Integration"];
function show(id){["home","test","insight","result"].forEach(x=>$(x).classList.toggle("active",x===id));scrollTo({top:0,behavior:"smooth"})}
function start(){current=0;answers=Array(TOTAL).fill(null);show("test");render()}
function restart(){if(confirm("Mulai ulang tes? Jawaban yang sudah dipilih akan hilang."))start()}
function render(){if(!qs.length)return; if(current<0)current=0; if(current>=TOTAL)current=TOTAL-1; let q=qs[current],c=Math.floor(current/10);$("chapter").textContent=`BABAK ${c+1} · ${chapters[c] || "Final"}`;$("counter").textContent=`${current+1} / 50`;$("question").textContent=q[0];$("progress").style.width=((current+1)/TOTAL*100)+"%";$("back").disabled=current===0;$("next").disabled=answers[current]===null;$("next").textContent=current===TOTAL-1?"Lihat hasil →":"Lanjut →";$("options").innerHTML=[q[1],q[2]].map((x,i)=>`<button class="option ${answers[current]===i?"selected":""}" onclick="choose(${i})"><span class="letter">${i?"B":"A"}</span><span>${esc(x)}</span></button>`).join("")}
function choose(i){answers[current]=i;render()}
function back(){if(current>0){current--;render()}}
function next(){
  if(answers[current]===null)return;

  // Pertanyaan terakhir: langsung tampilkan hasil akhir.
  if(current===TOTAL-1){
    finish();
    return;
  }

  current++;
  render();

  // Setelah setiap 10 pertanyaan, tampilkan pembacaan sementara.
  if(current%10===0){
    pending=current;
    makeInsight();
  }
}
function score(end){let s={I:0,E:0,N:0,S:0,T:0,F:0,J:0,P:0};for(let i=0;i<end;i++){let q=qs[i],v=answers[i]===0?q[3]:q[4];s[v]++}return s}
function type(s){return(s.I>=s.E?"I":"E")+(s.N>=s.S?"N":"S")+(s.T>=s.F?"T":"F")+(s.J>=s.P?"J":"P")}
function makeInsight(){let s=score(pending),t=type(s),p=profiles[t];$("insightProgress").textContent=`${pending} dari 50 pertanyaan selesai`;$("miniType").textContent=t;$("insightTitle").textContent=p[0];$("insightText").textContent=reading(t,pending);let ds=[["I","E"],["N","S"],["T","F"],["J","P"]],labs=["Energi","Informasi","Keputusan","Gaya hidup"];$("traits").innerHTML=ds.map((d,i)=>{let w=s[d[0]]>=s[d[1]]?d[0]:d[1];let m={I:"lebih internal",E:"lebih eksternal",N:"melihat pola",S:"fokus konkret",T:"lebih logis",F:"lebih people-aware",J:"lebih terstruktur",P:"lebih fleksibel"}[w];return `<span class="trait">${labs[i]}: ${m}</span>`}).join("");show("insight")}
function reading(t,n){
  const s=score(n), p=profiles[t];
  const bits={
    I:["kamu cukup nyaman memproses sesuatu dari dalam diri sebelum bereaksi","kamu cenderung butuh ruang untuk mengisi ulang energi"],
    E:["kamu terlihat mendapatkan energi dari interaksi dan pertukaran ide","kamu cenderung lebih cepat membaca situasi lewat interaksi"],
    N:["kamu cukup kuat melihat pola, kemungkinan, dan gambaran besar","kamu tampak tertarik pada makna di balik fakta"],
    S:["kamu cukup kuat memperhatikan fakta, pengalaman, dan hal yang konkret","kamu tampak nyaman dengan sesuatu yang jelas dan bisa diterapkan"],
    T:["kamu cenderung menimbang logika dan konsekuensi saat memilih","kamu tampak cukup nyaman dengan keputusan yang objektif"],
    F:["kamu cukup mempertimbangkan dampak keputusan terhadap orang lain","kamu tampak peka terhadap nilai dan dinamika hubungan"],
    J:["kamu cenderung mencari struktur, arah, dan kepastian","kamu terlihat nyaman ketika tujuan dan langkahnya jelas"],
    P:["kamu cenderung menjaga pilihan tetap terbuka dan adaptif","kamu terlihat nyaman menyesuaikan diri ketika keadaan berubah"]
  };
  const dims=[["I","E"],["N","S"],["T","F"],["J","P"]];
  const chosen=dims.map(d=>s[d[0]]>=s[d[1]]?d[0]:d[1]);
  if(n===10) return `Dari 10 jawaban pertama, ${bits[chosen[0]][0]}. ${bits[chosen[1]][0]}. Ini baru potret awal, jadi pola berikutnya masih bisa mengubah hasil.`;
  if(n===20) return `Setelah 20 jawaban, pola kamu mulai lebih jelas: ${bits[chosen[0]][1]} dan ${bits[chosen[1]][1]}. Dibanding awal, karakter dasarmu mulai terlihat lebih konsisten.`;
  if(n===30) return `Memasuki bagian keputusan, terlihat bahwa ${bits[chosen[2]][0]}. Ini penting karena cara mengambil keputusan sering menjadi salah satu pembeda utama dalam gaya kepribadian.`;
  if(n===40) return `Setelah 40 jawaban, kamu terlihat ${bits[chosen[3]][0]}. Jika digabung dengan pola sebelumnya, gambaran sementaramu mulai mendekati profil akhir.`;
  return p[2];
}
function continueTest(){show("test");render()}
function finish(){
  const s=score(TOTAL), t=type(s), p=profiles[t];
  if(!p){console.error("Profile tidak ditemukan:",t);return;}
  $("finalType").textContent=t;
  $("finalName").textContent=p[0];
  $("finalTag").textContent=p[2];
  $("thinking").textContent=p[2];
  $("social").textContent=p[5];
  $("relationship").textContent=p[6];
  $("work").textContent=p[7];
  $("leadership").textContent=p[8];
  $("pressure").textContent=p[9];
  $("hero").textContent=p[10];
  $("strengths").innerHTML=p[3].map(x=>`<li>${esc(x)}</li>`).join("");
  $("blind").innerHTML=p[4].map(x=>`<li>${esc(x)}</li>`).join("");
  $("summary").textContent=`Secara keseluruhan, ${p[2].charAt(0).toLowerCase()+p[2].slice(1)} Kekuatan utamamu adalah ${p[3].slice(0,3).join(", ").toLowerCase()}. Sisi yang paling perlu dijaga adalah ${p[4].slice(0,2).join(" dan ").toLowerCase()}. Dalam hubungan, kamu ${p[6].toLowerCase()} Dalam pekerjaan, kamu ${p[7].toLowerCase()} Ketika berada di bawah tekanan, ${p[9].toLowerCase()}`;
  $("strengthSummary").textContent=`Kekuatan yang paling menonjol: ${p[3].join(" • ")}`;
  $("blindSummary").textContent=`Area yang perlu dikembangkan: ${p[4].join(" • ")}`;
  const ds=[["I","E","Introvert","Extrovert"],["N","S","Intuitive","Sensing"],["T","F","Thinking","Feeling"],["J","P","Judging","Perceiving"]];
  $("dimensions").innerHTML=ds.map(d=>{let a=s[d[0]],b=s[d[1]],pct=Math.round(Math.max(a,b)/(a+b)*100),lab=a>=b?d[2]:d[3];return `<div class="dimension"><span>${lab}</span><div class="bar"><i style="width:${pct}%"></i></div><b>${pct}%</b></div>`}).join("");
  window.result={t};show("result");
}
function share(){let t=window.result.t,n=$("finalName").textContent,msg=encodeURIComponent(`🧠 Hasil Personality Insight-ku: ${t} — ${n}\n\nCoba tes juga: ${location.href}`);open(`https://wa.me/?text=${msg}`,"_blank")}
async function copyResult(){let x=`Hasil Personality Insight: ${$("finalType").textContent} — ${$("finalName").textContent}`;try{await navigator.clipboard.writeText(x);alert("Hasil disalin.")}catch(e){alert(x)}}
function esc(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
render();