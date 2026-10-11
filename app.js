const $=id=>document.getElementById(id), qs=DATA.questions, profiles=DATA.profiles;
const TOTAL=qs.length;
let current=0,answers=Array(TOTAL).fill(null),pending=0;
const chapters=["Mindset","Social","Decision","Drive","Integration"];
function show(id){["home","test","insight","result","adventureMenu","adventure","adventureResult"].forEach(x=>{const el=$(x);if(el)el.classList.toggle("active",x===id)});scrollTo({top:0,behavior:"smooth"})}
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
function type(s,end=TOTAL){
  // Jika skor seri, gunakan jawaban pada pertanyaan tie-breaker yang relevan.
  // Q7 (index 6) adalah pertanyaan energi yang eksplisit; Q26 (index 25)
  // adalah pertanyaan preferensi struktur yang eksplisit. Ini menghindari
  // bias lama yang selalu memilih I dan J ketika skor seri.
  const pick=(a,b,indices)=>{
    if(s[a]>s[b]) return a;
    if(s[b]>s[a]) return b;
    const answered=indices.filter(i=>i<end && answers[i]!==null);
    if(answered.length){
      const i=answered.includes(indices[0])?indices[0]:answered[answered.length-1];
      const q=qs[i], chosen=answers[i]===0?q[3]:q[4];
      if(chosen===a || chosen===b) return chosen;
    }
    // Untuk insight sebelum pertanyaan dimensi tersebut dijawab, hasilnya
    // masih sementara. Final test selalu memiliki jawaban tie-breaker.
    return a;
  };
  return pick("I","E",[6,0])+pick("N","S",[8,9])+pick("T","F",[16,17])+pick("J","P",[25,26]);
}
function makeInsight(){let s=score(pending),t=type(s,pending),p=profiles[t];$("insightProgress").textContent=`${pending} dari 50 pertanyaan selesai`;$("miniType").textContent=t;$("insightTitle").textContent=p[0];$("insightText").textContent=reading(t,pending);let ds=[["I","E"],["N","S"],["T","F"],["J","P"]],labs=["Energi","Informasi","Keputusan","Gaya hidup"];$("traits").innerHTML=ds.map((d,i)=>{let w=t[i];let m={I:"lebih internal",E:"lebih eksternal",N:"melihat pola",S:"fokus konkret",T:"lebih logis",F:"lebih people-aware",J:"lebih terstruktur",P:"lebih fleksibel"}[w];return `<span class="trait">${labs[i]}: ${m}</span>`}).join("");show("insight")}
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
  // Gunakan huruf hasil yang sama dengan miniType, termasuk saat skor seri.
  const chosen=t.split("");
  if(n===10) return `Dari 10 jawaban pertama, ${bits[chosen[0]][0]}. ${bits[chosen[1]][0]}. Ini baru potret awal, jadi pola berikutnya masih bisa mengubah hasil.`;
  if(n===20) return `Setelah 20 jawaban, pola kamu mulai lebih jelas: ${bits[chosen[0]][1]} dan ${bits[chosen[1]][1]}. Dibanding awal, karakter dasarmu mulai terlihat lebih konsisten.`;
  if(n===30) return `Memasuki bagian keputusan, terlihat bahwa ${bits[chosen[2]][0]}. Ini penting karena cara mengambil keputusan sering menjadi salah satu pembeda utama dalam gaya kepribadian.`;
  if(n===40) return `Setelah 40 jawaban, kamu terlihat ${bits[chosen[3]][0]}. Jika digabung dengan pola sebelumnya, gambaran sementaramu mulai mendekati profil akhir.`;
  return p[2];
}
function continueTest(){show("test");render()}
function finish(){
  const s=score(TOTAL), t=type(s,TOTAL), p=profiles[t];
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
  $("dimensions").innerHTML=ds.map((d,i)=>{let a=s[d[0]],b=s[d[1]],pct=Math.round(Math.max(a,b)/(a+b)*100),lab=t[i]===d[0]?d[2]:d[3];return `<div class="dimension"><span>${lab}</span><div class="bar"><i style="width:${pct}%"></i></div><b>${pct}%</b></div>`}).join("");
  window.result={t};show("result");
}
function share(){let t=window.result.t,n=$("finalName").textContent,msg=encodeURIComponent(`🧠 Hasil Personality Insight-ku: ${t} — ${n}\n\nCoba tes juga: ${location.href}`);open(`https://wa.me/?text=${msg}`,"_blank")}
async function copyResult(){let x=`Hasil Personality Insight: ${$("finalType").textContent} — ${$("finalName").textContent}`;try{await navigator.clipboard.writeText(x);alert("Hasil disalin.")}catch(e){alert(x)}}
function esc(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
render();

// =============================
// PERSONALITY ADVENTURE
// =============================
const FORBIDDEN_FOREST_SCENES = [
  {
    emoji:"🌧️", title:"Jalan yang Terlarang",
    image:"images/adventure/forbidden/scene-01.png",
    text:"Kamu sedang dalam perjalanan pulang ketika hujan turun sangat deras. Jalan utama tertutup karena sebuah pohon tumbang. Di samping hutan ada jalan kecil dengan papan tua: “JANGAN MASUK SETELAH MATAHARI TERBENAM.” Hari mulai gelap.",
    options:[
      ["🌲","Masuk melalui jalan kecil itu.",{courage:2,curiosity:1,independence:1},"Memilih jalan kecil bisa mencerminkan kesediaanmu mencoba jalur yang belum pasti ketika jalan biasa tertutup. Kamu mungkin tertarik mencari jalan keluar sendiri, meski tetap perlu menimbang risikonya."],
      ["📱","Mencari jalan lain menggunakan ponsel.",{caution:2,planning:1},"Menggunakan ponsel untuk mencari rute menunjukkan pendekatan yang mengandalkan informasi sebelum bertindak. Saat menghadapi hambatan, kamu mungkin lebih suka membandingkan pilihan daripada langsung mengambil risiko."],
      ["🏠","Mencari tempat berteduh sampai hujan reda.",{caution:2,security:1},"Berteduh sampai hujan reda menekankan pentingnya waktu dan keselamatan bagimu. Kamu mungkin memilih menstabilkan keadaan dahulu sebelum menentukan langkah berikutnya."]
    ]
  },
  {
    emoji:"🧭", title:"Tiga Benda",
    image:"images/adventure/forbidden/scene-02.png",
    text:"Jalan semakin sempit. Beberapa menit kemudian kamu menemukan tiga benda di tanah: sebuah kompas, senter, dan kunci tua. Kamu hanya boleh mengambil satu.",
    options:[
      ["🧭","Mengambil kompas.",{planning:2,curiosity:1},"Kompas adalah simbol mencari arah. Pilihan ini bisa menunjukkan bahwa petunjuk yang membantu menentukan tujuan terasa berguna bagimu ketika lingkungan masih asing."],
      ["🔦","Mengambil senter.",{caution:1,curiosity:2},"Senter membantu melihat apa yang dekat, bukan seluruh perjalanan. Pilihan ini bisa mencerminkan keinginan memahami keadaan selangkah demi selangkah sebelum memutuskan ke mana harus pergi."],
      ["🗝️","Mengambil kunci tua.",{curiosity:2,courage:1},"Kunci tua membuka kemungkinan yang belum diketahui. Memilihnya bisa menunjukkan bahwa misteri dan peluang tersembunyi cukup menarik bagimu, meskipun manfaatnya belum jelas."]
    ]
  },
  {
    emoji:"🏚️", title:"Rumah Tua",
    image:"images/adventure/forbidden/scene-03.png",
    text:"Kamu melihat sebuah rumah tua. Anehnya, ada cahaya dari salah satu jendelanya. Pintu depan sedikit terbuka. Tidak ada kendaraan dan tidak terdengar suara manusia.",
    options:[
      ["🚪","Masuk ke rumah.",{courage:2,curiosity:1},"Masuk ke rumah berarti memilih mendekati sumber misteri secara langsung. Kamu mungkin lebih ingin memperoleh jawaban dari dekat daripada terus menebak dari luar."],
      ["👀","Mengamati rumah dari luar terlebih dahulu.",{caution:2,planning:1},"Mengamati rumah dahulu menunjukkan bahwa kamu ingin mengumpulkan tanda sebelum mengambil risiko. Kamu mungkin merasa lebih mantap ketika sudah punya gambaran awal tentang situasi."],
      ["🚶","Melanjutkan perjalanan dan mengabaikannya.",{caution:1,independence:2},"Meninggalkan rumah menunjukkan bahwa rasa penasaran bukan satu-satunya pertimbanganmu. Kamu mungkin rela melewatkan sesuatu yang menarik jika pilihan lain terasa lebih sesuai dengan tujuan atau keselamatanmu."]
    ]
  },
  {
    emoji:"🗣️", title:"Suara dari Atas",
    image:"images/adventure/forbidden/scene-04.png",
    text:"Jika kamu masuk, baru beberapa langkah kamu mendengar suara dari lantai atas: “Tolong...” Suara itu terdengar seperti seseorang yang membutuhkan bantuan. Tetapi rumah tersebut terlihat sudah lama ditinggalkan.",
    options:[
      ["⬆️","Naik ke lantai atas.",{courage:2,empathy:1},"Naik ke lantai atas berarti menanggapi panggilan bantuan dengan tindakan langsung. Pilihan ini bisa mencerminkan keberanian untuk mendekati situasi yang belum jelas ketika seseorang mungkin membutuhkan pertolongan."],
      ["📢","Memanggil orang tersebut dari bawah.",{caution:1,empathy:2},"Memanggil dari bawah adalah cara mencari informasi sambil menjaga jarak aman. Kamu mungkin berusaha menyeimbangkan kepedulian terhadap orang lain dengan kehati-hatian."],
      ["🚪","Keluar dari rumah.",{caution:2,security:1},"Keluar dari rumah berarti memilih batas aman ketika situasi terasa terlalu tidak pasti. Kamu mungkin menilai bahwa menolong tidak selalu berarti harus terus berada dalam keadaan yang berisiko."]
    ]
  },
  {
    emoji:"🖼️", title:"Peringatan",
    image:"images/adventure/forbidden/scene-05.png",
    text:"Di lantai atas terdapat sebuah kamar. Tidak ada siapa-siapa. Hanya sebuah meja dan foto lama. Di belakang foto tertulis: “Jangan percaya orang yang kamu temui di sini.” Tiba-tiba terdengar langkah kaki dari belakangmu.",
    options:[
      ["🔄","Berbalik melihat siapa yang datang.",{courage:2,curiosity:1},"Berbalik untuk memeriksa suara berarti kamu ingin menghadapi sumber gangguan dan mengetahui apa yang terjadi. Pilihan ini bisa mencerminkan kecenderungan mencari kejelasan secara langsung."],
      ["🏃","Segera keluar dari kamar.",{caution:2,security:1},"Segera keluar dari kamar menunjukkan bahwa kamu bersedia meninggalkan penyelidikan ketika situasi mulai terasa tidak aman. Kamu mungkin memprioritaskan keselamatan daripada memenuhi rasa penasaran saat itu."],
      ["🤫","Bersembunyi dan mengamati.",{caution:1,planning:2},"Bersembunyi dan mengamati berarti kamu memilih memperoleh informasi tanpa langsung terlihat. Kamu mungkin menyukai pendekatan yang memberi waktu untuk membaca keadaan sebelum bertindak."]
    ]
  },
  {
    emoji:"🧍", title:"Orang Asing",
    image:"images/adventure/forbidden/scene-06.png",
    text:"Seorang pria berdiri di ujung lorong. Pakaiannya basah seperti baru datang dari luar. Dia berkata, “Kamu tidak seharusnya berada di sini.” Kemudian dia menunjuk ke arah tangga. “Ikuti saya kalau kamu ingin keluar.”",
    options:[
      ["🚶","Mengikutinya.",{trust:2,courage:1},"Mengikuti orang asing berarti kamu memberi kesempatan pada orang lain untuk menunjukkan jalan. Pilihan ini bisa mencerminkan keterbukaan pada bantuan, terutama ketika kamu belum mengetahui semua jawabannya."],
      ["🧭","Menolak dan mencari jalan sendiri.",{independence:2,caution:1},"Menolak dan mencari jalan sendiri menekankan kendali pribadi. Kamu mungkin lebih nyaman bertanggung jawab atas arah yang kamu ambil daripada menyerahkan keputusan kepada orang yang belum dikenal."],
      ["❓","Bertanya terlebih dahulu siapa dirinya.",{trust:1,planning:2},"Bertanya lebih dahulu menunjukkan bahwa kepercayaan bagimu dapat dibangun melalui penjelasan. Kamu mungkin tidak langsung menerima atau menolak bantuan, tetapi ingin memahami siapa yang sedang kamu hadapi."]
    ]
  },
  {
    emoji:"↔️", title:"Persimpangan",
    image:"images/adventure/forbidden/scene-07.png",
    text:"Kamu menemukan lorong dengan dua jalan. Pria itu menunjuk ke kiri. “Lewat sini.” Tetapi kamu melihat jejak kaki basah menuju jalan kanan. Pria tersebut tidak menjelaskan apa-apa.",
    options:[
      ["⬅️","Mengikuti pria tersebut.",{trust:2,security:1},"Mengikuti pria itu berarti kamu memilih mempercayai petunjuk yang tersedia. Dalam situasi nyata, pilihan semacam ini bisa menunjukkan keterbukaan pada arahan orang lain, walau kepercayaan tetap perlu disesuaikan dengan konteks."],
      ["➡️","Mengikuti jejak kaki.",{curiosity:2,independence:1},"Mengikuti jejak kaki berarti kamu memilih memeriksa bukti yang bisa diamati sendiri. Kamu mungkin lebih tertarik pada petunjuk konkret daripada hanya mengandalkan perkataan seseorang."],
      ["✋","Tetap di tempat dan meminta penjelasan.",{planning:2,trust:1},"Berhenti dan meminta penjelasan menunjukkan bahwa kamu ingin memahami alasan di balik sebuah arahan. Kamu mungkin merasa lebih yakin jika keputusan dibuat berdasarkan informasi yang cukup."]
    ]
  },
  {
    emoji:"🌉", title:"Jembatan",
    image:"images/adventure/forbidden/scene-08.png",
    text:"Jalan yang kamu pilih membawamu keluar dari rumah. Di depan terdapat jembatan kayu kecil. Di bawahnya mengalir sungai deras. Jembatan terlihat tua.",
    options:[
      ["🌉","Menyeberang sekarang.",{courage:2,independence:1},"Menyeberang sekarang berarti kamu bersedia bergerak meski belum semua hal diketahui. Pilihan ini bisa mencerminkan kesiapan menghadapi tantangan ketika kesempatan untuk maju sudah ada."],
      ["🔙","Kembali ke rumah.",{caution:2,security:1},"Kembali ke rumah berarti kamu mempertimbangkan ulang keputusan saat menemukan risiko baru. Kamu mungkin melihat perubahan rencana sebagai bentuk penyesuaian, bukan semata-mata kegagalan."],
      ["🔍","Memeriksa kondisi jembatan terlebih dahulu.",{planning:2,caution:1},"Memeriksa jembatan dahulu menunjukkan bahwa kamu ingin mengurangi ketidakpastian dengan mengecek kondisi secara langsung. Kamu mungkin memilih memastikan pijakan sebelum mengambil langkah yang sulit dibatalkan."]
    ]
  },
  {
    emoji:"🌑", title:"Dua Jalan",
    image:"images/adventure/forbidden/scene-09.png",
    text:"Setelah melewati jembatan, kamu menemukan jalan bercabang. Jalan pertama memiliki lampu-lampu kecil. Jalan kedua gelap total. Dari jalan gelap terdengar suara kendaraan. Jalan terang terlihat lebih aman, tetapi kamu tidak tahu ke mana arahnya.",
    options:[
      ["💡","Memilih jalan yang terang.",{security:2,caution:1},"Memilih jalan terang bisa menunjukkan bahwa kejelasan dan rasa aman menjadi pertimbangan penting ketika ada beberapa rute. Kamu mungkin lebih nyaman melihat apa yang akan dihadapi sebelum melanjutkan."],
      ["🌑","Memilih jalan yang gelap.",{courage:2,curiosity:1},"Memilih jalan gelap berarti kamu bersedia menjelajahi bagian yang belum diketahui. Pilihan ini bisa mencerminkan rasa ingin tahu atau ketertarikan pada kemungkinan yang belum terlihat, bukan berarti kamu selalu ceroboh."],
      ["🧭","Berhenti dan menentukan arah terlebih dahulu.",{planning:2,independence:1},"Berhenti menentukan arah menunjukkan bahwa kamu ingin memilih secara sadar, bukan hanya mengikuti jalur yang tersedia. Kamu mungkin menghargai jeda untuk menimbang tujuan sebelum bergerak."]
    ]
  },
  {
    emoji:"🌅", title:"Keluar dari Hutan",
    image:"images/adventure/forbidden/scene-10.png",
    text:"Kamu akhirnya melihat cahaya kota dari kejauhan. Hujan mulai berhenti. Sebelum meninggalkan hutan, kamu menoleh ke belakang. Rumah tua itu sudah tidak terlihat. Tetapi di tanganmu masih ada benda yang kamu ambil sejak awal. Perjalananmu berakhir di sini.",
    options:[
      ["✨","Melihat kembali apa yang kamu bawa.",{curiosity:1,reflection:2},"Memeriksa kembali barang yang dibawa menunjukkan bahwa kamu ingin memahami apa yang kamu peroleh dari perjalanan. Kamu mungkin tertarik pada detail atau makna yang baru terasa setelah sebuah pengalaman berlalu."],
      ["🚶","Langsung melanjutkan perjalanan pulang.",{independence:2,security:1},"Langsung pulang menandakan bahwa bagimu, menyelesaikan perjalanan bisa lebih penting daripada terus menengok ke belakang. Kamu mungkin cenderung beralih ke tujuan berikutnya setelah merasa tugas utama selesai."],
      ["🌲","Berhenti sejenak dan mengingat semua yang terjadi.",{reflection:2,planning:1},"Berhenti mengingat kejadian menunjukkan bahwa kamu memberi ruang untuk memproses pengalaman. Kamu mungkin ingin memahami bukan hanya apa yang terjadi, tetapi juga bagaimana pengalaman itu memengaruhi cara pandangmu."]
    ]
  }
];

const CITY_0317_SCENES = [
  {
    emoji:"🌃", title:"03:17", image:"images/adventure/0317/scene-01.png",
    text:"Malam itu kamu belum tidur. Kamu berdiri di dekat jendela apartemen sambil melihat kota yang masih dipenuhi cahaya. Jam digital di meja menunjukkan 03:16. Beberapa detik kemudian... 03:17. Seketika semuanya diam. Hujan yang tadi jatuh berhenti di udara. Lampu kendaraan tidak bergerak. Bahkan suara kota menghilang.",
    options:[
      ["🚪","Keluar dari apartemen.",{courage:2,curiosity:1},"Keluar dari apartemen berarti kamu memilih mendekati kejadian yang tidak biasa secara langsung. Pilihan ini bisa mencerminkan dorongan untuk mencari jawaban lewat pengalaman, bukan hanya pengamatan dari jauh."],
      ["🪟","Tetap mengamati dari jendela.",{caution:2,reflection:1},"Mengamati dari jendela memberi jarak untuk memahami kejadian sebelum ikut terlibat. Kamu mungkin lebih suka membaca situasi terlebih dahulu ketika sesuatu terasa ganjil."],
      ["📱","Mencoba merekam semuanya.",{curiosity:2,planning:1},"Merekam kejadian menunjukkan bahwa kamu ingin menyimpan bukti untuk diperiksa kembali. Kamu mungkin percaya bahwa detail kecil bisa membantu memahami sesuatu yang saat itu belum masuk akal."]
    ]
  },
  {
    emoji:"🌧️", title:"Kota yang Membeku", image:"images/adventure/0317/scene-02.png",
    text:"Kamu keluar. Di jalan, sebuah mobil berhenti di tengah persimpangan. Air hujan seperti kaca menggantung di udara. Lampu lalu lintas tidak berubah. Kamu berjalan melewati jalan yang biasanya ramai. Kemudian kamu melihat sesuatu. Di seberang jalan... seseorang sedang berjalan. Orang itu juga bisa bergerak.",
    options:[
      ["🚶","Mengikutinya.",{curiosity:2,courage:1},"Mengikuti mobil berarti kamu memilih mencari tahu dengan mendekati sumber kejadian. Kamu mungkin terdorong oleh rasa penasaran ketika menemukan sesuatu yang melanggar kebiasaan."],
      ["📢","Memanggilnya.",{courage:2,trust:1},"Memanggil pengemudi adalah cara mencoba membangun kontak langsung. Pilihan ini bisa menunjukkan bahwa kamu ingin menguji situasi melalui komunikasi, bukan hanya menebak dari kejauhan."],
      ["👁️","Bersembunyi dan mengamatinya.",{caution:2,planning:1},"Bersembunyi dan mengamati berarti kamu memilih mengumpulkan informasi tanpa segera menarik perhatian. Kamu mungkin lebih nyaman memahami pola kejadian dahulu sebelum menentukan tindakan."]
    ]
  },
  {
    emoji:"🕰️", title:"Orang yang Sama", image:"images/adventure/0317/scene-03.png",
    text:"Orang asing itu berhenti di depan sebuah toko tua. Ia menatap jam yang terpampang di dinding toko. 03:17. Lalu ia berkata tanpa menoleh, “Akhirnya kamu melihatnya juga.” Sebelum kamu sempat bertanya, ia mulai berjalan menuju sebuah gang kecil.",
    options:[
      ["🚶","Ikuti dia.",{curiosity:2,trust:1},"Mengikuti orang yang sama berarti kamu ingin menelusuri hubungan antara kejadian-kejadian aneh itu. Kamu mungkin merasa sebuah petunjuk layak diikuti ketika tampak berkaitan dengan misteri utama."],
      ["❓","Tanya siapa dirinya.",{planning:1,trust:2},"Menanyakan identitasnya menunjukkan bahwa kamu ingin memperjelas siapa yang terlibat sebelum memutuskan untuk ikut. Kamu mungkin menghargai penjelasan dan konteks saat menghadapi orang yang belum dikenal."],
      ["🏃","Pergi sebelum waktu kembali berjalan.",{caution:2,security:1},"Pergi sebelum waktu berjalan lagi berarti kamu memilih keluar dari situasi yang sulit dipahami. Kamu mungkin menilai bahwa menjaga diri lebih penting daripada memecahkan setiap misteri saat itu juga."]
    ]
  },
  {
    emoji:"🚪", title:"Gang yang Tidak Ada", image:"images/adventure/0317/scene-04.png",
    text:"Kamu memilih mengikuti. Gang itu seharusnya tidak ada. Kamu sudah sering melewati kawasan ini, tetapi tidak pernah melihat jalan sempit tersebut. Di ujung gang terdapat sebuah pintu besi. Orang asing itu mengeluarkan kunci. Sebelum membuka pintu, ia berkata, “Di balik pintu ini ada sesuatu yang kota ini lupakan.”",
    options:[
      ["🔑","Masuk bersamanya.",{courage:2,curiosity:1},"Masuk bersama orang asing berarti kamu bersedia menjelajah sambil menerima pendampingan. Pilihan ini bisa mencerminkan keterbukaan untuk bekerja sama ketika tujuan belum sepenuhnya jelas."],
      ["❓","Tanyakan apa yang ada di dalam.",{planning:2,trust:1},"Menanyakan apa yang ada di dalam menunjukkan bahwa kamu ingin mengetahui konsekuensi sebelum melangkah. Kamu mungkin lebih nyaman ketika ekspektasi dan risiko dijelaskan terlebih dahulu."],
      ["🗝️","Ambil kuncinya dan masuk sendiri.",{independence:2,courage:1},"Mengambil kunci lalu masuk sendiri menekankan inisiatif dan kendali pribadi. Kamu mungkin ingin menyelidiki dengan caramu sendiri, terutama ketika kesempatan muncul dan kamu tidak ingin sepenuhnya bergantung pada orang lain."]
    ]
  },
  {
    emoji:"🕰️", title:"Ruangan Jam", image:"images/adventure/0317/scene-05.png",
    text:"Di balik pintu terdapat ruangan besar yang dipenuhi jam. Ratusan jam. Semuanya menunjukkan waktu yang sama: 03:17. Di tengah ruangan ada sebuah meja dengan foto-foto lama. Kamu melihat foto kota yang sama, tetapi tanggalnya 30 tahun lalu. Dan di salah satu foto terdapat seseorang yang wajahnya terasa sangat familiar.",
    options:[
      ["📷","Mengambil foto tersebut.",{curiosity:2,reflection:1},"Mengambil foto menunjukkan bahwa kamu ingin menyimpan petunjuk yang bisa ditelaah kembali. Kamu mungkin tertarik menghubungkan detail dan mencari pola setelah punya bukti untuk diamati."],
      ["🗣️","Bertanya kepada orang asing.",{trust:2,planning:1},"Bertanya kepada orang asing berarti kamu mempertimbangkan pengalaman atau pengetahuan orang lain sebagai sumber informasi. Kamu mungkin memilih dialog ketika sebuah petunjuk sulit dijelaskan sendirian."],
      ["🔎","Mencari foto lain.",{curiosity:2,planning:1},"Mencari foto lain menunjukkan bahwa satu petunjuk belum cukup memuaskan rasa ingin tahumu. Kamu mungkin ingin membandingkan bukti sebelum menyimpulkan apa yang sedang terjadi."]
    ]
  },
  {
    emoji:"🖼️", title:"Foto yang Mustahil", image:"images/adventure/0317/scene-06.png",
    text:"Kamu menemukan foto lain. Kali ini lebih tua. Ada sekelompok orang berdiri di depan sebuah gedung yang sudah tidak ada. Di bagian belakang foto tertulis: “Mereka yang masih terjaga pada pukul 03:17.” Kemudian kamu menyadari sesuatu. Orang asing tadi tidak ada di dalam ruangan. Pintu di belakangmu tertutup. Dan salah satu jam mulai bergerak. 03:18.",
    options:[
      ["🚪","Mencari jalan keluar.",{caution:2,security:1},"Mencari jalan keluar berarti kamu mengutamakan cara meninggalkan situasi yang semakin membingungkan. Kamu mungkin tahu kapan harus berhenti menyelidiki dan kembali memprioritaskan keselamatan."],
      ["🔔","Mengikuti suara jam.",{curiosity:2,courage:1},"Mengikuti suara jam berarti kamu memilih mengejar petunjuk yang paling menarik perhatian. Kamu mungkin terdorong untuk melihat apa yang tersembunyi di balik kejadian yang tidak biasa."],
      ["🚪","Membuka pintu yang baru saja tertutup.",{courage:2,planning:1},"Membuka pintu yang tertutup berarti kamu ingin memeriksa kemungkinan yang baru muncul, meski situasinya belum jelas. Pilihan ini bisa mencerminkan inisiatif untuk menguji jalan lain daripada menganggapnya buntu."]
    ]
  },
  {
    emoji:"📱", title:"Satu Menit yang Hilang", image:"images/adventure/0317/scene-07.png",
    text:"Kamu keluar dari ruangan. Kota kembali bergerak. Mobil melaju. Hujan jatuh. Lampu berubah. Semua kembali normal. Tapi ada sesuatu yang berbeda. Ponselmu menunjukkan waktu 03:18. Kamu melihat rekaman yang tadi dibuat. Di dalam video, kamu melihat dirimu sendiri berdiri di jalan. Tetapi ada seseorang berdiri tepat di belakangmu.",
    options:[
      ["▶️","Memutar rekaman sampai selesai.",{curiosity:2,reflection:1},"Memutar rekaman sampai selesai menunjukkan bahwa kamu ingin memperoleh gambaran lengkap sebelum mengambil kesimpulan. Kamu mungkin merasa detail akhir bisa mengubah makna dari apa yang sudah dilihat."],
      ["🗑️","Menghapusnya.",{caution:2,security:1},"Menghapus rekaman berarti kamu memilih mengurangi keterlibatan dengan sesuatu yang terasa mengganggu atau berisiko. Kamu mungkin lebih mementingkan ketenangan dan keamanan daripada menyimpan semua jawaban."],
      ["🔍","Mencari orang tersebut.",{courage:2,curiosity:1},"Mencari orang tersebut berarti kamu memilih menindaklanjuti misteri melalui hubungan langsung dengan orang yang terlibat. Kamu mungkin lebih suka mendapatkan jawaban dari sumbernya daripada hanya menafsirkan bukti."]
    ]
  },
  {
    emoji:"📩", title:"Pesan", image:"images/adventure/0317/scene-08.png",
    text:"Rekaman berakhir dengan layar hitam. Kemudian muncul satu pesan yang tidak pernah kamu ketik: “Besok jangan tidur.” Di bawahnya terdapat alamat. Alamat apartemenmu sendiri. Kamu mulai menyadari bahwa fenomena ini bukan sekadar sesuatu yang terjadi di kota. Seseorang sedang mengawasimu.",
    options:[
      ["🚪","Pergi dari apartemen.",{courage:2,security:1},"Pergi dari apartemen berarti kamu memilih mengambil tindakan terhadap pesan yang terasa penting. Kamu mungkin terdorong untuk mencari kejelasan dengan bergerak, meskipun arah selanjutnya belum sepenuhnya pasti."],
      ["🛋️","Tetap di rumah dan menunggu 03:17.",{caution:2,reflection:1},"Tetap di rumah dan menunggu menunjukkan bahwa kamu memilih mengamati pola sebelum bereaksi. Kamu mungkin ingin melihat apakah kejadian itu berulang agar keputusanmu didasarkan pada lebih banyak informasi."],
      ["🔎","Kembali mencari orang asing itu.",{curiosity:2,independence:1},"Kembali mencari orang asing itu menunjukkan bahwa kamu menganggap hubungan dengan sumber misteri sebagai petunjuk penting. Kamu mungkin bersedia menelusuri kembali langkah sebelumnya demi memahami bagian yang belum terjawab."]
    ]
  },
  {
    emoji:"🛣️", title:"03:17 Lagi", image:"images/adventure/0317/scene-09.png",
    text:"Malam berikutnya. Kamu menunggu. 03:16. 03:17. Kota kembali berhenti. Tetapi kali ini tidak ada orang asing. Tidak ada suara. Tidak ada hujan. Hanya sebuah pesan baru di ponsel: “Sekarang giliranmu memilih.” Di depan apartemenmu terdapat tiga jalan. Satu menuju tempat kamu menemukan ruangan jam. Satu menuju stasiun tua. Dan satu lagi menuju pusat kota.",
    options:[
      ["🕰️","Kembali ke ruangan jam.",{curiosity:2,reflection:1},"Kembali ke ruangan jam menunjukkan bahwa kamu ingin meninjau ulang tempat yang mungkin menyimpan jawaban. Kamu mungkin percaya bahwa petunjuk yang terlewat bisa terlihat berbeda ketika diperiksa kembali."],
      ["🚉","Pergi ke stasiun tua.",{courage:2,independence:1},"Pergi ke stasiun tua berarti kamu memilih mencoba lokasi baru untuk membuka kemungkinan berbeda. Kamu mungkin bersedia mengubah strategi ketika jalur sebelumnya belum memberi jawaban."],
      ["🌃","Pergi ke pusat kota.",{curiosity:1,courage:1,independence:1},"Pergi ke pusat kota menunjukkan bahwa kamu memilih memperluas pencarian ke tempat yang lebih terbuka atau ramai. Kamu mungkin ingin melihat misteri dari sudut pandang yang lebih luas daripada terpaku pada satu lokasi."]
    ]
  },
  {
    emoji:"🚪", title:"Setelah 03:17", image:"images/adventure/0317/scene-10.png",
    text:"Pilihan terakhir menentukan akhir perjalanan. Tetapi apa pun jalan yang dipilih, ketika jam akhirnya menunjukkan 03:18, kota kembali bergerak. Orang-orang berjalan seperti biasa. Tidak ada yang mengetahui apa yang terjadi. Tidak ada ruangan jam. Tidak ada gang misterius. Tidak ada orang asing. Namun ketika kamu sampai di rumah... jam digital di meja tidak menunjukkan 03:18. Jam itu menunjukkan: 03:17. Dan untuk pertama kalinya... kamu mendengar seseorang mengetuk pintu. Tamat.",
    options:[
      ["🚪","Membuka pintu.",{courage:2,curiosity:1},"Membuka pintu berarti kamu memilih menghadapi sumber ketukan secara langsung. Pilihan ini bisa mencerminkan keinginan memperoleh jawaban meski masih ada ketidakpastian."],
      ["🔒","Mengunci semua pintu dan menunggu.",{caution:2,security:1},"Mengunci semua pintu dan menunggu menunjukkan bahwa kamu memilih menetapkan batas aman sebelum bertindak. Kamu mungkin ingin mengendalikan hal-hal yang masih bisa dikendalikan saat situasi terasa di luar kebiasaan."],
      ["👂","Diam dan mendengarkan ketukan itu.",{reflection:2,planning:1},"Diam dan mendengarkan berarti kamu memilih mengumpulkan petunjuk melalui perhatian, bukan tindakan langsung. Kamu mungkin merasa suara atau detail kecil bisa memberi informasi sebelum kamu memutuskan langkah berikutnya."]
    ]
  }
];

const ADVENTURE_STORIES = [
  {
    id:"forbidden-forest",
    title:"The Forbidden Forest",
    tag:"Misteri · Eksplorasi",
    description:"Hujan, rumah tua, orang asing, dan jalan keluar yang belum tentu aman. Pilih langkahmu dan lihat ke mana hutan membawamu.",
    meta:"±5 menit · 10 pilihan",
    icon:"🌲",
    cover:"images/adventure/forbidden/scene-01.png",
    status:"available",
    resultProfiles:[
      {title:"The Pathfinder",icon:"🧭",subtitle:"Kamu menemukan jalanmu sendiri di tengah ketidakpastian.",weights:{courage:2,curiosity:2,independence:2,planning:1}},
      {title:"The Guardian",icon:"🛡️",subtitle:"Kamu cenderung menjaga diri dan membaca risiko sebelum melangkah.",weights:{caution:2,security:2,planning:2}},
      {title:"The Trusting Soul",icon:"🤝",subtitle:"Kamu memberi ruang pada orang lain sambil tetap mencari rasa aman.",weights:{trust:2,empathy:2,security:1}},
      {title:"The Lone Walker",icon:"🐺",subtitle:"Kamu paling kuat ketika keputusan akhir tetap berada di tanganmu.",weights:{independence:3,courage:2,trust:-1}},
      {title:"The Forest Reader",icon:"🌲",subtitle:"Kamu cenderung mencari makna di balik tanda-tanda kecil.",weights:{reflection:2,curiosity:2,planning:1}}
    ],
    scenes:FORBIDDEN_FOREST_SCENES
  },
  {
    id:"city-0317",
    title:"Kota yang Berhenti pada Pukul 03:17",
    tag:"Misteri · Fantasi · Psikologis",
    description:"Setiap malam pukul 03:17, seluruh kota berhenti selama satu menit. Kali ini kamu bukan satu-satunya yang masih bisa bergerak.",
    meta:"±6–8 menit · 10 pilihan",
    icon:"🌌",
    cover:"images/adventure/0317/scene-01.png",
    status:"available",
    resultProfiles:[
      {title:"The Time Seeker",icon:"⏳",subtitle:"Kamu sulit berhenti ketika sebuah misteri belum menemukan jawabannya.",weights:{curiosity:3,reflection:2,courage:1}},
      {title:"The Night Observer",icon:"👁️",subtitle:"Kamu memilih mengamati pola sebelum mempercayai apa yang terlihat.",weights:{reflection:3,planning:2,caution:1}},
      {title:"The Skeptic",icon:"🔍",subtitle:"Kamu tidak mudah menerima penjelasan sebelum menemukan bukti sendiri.",weights:{planning:2,caution:2,curiosity:2,trust:-1}},
      {title:"The Time Walker",icon:"🌌",subtitle:"Kamu berani bergerak ketika dunia seolah kehilangan aturan normalnya.",weights:{courage:3,independence:2,curiosity:1}},
      {title:"The Keeper",icon:"🕰️",subtitle:"Kamu cenderung memaknai kejadian aneh sebagai sesuatu yang perlu direnungkan.",weights:{reflection:3,security:1,empathy:1}}
    ],
    scenes:CITY_0317_SCENES
  },
  {
    id:"empty-house",
    title:"Rumah yang Kosong",
    tag:"Misteri · Psikologis",
    description:"Sebuah rumah yang seharusnya kosong ternyata menyimpan sesuatu yang belum selesai.",
    meta:"Segera hadir",
    icon:"🏚️",
    cover:"images/adventure/story-02-cover.png",
    status:"coming"
  },
  {
    id:"last-train",
    title:"Kereta Terakhir",
    tag:"Misteri · Perjalanan",
    description:"Kamu tiba di stasiun ketika kereta terakhir malam itu hampir berangkat.",
    meta:"Segera hadir",
    icon:"🚆",
    cover:"images/adventure/story-03-cover.png",
    status:"coming"
  },
  {
    id:"mystery-island",
    title:"Pulau Misterius",
    tag:"Petualangan · Eksplorasi",
    description:"Sebuah pulau yang tidak ada di peta menjadi awal dari perjalanan yang tidak biasa.",
    meta:"Segera hadir",
    icon:"🏝️",
    cover:"images/adventure/story-04-cover.png",
    status:"coming"
  }
];

let activeAdventureStory=ADVENTURE_STORIES[0];
let adventureIndex=0;
let adventureScores={courage:0,caution:0,curiosity:0,planning:0,independence:0,trust:0,empathy:0,security:0,reflection:0};
let adventureChoices=[];

function showScreen(id){
  ["home","test","insight","result","adventureMenu","adventure","adventureResult"].forEach(x=>{
    const el=$(x); if(el) el.classList.toggle("active",x===id);
  });
  scrollTo({top:0,behavior:"smooth"});
}
function goHome(){showScreen("home")}
function openAdventureMenu(){renderAdventureMenu();showScreen("adventureMenu")}
function goAdventureMenu(){renderAdventureMenu();showScreen("adventureMenu")}

function renderAdventureMenu(){
  const list=$("storyList");
  if(!list)return;
  list.innerHTML=ADVENTURE_STORIES.map(story=>{
    const available=story.status==="available";
    return `<article class="story-card ${available?"":"coming"}">
      <div class="story-art ${story.cover?"has-cover":""}">${story.cover?`<img src="${esc(story.cover)}" alt="">`:story.icon}</div>
      <div>
        <span class="story-tag">${esc(story.tag)}</span>
        <h2>${esc(story.title)}</h2>
        <p>${esc(story.description)}</p>
        <div class="story-meta"><span>${esc(story.meta)}</span></div>
      </div>
      ${available?`<button class="btn primary" onclick="startAdventure('${story.id}')">Mulai cerita →</button>`:`<span class="coming-label">COMING SOON</span>`}
    </article>`;
  }).join("");
}

function startAdventure(storyId="forbidden-forest"){
  const story=ADVENTURE_STORIES.find(s=>s.id===storyId && s.status==="available");
  if(!story)return;
  activeAdventureStory=story;
  adventureIndex=0;
  adventureScores={courage:0,caution:0,curiosity:0,planning:0,independence:0,trust:0,empathy:0,security:0,reflection:0};
  adventureChoices=[];
  showScreen("adventure");
  renderAdventure();
}

function renderAdventure(){
  const s=activeAdventureStory.scenes[adventureIndex];
  $("adventureOptions").hidden=false;
  $("choiceInsight").hidden=true;
  const visual=$("sceneVisual");
  if(visual){
    visual.classList.remove("scene-changing");
    void visual.offsetWidth;
    visual.classList.add("scene-changing");
  }
  $("adventureCounter").textContent=`Adegan ${adventureIndex+1} dari ${activeAdventureStory.scenes.length}`;
  $("adventureStoryTitle").textContent=activeAdventureStory.title;
  $("adventureStoryTag").textContent=activeAdventureStory.tag;
  $("adventureProgress").style.width=((adventureIndex+1)/activeAdventureStory.scenes.length*100)+"%";
  $("sceneBadge").textContent=`${String(adventureIndex+1).padStart(2,"0")} / ${String(activeAdventureStory.scenes.length).padStart(2,"0")}`;
  const sceneImage=$("sceneImage");
  const sceneEmoji=$("sceneEmoji");
  sceneImage.src="";
  sceneImage.classList.remove("is-loading");
  sceneImage.classList.add("is-loading");
  sceneImage.src=s.image || "";
  sceneImage.alt=s.title || "Ilustrasi cerita";
  sceneImage.onerror=()=>{
    sceneImage.classList.remove("is-loading");
    sceneImage.style.display="none";
    sceneEmoji.style.display="grid";
  };
  sceneImage.onload=()=>{
    sceneImage.classList.remove("is-loading");
    sceneImage.style.display="block";
    sceneEmoji.style.display="none";
  };
  sceneEmoji.textContent=s.emoji || "🌲";
  sceneTitle.textContent=s.title;
  sceneText.textContent=s.text;
  $("adventureOptions").innerHTML=s.options.map((o,i)=>
    `<button class="option" onclick="chooseAdventure(${i})"><span class="letter">${o[0]}</span><span>${esc(o[1])}</span></button>`
  ).join("");
}

const ADVENTURE_TRAIT_EXPLANATIONS = {
  courage: {
    title:"Keberanian menghadapi ketidakpastian",
    text:"Kamu mungkin bersedia mengambil langkah meski situasinya belum sepenuhnya jelas. Ini bisa mencerminkan keberanian mencoba, terutama ketika ada sesuatu yang ingin kamu ketahui atau capai."
  },
  caution: {
    title:"Kehati-hatian",
    text:"Kamu mungkin ingin mengurangi risiko sebelum melangkah. Mengamati keadaan atau mencari pilihan yang lebih aman bisa menjadi cara bagimu untuk menjaga diri dan membuat keputusan yang terasa masuk akal."
  },
  curiosity: {
    title:"Rasa ingin tahu",
    text:"Kamu mungkin tertarik mencari tahu apa yang belum diketahui. Hal yang misterius atau tidak biasa bisa terasa seperti undangan untuk menyelidiki, bukan sesuatu yang langsung diabaikan."
  },
  planning: {
    title:"Mencari arah dan pola",
    text:"Kamu mungkin menyukai petunjuk yang membantumu menentukan langkah berikutnya. Mengumpulkan informasi, membaca tanda, atau membuat rencana bisa membuat situasi yang tidak pasti terasa lebih terarah."
  },
  independence: {
    title:"Kemandirian dalam memilih",
    text:"Kamu mungkin ingin tetap memegang kendali atas keputusanmu sendiri. Saat situasi membingungkan, menentukan jalan sendiri bisa terasa lebih sesuai daripada sepenuhnya mengikuti orang lain."
  },
  trust: {
    title:"Memberi ruang bagi kepercayaan",
    text:"Kamu mungkin bersedia mempertimbangkan bantuan atau niat orang lain, meski tetap perlu melihat konteksnya. Pilihan ini bisa menunjukkan bahwa hubungan dan kepercayaan ikut menjadi bagian dari pertimbanganmu."
  },
  empathy: {
    title:"Kepekaan terhadap orang lain",
    text:"Kamu mungkin memperhatikan kemungkinan bahwa orang lain membutuhkan bantuan atau pemahaman. Kamu bisa mempertimbangkan sisi manusiawi dari sebuah situasi, bukan hanya cara tercepat untuk menyelesaikannya."
  },
  security: {
    title:"Kebutuhan akan rasa aman",
    text:"Kamu mungkin lebih nyaman ketika ada pijakan yang terasa aman sebelum melanjutkan. Menjaga keselamatan atau kestabilan bisa menjadi pertimbangan penting, terutama saat keadaan sulit diprediksi."
  },
  reflection: {
    title:"Refleksi dan pemaknaan",
    text:"Kamu mungkin ingin berhenti sejenak untuk memahami pengalaman, bukan hanya segera melewatinya. Mengingat detail dan memikirkan maknanya bisa membantumu menyusun pemahaman pribadi."
  }
};

function explainAdventureChoice(scene, choice){
  // Prefer a unique, scene-specific reflection stored directly with each option.
  // The generic trait-based explanation remains as a fallback for future stories.
  if(typeof choice[3] === "string" && choice[3].trim()){
    return {title:"Apa yang mungkin tercermin dari pilihanmu?", text:choice[3]};
  }
  const traits=Object.entries(choice[2])
    .filter(([key])=>ADVENTURE_TRAIT_EXPLANATIONS[key])
    .sort((a,b)=>b[1]-a[1]);
  const primary=traits[0] ? ADVENTURE_TRAIT_EXPLANATIONS[traits[0][0]] : null;
  const secondary=traits.slice(1,3).map(([key])=>ADVENTURE_TRAIT_EXPLANATIONS[key]);
  let text=primary ? primary.text : "Pilihan ini menunjukkan cara yang kamu ambil untuk menghadapi situasi dalam cerita.";
  if(secondary.length){
    text += " " + secondary.map(x=>x.text).join(" ");
  }
  text += " Ini hanya interpretasi ringan dari pilihanmu dalam adegan ini, bukan kesimpulan pasti tentang kepribadianmu.";
  return {title:primary ? primary.title : "Cara kamu menghadapi situasi", text};
}

function chooseAdventure(i){
  const scene=activeAdventureStory.scenes[adventureIndex];
  const choice=scene.options[i];
  if(!choice || $("choiceInsight").hidden===false) return;

  Object.entries(choice[2]).forEach(([k,v])=>adventureScores[k]+=v);
  adventureChoices.push({
    sceneTitle:scene.title,
    choiceText:choice[1],
    scores:{...choice[2]},
    reflection:choice[3] || ""
  });

  const insight=explainAdventureChoice(scene,choice);
  $("choiceInsightTitle").textContent=`${choice[0]} ${choice[1]}`;
  $("choiceInsightText").textContent=insight.text;
  $("choiceContinueButton").textContent=adventureIndex===activeAdventureStory.scenes.length-1
    ? "Lihat hasil perjalanan →"
    : "Lanjutkan cerita →";
  $("adventureOptions").hidden=true;
  $("choiceInsight").hidden=false;
  $("choiceInsight").scrollIntoView({behavior:"smooth",block:"nearest"});
}

function continueAdventure(){
  if(adventureIndex===activeAdventureStory.scenes.length-1){
    finishAdventure();
    return;
  }
  adventureIndex++;
  renderAdventure();
}

function adventureProfile(){
  const storyId=activeAdventureStory.id;
  const s=adventureScores;
  const profiles=activeAdventureStory.resultProfiles || [];
  const weights={
    "forbidden-forest":[
      {courage:5,caution:0,curiosity:-1,planning:4,independence:3,trust:0,empathy:1,security:1,reflection:-1},
      {courage:-1,caution:0,curiosity:5,planning:-2,independence:5,trust:3,empathy:4,security:4,reflection:4},
      {courage:-1,caution:5,curiosity:4,planning:-1,independence:4,trust:-2,empathy:0,security:-1,reflection:2},
      {courage:3,caution:1,curiosity:2,planning:5,independence:-2,trust:3,empathy:5,security:1,reflection:-2},
      {courage:4,caution:3,curiosity:4,planning:-2,independence:-2,trust:2,empathy:5,security:-1,reflection:2}
    ],
    "city-0317":[
      {courage:5,caution:-1,curiosity:1,planning:-1,independence:-2,trust:5,empathy:0,security:4,reflection:0},
      {courage:4,caution:1,curiosity:4,planning:-2,independence:-2,trust:3,empathy:-1,security:0,reflection:-2},
      {courage:2,caution:4,curiosity:2,planning:5,independence:3,trust:0,empathy:1,security:1,reflection:0},
      {courage:2,caution:5,curiosity:2,planning:4,independence:-1,trust:1,empathy:5,security:-2,reflection:5},
      {courage:5,caution:4,curiosity:-2,planning:2,independence:2,trust:-1,empathy:-2,security:4,reflection:2}
    ]
  };
  const matrix=weights[storyId];
  if(!profiles.length) return {title:"The Observer",icon:"🦉",subtitle:"Kamu membaca situasi dari beberapa sisi sebelum menentukan arah."};
  if(!matrix) return profiles[0];

  const scored=profiles.map((p,index)=>{
    const w=matrix[index]||{};
    const score=Object.keys(w).reduce((sum,k)=>sum+(s[k]||0)*w[k],0);
    return {p,index,score};
  }).sort((a,b)=>b.score-a.score || a.index-b.index);

  return scored[0].p;
}

function adventureTraitLabels(){
  return {
    courage:"keberanian mencoba saat situasi belum pasti",
    caution:"kehati-hatian sebelum mengambil risiko",
    curiosity:"rasa ingin tahu dan dorongan mencari jawaban",
    planning:"kebutuhan memahami arah dan menimbang langkah",
    independence:"keinginan menentukan jalan sendiri",
    trust:"keterbukaan memberi kesempatan kepada orang lain",
    empathy:"perhatian pada kondisi dan kebutuhan orang lain",
    security:"prioritas pada keselamatan dan rasa aman",
    reflection:"kecenderungan memaknai pengalaman"
  };
}

function getAdventureAnalysis(){
  const labels=adventureTraitLabels();
  const totals=Object.entries(adventureScores).sort((a,b)=>b[1]-a[1]);
  const topScore=totals[0]?.[1] || 0;
  const top=totals.filter(([key,value])=>value===topScore).map(([key])=>key);
  const near=totals.filter(([key,value])=>value<topScore && value>=topScore-1).map(([key])=>key);
  const topText=top.map(k=>labels[k]).join(" dan ");
  const nextText=near.length ? near.map(k=>labels[k]).join(" dan ") : "";

  // Count how many separate choices positively contributed to each trait.
  // Requiring repeated evidence prevents a single answer from defining a whole pattern.
  const supportCounts={};
  Object.keys(labels).forEach(k=>{
    supportCounts[k]=adventureChoices.filter(c=>c.scores && (c.scores[k]||0)>0).length;
  });
  const strongest=[...new Set([...top,...near])];
  const eligible=totals
    .filter(([key,value])=>value>=topScore-2 && supportCounts[key]>=2)
    .map(([key])=>key);
  const comboCopy={
    "caution|courage":["Berani tetapi tetap waspada","Kamu dapat tertarik mencoba hal yang belum pasti, tetapi juga mempertimbangkan risiko sebelum melangkah. Dalam cerita ini, kedua kecenderungan muncul berdampingan—bukan berarti kamu selalu seimbang dalam semua situasi."],
    "curiosity|reflection":["Penasaran dan reflektif","Kamu bukan hanya ingin mengetahui apa yang terjadi; kamu juga memberi ruang untuk memikirkan makna petunjuk yang ditemukan. Pencarian jawaban diikuti proses memahami."],
    "independence|planning":["Mandiri dengan pertimbangan","Kamu ingin menentukan jalan sendiri, tetapi juga berusaha memahami arah dan konsekuensi pilihan. Kemandirian tidak harus berarti bertindak spontan."],
    "caution|empathy":["Peduli sekaligus waspada","Kamu bisa mempertimbangkan kebutuhan orang lain sambil tetap memeriksa apakah situasinya aman. Dalam cerita, kepedulian dan perlindungan diri tidak harus bertentangan."],
    "caution|trust":["Terbuka, tetapi tidak langsung menerima","Kamu mungkin bersedia memberi kesempatan kepada orang lain, sambil tetap ingin melihat tanda atau penjelasan yang masuk akal."],
    "curiosity|planning":["Mencari tahu dengan arah","Rasa ingin tahu mendorongmu menyelidiki, sementara perencanaan membantumu memilih petunjuk yang layak diikuti."],
    "courage|independence":["Berani mengambil jalan sendiri","Kamu mungkin bersedia bergerak dalam keadaan yang belum jelas dan merasa lebih nyaman menentukan keputusan sendiri. Pola ini tetap perlu disesuaikan dengan risiko nyata."],
    "planning|security":["Mengutamakan keamanan dan persiapan","Kamu mungkin mencari cara mengurangi ketidakpastian sebelum bertindak. Memeriksa kondisi dan menyusun langkah dapat menjadi cara menjaga rasa aman."],
    "empathy|trust":["Membangun hubungan dengan kepedulian","Kamu mungkin memberi ruang bagi orang lain dan mempertimbangkan bagaimana keputusan memengaruhi mereka."],
    "planning|reflection":["Merenung lalu menyusun langkah","Kamu mungkin menggunakan pengalaman dan detail yang diamati untuk memahami situasi, lalu memikirkan apa yang sebaiknya dilakukan."],
    "curiosity|independence":["Penasaran dan suka menjelajah sendiri","Kamu mungkin terdorong mencari jawaban sekaligus ingin mencoba jalur yang kamu tentukan sendiri."],
    "caution|security":["Menjaga batas aman","Kamu mungkin cenderung mengurangi risiko dan mencari pijakan yang terasa aman sebelum melanjutkan."]
  };
  const candidates=[];
  for(let i=0;i<eligible.length;i++){
    for(let j=i+1;j<eligible.length;j++){
      const pair=[eligible[i],eligible[j]].sort();
      const key=pair.join("|");
      if(comboCopy[key]){
        const scoreGap=Math.abs((adventureScores[pair[0]]||0)-(adventureScores[pair[1]]||0));
        const support=Math.min(supportCounts[pair[0]],supportCounts[pair[1]]);
        candidates.push({key,title:comboCopy[key][0],text:comboCopy[key][1],score:scoreGap,support});
      }
    }
  }
  candidates.sort((a,b)=>a.score-b.score || b.support-a.support);
  const combinations=candidates.slice(0,2).map(c=>{
    const traits=c.key.split("|");
    const examples=traits.flatMap(trait=>{
      const choice=adventureChoices.find(item=>item.scores && (item.scores[trait]||0)>0);
      return choice ? [`${labels[trait]}: “${choice.choiceText}” (${choice.sceneTitle})`] : [];
    });
    return {...c,examples};
  });

  let summary=`Sepanjang cerita ini, pilihanmu paling banyak mengarah pada ${topText}. `;
  if(near.length) summary+=`Kecenderungan yang juga cukup dekat adalah ${nextText}. `;
  summary+="Ini bukan berarti kamu selalu bertindak seperti ini di semua situasi; pola ini hanya menggambarkan keputusan yang kamu ambil dalam cerita ini.";

  const profileLink={
    "The Pathfinder":"Hasil ceritamu selaras dengan kecenderungan mencari jalan dan menentukan arah sendiri.",
    "The Guardian":"Hasil ceritamu selaras dengan kecenderungan memeriksa risiko dan menjaga pijakan tetap aman.",
    "The Trusting Soul":"Hasil ceritamu selaras dengan cara mempertimbangkan kepercayaan dan sisi manusiawi situasi.",
    "The Lone Walker":"Hasil ceritamu selaras dengan kemandirian dalam menentukan keputusan.",
    "The Forest Reader":"Hasil ceritamu selaras dengan kecenderungan memperhatikan detail dan mencari makna.",
    "The Time Seeker":"Hasil ceritamu selaras dengan dorongan menelusuri misteri sampai mendapat petunjuk.",
    "The Night Observer":"Hasil ceritamu selaras dengan kebiasaan mengamati sebelum bereaksi.",
    "The Skeptic":"Hasil ceritamu selaras dengan keinginan memeriksa penjelasan dan bukti.",
    "The Time Walker":"Hasil ceritamu selaras dengan keberanian bergerak saat aturan belum jelas.",
    "The Keeper":"Hasil ceritamu selaras dengan kecenderungan menyimpan dan memaknai pengalaman."
  };
  const profileNote=profileLink[adventureProfile().title] || "";
  if(profileNote) summary+=" "+profileNote;

  const evidence=adventureChoices
    .filter(c=>c.scores && Object.keys(c.scores).some(k=>top.includes(k)))
    .slice(0,3);
  const evidenceText=evidence.length
    ? "Beberapa pilihan yang ikut membentuk pola utama ini: "+evidence.map(c=>`“${c.choiceText}” pada adegan “${c.sceneTitle}”`).join("; ")+"."
    : "Setiap pilihanmu ikut menyumbang pada pola akhir perjalanan.";
  return {
    summary,evidenceText,topTraits:top.map(k=>labels[k]),
    scores:totals,supportCounts,combinations,
    combinationText:combinations.map(c=>`${c.title}: ${c.text}${c.examples.length ? " Contoh pilihan yang mendukung: "+c.examples.join("; ")+ "." : ""}`).join("\n\n")
  };
}

function finishAdventure(){
  const p=adventureProfile();
  const s=adventureScores;
  const analysis=getAdventureAnalysis();
  const a=analysis.topTraits.join(", ");
  const storyBodies={
    "forbidden-forest":{
      "The Pathfinder":"Hutan ini menguji caramu bergerak ketika petunjuk tidak lengkap. Pilihanmu menunjukkan bahwa kamu cukup siap mengambil arah sendiri, terutama ketika rasa ingin tahu bertemu kesempatan untuk mencoba sesuatu yang baru. Kamu tidak sekadar mencari jalan keluar; kamu ingin memahami apa yang sebenarnya tersembunyi di balik perjalanan itu. Kekuatanmu ada pada keberanian menjelajah tanpa kehilangan kendali atas keputusanmu.",
      "The Guardian":"Di hutan ini, keselamatan tidak pernah benar-benar pasti. Pilihanmu menunjukkan bahwa kamu lebih suka membaca risiko, mencari tanda, dan memastikan pijakan sebelum melangkah lebih jauh. Bagi kamu, berhati-hati bukan berarti takut—itu adalah cara untuk menjaga agar keputusan tetap masuk akal. Kekuatanmu adalah kemampuan bertahan tanpa harus terburu-buru.",
      "The Trusting Soul":"Perjalanan ini memperlihatkan bahwa kamu cukup memperhatikan manusia di balik setiap kejadian. Ketika bertemu orang asing dan situasi yang meragukan, kamu memberi ruang bagi kepercayaan sekaligus mempertimbangkan rasa aman. Kamu cenderung melihat keputusan sebagai sesuatu yang juga berdampak pada hubungan. Kekuatanmu adalah kemampuan menjaga sisi manusiawi ketika keadaan terasa asing.",
      "The Lone Walker":"Hutan ini memperlihatkan sisi mandirimu. Ketika arah menjadi tidak jelas, kamu cenderung ingin menentukan keputusan dengan caramu sendiri daripada menyerahkan kendali kepada orang lain. Kamu bisa maju ketika situasi menuntut keberanian, tetapi tetap memiliki batas tentang risiko yang mau kamu ambil. Kekuatanmu adalah keteguhan untuk bertanggung jawab atas pilihan sendiri.",
      "The Forest Reader":"Kamu tidak hanya melewati hutan; kamu memperhatikan tanda-tandanya. Pilihanmu menunjukkan kecenderungan untuk menghubungkan benda, suara, jejak, dan kejadian menjadi sebuah gambaran yang lebih besar. Kamu mungkin tidak selalu menjadi orang pertama yang bergerak, tetapi ketika bergerak, ada alasan di baliknya. Kekuatanmu adalah kemampuan menemukan makna dari detail kecil."
    },
    "city-0317":{
      "The Time Seeker":"Kota 03:17 membuatmu berhadapan dengan satu pertanyaan: apa yang akan kamu lakukan jika jawaban belum selesai ditemukan? Pilihanmu menunjukkan bahwa rasa ingin tahu cukup kuat untuk membuatmu terus mengikuti jejak, bahkan ketika jawabannya terasa semakin aneh. Kamu lebih sulit meninggalkan sebuah misteri daripada membiarkannya menggantung. Kekuatanmu adalah dorongan untuk mencari tahu sampai pola mulai terbentuk.",
      "The Night Observer":"Di kota yang membeku, kamu memilih melihat sebelum bereaksi. Kamu memperhatikan pola, perubahan kecil, dan kemungkinan yang tersembunyi di balik kejadian yang tampak mustahil. Kamu tidak mudah terbawa suasana hanya karena sesuatu terlihat menyeramkan. Kekuatanmu adalah ketenangan untuk mengamati ketika orang lain mungkin langsung bereaksi.",
      "The Skeptic":"Cerita 03:17 menguji kepercayaanmu terhadap apa yang kamu lihat. Pilihanmu menunjukkan bahwa kamu cenderung membutuhkan alasan dan bukti sebelum menerima sebuah penjelasan. Bahkan ketika sesuatu terasa menarik, kamu masih ingin tahu apakah ada kemungkinan lain. Kekuatanmu adalah kemampuan menjaga jarak kritis dari sebuah misteri tanpa kehilangan rasa ingin tahu.",
      "The Time Walker":"Ketika kota berhenti, kamu justru bergerak. Pilihanmu menunjukkan keberanian menghadapi situasi yang tidak memiliki aturan jelas dan kemauan untuk menentukan arah sendiri. Kamu tidak selalu membutuhkan kepastian untuk mulai bertindak. Kekuatanmu adalah kemampuan tetap berjalan ketika dunia di sekitarmu terasa tidak masuk akal.",
      "The Keeper":"Bagi kamu, 03:17 bukan hanya misteri untuk dipecahkan, tetapi pengalaman yang memiliki makna. Pilihanmu menunjukkan kecenderungan berhenti, mengingat detail, dan bertanya apa arti semua kejadian itu bagi dirimu. Kamu tidak terburu-buru menghapus hal aneh sebagai kebetulan. Kekuatanmu adalah kemampuan membawa pengalaman yang membingungkan menjadi bahan refleksi."
    }
  };
  const body=(storyBodies[activeAdventureStory.id]||{})[p.title] || `Perjalananmu melalui ${activeAdventureStory.title} menunjukkan pola ${a}. Pilihanmu membentuk cara yang khas dalam menghadapi dunia cerita ini, dan hasil akhirnya lebih menggambarkan gaya mengambil keputusan daripada benar atau salah.`;
  $("adventureResultIcon").textContent=p.icon;
  $("adventureResultTitle").textContent=p.title;
  $("adventureResultSubtitle").textContent=`${activeAdventureStory.title} · ${p.subtitle}`;
  $("adventureSummary").textContent=body + " " + analysis.summary;
  $("journeyChoices").textContent=analysis.evidenceText;
  const patternEl=$("journeyPattern");
  if(patternEl) patternEl.textContent=analysis.summary;
  const traitEl=$("journeyTraitList");
  if(traitEl) traitEl.innerHTML=analysis.topTraits.map(t=>`<span class="trait-chip">${esc(t)}</span>`).join("");
  const evidenceEl=$("journeyEvidence");
  if(evidenceEl) evidenceEl.textContent=analysis.evidenceText;
  const comboEl=$("journeyCombinations");
  if(comboEl){
    comboEl.innerHTML=analysis.combinations.length
      ? analysis.combinations.map(c=>`<article class="combo-card"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p>${c.examples.length?`<p class="combo-evidence"><strong>Contoh pilihan:</strong> ${esc(c.examples.join("; "))}</p>`:""}</article>`).join("")
      : '<p class="muted">Belum ada kombinasi kecenderungan yang cukup kuat untuk dijelaskan dari pola pilihan ini. Cobalah cerita lain untuk melihat pola berbeda.</p>';
  }
  showScreen("adventureResult");
}

// Keep original V3 navigation working after Adventure is added.
