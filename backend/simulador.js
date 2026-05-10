/**
 * ============================================================================
 * ROBÔ SIMULADOR IoT (DIGITAL TWIN) - TermoSync Enterprise NOC
 * Versão: 7.2 | STRESS TEST ESTÁVEL, ANTI-CRASH & BATCH PROCESSING
 * ============================================================================
 */

const axios = require('axios');
const API_URL = 'http://127.0.0.1:3000/api';
const LOGIN_SIMULADOR = { usuario: 'admin_master', senha: '123456' };

// CONFIGURAÇÃO DE VELOCIDADE (Tempo Real)
const INTERVALO_TELEMETRIA = 2000; // 2 Segundos - Injeção contínua

// CÓDIGOS DE COR PARA O TERMINAL (NOC UI)
const COLORS = {
  reset: "\x1b[0m", bold: "\x1b[1m", cyan: "\x1b[36m", green: "\x1b[32m",
  yellow: "\x1b[33m", red: "\x1b[31m", blue: "\x1b[34m", magenta: "\x1b[35m", gray: "\x1b[90m"
};

let tokenAtivo = '';
let historicoTemperaturas = {}; 
let historicoUmidades = {}; 
let tickCount = 0;

console.log(`${COLORS.magenta}${COLORS.bold}
=========================================================
  [ TermoSync NOC ] - MOTOR DE TELEMETRIA (CAOS MÁXIMO)
  Frequência de Injeção: ${INTERVALO_TELEMETRIA}ms
=========================================================${COLORS.reset}`);

/**
 * AUTENTICAÇÃO COM ANTI-CRASH
 */
async function autenticar() {
  try {
    process.stdout.write(`${COLORS.yellow}⏳ A estabelecer handshake seguro [${LOGIN_SIMULADOR.usuario}]... ${COLORS.reset}`);
    const res = await axios.post(`${API_URL}/login`, LOGIN_SIMULADOR);
    tokenAtivo = res.data.token;
    console.log(`${COLORS.green}✅ OK! Acesso Concedido. A iniciar telemetria...${COLORS.reset}\n`);
    return true;
  } catch (error) {
    console.log(`${COLORS.red}❌ FALHA! Servidor offline ou ligação recusada. Nova tentativa em 5s...${COLORS.reset}`);
    return false;
  }
}

/**
 * GERAÇÃO DE ANOMALIAS E DESPACHO TÉCNICO
 */
async function criarChamadoSimulado(eq, tipoFalha) {
  const falhas = {
    'MECANICA': 'URGENTE: O compressor parou inesperadamente e a máquina perdeu pressão de fluido refrigerante.',
    'PERDA_EFICIENCIA': 'Aviso de IA Preditiva: A máquina está a consumir muita energia para manter a temperatura. Fuga de gás provável.',
    'PORTA_ABERTA': 'ALERTA: A porta da câmara frigorífica encontra-se aberta ou com a vedação comprometida.',
    'REDE': 'TI / INFRA: O sensor IoT perdeu o sinal de rede e está a operar na memória local.',
    'METROLOGIA': 'QUALIDADE: O sensor térmico apresenta um desvio de leitura (necessita de recalibração urgente).'
  };

  const desc = falhas[tipoFalha] || 'Manutenção Preventiva Requisitada pelo Sistema Autónomo.';
  const tecnicos = ['Roberto Almeida', 'Fernando Costa', 'Carlos Silva', 'Equipa Noturna']; 
  const tecSorteado = tecnicos[Math.floor(Math.random() * tecnicos.length)];

  try {
    await axios.post(`${API_URL}/chamados`, {
      equipamento_id: eq.id,
      descricao: `[DIAGNÓSTICO AUTÓNOMO] ${desc}`,
      solicitante_nome: 'Robô TermoSync',
      tecnico_responsavel: tecSorteado
    }, { headers: { Authorization: `Bearer ${tokenAtivo}` } });
    
    console.log(`\n${COLORS.red}${COLORS.bold}🚨 [INCIDENTE DETETADO] -> ${eq.filial} | ${eq.nome}${COLORS.reset}`);
    console.log(`${COLORS.magenta}   > Despacho Técnico: ${tecSorteado || 'Fila Geral'}${COLORS.reset}`);
    console.log(`${COLORS.gray}   > Motivo: ${desc}${COLORS.reset}\n`);
    
  } catch (e) {
    // Falha silenciosa para manter o loop
  }
}

/**
 * TÉCNICO VIRTUAL (RESOLUÇÃO AUTÓNOMA)
 */
