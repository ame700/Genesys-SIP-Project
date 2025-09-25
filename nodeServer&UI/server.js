import express from 'express';
import cors from 'cors';
import { SipClient } from 'livekit-server-sdk';
import { RoomServiceClient } from 'livekit-server-sdk';
import { SIPTransport }  from '@livekit/protocol';
import { generateToken } from './token-generator.js';


const app = express();
app.use(express.json());
app.use(cors()); // allow all origins

const LIVEKIT_URL = "http://localhost:7880";
const LIVEKIT_API_KEY = 'devkey';
const LIVEKIT_SECRET = 'supersecureyoursecretkeywith32chars!!';

app.post('/create-trunk', async (req, res) => {
  try {
    const sipClient = new SipClient(LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_SECRET);
    let { address, number, auth_username, auth_password , isTls} = req.body;

    // SIP address is the hostname or IP the SIP INVITE is sent to.
    // Address format for Twilio: <trunk-name>.pstn.twilio.com
    // Address format for Telnyx: sip.telnyx.com
    //const address = 'ahmed007.pstn.twilio.com';

    // An array of one or more provider phone numbers associated with the trunk.
    const numbers = [number];
    let trunkOptions;
    // // Trunk options
    trunkOptions = {
      auth_username: auth_username,
      auth_password: auth_password,
      transport: (isTls) ? SIPTransport.SIP_TRANSPORT_TLS : SIPTransport.SIP_TRANSPORT_UDP  
    };


    const trunk = await sipClient.createSipOutboundTrunk(
      'My SIP trunk',
      address,
      numbers,
      trunkOptions);
    res.send({ status: 'OK', message: 'SIP outbound created successfully.', trunk: trunk });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e });

  }
});

app.get('/token', async (req, res) => {
  try {
    let token = await generateToken();
    res.send({ status: 'OK', token: token });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e });

  }
});

app.post('/create-room', async (req, res) => {

  const roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_SECRET);

  const opts = {
    name: 'sip-room',
    emptyTimeout: 10 * 60 * 60, // 10 minutes
    maxParticipants: 10,
  };

  let room = await roomService.createRoom(opts);

  res.send({ status: 'OK', message: 'room is reacted.', room: room });
});


app.post('/disconnect-all', async (req, res) => {
  try {
    const roomName = 'sip-room';
    const roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_SECRET);
    await roomService.deleteRoom(roomName);
    res.send({ status: 'OK', message: 'All participants got disconnected.' });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e });

  }
});

app.get('/list-rooms', async (req, res) => {

  const roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_SECRET);

  let rooms = await roomService.listRooms();

  res.send({ status: 'OK', message: 'room is reacted.', rooms: rooms });
});

app.post('/start-call', async (req, res) => {

  try {
    const sipClient = new SipClient(LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_SECRET);


    // Outbound trunk to use for the call
    console.log(req.body.trunkId);
    const trunkId = req.body.trunkId;

    // Phone number to dial
    const phoneNumber = req.body.number;  //'+971543306217';

    // Name of the room to attach the call to
    const roomName = 'sip-room';

    const sipParticipantOptions = {
      participantIdentity: 'sip-test' + Math.random().toString(36).substring(2, 8),
      participantName: 'Test Caller',
      krispEnabled: true
    };

    const participant = await sipClient.createSipParticipant(
      trunkId,
      phoneNumber,
      roomName,
      sipParticipantOptions
    );
    res.send({ status: 'OK', message: 'call initaited.' });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e });

  }
});


app.listen(3000, () => console.log('API listening on http://localhost:3000'));
