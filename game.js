'use strict';
// Four human seats, shared-screen test mode. No bots, networking, or external dependencies.
const $=id=>document.getElementById(id), R='23456789TJQKA', S='CDHS';
const players=['Laptop','Phone'].map((name,id)=>({id,name,stack:5000,hole:[],folded:false,allIn:false,bet:0,total:0,acted:false}));
const STARTING_CHIPS=5000, BASE_SB=10, BASE_BB=20, HANDS_PER_LEVEL=20, ACTION_SECONDS=50;
let smallBlind=BASE_SB,bigBlind=BASE_BB,turnDeadline=0,clockKey='',clockInterval=null;
let deck=[],board=[],dealer=1,turn=-1,street='idle',currentBet=0,minRaise=20,pot=0,hand=0,over=true,timer=null,lastMessage='',winners=[];
function random(n){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n;}
function shuffle(){const d=[...R].flatMap(rank=>[...S].map(suit=>({rank,suit})));for(let i=d.length-1;i>0;i--){const j=random(i+1);[d[i],d[j]]=[d[j],d[i]];}return d;}
function cardName(c){return c.rank+c.suit+'.svg';}
function card(c){const e=document.createElement('img');e.className='card';e.src='cards/'+cardName(c);e.alt=c.rank+' of '+({C:'clubs',D:'diamonds',H:'hearts',S:'spades'})[c.suit];return e;}
function next(from,fn){for(let k=1;k<=players.length;k++){let i=(from+k)%players.length;if(fn(players[i]))return i;}return -1;}
const canAct=p=>p.hole.length&&!p.folded&&!p.allIn&&p.stack>0;
const active=p=>p.stack>0;
const contenders=()=>players.filter(p=>p.hole.length&&!p.folded);
const fmt=n=>n.toLocaleString('en-US');
function say(s){lastMessage=s;}
function pay(p,n){let x=Math.min(p.stack,Math.max(0,Math.floor(n)));p.stack-=x;p.bet+=x;p.total+=x;pot+=x;if(!p.stack)p.allIn=true;return x;}
function start(){if(window.netRole!=='host'||!window.remoteConnected)return;clearTimeout(timer);if(players.filter(active).length<2){players.forEach(p=>p.stack=5000);say('New tournament: stacks reset to 5,000.');}
 hand++;const level=Math.floor((hand-1)/HANDS_PER_LEVEL);smallBlind=BASE_SB*Math.pow(2,level);bigBlind=BASE_BB*Math.pow(2,level);deck=shuffle();board=[];pot=0;currentBet=0;minRaise=bigBlind;street='preflop';over=false;winners=[];
 players.forEach(p=>{p.hole=[];p.folded=!p.stack;p.allIn=false;p.bet=0;p.total=0;p.acted=false;});
 dealer=next(dealer,active);const seats=players.filter(active);for(let i=0;i<2;i++)for(const p of seats)p.hole.push(deck.pop());
 const sb=seats.length===2?dealer:next(dealer,active),bb=next(sb,active);pay(players[sb],smallBlind);pay(players[bb],bigBlind);currentBet=players[bb].bet;
 turn=bb;clockKey='';say(`Hand #${hand} · ${players[sb].name} posts small blind, ${players[bb].name} posts big blind.`);render();settle();}
function roundDone(){return players.filter(canAct).every(p=>p.acted&&p.bet===currentBet);}
function settle(){if(over)return;if(contenders().length===1){const p=contenders()[0];p.stack+=pot;winners=[p.id];end(`${p.name} wins ${fmt(pot)} chips (everyone else folded).`);return;}
 if(roundDone()||players.filter(canAct).length===0){advanceStreet();return;}
 turn=next(turn,canAct);clockKey='';render();}
function advanceStreet(){if(over)return;
 if(street==='preflop'){deck.pop();board.push(deck.pop(),deck.pop(),deck.pop());street='flop';}
 else if(street==='flop'){deck.pop();board.push(deck.pop());street='turn';}
 else if(street==='turn'){deck.pop();board.push(deck.pop());street='river';}
 else{showdown();return;}
 players.forEach(p=>{p.bet=0;p.acted=false;});currentBet=0;minRaise=bigBlind;
 turn=next(dealer,canAct);clockKey='';say(`${street.toUpperCase()} · ${players[turn]?.name||'All players are all-in'}.`);
 // If everyone is all-in, reveal remaining streets automatically.
 if(players.filter(canAct).length===0){render();timer=setTimeout(advanceStreet,650);return;}
 render();}
