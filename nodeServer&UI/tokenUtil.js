import { AccessToken } from 'livekit-server-sdk';

export function createToken(identity, apiKey, apiSecret) {
  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    ttl: '1h',
  });

  token.addGrant({ roomJoin: true, canPublish: true, canSubscribe: true });
  return token.toJwt();
}
