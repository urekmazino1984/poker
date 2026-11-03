"use strict";
// PeerJS signaling is hosted by the public PeerJS service. WebRTC transports gameplay.
window.netRole='none';window.remoteConnected=false;
let peer=null,connection=null,room=null;
const status=msg=>{$('connectionStatus').textContent=msg;};
function roomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const bytes=new Uint8Array(6);crypto.getRandomValues(bytes);return [...bytes].map(b=>chars[b%chars.length]).join('');}
function setupConnection(c){connection=c;
 c.on('open',()=>{window.remoteConnected=true;$('lobby').classList.add('connected');status(window.netRole==='host'?'Phone connected — game started!':'Connected to laptop — game started!');
 if(window.netRole==='host')start();else c.send({type:'ready'});render();});
 c.on('data',msg=>{if(!msg||typeof msg!=='object')return;
 if(window.netRole==='host'&&msg.type==='action'&&turn===1&&!over){if(!['fold','call','raise'].includes(msg.kind))return;
 if(msg.kind==='raise')$('raiseInput').value=Number.isFinite(msg.amount)?msg.amount:0;
 act(msg.kind);}
 if(window.netRole==='host'&&msg.type==='ready')window.broadcastState();
 if(window.netRole==='client'&&msg.type==='state')applySnapshot(msg.state);
 });
 c.on('close',()=>{window.remoteConnected=false;status('Connection lost. Reload both pages to reconnect.');render();});
 c.on('error',err=>status('Connection error: '+err.message));
}
window.broadcastState=()=>{if(window.netRole==='host'&&connection?.open)connection.send({type:'state',state:snapshot()});};
window.sendRemoteAction=(kind,amount)=>{if(window.netRole==='client'&&connection?.open)connection.send({type:'action',kind,amount});};
function fail(err){status('Connection failed: '+(err?.message||err)+'. Try refreshing and using a new room.');}
$('hostBtn').onclick=()=>{if(typeof Peer==='undefined'){status('PeerJS did not load. Check internet access.');return;}
 window.netRole='host';room=roomCode();$('roomDisplay').textContent='ROOM: '+room;
 $('hostBtn').disabled=true;$('joinBtn').disabled=true;status('Creating room…');
 peer=new Peer('felt-'+room.toLowerCase());peer.on('open',()=>status('Room '+room+' ready. Enter this code on your phone.'));
 peer.on('connection',c=>{if(connection?.open){c.on('open',()=>c.close());return;}setupConnection(c);});
 peer.on('error',fail);};
$('joinBtn').onclick=()=>{if(typeof Peer==='undefined'){status('PeerJS did not load. Check internet access.');return;}
 room=$('roomInput').value.trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(room)){status('Enter the 6-character room code shown on laptop.');return;}
 window.netRole='client';$('hostBtn').disabled=true;$('joinBtn').disabled=true;status('Connecting to '+room+'…');
 peer=new Peer();peer.on('open',()=>setupConnection(peer.connect('felt-'+room.toLowerCase(),{reliable:true})));
 peer.on('error',fail);};
