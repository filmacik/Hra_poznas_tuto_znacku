const brands = [
  ['BMW','bmw'],['Audi','audi'],['Coca-Cola','cocacola'],['Apple','apple'],['Nike','nike'],['Adidas','adidas'],['Mercedes-Benz','mercedes'],['Porsche','porsche'],['Tesla','tesla'],['Toyota','toyota'],
  ['Volkswagen','volkswagen'],['Ford','ford'],['Honda','honda'],['Hyundai','hyundai'],['Lexus','lexus'],['Ferrari','ferrari'],['Lamborghini','lamborghini'],['Pepsi','pepsi'],['McDonald\'s','mcdonalds'],['Starbucks','starbucks'],
  ['KFC','kfc'],['Burger King','burgerking'],['IKEA','ikea'],['LEGO','lego'],['Samsung','samsung'],['Sony','sony'],['Microsoft','microsoft'],['Google','google'],['Amazon','amazon'],['Netflix','netflix'],
  ['Spotify','spotify'],['YouTube','youtube'],['TikTok','tiktok'],['Instagram','instagram'],['Facebook','facebook'],['LinkedIn','linkedin'],['X','x'],['PlayStation','playstation'],['Nintendo','nintendo'],['Puma','puma'],
  ['Rolex','rolex'],['Gucci','gucci'],['Chanel','chanel'],['Prada','prada'],['Louis Vuitton','louisvuitton'],['Red Bull','redbull'],['Fanta','fanta'],['Shell','shell'],['Mastercard','mastercard'],['Visa','visa'],
  ['Uber','uber'],['Airbnb','airbnb'],['PayPal','paypal'],['Intel','intel'],['Oracle','oracle'],['Cisco','cisco'],['IBM','ibm'],['Dell','dell'],['Canon','canon'],['Nikon','nikon']
];
const aliases = { 'mercedes-benz':['mercedes','mercedes benz'], 'mcdonald\'s':['mcdonalds','mc donalds'], 'coca-cola':['coca cola'], 'burger king':['burgerking'], 'louis vuitton':['louisvuitton'], 'red bull':['redbull'] };
const $ = id => document.getElementById(id);
const screens = ['startScreen','gameScreen','resultScreen','scoresScreen'];
let questions=[], index=0, score=0, player='', timer=null, deadline=0, locked=false, previousScreen='startScreen';
function show(id){ screens.forEach(s => $(s).classList.toggle('active',s===id)); }
function shuffle(a){ return [...a].sort(()=>Math.random()-.5); }
function startGame(name){ player=name.trim(); questions=shuffle(brands).slice(0,50);index=0;score=0;show('gameScreen');nextQuestion(); }
function nextQuestion(){ if(index>=questions.length) return finish(); locked=false; const [name,slug]=questions[index]; $('progressText').textContent=`${index+1} / ${questions.length}`; $('answerInput').value=''; const img=$('logoImage'), fallback=$('fallbackLogo'); fallback.hidden=true;img.hidden=false;img.alt=`Logo: ${name}`; img.src=`https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/${slug}.svg`; img.onerror=()=>{img.hidden=true;fallback.hidden=false;fallback.textContent=name[0];}; $('answerInput').focus(); deadline=Date.now()+10000; clearInterval(timer); timer=setInterval(tick,50);tick(); }
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
