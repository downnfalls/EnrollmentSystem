const crypto = require('crypto');
require('dotenv').config();

const apiKey = process.env.API_KEY;
const publicKey = process.env.PUBLIC_KEY;
const baseUrl = process.env.BASE_URL;

const loginUrl = process.env.LOGIN_URL;
const renewTokenUrl = process.env.RENEW_TOKEN_URL;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;

var accessToken = '';
var refreshToken = '';

async function renewToken() {
  const url = baseUrl + renewTokenUrl;

  const payload = {
    renewtoken: refreshToken
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        
        'App-Key': apiKey,
        'x-access-token': accessToken,
        
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json(); 
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    console.log('Success:', data);
    return data;

  } catch (error) {
    try {
      const parsedErrorJSON = JSON.parse(error.message);
      
      console.log("The server sent an error!");
      console.log("Error details:", parsedErrorJSON);
      
    } catch (parseError) {
      console.error("A network or unexpected error occurred:", error.message);
    }
  }
}

function encryptPayload(text) {
    const buffer = Buffer.from(text, 'utf8');
    const encrypted = crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING // สำคัญมาก ต้องใช้ Padding ตัวนี้
    }, buffer);
    return encrypted.toString('base64');
}

async function login(username, password) {
    const url = baseUrl + loginUrl;
    
    const payload = {
        username: encryptPayload(username),
        password: encryptPayload(password)
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'App-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json(); 
            throw new Error(JSON.stringify(errorData));
        }

        const data = await response.json();
        console.log('Login successful:', data);

        return data;

    } catch (error) {
        try {
            const parsedErrorJSON = JSON.parse(error.message);
            
            console.log("Login failed!");
            console.log("Error details:", parsedErrorJSON);
            
        } catch (parseError) {
            console.error("A network or unexpected error occurred during login:", error.message);
        }
    }
}

async function worker() {

    

    await renewToken();
}

async function main() {
    let data = await login(username, password);

    accessToken = data.accesstoken;
    refreshToken = data.renewtoken;
    
    setInterval(worker, 10000)
}

main();