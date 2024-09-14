const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'nome',
    description: 'Consulta informações de uma pessoa pelo nome.',
    async run(app, message, args) {
        const nome = args.join(' '); // Juntar todos os argumentos para formar o nome

        if (!nome) {
            return message.reply('Por favor, forneça um nome válido.');
        }

        const headers = {
            Accept: 'application/json, text/plain, */*',
            Referer: 'https://si-pni.saude.gov.br/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.76',
        };

        try {
            // Obter token de acesso
            const response1 = await axios.post(
                'https://servicos-cloud.saude.gov.br/pni-bff/v1/autenticacao/tokenAcesso',
                null,
                { headers, auth: { username: email, password } }
            );

            const accessToken = response1.data.accessToken;

            // Consultar informações pelo nome
            const response2 = await axios.get(
                `https://servicos-cloud.saude.gov.br/pni-bff/v1/cidadao/nome/${encodeURIComponent(nome)}`,
                { headers: { ...headers, Authorization: `Bearer ${accessToken}` } }
            );

            const data = response2.data.records ? response2.data.records[0] : null;

            if (!data) {
                return message.reply('Nenhuma informação encontrada para o nome fornecido.');
            }

            const telefones = data.telefone || [];
            const telefone = telefones.length > 0 ? telefones[0] : {};
            const ddd = telefone.ddd || '';
            const numero = telefone.numero || '';

            const embed = new MessageEmbed()
                .setTitle('🔍 𝗖𝗢𝗡𝗦𝗨𝗟𝗧𝗔 𝗣𝗢𝗥 𝗡𝗢𝗠𝗘 🔍')
                .setColor('#333333')
                .setDescription(
                    `• NOME: ${nome}\n` +
                    `• CPF: ${data.cpf || 'Sem Informação'}\n` +
                    `• CNS: ${data.cnsDefinitivo || 'Sem Informação'}\n` +
                    `• NASCIMENTO: ${data.dataNascimento || 'Sem Informação'}\n` +
                    `• MÃE: ${data.nomeMae || 'Sem Informação'}\n` +
                    `• PAI: ${data.nomePai || 'Sem Informação'}\n` +
                    `• ENDEREÇO:\n` +
                    `${data.endereco?.logradouro || 'Sem Informação'}, ${data.endereco?.numero || 'Sem Informação'} - ${data.endereco?.bairro || 'Sem Informação'}, ${data.endereco?.siglaUf || 'Sem Informação'} - ${data.endereco?.cep || 'Sem Informação'}\n` +
                    `• TELEFONE\n` +
                    `(${ddd}) ${numero} - DESCONHECIDA\n` +
                    `• Ikaruh7`
                )
                .setFooter('Ikaruh7');

            const msg = await message.channel.send({ embeds: [embed] });
            setTimeout(() => msg.delete(), 100000); // Deleta a mensagem após 100 segundos
            message.delete(); // Deleta o comando original
        } catch (error) {
            console.error(`Erro ao consultar nome: ${error.message}`);
            message.reply('Houve um erro ao consultar o nome. Tente novamente mais tarde.');
        }
    },
};