const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inicialização robusta com prevenção de Timeouts e correção do erro "t: t"
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // true para não abrir a janela do Chrome visivelmente
        timeout: 120000, // Aumenta o tempo de espera para 120 segundos (2 minutos)
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu' // Essencial no Windows para evitar lentidão no Chrome invisível
        ]
    },
    // 🔥 CORREÇÃO PARA O ERRO "t: t": Força uma versão estável do WhatsApp Web
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    }
});

// Evento: Gera o QR Code no terminal para ler com o telemóvel
client.on('qr', (qr) => {
    console.log('🤖 WhatsApp Bot: Escaneie o QR Code abaixo para ligar ao TermoSync:');
    qrcode.generate(qr, { small: true });
});

// Evento: Confirma que o WhatsApp ligou com sucesso
client.on('ready', () => {
    console.log('✅ WhatsApp Bot do TermoSync está ONLINE e pronto a enviar alertas!');
});

// Evento: Tratamento de erros para não crashar o Node
client.on('auth_failure', msg => {
    console.error('❌ WhatsApp Bot: Falha na autenticação', msg);
});

client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp Bot: Cliente desconectado', reason);
});

// Inicia o cliente
client.initialize().catch(err => console.error("Erro ao iniciar o WhatsApp:", err));

/**
 * Função exportada para o server.js enviar as mensagens
 */
const enviarAlertaWhatsApp = async (mensagem, filial) => {
    try {
        // 1. Número base com Código do País (55) + DDD (14) + Número
        const numeroLimpo = '5514991751894'; 
        
        // 2. Formatação obrigatória da API do WhatsApp (@c.us no final)
        const numeroDestino = `${numeroLimpo}@c.us`; 
        
        // Verifica se o bot já está pronto antes de tentar enviar
        if (client.info) {
            
            // 3. Verificação de segurança: Valida se o número tem WhatsApp ativo
            const isRegistered = await client.isRegisteredUser(numeroDestino);
            
            if (!isRegistered) {
                console.error(`[WhatsApp] ERRO: O número ${numeroDestino} não possui uma conta ativa de WhatsApp.`);
                return; // Aborta para não crashar
            }

            // 4. Envio da mensagem
            await client.sendMessage(numeroDestino, mensagem);
            console.log(`[WhatsApp] Alerta enviado com sucesso para a filial ${filial}`);
            
        } else {
            console.log(`[WhatsApp] Bot ainda não está pronto. Alerta ignorado: ${mensagem}`);
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem no WhatsApp:', error.message);
    }
};

module.exports = { enviarAlertaWhatsApp };