async function gerirChamadosPendentes() {
  try {
    const res = await axios.get(`${API_URL}/chamados`, { headers: { Authorization: `Bearer ${tokenAtivo}` } });
    const dados = Array.isArray(res.data) ? res.data : [];
    const chamados = dados.filter(c => c.status !== 'Concluído');

    for (let c of chamados) {
      if (c.urgencia === 'Pendente') {
        let urgenciaCalculada = 'Baixa';
        if (c.descricao.includes('URGENTE') || c.descricao.includes('parou')) urgenciaCalculada = 'Crítica';
        else if (c.descricao.includes('Preditiva') || c.descricao.includes('energia')) urgenciaCalculada = 'Alta';
        else if (c.descricao.includes('ALERTA') || c.descricao.includes('TI')) urgenciaCalculada = 'Média';

        await axios.put(`${API_URL}/chamados/${c.id}/urgencia`, { urgencia: urgenciaCalculada }, { headers: { Authorization: `Bearer ${tokenAtivo}` } });
      } 
      else if (Math.random() < 0.15) {
          const solucoes = [
            "Compressor substituído, vácuo realizado e sistema de gás purgado com sucesso.",
            "Detetada micro-fuga de gás. Soldadura efetuada e carga reposta.",
            "Borracha da porta substituída e fecho magnético ajustado.",
            "Módulo ESP32 reiniciado e reconetado à rede Wi-Fi da loja.",
            "Auditoria metrológica realizada. Sensor calibrado."
          ];
          const solucaoSorteada = solucoes[Math.floor(Math.random() * solucoes.length)];

          await axios.put(`${API_URL}/chamados/${c.id}/status`, { 
            status: 'Concluído', nota_resolucao: `[Auto-Fix] ${solucaoSorteada}` 
          }, { headers: { Authorization: `Bearer ${tokenAtivo}` } });

          console.log(`${COLORS.green}✅ [OS RESOLVIDA] Ordem de Serviço #${c.id} encerrada com sucesso.${COLORS.reset}`);
      }
    }
  } catch (error) {}
}

/**
 * MOTOR DE FÍSICA TERMODINÂMICA (DIGITAL TWIN)
 */
async function simularMaquina(eq) {
  let alertaForcado = null;
  let consumoKwh = 0.1; 
  let motorLigado = eq.motor_ligado ? 1 : 0;
  let emDegelo = eq.em_degelo ? 1 : 0;

  // PROBABILIDADES DE FALHA EXTREMAS (Chaos Monkey)
  if (motorLigado && !emDegelo && Math.random() < 0.025) { alertaForcado = 'PERDA_EFICIENCIA'; criarChamadoSimulado(eq, 'PERDA_EFICIENCIA'); }
  if (motorLigado && !emDegelo && !alertaForcado && Math.random() < 0.035) { alertaForcado = 'PORTA_ABERTA'; criarChamadoSimulado(eq, 'PORTA_ABERTA'); }
  if (!alertaForcado && Math.random() < 0.015) { alertaForcado = 'REDE'; criarChamadoSimulado(eq, 'REDE'); }
  if (!alertaForcado && Math.random() < 0.01) { alertaForcado = 'METROLOGIA'; criarChamadoSimulado(eq, 'METROLOGIA'); }
  
  // Degelos e Paragens de Motor
  if (motorLigado && !emDegelo && Math.random() < 0.015) {
    emDegelo = 1; motorLigado = 0; console.log(`${COLORS.blue}❄️  [SISTEMA] Ciclo de Degelo automático iniciado em: ${eq.nome}${COLORS.reset}`);
  } else if (motorLigado && !emDegelo && !alertaForcado && Math.random() < 0.02) {
    motorLigado = 0; criarChamadoSimulado(eq, 'MECANICA'); 
  } else if ((!motorLigado || emDegelo) && Math.random() < 0.15) {
    emDegelo = 0; motorLigado = 1; 
  }

  // --- LÓGICA TÉRMICA FÍSICA ---
  let tempAtual = historicoTemperaturas[eq.id] || parseFloat(eq.temp_min) + 1;
  const umidMinConfig = parseFloat(eq.umidade_min || 40);
  let umidAtual = historicoUmidades[eq.id] || umidMinConfig + 15; 
  const fator = parseFloat(eq.temp_min) < 0 ? 1.5 : 0.8; 
  const ideal = parseFloat(eq.temp_min) + ((parseFloat(eq.temp_max) - parseFloat(eq.temp_min)) / 2);

  if (emDegelo) { 
      tempAtual += (Math.random() * 0.2 + 0.05); umidAtual += (Math.random() * 1.5); consumoKwh = 2.8; 
  } else if (!motorLigado) { 
      tempAtual += (Math.random() * 0.3 + 0.1); umidAtual += (Math.random() * 0.8); consumoKwh = 0.08; 
  } else {
      if (alertaForcado === 'PORTA_ABERTA') { 
          tempAtual += (Math.random() * 0.4 + 0.1); umidAtual += (Math.random() * 2.5); consumoKwh = 5.8;
      } else if (alertaForcado === 'PERDA_EFICIENCIA') {
          tempAtual += (Math.random() * 0.1); consumoKwh = 4.9;
      } else if (tempAtual > ideal) { 
          tempAtual -= (Math.random() * (fator * 0.25) + 0.05); umidAtual -= (Math.random() * 0.5 + 0.1); consumoKwh = (Math.random() * 0.5) + 1.6; 
      } else { 
          tempAtual += (Math.random() * 0.15 - 0.05); umidAtual += (Math.random() * 0.4 - 0.2); consumoKwh = (Math.random() * 0.3) + 0.6; 
      }
  }

  // Travas de segurança termodinâmicas
  if (tempAtual > 35) tempAtual = 35; 
  if (tempAtual < -35) tempAtual = -35;
  if (umidAtual > 98) umidAtual = 98; 
  const floorSeguro = umidMinConfig + 2;
  if (umidAtual < floorSeguro) umidAtual = floorSeguro;

  historicoTemperaturas[eq.id] = tempAtual; 
  historicoUmidades[eq.id] = umidAtual;
  
  // --- FORMATAÇÃO ALINHADA DO TERMINAL (MATRIX STREAM) ---
  let statusColor = tempAtual > eq.temp_max ? COLORS.red : COLORS.cyan;
  const strFilial = `[${eq.filial}]`.padEnd(18);
  const strNome = eq.nome.padEnd(22);
  const strTemp = `${tempAtual.toFixed(2).padStart(6)}°C`;
  const strUmid = `${umidAtual.toFixed(1).padStart(5)}%`;
  const strPwr = `${consumoKwh.toFixed(2).padStart(5)} kW`;

  console.log(`${COLORS.gray}  ↳ ${strFilial} ${strNome} | ${statusColor}T: ${strTemp}${COLORS.gray} | ${COLORS.cyan}U: ${strUmid}${COLORS.gray} | ${COLORS.yellow}Pwr: ${strPwr}${COLORS.reset}`);

  try {
    // NOTA: As chaves 'umidade' e 'alerta_forcado' devem respeitar o schema da API (sem cedilhas/acentos)
    await axios.post(`${API_URL}/leituras`, { 
        equipamento_id: eq.id, temperatura: tempAtual.toFixed(2), umidade: umidAtual.toFixed(2), 
        consumo_kwh: consumoKwh.toFixed(2), alerta_forcado: alertaForcado, motor_ligado: motorLigado, em_degelo: emDegelo
    }, { headers: { Authorization: `Bearer ${tokenAtivo}` } });
  } catch (e) {}
}