function act(kind){if(window.netRole!=='host'||over||turn<0)return;const p=players[turn];if(!canAct(p))return;const need=Math.max(0,currentBet-p.bet);
 if(kind==='fold'){p.folded=true;p.acted=true;say(`${p.name} folds.`);}
 else if(kind==='call'){const x=pay(p,need);p.acted=true;say(`${p.name} ${need?'calls '+fmt(x):'checks'}${p.allIn?' (all-in)':''}.`);}
 else if(kind==='raise'){
  const max=p.bet+p.stack;if(max<=currentBet){pay(p,need);p.acted=true;say(`${p.name} calls all-in.`);}
  else{let target=Math.floor(Number($('raiseInput').value));if(!Number.isFinite(target))return;const min=Math.min(max,currentBet+minRaise);target=Math.max(min,Math.min(max,target));const previous=currentBet;pay(p,target-p.bet);currentBet=p.bet;const increment=currentBet-previous;
   if(increment>=minRaise){minRaise=increment;players.forEach(q=>{if(q!==p&&canAct(q))q.acted=false;});}
   p.acted=true;say(`${p.name} raises to ${fmt(currentBet)}${p.allIn?' (all-in)':''}.`);
  }
 }
 render();settle();}
// Rank 5-card poker hands; compare arrays lexicographically.
function five(cards){const vals=cards.map(c=>R.indexOf(c.rank)+2).sort((a,b)=>b-a),count=new Map();for(const v of vals)count.set(v,(count.get(v)||0)+1);
 const unique=[...new Set(vals)];if(unique.includes(14))unique.push(1);let straight=0;for(let i=0;i<=unique.length-5;i++)if(unique[i]-unique[i+4]===4){straight=unique[i];break;}
 const flush=cards.every(c=>c.suit===cards[0].suit),groups=[...count].map(([v,n])=>({v,n})).sort((a,b)=>b.n-a.n||b.v-a.v);
 if(flush&&straight)return [8,straight];if(groups[0].n===4)return [7,groups[0].v,groups[1].v];if(groups[0].n===3&&groups[1].n===2)return [6,groups[0].v,groups[1].v];if(flush)return [5,...vals];if(straight)return [4,straight];if(groups[0].n===3)return [3,groups[0].v,...groups.slice(1).map(g=>g.v).sort((a,b)=>b-a)];if(groups[0].n===2&&groups[1].n===2)return [2,Math.max(groups[0].v,groups[1].v),Math.min(groups[0].v,groups[1].v),groups[2].v];if(groups[0].n===2)return [1,groups[0].v,...groups.slice(1).map(g=>g.v).sort((a,b)=>b-a)];return [0,...vals];}
function compare(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){if((a[i]||0)!==(b[i]||0))return (a[i]||0)-(b[i]||0);}return 0;}
function best(cards){let top=null;for(let a=0;a<cards.length-4;a++)for(let b=a+1;b<cards.length-3;b++)for(let c=b+1;c<cards.length-2;c++)for(let d=c+1;d<cards.length-1;d++)for(let e=d+1;e<cards.length;e++){const v=five([cards[a],cards[b],cards[c],cards[d],cards[e]]);if(!top||compare(v,top)>0)top=v;}return top;}
const labels=['High card','One pair','Two pair','Three of a kind','Straight','Flush','Full house','Four of a kind','Straight flush'];
function showdown(){street='showdown';const scores=new Map(contenders().map(p=>[p.id,best([...p.hole,...board])]));const levels=[...new Set(players.map(p=>p.total).filter(Boolean))].sort((a,b)=>a-b);let prev=0;const earned=new Map();
 for(const level of levels){const contributors=players.filter(p=>p.total>=level);const amount=(level-prev)*contributors.length;prev=level;const eligible=contributors.filter(p=>!p.folded);if(!eligible.length)continue;
 let high=null;for(const p of eligible){const score=scores.get(p.id);if(!high||compare(score,high)>0)high=score;}
 const tied=eligible.filter(p=>compare(scores.get(p.id),high)===0).sort((a,b)=>((a.id-dealer+players.length)%players.length)-((b.id-dealer+players.length)%players.length));const share=Math.floor(amount/tied.length);let extra=amount%tied.length;
 for(const p of tied){const win=share+(extra-->0?1:0);p.stack+=win;earned.set(p.id,(earned.get(p.id)||0)+win);}
 }
 winners=[...earned.keys()];const summary=[...earned].map(([id,amount])=>`${players[id].name} wins ${fmt(amount)} (${labels[scores.get(id)[0]]})`).join(' · ');end(summary||'Hand completed.');}
