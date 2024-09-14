const Discord = require('discord.js');
const { prefix, color } = require('../../config.json');
const request = require('request'); // Requisição HTTP

module.exports.run = (client, message, args) => {
  message.delete(); // Deleta a mensagem do usuário
  if (!args[0]) return message.channel.send(`${message.author}, Formato correto: ${prefix}ip <ip>`);

  var options = {
    url: `https://ipfind.co/?ip=${args[0]}&auth=f1b781f3-de50-4d93-95e9-faabebc43e7c`
  };

  request(options, function (error, response, body) {
    try {
      let dados = JSON.parse(body);

      let ipaddress = dados.ip_address;
      if (!ipaddress) {
        return message.reply("IP não encontrado na base de dados!");
      }

      let country = dados.country || 'Não Encontrado';
      let countrycode = dados.country_code || 'Não Encontrado';
      let continent = dados.continent || 'Não Encontrado';
      let continentcode = dados.continent_code || 'Não Encontrado';
      let timezone = dados.timezone || 'Não Encontrado';
      let languages = dados.languages || 'Não Encontrado';
      let currency = dados.currency || 'Não Encontrado';
      let city = dados.city || 'Não Encontrado';
      let org = dados.org || 'Não Encontrado';
      let postalcode = dados.postal_code || 'Não Encontrado';
      let regioncode = dados.region_code || 'Não Encontrado';
      let latitude = dados.latitude || 'Não Encontrado';
      let longitude = dados.longitude || 'Não Encontrado';

      // Criação do embed usando EmbedBuilder (v14)
      const embed = new Discord.EmbedBuilder()
        .setTitle(`CONSULTA POR IP`)
        .setColor(color)
        .setFooter({ text: `Pedido por: ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setThumbnail(message.guild.iconURL({ dynamic: true, size: 1024 }))
        .setDescription(`
          > __**ESTADO**__ - ${country}
          > __**SIGLA DO ESTADO:**__ - ${countrycode}
          > __**CONTINENTE**__ - ${continent}
          > __**CÓDIGO DO CONTINENTE**__ - ${continentcode}
          > __**IP**__ - ${ipaddress}
          > __**HORÁRIO**__ - ${timezone}
          > __**LÍNGUAS**__ - ${languages}
          > __**MOEDA**__ - ${currency}
          > __**CIDADE**__ - ${city}
          > __**INTERNET**__ - ${org}
          > __**CÓDIGO POSTAL**__ - ${postalcode}
          > __**CÓDIGO DA REGIÃO**__ - ${regioncode}
          > __**LATITUDE**__ - ${latitude}
          > __**LONGITUDE**__ - ${longitude}
        `);

      // Envia o embed sem excluir a mensagem
      message.channel.send({ embeds: [embed] });

    } catch (e) {
      console.log(e.name, e.message);
    }
  });
};