/**
 * LOOP PRINCIPAL (CORE) COM BATCH PROCESSING
 */
async function executarSimulacao() {
  if (!tokenAtivo) { const sucesso = await autenticar(); if (!sucesso) return; }
  try {
    const resEquip = await axios.get(`${API_URL}/equipamentos`, { headers: { Authorization: `Bearer ${tokenAtivo}` } });
    const equipamentos = Array.isArray(resEquip.data) ? resEquip.data : [];
    
    if(equipamentos.length === 0) {
      console.log(`${COLORS.yellow}⚠️ Banco de dados vazio. Registe equipamentos no painel web para iniciar o simulador.${COLORS.reset}`);
      return;
    }

    tickCount++;
    const msTime = new Date().toISOString().split('T')[1].replace('Z', '');
    console.log(`\n${COLORS.blue}${COLORS.bold}[CYCLE #${tickCount.toString().padStart(4, '0')}] ⚡ DATA STREAM ACTIVE [${msTime}]${COLORS.reset}`);
    
    // Processamento em lotes (Batches) para evitar saturação do servidor / ECONNRESET
    const TAMANHO_LOTE = 10;
    for (let i = 0; i < equipamentos.length; i += TAMANHO_LOTE) {
      const lote = equipamentos.slice(i, i + TAMANHO_LOTE);
      await Promise.all(lote.map(eq => simularMaquina(eq)));
      
      // Micro-pausa entre lotes (50ms) para dar tempo de respiração ao servidor Node.js
      await new Promise(r => setTimeout(r, 50));
    }
    
    // Limpa a consola a cada 20 ciclos
    if(tickCount % 20 === 0) console.clear();

    await gerirChamadosPendentes();

  } catch (error) { 
    if (error.response?.status === 401) tokenAtivo = ''; 
  }
}

async function iniciarLoopSeguro() {
  await executarSimulacao();
  setTimeout(iniciarLoopSeguro, tokenAtivo ? INTERVALO_TELEMETRIA : 5000);
}

// Inicializa o Robô
iniciarLoopSeguro();