function end(s){over=true;turn=-1;turnDeadline=0;clockKey='';street='showdown';say(s+' · Next hand starts automatically in 5 seconds.');render();timer=setTimeout(start,5000);}
function localSeat(){return window.netRole==='client'?1:0;}
function ensureClock(){if(window.netRole!=='host'||over||!window.remoteConnected||turn<0)return;
 const key=hand+'-'+street+'-'+turn+'-'+players[turn].total+'-'+players[turn].acted+'-'+currentBet;
 if(key!==clockKey){clockKey=key;turnDeadline=Date.now()+ACTION_SECONDS*1000;}
}
function tickClock(){if(window.netRole==='client'){if(!over&&turnDeadline)$('turnClock').textContent=Math.max(0,Math.ceil((turnDeadline-Date.now())/1000))+'s';return;}if(window.netRole!=='host'||over||!window.remoteConnected||turn<0)return;
 ensureClock();if(Date.now()>=turnDeadline){const p=players[turn];if(!canAct(p))return;
 const kind=currentBet===p.bet?'call':'fold';act(kind);}
 else {const remaining=Math.max(0,Math.ceil((turnDeadline-Date.now())/1000));$('turnClock').textContent=remaining+'s';if(window.broadcastState)window.broadcastState();}}
clockInterval=setInterval(tickClock,500);
function render(){ensureClock();const seats=$('seats');seats.replaceChildren();for(const p of players){const el=document.createElement('div');el.className=`seat pos${p.id===localSeat()?0:2}${turn===p.id&&!over?' turn':''}${p.folded?' folded':''}${winners.includes(p.id)?' winner':''}`;
 const avatar=document.createElement('div');avatar.className='avatar';avatar.textContent='P'+(p.id+1);el.append(avatar);
 const info=document.createElement('div');info.className='seat-info';const name=document.createElement('strong');name.textContent=p.name;if(p.id===dealer){const badge=document.createElement('span');badge.className='dealer';badge.textContent='D';name.append(badge);}const chips=document.createElement('span');chips.textContent=fmt(p.stack)+' chips';const note=document.createElement('small');note.textContent=p.folded?'FOLDED':p.allIn?'ALL-IN':p.bet?`Bet ${fmt(p.bet)}`:winners.includes(p.id)?'WINNER':' ';info.append(name,chips,note);el.append(info);
 const hole=document.createElement('div');hole.className='hole';if(p.id===localSeat())for(const c of p.hole)hole.append(card(c));else for(let i=0;i<(p.holeCount??p.hole.length);i++){const back=document.createElement('div');back.className='card card-back';back.textContent='♠';hole.append(back);}el.append(hole);seats.append(el);}
 $('community').replaceChildren();for(const c of board)$('community').append(card(c));for(let i=board.length;i<5;i++){const slot=document.createElement('div');slot.className='card placeholder';$('community').append(slot);}
 $('pot').textContent=fmt(pot);$('street').textContent=street.toUpperCase();$('handCount').textContent=`HAND #${hand} · LEVEL ${Math.floor((Math.max(1,hand)-1)/20)+1}`;$('blindValue').textContent=smallBlind+' / '+bigBlind;const mb=$('mobileBlindLabel');if(mb)mb.textContent='BLINDS '+smallBlind+'/'+bigBlind;$('message').textContent=lastMessage;
 const p=players[turn],playing=!over&&!!p&&turn===(window.netRole==='host'?0:1)&&window.remoteConnected;
 $('turnClock').textContent=over?'—':turnDeadline?Math.max(0,Math.ceil((turnDeadline-Date.now())/1000))+'s':'50s';$('turnTitle').textContent=over?'Hand finished':!window.remoteConnected?'Waiting for second player…':playing?'Your turn':`${p?.name||'Player'} is playing`;$('fold').disabled=!playing;$('check').disabled=!playing;$('raise').disabled=!playing;$('allIn').disabled=!playing;$('raiseSlider').disabled=!playing;$('raiseInput').disabled=!playing;
 if(playing){const need=Math.max(0,currentBet-p.bet);$('check').textContent=need?`Call ${fmt(Math.min(need,p.stack))}`:'Check';const max=p.bet+p.stack,min=Math.min(max,currentBet+minRaise);$('raise').disabled=max<=currentBet;$('raise').textContent=max<=currentBet?'No raise':'Raise';$('raiseSlider').min=min;$('raiseSlider').max=max;$('raiseSlider').step=bigBlind;$('raiseInput').min=min;$('raiseInput').max=max;$('raiseInput').step=bigBlind;
 const old=Number($('raiseInput').value);const amount=Math.min(max,Math.max(min,Number.isFinite(old)?old:min));$('raiseSlider').value=amount;$('raiseInput').value=amount;$('raiseAmount').textContent=fmt(amount);$('raiseLabel').textContent=currentBet?'Raise to':'Bet';}
 $('next').hidden=!over||window.netRole!=='host';$('status').textContent=!window.remoteConnected?'Waiting for a second device':over?'Automatic next hand in 5 seconds':'Two human players · no bots';if(window.netRole==='host'&&window.remoteConnected&&window.broadcastState)window.broadcastState();}
