const Discord = require('discord.js');
const { exec } = require('child_process'); // Para obter o uso da CPU
const request = require('request');
const colors = require('colors');
const axios = require('axios');
const { GatewayIntentBits } = require('discord.js');

const app = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// AQUI PEGARÁ DO CONFIG.JSON AS STRING'S DEFINIDAS NO JSON PARA UTILIZAR NO APP.JS
const { token, prefix, color, logChannelId, infoChannelId } = require("./config.json");

// Comandos de status a serem alternados
const statuses = [
    'Por y2k', // Substitua por seu status desejado
    'Melhor Consult Bot'  // Substitua por seu status desejado
];

let currentStatusIndex = 0;

// Atualiza o status do bot a cada 5 segundos
function updateStatus() {
    currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
    app.user.setPresence({
        activities: [{ name: statuses[currentStatusIndex] }],
        status: 'online' // Pode ser 'online', 'idle', 'dnd', 'invisible'
    });
}

// Alterna o status a cada 5 segundos
setInterval(updateStatus, 5000);

app.on('messageCreate', message => {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;
    if (message.content.startsWith(`<@!${app.user.id}>`) || message.content.startsWith(`<@${app.user.id}>`)) return;

    const args = message.content
        .trim().slice(prefix.length)
        .split(/ +/g);
    const command = args.shift().toLowerCase();

    try {
        const consultar_cmdh = require(`./src/comandos/${command}.js`);
        consultar_cmdh.run(app, message, args);

        // Enviar informações do comando para o canal de logs
        const logChannel = app.channels.cache.get(logChannelId);
        if (logChannel) {
            const embed = new Discord.EmbedBuilder()
                .setTitle('📋 Comando Executado')
                .setColor(color)
                .setDescription(`**Usuário:** ${message.author.tag} \n**Comando:** ${command} \n**Canal:** ${message.channel.name}`)
                .setFooter({ text: `ID do usuário: ${message.author.id}` })
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }

    } catch (err) {
        console.error('Erro:' + err);
    }
});

// Função para obter o uso da CPU
function getCpuUsage(callback) {
    exec('wmic cpu get loadpercentage', (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro ao obter uso da CPU: ${error.message}`);
            return callback('Não disponível');
        }
        if (stderr) {
            console.error(`Erro: ${stderr}`);
            return callback('Não disponível');
        }
        callback(stdout.trim().split('\n')[1] + '%');
    });
}

// Função para enviar informações sobre o bot
function sendBotInfo() {
    const infoChannel = app.channels.cache.get(infoChannelId);
    if (infoChannel) {
        const uptime = Math.floor(app.uptime / 1000 / 60 / 60); // Uptime em horas
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2); // Uso de memória em MB


            const embed = new Discord.EmbedBuilder()
                .setTitle('📊 Informações do Bot')
                .setColor(color)
                .addFields(
                    { name: 'Ping do Bot', value: `${app.ws.ping} ms`, inline: true },
                    { name: 'Dono do Bot', value: `<@${app.ownerId}>`, inline: true },
                    { name: 'Horas Ativo', value: `${uptime} horas`, inline: true },
                    { name: 'Uso de Memória', value: `${memoryUsage} MB`, inline: true },
                    { name: 'Servidores', value: `${app.guilds.cache.size}`, inline: true }
                )
                .setFooter({ text: 'Informações do Bot' })
                .setTimestamp();

            infoChannel.send({ embeds: [embed] });
        };
    }


// Envia informações do bot a cada 5 horas
setInterval(sendBotInfo, 5 * 60 * 60 * 1000); // 5 horas em milissegundos

app.on("ready", () => {
    console.log('Bot consultor feito por: '.green + "y2k'#0001".red);
    console.log('Logado no bot: '.green + `${app.user.tag}`.red);
    // Define o status inicial
    updateStatus();
    // Envia as informações do bot imediatamente após o início
    sendBotInfo();
});

// AQUI ELE LOGARÁ PELO TOKEN DO BOT
app.login(token);
