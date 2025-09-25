// token-generator.js
import { AccessToken } from 'livekit-server-sdk';

const apiKey = 'devkey';//'devkey';
const secret = 'supersecureyoursecretkeywith32chars!!';//'supersecureyoursecretkeywith32chars!!';
const roomName = 'sip-room';
const identity = 'browser-user-' + Math.random().toString(36).substring(2, 8);


export async function generateToken() {

  const at = new AccessToken(apiKey, secret, {
    identity,
    ttl: '20h'
  });
  at.addGrant({ roomJoin: true, room: roomName });

  const token = await at.toJwt();
  return token; 
}
