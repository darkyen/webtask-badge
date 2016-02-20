require('babel/register')({
  experimental: true,
  stage: 0,
});

// oh babel
var app = require('./lib/app');
app.listen(3000);
