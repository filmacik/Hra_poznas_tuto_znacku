// Only symbol-based marks are used: no full brand name is visible in a question.
// The third value is the official brand colour used by Simple Icons.
const brands = [
  ['Audi','audi','BB0A30'], ['Mercedes-Benz','mercedes','242424'], ['Toyota','toyota','EB0A1E'], ['Hyundai','hyundai','002C5F'], ['Lexus','lexus','000000'],
  ['Tesla','tesla','CC0000'], ['Volkswagen','volkswagen','151F6D'], ['Honda','honda','E40521'], ['Ferrari','ferrari','D40000'], ['Lamborghini','lamborghini','DDB320'],
  ['Apple','apple','555555'], ['Nike','nike','111111'], ['Puma','puma','000000'], ['Under Armour','underarmour','1D1D1D'], ['New Balance','newbalance','CF0A2C'],
  ['Pepsi','pepsi','2151A1'], ['Red Bull','redbull','D31A2B'], ['Starbucks','starbucks','006241'], ['McDonald\'s','mcdonalds','FFBC0D'], ['Pringles','pringles','EF151E'],
  ['Spotify','spotify','1ED760'], ['Netflix','netflix','E50914'], ['YouTube','youtube','FF0000'], ['TikTok','tiktok','000000'], ['Instagram','instagram','E4405F'],
  ['Facebook','facebook','1877F2'], ['WhatsApp','whatsapp','25D366'], ['Snapchat','snapchat','FFFC00'], ['Discord','discord','5865F2'], ['Telegram','telegram','26A5E4'],
  ['Pinterest','pinterest','BD081C'], ['PlayStation','playstation','003791'], ['Xbox','xbox','107C10'], ['Microsoft','microsoft','5E5E5E'], ['Shell','shell','FBCE07'],
  ['Mastercard','mastercard','EB001B'], ['PayPal','paypal','00457C'], ['Airbnb','airbnb','FF5A5F'], ['Nvidia','nvidia','76B900'], ['Dropbox','dropbox','0061FF'],
  ['Slack','slack','4A154B'], ['GitHub','github','181717'], ['GitLab','gitlab','FC6D26'], ['Google Chrome','googlechrome','4285F4'], ['Firefox','firefox','FF7139'],
  ['Opera','opera','FF1B2D'], ['Brave','brave','FB542B'], ['Android','android','3DDC84'], ['Linux','linux','FCC624'], ['Ubuntu','ubuntu','E95420']
];
const aliases = { 'mercedes-benz':['mercedes','mercedes benz'], 'mcdonald\'s':['mcdonalds','mc donalds'], 'red bull':['redbull'], 'under armour':['underarmour'], 'new balance':['newbalance'], 'google chrome':['chrome','googlechrome'] };
const $ = id => document.getElementById(id);
const screens = ['startScreen','gameScreen','resultScreen','scoresScreen'];
let questions=[], index=0, score=0, player='', timer=null, deadline=0, locked=false, previousScreen='startScreen', logoRequest=0;
function show(id){ screens.forEach(s => $(s).classList.toggle('active',s===id)); }
function shuffle(a){ return [...a].sort(()=>Math.random()-.5); }
function startGame(name){ player=name.trim(); questions=shuffle(brands).slice(0,50);index=0;score=0;show('gameScreen');nextQuestion(); }
async function loadLogo(slug,color){
  const requestId=++logoRequest, img=$('logoImage'), holder=$('fallbackLogo');
  img.hidden=true; img.removeAttribute('src'); holder.hidden=false; holder.classList.remove('has-logo'); holder.textContent='…';
  try {
    const response=await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/${slug}.svg`);
    if(!response.ok) throw new Error('Logo sa nenašlo');
    const svgText=await response.text();
    if(requestId!==logoRequest) return;
    holder.innerHTML=svgText;
    const svg=holder.querySelector('svg');
    if(!svg) throw new Error('Neplatné logo');
    svg.setAttribute('aria-hidden','true');
    svg.style.fill=`#${color}`;
    holder.classList.add('has-logo');
  } catch {
    if(requestId===logoRequest) { holder.textContent='?'; holder.classList.remove('has-logo'); }
  }
}
function nextQuestion(){ if(index>=questions.length) return finish(); locked=false; const [name,slug,color]=questions[index]; $('progressText').textContent=`${index+1} / ${questions.length}`; $('answerInput').value=''; loadLogo(slug,color); $('answerInput').focus(); deadline=Date.now()+10000; clearInterval(timer); timer=setInterval(tick,50);tick(); }
function tick(){ const remaining=Math.max(0,deadline-Date.now()), fraction=remaining/10000;$('timerBar').style.transform=`scaleX(${fraction})`;$('timerBar').style.background=fraction<.3?'#ff4d77':'#2a57ff';$('timeText').textContent=`${(remaining/1000).toFixed(1)} s`;if(remaining<=0){clearInterval(timer);checkAnswer('');} }
function normalize(s){return s.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');}
function accepted(name,answer){const key=name.toLowerCase(), possibilities=[name,...(aliases[key]||[])];return possibilities.some(v=>normalize(v)===normalize(answer));}
function checkAnswer(answer){ if(locked)return;locked=true;clearInterval(timer);const correct=accepted(questions[index][0],answer);if(correct){score++;toast('Správne! ✓');}else toast(`Správna odpoveď: ${questions[index][0]}`);index++;setTimeout(nextQuestion,correct?550:1250); }
function finish(){saveScore();$('finalScore').textContent=score;$('resultTitle').textContent=score>=40?'Fenomenálny výkon!':score>=25?'Parádny výsledok!':'Dobrý začiatok!';$('resultMessage').textContent=`${player}, uhádol/a si ${score} z 50 značiek.`;show('resultScreen');}
function loadScores(){try{return JSON.parse(localStorage.getItem('znackovacka-scores'))||[]}catch{return[]}}
function saveScore(){const list=loadScores();list.push({name:player,score,date:new Date().toLocaleDateString('sk-SK')});localStorage.setItem('znackovacka-scores',JSON.stringify(list.sort((a,b)=>b.score-a.score).slice(0,10)));}
function renderScores(){const list=loadScores(),el=$('scoreList');el.innerHTML=list.length?list.map(s=>`<li><span>${escapeHtml(s.name)}</span><strong>${s.score} / 50</strong><time>${s.date}</time></li>`).join(''):'<li class="empty">Zatiaľ tu nie sú žiadne výsledky. Buď prvý/á!</li>';}
function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('visible');setTimeout(()=>el.classList.remove('visible'),1100);}
$('startForm').addEventListener('submit',e=>{e.preventDefault();startGame($('playerName').value);});$('answerForm').addEventListener('submit',e=>{e.preventDefault();checkAnswer($('answerInput').value);});$('playAgain').onclick=()=>startGame(player);function openScores(){previousScreen=document.querySelector('.screen.active').id;clearInterval(timer);renderScores();show('scoresScreen');}$('showScores').onclick=openScores;$('showScoresFromResult').onclick=openScores;$('backFromScores').onclick=()=>show(previousScreen);$('clearScores').onclick=()=>{localStorage.removeItem('znackovacka-scores');renderScores();};
