export async function onRequest(context) {
    const { request, next, env } = context;
    const USERNAME = env.CFP_USERNAME; 
    const PASSWORD = env.CFP_PASSWORD; 
    const REALM = 'Secure Clocktower Frontend';
  
    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return new Response('Please provide username and password.', {
        status: 401,
        headers: { 'WWW-Authenticate': `Basic realm="${REALM}"` },
      });
    }
  
    const credentials = parseCredentials(authorization);
    if (credentials[0] !== USERNAME || credentials[1] !== PASSWORD) {
      return new Response('Invalid username or password.', {
        status: 401,
        headers: { 'WWW-Authenticate': `Basic realm="${REALM}"` },
      });
    }
  
    return next();
  }
  
  function parseCredentials(authorization) {
    const parts = authorization.split(' ');
    const plainAuth = atob(parts[1]); // Decode base64
    return plainAuth.split(':');
  }