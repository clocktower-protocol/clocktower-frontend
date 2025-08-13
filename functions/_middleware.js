export async function onRequest(context) {
    const { request, next, env } = context;
    
    // Debug: Log all headers to see what we're getting
    const country = request.headers.get('cf-ipcountry');
    const region = request.headers.get('cf-ipregion');
    const city = request.headers.get('cf-ipcity');
    const ip = request.headers.get('cf-connecting-ip');
    
    // Get geolocation from the cf object (more reliable)
    const cf = request.cf;
    const cfCountry = cf?.country;
    const cfRegion = cf?.regionCode;
    const cfCity = cf?.city;
    
    console.log('Debug headers:', { country, region, city, ip });
    console.log('CF object:', { cfCountry, cfRegion, cfCity });
    
    // Block New York State users - use cf object data
    if ((country === 'US' && region === 'New York') || (cfCountry === 'US' && cfRegion === 'NY')) {
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Access Restricted</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .error { color: #d32f2f; font-size: 24px; margin-bottom: 20px; }
                    .message { color: #666; line-height: 1.6; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="error">⚠️ Access Restricted</h1>
                    <p class="message">We're sorry, but our service is not available in New York State.</p>
                </div>
            </body>
            </html>
        `, {
            status: 403,
            headers: {
                'Content-Type': 'text/html;charset=utf-8',
                'Cache-Control': 'no-cache'
            }
        });
    }
    
    // Skip authentication if ENABLE_AUTH is not set to 'true'
    if (env.ENABLE_AUTH !== 'true') {
        return next();
    }
    
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