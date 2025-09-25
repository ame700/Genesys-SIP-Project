import {
    Room,
    RemoteAudioTrack,
    createLocalAudioTrack
  } from 'livekit-client';
  
  const livekitUrl = 'ws://localhost:7880';
  let token; 

  let room;
  let micTrack;
  let participants = [];



  async function updateParticipantList() {
    const list = document.getElementById('participantList');
    list.innerHTML = '';
  
    if (!room) return;
  
    // // Add local participant
    // const liLocal = document.createElement('li');
    // liLocal.textContent = `🟢 You (local)`;
    // list.appendChild(liLocal);
  
    if(participants && participants.length>0){
        participants.forEach(participant => {
            const li = document.createElement('li');
            li.textContent = (participant.identity == 'me') ? `🟢 You (local)` : `👤 ${participant.identity}`;
            list.appendChild(li);
          });
    }
    
  }
  
  async function generateToken(){
    const res = await fetch('http://localhost:3000/token');
    const data = await res.json();
    console.log(data);
    return data.token;
  }

  async function start() {
    room = new Room();
    if(!token){
      token = await generateToken();
    }

    await room.connect(livekitUrl, token, {
      autoSubscribe: true,
    });
  
    micTrack = await createLocalAudioTrack();
    room.localParticipant.setMicrophoneEnabled(true);
    room.localParticipant.publishTrack(micTrack);
  
    participants.push({identity:"me"});
    updateParticipantList();

    room.on('participantConnected', (participant) => {
      console.log('Participant connected:', participant.identity);
      participants.push(participant);
      updateParticipantList();

      participant.on('trackSubscribed', (track) => {
        if (track.kind === 'audio') {
          track.attach();
        }
      });
    });

    room.on('participantDisconnected', (participant) => {
        console.log('Participant disconnected:', participant.identity);
        participants = participants.filter(part => part.identity == participant.identity);
        updateParticipantList();
      });
  
    // Handle existing participants
    if(room.participants){
        room.participants.forEach((participant) => {
            participant.tracks.forEach((publication) => {
              if (publication.isSubscribed && publication.track instanceof RemoteAudioTrack) {
                publication.track.attach();
              }
        
              publication.on('subscribed', (track) => {
                if (track.kind === 'audio') {
                  track.attach();
                }
              });
            });
          });
    }

    window.addEventListener('beforeunload', () => {
        disconnectRoom();
    });


    
  }
  
  async function disconnectRoom() {
    if (micTrack) {
      micTrack.stop();
    }
    if (room) {
      room.disconnect();
      room = null;
      participants = [];
      updateParticipantList();
      document.getElementById('participantList').innerHTML = '';

      //disconnect all participants
      const response = await fetch('http://localhost:3000/disconnect-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
  
      const data = await response.json();
      if (response.ok){
        console.log(data);
      }
    }
  }


  async function refreshRooms() {
    const res = await fetch('http://localhost:3000/list-rooms');
    const data = await res.json();
  
    const roomList = document.getElementById('rooms');
    roomList.innerHTML = '';
  
    data.rooms.forEach(room => {
      const li = document.createElement('li');
      li.textContent = `Room: ${room.name} (${room.numParticipants} participants)`;
      roomList.appendChild(li);
    });
  }
  

 
  async function dialNumber() {
    const number = document.getElementById('phoneNumber').value.trim();
  
    if (!number) {
      alert('Please enter a phone number.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/start-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
         // trunkId: 'ST_bVgfmwe6i2WQ', // Static trunkId for now
         trunkId: 'ST_YRChz3Pqrgnc', 
         number: number              // Optional: send number if your backend needs it
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        //alert('Call initiated successfully!');
      } else {
        console.error(data);
        alert(`Failed to start call: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error starting call. Check console for details.');
    }
  }
  
  document.getElementById('joinBtn').onclick = () => {
    start().catch(console.error);
  };
  
  document.getElementById('dialBtn').onclick = () => {
    dialNumber().catch(console.error);
  };

  document.getElementById('disconnectBtn').onclick = () => {
    disconnectRoom();
  };
  
