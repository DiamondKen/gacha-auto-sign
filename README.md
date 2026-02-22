<h1 align="center">
    <img width="120" height="120" src="pic/logo.svg" alt=""><br>
    gacha-auto-sign
 </h1>

<p align="center">
    <img src="https://img.shields.io/github/license/canaria3406/hoyolab-auto-sign?style=flat-square" alt="">
    <img src="https://img.shields.io/github/stars/canaria3406/hoyolab-auto-sign?style=flat-square" alt="">
    <br><a href="/README_zh-tw.md">繁體中文</a>　<b>English</b>　<a href="/README_ru-ru.md">Русский</a>
</p>

A lightweight, secure, and free script that automatically collect daily check in rewards.
Supports Genshin Impact, Honkai Impact 3rd, Honkai: Star Rail, Tears of Themis, Zenless Zone Zero, and Endfield. Support multiple accounts.

## Features
* **Lightweight** - The script only requires minimal configuration and is well-organized for easy maintenance.
* **Secure** - The script can be self-deployed to Google Apps Script, no worries about data leaks.
* **Free** - Google Apps Script is currently a free service.
* **Simple** - The script can run without a browser and will automatically notify you through Discord or Telegram.
* **Separated Config** - HoyoLab games and Endfield credentials are organized in separate sections for better clarity.
* **Proper Error Handling** - Distinguishes between "already checked in" (success) and actual errors.
* **Comprehensive Logging** - Detailed logs for every step including token refresh, check-in status, and errors.
* **Proper Signature Generation** - Endfield uses correct HMAC-SHA256 → MD5 signature algorithm with token refresh.