function syncRaise(v){const min=Number($('raiseSlider').min),max=Number($('raiseSlider').max);let n=Math.max(min,Math.min(max,Number(v)||min));if(n!==max)n=Math.min(max,min+Math.round((n-min)/bigBlind)*bigBlind);$('raiseSlider').value=n;$('raiseInput').value=n;$('raiseAmount').textContent=fmt(n);}
$('fold').addEventListener('click',()=>sendAction('fold'));$('check').addEventListener('click',()=>sendAction('call'));$('raise').addEventListener('click',()=>sendAction('raise'));$('raiseSlider').addEventListener('input',e=>syncRaise(e.target.value));$('raiseInput').addEventListener('input',e=>{$('raiseAmount').textContent=fmt(Number(e.target.value)||0);$('raiseSlider').value=e.target.value;});$('minus').addEventListener('click',()=>syncRaise(Number($('raiseInput').value)-bigBlind));$('plus').addEventListener('click',()=>syncRaise(Number($('raiseInput').value)+bigBlind));$('allIn').addEventListener('click',()=>syncRaise($('raiseSlider').max));$('next').addEventListener('click',()=>{if(window.netRole==='host')start();});$('reset').addEventListener('click',()=>{if(window.netRole!=='host')return;if(confirm('Reset all chip stacks and start over?')){players.forEach(p=>p.stack=5000);hand=0;dealer=1;start();}});
function sendAction(kind){if(!window.remoteConnected||over||turn!==(window.netRole==='host'?0:1))return;
 if(window.netRole==='host')act(kind);
 else if(window.sendRemoteAction)window.sendRemoteAction(kind,Number($('raiseInput').value));}
function snapshot(viewer=0){return {players:players.map(p=>({...p,hole:p.id===viewer?p.hole:[],holeCount:p.hole.length})),board,deck:[],dealer,turn,street,currentBet,minRaise,pot,hand,over,lastMessage,winners,smallBlind,bigBlind,turnDeadline};}
function applySnapshot(s){if(window.netRole!=='client')return;clearTimeout(timer);
 for(let i=0;i<players.length;i++)Object.assign(players[i],s.players[i]);
 board=s.board;dealer=s.dealer;turn=s.turn;street=s.street;currentBet=s.currentBet;minRaise=s.minRaise;pot=s.pot;hand=s.hand;over=s.over;lastMessage=s.lastMessage;winners=s.winners;smallBlind=s.smallBlind;bigBlind=s.bigBlind;turnDeadline=s.turnDeadline;render();}
// The game starts only when the host and one remote player are connected.
render();
