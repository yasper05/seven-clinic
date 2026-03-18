const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const db = require('./db');

// ============================================
// WHATSAPP CLIENT SETUP
// ============================================
const whatsappClient = new Client({
    authStrategy: new LocalAuth({ clientId: 'seven-clinic' }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let whatsappReady = false;

whatsappClient.on('qr', (qr) => {
    console.log('\n==========================================');
    console.log('SEVEN CLINIC - CONECTAR WHATSAPP');
    console.log('Abra o WhatsApp do número da Seven Clinic');
    console.log('e escaneie o QR Code abaixo:');
    console.log('==========================================\n');
    qrcode.generate(qr, { small: true });
});

whatsappClient.on('ready', () => {
    whatsappReady = true;
    console.log('[WHATSAPP] ✅ WhatsApp da Seven Clinic conectado e pronto!');
});

whatsappClient.on('auth_failure', () => {
    console.error('[WHATSAPP] ❌ Falha de autenticação. Delete a pasta .wwebjs_auth e reinicie.');
});

whatsappClient.on('disconnected', (reason) => {
    whatsappReady = false;
    console.warn('[WHATSAPP] ⚠️ Desconectado:', reason);
});

// Inicia a conexão com o WhatsApp (erro não fatal - esperamos o QR Code)
whatsappClient.initialize().catch((err) => {
    console.warn('[WHATSAPP] ⚠️ Falha ao iniciar WhatsApp (normal antes do QR scan):', err.message);
});

// ============================================
// HELPERS
// ============================================

/**
 * Formata um número de telefone brasileiro para o formato do WhatsApp
 * Ex: "41989028503" -> "5541989028503@c.us"
 */
function formatarNumeroWhatsApp(telefone) {
    // Remove tudo que não for dígito
    let numero = String(telefone).replace(/\D/g, '');
    // Adiciona código do país 55 se não tiver
    if (!numero.startsWith('55')) {
        numero = '55' + numero;
    }
    return numero + '@c.us';
}

/**
 * Envia uma mensagem WhatsApp para um número
 */
async function enviarMensagemWhatsApp(telefone, mensagem) {
    if (!whatsappReady) {
        console.warn('[WHATSAPP] Não conectado, mensagem não enviada para:', telefone);
        return false;
    }
    try {
        const numero = formatarNumeroWhatsApp(telefone);
        await whatsappClient.sendMessage(numero, mensagem);
        console.log('[WHATSAPP] ✅ Mensagem enviada para:', telefone);
        return true;
    } catch (err) {
        console.error('[WHATSAPP] ❌ Erro ao enviar para', telefone, ':', err.message);
        return false;
    }
}

// ============================================
// LEMBRETES AGENDADOS
// ============================================

/**
 * Busca agendamentos para uma data específica (formato YYYY-MM-DD)
 */
function buscarAgendamentosPorData(dataISO) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                a.id, a.data_hora, a.status,
                u.nome AS cliente_nome, u.telefone AS cliente_telefone,
                p.nome AS procedimento_nome
            FROM agendamentos a
            JOIN usuarios u ON a.usuario_id = u.id
            JOIN procedimentos p ON a.procedimento_id = p.id
            WHERE DATE(a.data_hora) = ?
              AND a.status = 'pendente'
        `;
        db.all(sql, [dataISO], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

/**
 * Formata a data/hora de um agendamento em texto legível
 * Ex: "2026-03-18 14:30:00" -> "14h30" e "18/03"
 */
function formatarDataHora(dataHoraStr) {
    const dt = new Date(dataHoraStr);
    const hora = dt.getHours().toString().padStart(2, '0');
    const min = dt.getMinutes().toString().padStart(2, '0');
    const dia = dt.getDate().toString().padStart(2, '0');
    const mes = (dt.getMonth() + 1).toString().padStart(2, '0');
    return { hora: `${hora}h${min}`, data: `${dia}/${mes}` };
}

/**
 * CRON: Todo dia às 9h — lembrete para agendamentos de AMANHÃ
 */
cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Verificando agendamentos de amanhã para lembrete...');

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dataAmanha = amanha.toISOString().split('T')[0]; // YYYY-MM-DD

    try {
        const agendamentos = await buscarAgendamentosPorData(dataAmanha);
        console.log(`[CRON] ${agendamentos.length} agendamento(s) para amanhã (${dataAmanha})`);

        for (const ag of agendamentos) {
            if (!ag.cliente_telefone) continue;
            const { hora, data } = formatarDataHora(ag.data_hora);
            const primeiroNome = ag.cliente_nome.split(' ')[0];

            const mensagem =
                `Olá, ${primeiroNome}! 💆‍♀️\n\n` +
                `Passamos para *confirmar seu agendamento amanhã (${data})* às *${hora}* na Seven Clinic.\n\n` +
                `✨ Serviço: *${ag.procedimento_nome}*\n\n` +
                `Por favor, responda *SIM* para confirmar ou *NÃO* caso precise cancelar.\n\n` +
                `Te esperamos! 🌸 — Equipe Seven Clinic`;

            await enviarMensagemWhatsApp(ag.cliente_telefone, mensagem);

            // Pequena pausa entre envios para não ser bloqueado
            await new Promise(r => setTimeout(r, 3000));
        }
    } catch (err) {
        console.error('[CRON] Erro ao processar lembretes de amanhã:', err.message);
    }
}, { timezone: 'America/Sao_Paulo' });

/**
 * CRON: Todo dia às 8h — lembrete para agendamentos de HOJE
 */
cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Verificando agendamentos de hoje para lembrete...');

    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
        const agendamentos = await buscarAgendamentosPorData(hoje);
        console.log(`[CRON] ${agendamentos.length} agendamento(s) para hoje (${hoje})`);

        for (const ag of agendamentos) {
            if (!ag.cliente_telefone) continue;
            const { hora } = formatarDataHora(ag.data_hora);
            const primeiroNome = ag.cliente_nome.split(' ')[0];

            const mensagem =
                `Bom dia, ${primeiroNome}! ☀️\n\n` +
                `Lembrando que seu agendamento na *Seven Clinic* é *hoje* às *${hora}*.\n\n` +
                `✨ Serviço: *${ag.procedimento_nome}*\n\n` +
                `Nos vemos em breve! 💖 — Equipe Seven Clinic`;

            await enviarMensagemWhatsApp(ag.cliente_telefone, mensagem);

            // Pequena pausa entre envios
            await new Promise(r => setTimeout(r, 3000));
        }
    } catch (err) {
        console.error('[CRON] Erro ao processar lembretes de hoje:', err.message);
    }
}, { timezone: 'America/Sao_Paulo' });

console.log('[CRON] ✅ Lembretes de WhatsApp agendados: 8h (hoje) e 9h (amanhã)');

module.exports = { enviarMensagemWhatsApp, whatsappClient };
