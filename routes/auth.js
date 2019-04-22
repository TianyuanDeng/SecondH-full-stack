const secret = require('../config').secret;
const jwt = require('express-jwt');

function getTokenFromHeader(req) {
    var authHeader = req.header('authorization');
    
    if (!authHeader) return null;
    const [name, token] = authHeader.split(' ');
    
    if (name === 'Token' && token)
      return token;
      
    return null;
  }
  
  const auth = {
    required: jwt({
      secret,
      userProperty: 'payload',
      getToken: getTokenFromHeader
    }),
    optional: jwt({
      secret,
      userProperty: 'payload',
      credentialsRequired: false,
      getToken: getTokenFromHeader
    })
  };

  module.exports = auth;