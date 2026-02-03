const profiles = [
  {
    accountName: "YOUR NICKNAME",
    hoyoGames: {
      token: "ltoken_v2=v2_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx; ltuid_v2=26XXXXX20;",
      genshin: true,
      honkai_star_rail: true,
      honkai_3: false,
      tears_of_themis: false,
      zenless_zone_zero: false
    },
    endfield: {
      creds: [
        {
          cred: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          token: "",
          skGameRole: "3_xxxxxxxx_x",
          platform: "3",
          vName: "1.0.0"
        }
      ]
    }
  }
];

const discord_notify = true
const myDiscordID = ""
const discordWebhook = ""

/** The above is the config. Please refer to the instructions on https://github.com/DiamondKen/gacha-auto-sign for configuration. **/
/** The following is the script code. Please DO NOT modify. **/

function logInfo(message) {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
}

function logError(message, error) {
  const errorDetails = error ? ` - ${error.message}\n${error.stack}` : '';
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}${errorDetails}`);
}

const urlDict = {
  Genshin: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=en-us&act_id=e202102251931481',
  Star_Rail: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202303301540311',
  Honkai_3: 'https://sg-public-api.hoyolab.com/event/mani/sign?lang=en-us&act_id=e202110291205111',
  Tears_of_Themis: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202308141137581',
  Zenless_Zone_Zero: 'https://sg-public-api.hoyolab.com/event/luna/zzz/os/sign?lang=en-us&act_id=e202406031448091',
  Endfield: 'https://zonai.skport.com/web/v1/game/endfield/attendance',
  Endfield_Refresh: 'https://zonai.skport.com/web/v1/auth/refresh'
};

/** 
  The below code is written due to the some game(s) requiring a extra header. 
  More info about it on :  https://github.com/canaria3406/hoyolab-auto-sign/issues/52 
**/
const headerDict = {
  default: {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',
    'dnt': '1',
  },
  Genshin: {
    'Connection': 'keep-alive',
    'x-rpc-app_version': '2.34.1',
    'x-rpc-client_type': '4',
    'Referer': 'https://act.hoyolab.com/',
    'Origin': 'https://act.hoyolab.com',
  },
  Star_Rail: {
    'Connection': 'keep-alive',
    'x-rpc-app_version': '2.34.1',
    'x-rpc-client_type': '4',
    'Referer': 'https://act.hoyolab.com/',
    'Origin': 'https://act.hoyolab.com',
  },
  Honkai_3: {
    'Connection': 'keep-alive',
    'x-rpc-app_version': '2.34.1',
    'x-rpc-client_type': '4',
    'Referer': 'https://act.hoyolab.com/',
    'Origin': 'https://act.hoyolab.com',
  },
  Tears_of_Themis: {
    'Connection': 'keep-alive',
    'x-rpc-app_version': '2.34.1',
    'x-rpc-client_type': '4',
    'Referer': 'https://act.hoyolab.com/',
    'Origin': 'https://act.hoyolab.com',
  },
  Zenless_Zone_Zero: {
    'Connection': 'keep-alive',
    'x-rpc-app_version': '2.34.1',
    'x-rpc-client_type': '4',
    'Referer': 'https://act.hoyolab.com/',
    'Origin': 'https://act.hoyolab.com',
    'x-rpc-signgame': 'zzz',
  },
  Endfield: {
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'origin': 'https://game.skport.com',
    'platform': '3',
    'referer': 'https://game.skport.com/',
    'sk-language': 'en',
    'vname': '1.0.0'
  }
}

async function main() {
  logInfo('Starting daily check-in process');

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    logInfo(`Processing profile ${i + 1}/${profiles.length}: ${profile.accountName}`);

    let results;

    try {
      results = autoSignFunction(profile);
    } catch (error) {
      logError(`Failed to process profile ${profile.accountName}`, error);
      results = [{
        name: 'Error',
        success: false,
        status: 'Exception',
        rewards: error.message
      }];
    }

    logInfo(`Check-in for ${profile.accountName} completed`);

    if (discord_notify && discordWebhook) {
      try {
        const message = formatDiscordMessage(results, profile.accountName);
        postWebhook(message);
        logInfo(`Discord notification sent for ${profile.accountName}`);
      } catch (error) {
        logError(`Failed to send Discord notification for ${profile.accountName}`, error);
      }
    }

    if (i < profiles.length - 1) {
      Utilities.sleep(1000);
    }
  }

  logInfo(`All check-ins completed`);
}

function discordPing() {
  return myDiscordID ? `<@${myDiscordID}> ` : '';
}

function bytesToHex(bytes) {
  return bytes.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function generateSign(path, body, timestamp, token, platform, vName) {
  let str = path + body + timestamp;
  const headerJson = `{"platform":"${platform}","timestamp":"${timestamp}","dId":"","vName":"${vName}"}`;
  str += headerJson;

  const hmacBytes = Utilities.computeHmacSha256Signature(str, token);
  const hmacHex = bytesToHex(hmacBytes);

  const md5Bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, hmacHex);
  return bytesToHex(md5Bytes);
}

function refreshSkportToken(profile, credIndex) {
  const { cred, platform, vName } = profile.endfield.creds[credIndex];
  const { accountName } = profile;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'cred': cred,
    'platform': platform,
    'vName': vName,
    'Origin': 'https://game.skport.com',
    'Referer': 'https://game.skport.com/'
  };

  const options = {
    method: 'GET',
    headers: headers,
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(urlDict.Endfield_Refresh, options);
    const json = JSON.parse(response.getContentText());

    if (json.code === 0 && json.data && json.data.token) {
      logInfo(`[${accountName}] Token refreshed successfully`);
      profile.endfield.creds[credIndex].token = json.data.token;
      return json.data.token;
    } else {
      throw new Error(`Refresh Failed (Code: ${json.code}, Msg: ${json.message})`);
    }
  } catch (error) {
    logError(`[${accountName}] Token refresh failed`, error);
    throw error;
  }
}

function endfieldSignIn(profile, credIndex) {
  const { cred, skGameRole, platform, vName } = profile.endfield.creds[credIndex];
  const { accountName } = profile;
  const url = urlDict.Endfield;

  let result = {
    name: `Endfield - ${accountName}`,
    success: false,
    status: '',
    rewards: ''
  };

  try {
    const token = refreshSkportToken(profile, credIndex);
    Utilities.sleep(1000);

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const path = '/web/v1/game/endfield/attendance';
    const body = '';
    const sign = generateSign(path, body, timestamp, token, platform, vName);

    const headers = {
      ...headerDict.default,
      ...headerDict.Endfield,
      'cred': cred,
      'sign': sign,
      'sk-game-role': skGameRole,
      'timestamp': timestamp
    };

    const response = UrlFetchApp.fetch(url, {
      method: 'POST',
      headers: headers,
      muteHttpExceptions: true
    });

    const json = JSON.parse(response.getContentText());

    if (json.code === 0) {
      result.success = true;
      result.status = 'Check-in Successful';
      const awards = json.data.awardIds.map(a => {
        const info = json.data.resourceInfoMap[a.id];
        return `${info.name} x${info.count}`;
      }).join(', ');
      result.rewards = awards;
    } else if (json.code === 10001) {
      result.success = true;
      result.status = 'Already Checked In';
      result.rewards = 'Nothing to claim';
    } else {
      result.success = false;
      result.status = `Error (Code: ${json.code})`;
      result.rewards = json.message;
    }
  } catch (error) {
    result.success = false;
    result.status = 'Exception';
    result.rewards = error.message;
    logError(`[Endfield - ${accountName}] Check-in failed`, error);
  }

  return result;
}

function hoyoSignIn(hoyoGames, accountName) {
  const results = [];
  logInfo(`[${accountName}] Starting HoyoLab games check-in`);

  const games = [];
  if (hoyoGames.genshin) games.push({
    name: 'Genshin Impact',
    url: urlDict.Genshin,
    headers: { Cookie: hoyoGames.token, ...headerDict.default, ...headerDict.Genshin }
  });
  if (hoyoGames.honkai_star_rail) games.push({
    name: 'Honkai Star Rail',
    url: urlDict.Star_Rail,
    headers: { Cookie: hoyoGames.token, ...headerDict.default, ...headerDict.Star_Rail }
  });
  if (hoyoGames.honkai_3) games.push({
    name: 'Honkai Impact 3rd',
    url: urlDict.Honkai_3,
    headers: { Cookie: hoyoGames.token, ...headerDict.default, ...headerDict.Honkai_3 }
  });
  if (hoyoGames.tears_of_themis) games.push({
    name: 'Tears of Themis',
    url: urlDict.Tears_of_Themis,
    headers: { Cookie: hoyoGames.token, ...headerDict.default, ...headerDict.Tears_of_Themis }
  });
  if (hoyoGames.zenless_zone_zero) games.push({
    name: 'Zenless Zone Zero',
    url: urlDict.Zenless_Zone_Zero,
    headers: { Cookie: hoyoGames.token, ...headerDict.default, ...headerDict.Zenless_Zone_Zero }
  });

  let sleepTime = 0;
  for (const game of games) {
    Utilities.sleep(sleepTime);
    sleepTime = 1000;

    logInfo(`[${accountName}] Checking ${game.name}...`);

    try {
      const response = UrlFetchApp.fetch(game.url, {
        method: 'POST',
        headers: game.headers,
        muteHttpExceptions: true
      });

      const json = JSON.parse(response);

      let result = {
        name: game.name,
        success: true,
        status: '',
        rewards: ''
      };

      if (json.retcode === 0 && json.message === 'OK') {
        result.success = true;
        result.status = 'Check-in Successful';
        result.rewards = 'OK';
        logInfo(`[${accountName}] ✅ ${game.name}: Check-in successful`);
        results.push(result);
      } else if (json.retcode === -5003) {
        result.success = true;
        result.status = 'Already Checked In';
        result.rewards = json.message || 'Nothing to claim';
        logInfo(`[${accountName}] ℹ️ ${game.name}: ${json.message}`);
        results.push(result);
      } else {
        const errorType = json.data?.gt_result?.is_risk ? 'CAPTCHA Blocked' : 'Error';
        const errorCode = json.retcode || 'unknown';
        const errorMessage = json.message || 'Unknown error';
        throw new Error(`[${game.name}] ${errorType} (retcode: ${errorCode}) - ${errorMessage}`);
      }
    } catch (error) {
      const isCaptcha = error.message && error.message.includes('CAPTCHA Blocked');
      results.push({
        name: game.name,
        success: false,
        status: isCaptcha ? 'CAPTCHA Blocked' : 'Error',
        rewards: error.message
      });
      logError(`[${game.name} - ${accountName}] Check-in failed`, error);
    }
  }

  const successCount = results.filter(r => r.success).length;
  logInfo(`[${accountName}] HoyoLab games completed: ${successCount}/${results.length} successful`);

  return results;
}

function autoSignFunction(profile) {
  const results = [];
  const hoyoGames = profile.hoyoGames;
  const endfield = profile.endfield;
  const accountName = profile.accountName;

  logInfo(`[${accountName}] Starting check-in process`);

  if (hoyoGames && hoyoGames.token) {
    const hoyoResults = hoyoSignIn(hoyoGames, accountName);
    results.push(...hoyoResults);
  }

  if (endfield && endfield.creds && endfield.creds.length > 0) {
    logInfo(`[${accountName}] Starting Endfield check-in`);
    for (let i = 0; i < endfield.creds.length; i++) {
      const endfieldResult = endfieldSignIn(profile, i);
      results.push(endfieldResult);
      Utilities.sleep(1000);
    }

    const endfieldResults = results.filter(r => r.name.includes('Endfield'));
    const endfieldSummary = endfieldResults.filter(r => r.success).length;
    logInfo(`[${accountName}] Endfield completed: ${endfieldSummary}/${endfieldResults.length} successful`);
  }

  logInfo(`[${accountName}] Check-in process completed`);
  return results;
}

function formatDiscordMessage(results, accountName) {
  const allSuccess = results.every(r => r.success);
  const hasError = !allSuccess;
  const embedColor = allSuccess ? 5763719 : 15548997;

  const fields = results.map(r => {
    return {
      name: `🎮 ${r.name}`,
      value: `**Status:** ${r.success ? '✅' : '❌'} ${r.status}\n**Rewards:**\n${r.rewards || 'None'}`,
      inline: true
    };
  });

  const payload = {
    username: 'gacha-auto-sign',
    avatar_url: 'https://i.imgur.com/LI1D4hP.png',
    embeds: [{
      title: `📋 Daily Check-in Report - ${accountName}`,
      color: embedColor,
      fields: fields,
      footer: {
        text: `Time: ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} (UTC)`,
      }
    }]
  };

  if (hasError && myDiscordID) {
    payload.content = `<@${myDiscordID}> Script encountered an error, please check logs!`;
  }

  return payload;
}

function postWebhook(data) {
  const payload = typeof data === 'string' ? {
    username: 'gacha-auto-sign',
    avatar_url: 'https://i.imgur.com/LI1D4hP.png',
    content: data
  } : data;

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch(discordWebhook, options);
}
