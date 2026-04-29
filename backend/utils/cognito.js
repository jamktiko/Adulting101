// backend/utils/cognito.js
const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const crypto = require('crypto');

const ClientId = process.env.COGNITO_CLIENT_ID;
const ClientSecret = process.env.COGNITO_CLIENT_SECRET;

const client = new CognitoIdentityProviderClient({
  region: 'eu-north-1',
});

// Apufunktio SECRET_HASH:n laskemiseen
function getSecretHash(username) {
  return crypto
    .createHmac('sha256', ClientSecret)
    .update(username + ClientId)
    .digest('base64');
}

async function signUpUser(username, email, password) {
  const command = new SignUpCommand({
    ClientId,
    Username: username,
    Password: password,
    UserAttributes: [{ Name: 'email', Value: email }],
    SecretHash: getSecretHash(username),
  });
  return client.send(command);
}

async function confirmUser(username, code) {
  const command = new ConfirmSignUpCommand({
    ClientId,
    Username: username,
    ConfirmationCode: code,
    SecretHash: getSecretHash(username),
  });
  return client.send(command);
}

async function loginUser(username, password) {
  const command = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
      SECRET_HASH: getSecretHash(username),
    },
  });

  const res = await client.send(command);

  if (res.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
    return { challengeName: res.ChallengeName, session: res.Session };
  }

  if (!res.AuthenticationResult) {
    throw new Error('Autentikointi epäonnistui');
  }

  return {
    idToken: res.AuthenticationResult.IdToken,
    accessToken: res.AuthenticationResult.AccessToken,
    refreshToken: res.AuthenticationResult.RefreshToken,
  };
}

module.exports = { signUpUser, confirmUser, loginUser };
