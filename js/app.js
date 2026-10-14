const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let sessions=[];
try{sessions=JSON.parse(localStorage.getItem('tp_sessions')||'[]')}catch(e){}
if(!sessions.length)sessions=[{title:'Sesi 1',m:10,s:0,note:''}];
const save=()=>{try{localStorage.setItem('tp_sessions',JSON.stringify(sessions))}catch(e){}};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v|0));

/* ---------- SETUP ---------- */
function stepper(k,v,unit){return `<div class="st"><button data-st="${k}:-${k=='m'?1:15}">−</button><input data-n="${k}" inputmode="numeric" pattern="[0-9]*" value="${v}"><button data-st="${k}:${k=='m'?1:15}">+</button><span>${unit}</span></div>`}
function renderSetup(){
  $('list').innerHTML=sessions.map((s,i)=>`<div class="card" data-i="${i}">
   <div class="num">${i+1}</div>
   <div>
    <div class="f"><label>Nama sesi</label><input data-k="title" value="${esc(s.title)}" placeholder="Contoh: Sambutan Ketua"></div>
    <div class="f"><label>Durasi</label><div class="dur">${stepper('m',s.m,'menit')}${stepper('s',s.s,'detik')}</div>
     <div class="chips">${[1,3,5,10,15,20,30,45,60].map(v=>`<button data-chip="${v}">${v} mnt</button>`).join('')}</div></div>
    <div class="f"><label>Keterangan (muncul di layar panggung)</label><input data-k="note" value="${esc(s.note)}" placeholder="Contoh: Mohon wrap up"></div>
    <div class="act"><button data-a="up">↑ Naik</button><button data-a="down">↓ Turun</button><button data-a="del" class="del">Hapus</button></div>
   </div></div>`).join('');
}
$('list').addEventListener('input',e=>{
  const c=e.target.closest('.card');if(!c)return;const s=sessions[c.dataset.i];
  if(e.target.dataset.k)s[e.target.dataset.k]=e.target.value;
  if(e.target.dataset.n){const k=e.target.dataset.n;s[k]=clamp(e.target.value.replace(/\D/g,''),0,k=='m'?999:59)}
  save();
});
$('list').addEventListener('change',e=>{if(e.target.dataset.n){const c=e.target.closest('.card');e.target.value=sessions[c.dataset.i][e.target.dataset.n]}});
$('list').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  const c=b.closest('.card'),i=+c.dataset.i,s=sessions[i];
  if(b.dataset.st){const[k,d]=b.dataset.st.split(':');s[k]=clamp(s[k]+ +d,0,k=='m'?999:59)}
  else if(b.dataset.chip){s.m=+b.dataset.chip;s.s=0}
  else if(b.dataset.a=='up'&&i>0)[sessions[i-1],sessions[i]]=[sessions[i],sessions[i-1]];
  else if(b.dataset.a=='down'&&i<sessions.length-1)[sessions[i+1],sessions[i]]=[sessions[i],sessions[i+1]];
  else if(b.dataset.a=='del'){if(sessions.length==1)return;if(!confirm('Hapus sesi "'+(s.title||i+1)+'"?'))return;sessions.splice(i,1)}
  save();renderSetup();
});
$('add').onclick=()=>{sessions.push({title:'Sesi '+(sessions.length+1),m:10,s:0,note:''});save();renderSetup();setTimeout(()=>$('setup').scrollTo({top:1e5,behavior:'smooth'}),50)};

/* ---------- RUN ---------- */
let idx=0,total=0,remain=0,running=false,endAt=0,lock=null;
const cur=()=>sessions[idx];
function load(i){idx=i;total=(cur().m*60+cur().s)*1000;remain=total;running=false;draw()}
function now(){return Date.now()}
function sync(){if(running)remain=endAt-now()}
function fmt(ms){
  const over=ms<0;let t=over?Math.floor(-ms/1000):Math.ceil(ms/1000);
  const h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60,p=n=>String(n).padStart(2,'0');
  return (over?'+':'')+(h?h+':'+p(m):p(m))+':'+p(s);
}
function draw(){
  sync();
  const c=cur(),warn=Math.max(30000,Math.min(300000,total*.25)),dang=Math.max(10000,Math.min(60000,total*.1));
  $('pos').textContent='Sesi '+(idx+1)+' dari '+sessions.length;
  $('title').textContent=c.title||'Sesi '+(idx+1);
  $('note').textContent=c.note;
  $('time').textContent=fmt(remain);
  $('pb').style.width=(total>0?Math.max(0,Math.min(100,remain/total*100)):0)+'%';
  $('run').className=remain<0?'over':remain<=dang?'danger':remain<=warn?'warn':'';
  $('toggle').textContent=running?'Jeda':(remain<total?'Lanjut':'Mulai');
  const n=sessions[idx+1];$('next').textContent=n?'Berikutnya: '+(n.title||'Sesi '+(idx+2))+' ('+(n.m?n.m+' mnt':'')+(n.s?' '+n.s+' dtk':'')+')':'Sesi terakhir';
  $('clock').textContent=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}).replace('.',':');
}
async function wake(){try{if('wakeLock' in navigator&&!lock){lock=await navigator.wakeLock.request('screen');lock.addEventListener('release',()=>lock=null)}}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(!$('run').classList.contains('hidden')){wake();draw()}});
setInterval(()=>{if(!$('run').classList.contains('hidden'))draw()},100);

$('start').onclick=()=>{$('setup').classList.add('hidden');$('run').classList.remove('hidden');load(0);wake()};
$('edit').onclick=()=>{if(running&&!confirm('Timer sedang berjalan. Kembali ke pengaturan?'))return;running=false;$('run').classList.add('hidden');$('setup').classList.remove('hidden');$('run').className='hidden'};
$('toggle').onclick=()=>{sync();if(running){running=false}else{endAt=now()+remain;running=true;wake()}draw()};
const adj=d=>{sync();remain+=d;if(running)endAt=now()+remain;if(remain>total)total=remain;draw()};
$('p1').onclick=()=>adj(60000);
$('m1').onclick=()=>adj(-60000);
$('rst').onclick=()=>{if(running&&!confirm('Ulang sesi dari awal?'))return;load(idx)};
$('nxt').onclick=()=>{if(idx<sessions.length-1){if(running&&remain>0&&!confirm('Sesi belum selesai. Lanjut ke sesi berikutnya?'))return;load(idx+1)}};
$('prev').onclick=()=>{if(idx>0)load(idx-1)};
$('hide').onclick=()=>{$('ctl').classList.add('hidden');$('next').classList.add('hidden');$('show').classList.remove('hidden')};
$('show').onclick=()=>{$('ctl').classList.remove('hidden');$('next').classList.remove('hidden');$('show').classList.add('hidden')};
renderSetup();

/* ---------- OFFLINE (service worker) ---------- */
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
