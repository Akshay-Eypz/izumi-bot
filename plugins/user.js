const { izumi,mode, isAdmin, formatTime,parsedJid} = require("../lib");
const { downloadContentFromMessage } = require('@adiwajshing/baileys');
const config = require('../config'); // adjust the path if needed
izumi(
  {
    pattern: 'block ?(.*)',
    fromMe: true,
    desc: "Block a person",
    type: "user",
  },
  async (message, match) => {
    if (message.isGroup) {
      let jid = message.mention[0] || message.reply_message.jid;
      if (!jid) return await message.reply("_Reply to a person or mention_");
      await message.block(jid);
      return await message.sendMessage(
        `_@${jid.split("@")[0]} Blocked_`,
        {
          mentions: [jid],
        }
      );
    } else {
      await message.block(message.jid);
      return await message.reply("_User blocked_");
    }
  }
);

izumi(
  {
    pattern: "unblock",
    fromMe: true,
    desc: "Unblock a person",
    type: "user",
  },
  async (message, match) => {
    if (message.isGroup) {
      let jid = message.mention[0] || message.reply_message.jid;
      if (!jid) return await message.reply("_Reply to a person or mention_");
      await message.unblock(jid);
      return await message.sendMessage(
        message.jid,
        `_@${jid.split("@")[0]} unblocked_`,
        {
          mentions: [jid],
        }
      );
    } else {
      await message.unblock(message.jid);
      return await message.reply("_User unblocked_");
    }
  }
);
izumi(
  {
    pattern: "forward ?(.*)",
    fromMe: true,
    desc: "Forwards the replied Message",
    type: "user",
  },
  async (message, match) => {
    if (!message.quoted) return message.reply('Reply to something');
    
    let jids = parsedJid(match);
    for (let i of jids) {
      const eypz = {
        text: message.quoted ? message.quoted.message : "Replied message",
        contextInfo: {
          isForwarded: false
        }
      };
      
      await message.forwardMessage(i, message.reply_message.data, eypz);
    }
  }
);
 izumi({
    pattern: "ping",
    fromMe: mode,
    desc: "Bot response in second.",
    type: "info",
}, async (message, match, client) => {
    let thumbnail = 'https://i.im.ge/2024/05/23/KdOx1z.alexa.png';
    let vcardMessage = {
        key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: 'status@broadcast' },
        message: {
            contactMessage: {
                displayName: config.BOT_NAME,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:Izumi-v3\nitem1.TEL;waid=${message.sender.split('@')[0]}:${message.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
            },
        },
    };
    
    const start = new Date().getTime();
    
    // Send the initial "Pinging..." message
    let pingMsg = await client.sendMessage(message.jid, { text: 'Pinging...' }, { quoted: vcardMessage });

    const end = new Date().getTime();
    const ms = end - start;

    await client.relayMessage(
        message.jid,
        {
            protocolMessage: {
                key: pingMsg.key,
                type: 14,
                editedMessage: {
                    conversation: `Pong ${ms}ms`,
                },
            },
        },
        {}
    );
});

izumi({
	pattern: "jid ?(.*)",
	fromMe: mode,
	desc: 'To get remoteJid',
	type: 'info'
}, async (message) => {
	await message.send(message.mention[0] ? message.mention[0] : message.quoted ? message.quoted.sender : message.chat)
});
izumi({
	pattern: 'runtime$',
	fromMe: mode,
	desc: 'Get bots runtime',
	type: 'info'
}, async (message, match, client) => {
	await message.reply(formatTime(process.uptime()));
});
izumi(
	{
		pattern: 'save ?(.*)',
		fromMe: mode,
		desc: 'forward replied msg to u',
		type: 'misc',
	},
	async (message, match) => {
		if (!message.reply_message)
			return await message.send('*Reply to a message*');
		await message.forwardMessage(message.sender, message.quoted.data);
	}
);
