const dns = require('dns');
dns.resolveSrv('_mongodb._tcp.cluster0.vcebook.mongodb.net', (err, records) => {
  if (err) {
    console.log('DNS Error:', err.message, 'Code:', err.code);
  } else {
    console.log('SRV Records:', JSON.stringify(records, null, 2));
  }
});