## Setup
1. Go to [Google Apps Script](https://script.google.com/home/start) and create a new project with your custom name.
2. Select the editor and paste the code( [Discord version](https://github.com/canaria3406/hoyolab-auto-sign/blob/main/src/main-discord.gs) / [Telegram version](https://github.com/canaria3406/hoyolab-auto-sign/blob/main/src/main-telegram.gs) ). Refer to the instructions below to configure the config file and save it.
3. Select "main" and click the "Run" button at the top.
   Grant the necessary permissions and confirm that the configuration is correct (Execution started > completed).
4. Click the trigger button on the left side and add a new trigger.
   Select the function to run: main
   Select the event source: Time-driven
   Select the type of time based trigger: Day timer
   Select the time of day: recommended to choose any off-peak time between 0900 to 1500.

## Configuration

```javascript
const profiles = [
  {
    accountName: "YOUR NICKNAME",
    hoyoGames: {
      token: "ltoken_v2=v2_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx; ltuid_v2=26XXXXX20;",
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
          skGameRole: "3_xxxxxxxx_3",
          platform: "3",
          vName: "1.0.0"
        }
      ]
    }
  }
];
```

> HoYoLAB has changed the rules for tokens on July 2023, switching from the previous "ltoken" and "ltuid" to "ltoken_v2" and "ltuid_v2".

> [!IMPORTANT]
> HoYoLAB has changed the cookie to HttpOnly cookie. It is no longer possible to read the cookies by using the getToken.js code.
> Please use the method of manually copying the cookie to obtain the ltoken_v2 and ltuid_v2.
> For more detail:
> [https://github.com/Joshua-Noakes1/mei-cards#2-getting-your-hoyolab-cookies](https://github.com/Joshua-Noakes1/mei-cards#2-getting-your-hoyolab-cookies)

 <details>
 <summary><b>HoYoLAB settings</b></summary>

 1. **hoyoGames.token** - Please enter token for HoYoLAB check-in page.

    > HoYoLAB has changed cookie to HttpOnly cookie. It is no longer possible to read cookies by using getToken.js code.
    > Please use the method of manually copying the cookie to obtain ltoken_v2 and ltuid_v2.

 2. **hoyoGames.genshin**

    Whether to enable auto check in for Genshin Impact.
    If you want, set it to true. If not, please set it to false, or delete this line.
    If you do not play Genshin Impact, or your account is not bound to an uid, please set it to false, or delete this line.

 3. **hoyoGames.honkai_star_rail**

    Whether to enable auto check in for Honkai: Star Rail.
    If you want, set it to true. If not, please set it to false, or delete this line.
    If you do not play Honkai: Star Rail, or your account is not bound to an uid, please set it to false, or delete this line.

 4. **hoyoGames.honkai_3**

    Whether to enable auto check in for Honkai Impact 3rd.
    If you want, set it to true. If not, please set it to false, or delete this line.
    If you do not play Honkai Impact 3rd, or your account is not bound to an uid, please set it to false, or delete this line.

 5. **hoyoGames.tears_of_themis**

    Whether to enable auto check in for Tears of Themis.
    If you want, set it to true. If not, please set it to false, or delete this line.
    If you do not play Tears of Themis, or your account is not bound to an uid, please set it to false, or delete this line.

 6. **hoyoGames.zenless_zone_zero**

    Whether to enable auto check in for Zenless Zone Zero.
    If you want, set it to true. If not, please set it to false, or delete this line.
    If you do not play Zenless Zone Zero, or your account is not bound to an uid, please set it to false, or delete this line.

 7. **accountName** - Please enter your customized nickname.

    Please enter your customized HoYoLAB or in-game nickname here.

   </details>

   <details>
   <summary><b>Endfield settings</b></summary>

 1. **endfield**

    Whether to enable auto check in for Endfield.
    If you want, set it to true. If not, please set it to false, or delete this section.

 2. **endfield.creds**

    Array of credential objects for Endfield accounts. Each object contains:
    - `cred`: Your Endfield authentication credential
    - `token`: Leave empty - will be auto-refreshed by the script
    - `skGameRole`: Your game role ID (format: `3_{YOUR_INGAME_UID}_3`)
    - `platform`: Platform ID (default: "3")
    - `vName`: Game version (default: "1.0.0")

    **How to get cred and skGameRole:**
    - Log into [Endfield Daily Checkin page](https://game.skport.com/endfield/sign-in)
    - Open browser DevTools (F12) → Network tab
    - Sign in manually once to capture requests
    - Filter and find for `endfield/attendance` or `attendance`
    - In Header Tab, Scroll down to Request Headers
    - Copy `cred` header value into the same field in `endfield.creds` **(DO NOT GIVE THIS ANYONE, THIS IS YOUR CREDENTIAL)**
    - Copy `sk-game-role` header value into the same field in `endfield.creds`

    **Example:**
    ```javascript
    endfield: {
      creds: [
        {
          cred: "8Vxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          token: "",
          skGameRole: "3_1234567890_3",
          platform: "3",
          vName: "1.0.0"
        }
      ]
    }
    ```

    **Multiple Game Roles:**
    If you have multiple game roles (multiple accounts or servers), add multiple objects to the array:
    ```javascript
    endfield: {
      creds: [
        {
          cred: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          token: "",
          skGameRole: "3_6234567890_3",
          platform: "3",
          vName: "1.0.0"
        },
        {
          cred: "yyyyyyyyyyyyyyyyyyyyyyyyyyyy",
          token: "",
          skGameRole: "3_1876543210_3",
          platform: "3",
          vName: "1.0.0"
        }
      ]
    }
    ```

 3. **accountName** - Please enter your customized nickname.

    Please enter your customized nickname here.

    </details>
    
    </details>
   
   </details>
   
   <details>
   <summary><b>discord notify settings (only for <a href="https://github.com/canaria3406/hoyolab-auto-sign/blob/main/src/main-discord.gs">Discord version</a>)</b></summary>

```javascript
const discord_notify = true
const myDiscordID = "20000080000000040"
const discordWebhook = "https://discord.com/api/webhooks/1050000000000000060/6aXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXnB"
```

1. **discord_notify**

   Whether to enable Discord notify.
   If you want to enable auto check-in notify, set it to true. If not, please set it to false.

2. **myDiscordID** - Please enter your Discord user ID.

   Whether you want to be ping when there is an unsuccessful check-in.
   Copy your Discord user ID which like `23456789012345678` and fill it in "quotes".
   You can refer to [this article](https://support.discord.com/hc/en-us/articles/206346498) to find your Discord user ID.
   If you don't want to be pinged, leave the "quotes" empty.

3. **discordWebhook** - Please enter the Discord webhook for the server channel to send notify.

   You can refer to [this article](https://support.discord.com/hc/en-us/articles/228383668) to create a Discord webhook.
   Once you have finished creating the Discord webhook, you will receive your Discord webhook URL, which like `https://discord.com/api/webhooks/1234567890987654321/PekopekoPekopekoPekopeko06f810494a4dbf07b726924a5f60659f09edcaa1`.
   Copy the webhook URL and paste it in "quotes".

</details>

<details>
<summary><b>telegram notify settings (only for <a href="https://github.com/canaria3406/hoyolab-auto-sign/blob/main/src/main-telegram.gs">Telegram version</a>)</b></summary>

```javascript
const telegram_notify = true
const myTelegramID = "1XXXXXXX0"
const telegramBotToken = "6XXXXXXXXX:AAAAAAAAAAXXXXXXXXXX8888888888Peko"
```

1. **telegram_notify**

   Whether to enable Telegram notify.
   If you want to enable auto check in notify, set it to true. If not, please set it to false.

2. **myTelegramID** - Please enter your Telegram ID.

   Use the `/getid` command to find your Telegram user ID by messaging [@IDBot](https://t.me/myidbot).
   Copy your Telegram ID which like `123456780` and fill it in "quotes".

3. **telegramBotToken** - Please enter your Telegram Bot Token.

   Use the `/newbot` command to create a new bot on Telegram by messaging [@BotFather](https://t.me/botfather).
   Once you have finished creating the bot, you will receive your Telegram Bot Token, which like `110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`.
   Copy your Telegram Bot Token and fill it in "quotes".
   For more detailed instructions, you can refer to [this article](https://core.telegram.org/bots/features#botfather).

</details>

## Demo
If auto check in process is success, it will send "OK".
If you have already check in today, it will send "Traveler/Trailblazer/Captain, you've already checked in today" or display the actual API message.

### Important Notes

- **Endfield Token Refresh**: The script automatically refreshes Endfield tokens for secure and persistent authentication.
- **Proper Signature Generation**: Endfield uses HMAC-SHA256 → MD5 signature algorithm.
  - Signature algorithm discovered by [HHim8826](https://gist.github.com/HHim8826)
  - Endfield sign-in script inspired by [cptmacp's gist](https://gist.github.com/cptmacp/1e9a9f20f69c113a0828fea8d13cb34c)
  - Special thanks to [@HHim8826](https://github.com/HHim8826) and [@cptmacp](https://github.com/cptmacp) for implementation
- **Error Handling**: The script properly distinguishes between:
  - "Already Checked In" (retcode -5003) - Treated as success, not an error
  - "Check-in Successful" (retcode 0) - Successful check-in
  - CAPTCHA Blocked - Error, script continues with other games
  - Other Errors - Error with details from API
- **Logging**: Comprehensive logging for debugging including token refresh, check-in status, and error details.

 <details>
<summary><b>Single HoYoLAB account auto check-in with Discord notification and ping.</b></summary>
Enable Genshin Impact and Honkai: Star Rail auto check in, enable Discord notify, ping in Discord.

```javascript
const profiles = [
  {
    accountName: "HuTao",
    hoyoGames: {
      token: "account_mid_v2=123xyzabcd_hi; account_id_v2=26XXXXX20; ltoken_v2=v2_CANARIAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX3406; ltmid_v2=123xyzabcd_hi; ltuid_v2=26XXXXX20;",
      genshin: true,
      honkai_star_rail: true
    }
  }
];

const discord_notify = true
const myDiscordID = "240000800000300040"
const discordWebhook = "https://discord.com/api/webhooks/10xxxxxxxxxxxxxxx60/6aXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXnB"
```
![image](https://github.com/canaria3406/hoyolab-auto-sign/blob/main/pic/E02.png)

</details>

 <details>
<summary><b>Two HoYoLAB accounts auto check-in with Telegram notification.</b></summary>
Enable Genshin Impact auto check in on accountA, Honkai Impact 3rd auto check in on accountB, enable Telegram notify.

```javascript
const profiles = [
  {
    accountName: "accountA",
    hoyoGames: {
      token: "account_mid_v2=123xyzabcd_hi; account_id_v2=26XXXXX20; ltoken_v2=v2_GENSHINXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX5566; ltmid_v2=123xyzabcd_hi; ltuid_v2=26XXXXX20;",
      genshin: true
    }
  },
  {
    accountName: "accountB",
    hoyoGames: {
      token: "account_mid_v2=456qwertyu_hi; account_id_v2=28XXXXX42; ltoken_v2=v2_GENSHINXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX5566; ltmid_v2=456qwertyu_hi; ltuid_v2=28XXXXX42;",
      honkai_3: true
    }
  }
];

const telegram_notify = true
const myTelegramID = "1XXXXXXX0"
const telegramBotToken = "6XXXXXXXXX:AAAAAAAAAAXXXXXXXXXX8888888888Peko"
```
![image](https://github.com/canaria3406/hoyolab-auto-sign/blob/main/pic/E03.png)

</details>

## Changelog
2022-12-30 Project launched.
2023-04-27 Add support for Honkai Impact 3rd, and Honkai: Star Rail.
2023-04-27 Add switch for Discord notify.
2023-05-12 Update get token process[#2](https://github.com/canaria3406/hoyolab-auto-sign/pull/2).
2023-05-12 Add Telegram notify support[#3](https://github.com/canaria3406/hoyolab-auto-sign/pull/3).
2023-05-13 Support multiple HoYoLAB accounts[#4](https://github.com/canaria3406/hoyolab-auto-sign/pull/4).
2026-01-28 Add Endfield auto sign-in support.
2026-02-02 Major refactoring with improved error handling, logging, and code organization.
  - Separated `hoyoGames` and `endfield` configuration for better clarity
  - Added dedicated `hoyoSignIn()` function for HoYoLab games
  - Implemented proper Endfield signature generation (HMAC-SHA256 → MD5) with auto token refresh
  - Enhanced error handling to distinguish between "already checked in" (success) and actual errors
  - Added comprehensive logging throughout script
  - Implemented continue-on-error pattern to process all games even when some fail
  - Separate Discord notifications per profile instead of squishing all results together
  - Credit to [HHim8826](https://github.com/HHim8826) for signature algorithm discovery
  - Credit to [cptmacp](https://github.com/cptmacp) for Endfield script inspiration