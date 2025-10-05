const https = require('https');

const data = JSON.stringify({
  connectionStringName: 'Default',
  provider: 'SqlServer'
});

const options = {
  hostname: 'localhost',
  port: 44379,
  path: '/api/code-generator/introspect-db',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  rejectUnauthorized: false // Ignore SSL certificate errors
};

const req = https.request(options, res => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.write(data);
req.end();