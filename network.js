'use strict';
// PeerJS signaling is hosted by the public PeerJS server. The host phone/browser
// maintains the authoritative poker state and distributes private per-seat snapshots.
window.netRole='none';window.remoteConnected=false;window.localPlayerId=0;
let peer=null,hostConnection=null,room=null,started=false,interrupted=false;
const peerConnections=new Map(); // seat id -> PeerJS connection (host only)
const status=msg=>{$('connectionStatus').textContent=msg;};
function roomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const bytes=new Uint8Array(6);crypto.getRandomValues(bytes);return [...bytes].map(b=>chars[b%chars.length]).join('');}
function connectedSeats(){return 1+[...peerConnections.values()].filter(c=>c.open).length;}
function applyConnectedStyle(connected){document.documentElement.classList.toggle('game-connected',connected);$('lobby').classList.toggle('connected',connected);}
function waitingStatus(){
 const count=connectedSeats();
 status(`${count} / ${TABLE_PLAYER_COUNT} players seated. Waiting for ${TABLE_PLAYER_COUNT-count} more.`);
 for(const [id,c] of peerConnections)if(c.open)c.send({type:'waiting',count,total:TABLE_PLAYER_COUNT,players:players.map(p=>({id:p.id,name:p.name,joined:p.joined}))});
}
function distribute(){if(window.netRole!=='host')return;
 for(const [seat,c] of peerConnections)if(c.open)c.send({type:'state',state:snapshot(seat)});
}
window.broadcastState=distribute;
window.sendRemoteAction=(kind,amount)=>{
 if(window.netRole==='client'&&hostConnection?.open)hostConnection.send({type:'action',kind,amount});
};
window.sendNewGame=()=>{
 if(window.netRole==='client'&&hostConnection?.open)hostConnection.send({type:'new-game'});
};
function beginIfFull(){
 if(started||connectedSeats()!==TABLE_PLAYER_COUNT)return;
 started=true;window.remoteConnected=true;applyConnectedStyle(true);
 status('All players seated. Game started!');
 for(const [seat,c] of peerConnections)if(c.open)c.send({type:'started',seat});
 start();
}
function attachHostConnection(c){
 let assigned=-1;
 c.on('data',msg=>{
  if(!msg||typeof msg!=='object')return;
  if(msg.type==='join'&&assigned<0){
   if(started||interrupted){c.send({type:'reject',reason:interrupted?'Room interrupted. Please create a new table.':'Game is already in progress.'});c.close();return;}
   const openSeat=players.findIndex(p=>p.id>0&&!p.joined);
   if(openSeat<0){c.send({type:'reject',reason:'Table is full.'});c.close();return;}
   assigned=openSeat;peerConnections.set(assigned,c);
   updatePlayerName(assigned,msg.name);
   players[assigned].joined=true;
   c.send({type:'welcome',seat:assigned,total:TABLE_PLAYER_COUNT,options:{count:TABLE_PLAYER_COUNT,blindHands:HANDS_PER_LEVEL,chips:STARTING_CHIPS},players:players.map(p=>({id:p.id,name:p.name,joined:p.joined}))});
   render();
   if(connectedSeats()===TABLE_PLAYER_COUNT)beginIfFull();else waitingStatus();
   return;
  }
  if(assigned<0||!started||!window.remoteConnected)return;
  if(msg.type==='action'&&turn===assigned&&!over){
   if(!['fold','call','raise'].includes(msg.kind))return;
   if(msg.kind==='raise')$('raiseInput').value=Number.isFinite(msg.amount)?msg.amount:0;
   act(msg.kind);
  }
  if(msg.type==='new-game'&&tournamentOver)startNewGame();
 });
 c.on('close',()=>{
  if(assigned<0)return;
  if(peerConnections.get(assigned)===c)peerConnections.delete(assigned);
  players[assigned].joined=false;
  if(started){
   window.remoteConnected=false;applyConnectedStyle(false);started=false;interrupted=true;
   status(`Player ${assigned+1} disconnected. Reload all devices to start a new table.`);
   for(const [,other] of peerConnections)if(other.open)other.send({type:'interrupted',reason:'A player disconnected. Reload all devices to restart.'});
  }else waitingStatus();
  render();
 });
 c.on('error',err=>status('Connection error: '+err.message));
}
function connectClient(){
 peer=new Peer();
 peer.on('open',()=>{
  hostConnection=peer.connect('felt-'+room.toLowerCase(),{reliable:true});
  hostConnection.on('open',()=>{hostConnection.send({type:'join',name:window.pendingPlayerName});status('Connected. Requesting a seat…');});
  hostConnection.on('data',msg=>{
   if(!msg||typeof msg!=='object')return;
   if(msg.type==='welcome'){
    window.localPlayerId=msg.seat;
    TABLE_PLAYER_COUNT=msg.options.count;HANDS_PER_LEVEL=msg.options.blindHands;STARTING_CHIPS=msg.options.chips;
    players.splice(0,players.length,...msg.players.map(p=>newPlayer(p.id,p.name,p.joined)));
    status(`Joined as ${players[msg.seat].name}. Waiting for all ${msg.total} players…`);render();
   }else if(msg.type==='waiting'){
    for(const p of msg.players)if(players[p.id]){players[p.id].name=p.name;players[p.id].joined=p.joined;}
    status(`${msg.count} / ${msg.total} players seated. Waiting for the others.`);render();
   }else if(msg.type==='started'){
    window.localPlayerId=msg.seat;window.remoteConnected=true;applyConnectedStyle(true);
    status('All seats filled. Playing now!');render();
   }else if(msg.type==='state'){
    applySnapshot(msg.state);
   }else if(msg.type==='interrupted'){
    window.remoteConnected=false;applyConnectedStyle(false);status(msg.reason);render();
   }else if(msg.type==='reject'){
    status(msg.reason);$('joinBtn').disabled=false;$('hostBtn').disabled=false;
   }
  });
  hostConnection.on('close',()=>{window.remoteConnected=false;applyConnectedStyle(false);status('Host disconnected. Reload to reconnect.');render();});
  hostConnection.on('error',err=>status('Connection error: '+err.message));
 });
 peer.on('error',err=>status('Connection failed: '+err.message+'. Reload and try again.'));
}
$('hostBtn').onclick=()=>{
 const menu=$('createOptions');menu.hidden=!menu.hidden;
};
$('confirmHostBtn').onclick=()=>{
 if(typeof Peer==='undefined'){status('PeerJS did not load. Check internet access.');return;}
 const chips=Math.floor(Number($('startingChips').value));
 if(!Number.isFinite(chips)||chips<100||chips>100000){status('Starting chips must be between 100 and 100,000.');return;}
 const name=$('hostName').value.trim().slice(0,15)||'Host';
 const interval=Math.floor(Number($('blindHands').value));
 if(!Number.isFinite(interval)||interval<1||interval>200){status('Choose a blind interval from 1 to 200 hands.');return;}
 window.netRole='host';window.localPlayerId=0;
 setTableOptions({count:Number($('playerCount').value),blindHands:Number($('blindHands').value),chips,name});
 room=roomCode();$('roomDisplay').textContent='ROOM: '+room;
 $('confirmHostBtn').disabled=true;$('hostBtn').disabled=true;$('joinBtn').disabled=true;
 $('createOptions').hidden=true;status('Creating room…');
 peer=new Peer('felt-'+room.toLowerCase());
 peer.on('open',()=>waitingStatus());
 peer.on('connection',attachHostConnection);
 peer.on('error',err=>status('Could not create room: '+err.message+'. Refresh to retry.'));
};
$('joinBtn').onclick=()=>{
 if(typeof Peer==='undefined'){status('PeerJS did not load. Check internet access.');return;}
 room=$('roomInput').value.trim().toUpperCase();
 if(!/^[A-Z2-9]{6}$/.test(room)){status('Enter the 6-character room code.');return;}
 // Name is requested at the point of joining; the limit is also enforced by the host.
 const chosen=window.prompt('Player name (maximum 15 characters):','Player');
 if(chosen===null)return;
 const name=chosen.trim().slice(0,15);
 if(!name){status('Please enter a player name.');return;}
 window.pendingPlayerName=name;window.netRole='client';
 $('hostBtn').disabled=true;$('joinBtn').disabled=true;
 status('Connecting to '+room+'…');connectClient();
};
