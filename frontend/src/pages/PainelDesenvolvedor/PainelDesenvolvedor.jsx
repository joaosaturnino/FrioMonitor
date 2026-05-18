import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ShieldAlert, Zap, Database, Cpu, Eye, EyeOff as EyeClosed, Power,
  Settings2, Activity, Globe, Lock, Wrench, Server, Droplets, Archive,
  History, Store, Sliders, ToggleLeft, ToggleRight, FileOutput, Volume2,
  Wifi, MessageSquareOff, Users, Eraser, CreditCard, CheckCircle2, AlertTriangle,
  Building2, BrainCircuit, ActivitySquare, Network, Receipt, TrendingUp,
  DownloadCloud, DollarSign, Send, FileText, Banknote, Calendar, Percent, Cloud,
  ChevronUp, ChevronDown, Terminal, RefreshCw, Mail, ShieldX, Key, UserCheck, LineChart,
  ShieldCheck, Fingerprint, UserX, MapPin, Clock, PieChart, FileSpreadsheet // Ícones adicionados
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './PainelDesenvolvedor.css';

import GestaoEmpresas from '../GestaoEmpresas/GestaoEmpresas';

const BootScreen = ({ onComplete }) => {
  const [logs, setLogs] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [logs, showInput]);

  useEffect(() => {
    let isMounted = true;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const genHex = () => Math.random().toString(16).substring(2, 10).toUpperCase();

    const runBootSequence = async () => {
      const sequence = [
        { text: "TermoSync BIOS (C) 2026 TermoSync Corp. NOC Division", delay: 200, color: '#94a3b8' },
        { text: "CPU: AMD EPYC 9754 128-Core Processor", delay: 100 },
        { text: "Memory: 1048576 MB RAM - OK", delay: 50 },
        { text: "Loading kernel TermoSync OS v10.5 Enterprise...", delay: 300 }
      ];

      for (let i = 0; i < 25; i++) {
        sequence.push({ 
          text: `[ ${(Math.random() * 2).toFixed(6)}] Loading module 0x${genHex()}... OK`, 
          delay: 10 + Math.random() * 15, 
          color: '#475569' 
        });
      }

      sequence.push(
        { text: "[  OK  ] Initializing hardware watchdogs...", delay: 150 },
        { text: "Establishing uplink to core servers... [ 104.28.192.12 ]", delay: 250 },
        { text: "[  OK  ] Handshake accepted. Tunnel secured.", delay: 100, color: '#10b981' },
        { text: "Loading user profile DEV_ROOT...", delay: 200 },
        { text: "Decrypting master access tokens (AES-256): [████████████████████] 100%", delay: 350 },
        { text: "[  OK  ] Token decrypted.", delay: 100, color: '#10b981' },
        { text: "Mounting Multi-Tenant Database Clusters...", delay: 250 },
        { text: "Waking NOC (Network Operations Center) daemons...", delay: 200 },
        { text: "[ WARN ] SUPERVISOR MODE ACTIVATED.", delay: 400, color: '#eab308', isBold: true },
        { text: "[ WARN ] IDS ENGAGING LOCKDOWN PROTOCOL.", delay: 300, color: '#ef4444', isBold: true },
        { text: "SYSTEM RESTRICTED.", delay: 200, color: '#ef4444', isBold: true },
        { text: "ROOT IDENTIFICATION REQUIRED TO PROCEED.", delay: 150, color: '#cbd5e1', isBold: true }
      );

      for (let i = 0; i < sequence.length; i++) {
        if (!isMounted) return;
        await sleep(sequence[i].delay);
        setLogs(prev => [...prev, sequence[i]]);
      }

      if (isMounted) setShowInput(true);
    };

    runBootSequence();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => { if (showInput && inputRef.current && !isProcessing) inputRef.current.focus(); }, [showInput, isProcessing]);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!passcode.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setShowInput(false);
    
    const secretKey = "root";
    const typed = passcode;
    setPasscode('');
    
    setLogs(prev => [...prev, { text: `root@termosync:~$ ${typed}`, color: 'var(--primary)' }]);
    
    await new Promise(r => setTimeout(r, 400));
    setLogs(prev => [...prev, { text: "Verifying cryptographic signature...", color: '#94a3b8' }]);
    
    await new Promise(r => setTimeout(r, 600));
    
    if (typed.toLowerCase() === secretKey) {
      setLogs(prev => [...prev, { text: "Compiling hash [0x9A4B...21F] -> MATCH", color: '#10b981' }]);
      await new Promise(r => setTimeout(r, 300));
      setLogs(prev => [...prev, { text: "[  OK  ] AUTHENTICATION SUCCESSFUL.", color: '#10b981', isBold: true }]);
      setLogs(prev => [...prev, { text: "Unlocking SaaS modules and root privileges...", color: '#94a3b8' }]);
      await new Promise(r => setTimeout(r, 800));
      onComplete();
    } else {
      setLogs(prev => [...prev, { text: "Compiling hash [0x9A4B...21F] -> MISMATCH", color: '#ef4444' }]);
      await new Promise(r => setTimeout(r, 300));
      setLogs(prev => [...prev, { text: "[ FAIL ] ACCESS DENIED. INTRUSION ATTEMPT LOGGED.", color: '#ef4444', isBold: true }]);
      await new Promise(r => setTimeout(r, 500));
      setShowInput(true);
      setIsProcessing(false);
    }
  };

  return (
    <div className="root-boot-screen" onClick={() => { if (showInput) inputRef.current?.focus(); }}>
      <div className="boot-terminal">
        <div style={{ color: '#94a3b8', marginBottom: '15px', zIndex: 3 }}>
          TermoSync Core OS [Build 10042]<br />
          (c) TermoSync Corp. Todos os direitos reservados.
        </div>

        {logs.map((log, index) => (
          <div key={index} className="boot-log" style={{ color: log.color || '#cbd5e1', fontWeight: log.isBold ? 'bold' : 'normal' }}>
            {log.text.startsWith('root@') ? log.text : log.text}
          </div>
        ))}

        {showInput && (
          <form onSubmit={handleAuth} style={{ display: 'flex', marginTop: '5px', zIndex: 3 }}>
            <span style={{ color: 'var(--primary)', marginRight: '8px' }}>root@termosync:~$</span>
            <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
              <input 
                ref={inputRef} 
                type="password" 
                value={passcode} 
                onChange={e => setPasscode(e.target.value)} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'white', 
                  outline: 'none', 
                  fontFamily: 'inherit', 
                  fontSize: 'inherit', 
                  width: '100%',
                  caretColor: 'transparent'
                }} 
                autoComplete="off" 
                disabled={isProcessing}
              />
              <span className="boot-cursor-blink" style={{ position: 'absolute', left: `${passcode.length * 8.5}px`, top: '1px' }}></span>
            </div>
          </form>
        )}
        <div ref={bottomRef} style={{ paddingBottom: '20px' }} />
      </div>
    </div>
  );
};

export default function PainelDesenvolvedor({ api, abaAtiva, isDevAuthenticated, onAuthenticate, showToast, sysConfig, updateSysConfig, tocarAlarme, usuariosLista, filiaisDb, setModalConfig }) {
  const [terminalLogs, setTerminalLogs] = useState([]);
  const addLog = useCallback((text, status = 'info') => { setTerminalLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text, status }]); }, []);

  if (!isDevAuthenticated) {
    return <BootScreen onComplete={() => { onAuthenticate(); addLog("Sessão Master estabelecida. Controle absoluto liberado.", "success"); }} />;
  }

  return (
    <div className="dev-os-container anim-fade-in">
      <div className="dev-os-workspace">
        <div className="dev-os-content">
          {abaAtiva === 'empresas' && <GestaoEmpresas api={api} showToast={showToast} setModalConfig={setModalConfig} />}
          {abaAtiva === 'dev_panel' && <TelaNOC showToast={showToast} sysConfig={sysConfig} updateSysConfig={updateSysConfig} tocarAlarme={tocarAlarme} usuariosLista={usuariosLista} addLog={addLog} />}
          {abaAtiva === 'saas' && <TelaSaaS api={api} sysConfig={sysConfig} updateSysConfig={updateSysConfig} filiaisDb={filiaisDb} showToast={showToast} addLog={addLog} />}
          {abaAtiva === 'billing' && <TelaBilling sysConfig={sysConfig} filiaisDb={filiaisDb} showToast={showToast} addLog={addLog} updateSysConfig={updateSysConfig} />}
          {abaAtiva === 'system' && <TelaSistema api={api} showToast={showToast} addLog={addLog} sysConfig={sysConfig} updateSysConfig={updateSysConfig} />}
          {abaAtiva === 'soc' && <TelaSOC api={api} showToast={showToast} addLog={addLog} />}
          
          {/* TelaBI agora recebendo sysConfig e filiaisDb para os dados reais de billing */}
          {abaAtiva === 'bi' && <TelaBI api={api} showToast={showToast} addLog={addLog} sysConfig={sysConfig} filiaisDb={filiaisDb} />}
        </div>
        <TerminalFooter logs={terminalLogs} setLogs={setTerminalLogs} addLog={addLog} filiaisDb={filiaisDb} />
      </div>
    </div>
  );
}

const TelaNOC = ({ showToast, sysConfig, updateSysConfig, tocarAlarme, usuariosLista, addLog }) => {
  const [scopeType, setScopeType] = useState('ROLE');
  const [activeScope, setActiveScope] = useState('GLOBAL');
  const [metrics, setMetrics] = useState({ cpu: 12, ram: 42, ping: 14, reqs: 342 });
  const [apiTraffic, setApiTraffic] = useState([]);
  const [threats, setThreats] = useState([]);
  const trafficContainerRef = useRef(null);

  useEffect(() => {
    const i1 = setInterval(() => setMetrics({ cpu: Math.floor(Math.random() * 15) + 5, ram: Math.floor(Math.random() * 20) + 40, ping: Math.floor(Math.random() * 8) + 10, reqs: Math.floor(Math.random() * 100) + 300 }), 2000);
    const i2 = setInterval(() => {
      const rotas = ['GET /api/leituras', 'POST /api/telemetry', 'WSS /socket.io/stream', 'PUT /api/notificacoes'];
      const newTraffic = `[200 OK] ${rotas[Math.floor(Math.random() * rotas.length)]} - 192.168.1.${Math.floor(Math.random() * 255)} - ${Math.floor(Math.random() * 20)}ms`;
      setApiTraffic(prev => [...prev.slice(-10), { id: Date.now() + Math.random(), text: newTraffic }]);
    }, 600);

    const i3 = setInterval(() => {
      const ataques = ['SQL Injection', 'DDoS Attempt', 'Brute Force', 'XSS Payload'];
      const ips = [`45.33.${Math.floor(Math.random() * 255)}.12`, `188.166.${Math.floor(Math.random() * 255)}.55`, `104.28.${Math.floor(Math.random() * 255)}.1`];
      const atk = `[BLOCK] ${ataques[Math.floor(Math.random() * ataques.length)]} detectado do IP ${ips[Math.floor(Math.random() * ips.length)]}`;
      setThreats(prev => [...prev.slice(-4), { id: Date.now(), text: atk }]);
    }, 3500);

    return () => { clearInterval(i1); clearInterval(i2); clearInterval(i3); };
  }, []);

  useEffect(() => { if (trafficContainerRef.current) trafficContainerRef.current.scrollTop = trafficContainerRef.current.scrollHeight; }, [apiTraffic]);
  useEffect(() => { if (scopeType === 'ROLE') setActiveScope('GLOBAL'); else setActiveScope(usuariosLista?.[0]?.usuario || ''); }, [scopeType, usuariosLista]);

  const regrasAtivas = (scopeType === 'USER' ? sysConfig?.regras?.USERS?.[activeScope] : sysConfig?.regras?.[activeScope]) || { modulosOcultos: [], features: {} };

  const handleToggleModulo = (id) => { updateSysConfig(scopeType, activeScope, 'modulosOcultos', id); addLog(`Módulo '${id}' alterado.`, 'warning'); };
  const handleToggleFeature = (key) => { updateSysConfig(scopeType, activeScope, 'features', key, !(regrasAtivas?.features?.[key] ?? true)); addLog(`Política '${key}' atualizada.`, 'warning'); };
  const handleMaintenance = () => { const s = !sysConfig.maintenanceMode; updateSysConfig('ROLE', null, 'maintenanceMode', null, s); addLog(`Lockdown = ${s}.`, s ? 'error' : 'success'); showToast('Bloqueio alterado.', s ? 'warning' : 'success'); };

  const TODOS_MODULOS = [
    { id: 'dashboard', nome: 'Dashboard' }, 
    { id: 'mapa', nome: 'Planta Digital (Heatmap)' }, 
    { id: 'motores', nome: 'Motores Térmicos' }, 
    { id: 'umidade', nome: 'Umidade Relativa' },
    { id: 'kanban', nome: 'Quadro Kanban (OS)' }, 
    { id: 'metrologia', nome: 'Metrologia (ANVISA)' },
    { id: 'equipamentos', nome: 'Máquinas (IoT)' }, 
    { id: 'parametros', nome: 'Parâmetros Core' }, 
    { id: 'chamados', nome: 'Ordens (OS)' },
    { id: 'historico_chamados', nome: 'Arquivo de OS' }, 
    { id: 'chat', nome: 'Chat' }, 
    { id: 'relatorios', nome: 'Relatórios ESG' },
    { id: 'historico', nome: 'Auditoria Logs' }, 
    { id: 'lojas', nome: 'Lojas da Rede' }, 
    { id: 'usuarios', nome: 'Identidades (AD)' },
    { id: 'simulador', nome: 'Simulador IoT' }, 
    { id: 'hardware', nome: 'Frota Edge (IoT)' },
    { id: 'system', nome: 'Governança Global' },
    { id: 'soc', nome: 'Segurança (SOC)' }, 
    { id: 'sobre', nome: 'Sobre a Plataforma' }
  ];

  return (
    <div className="dev-tela-scroll">
      <div className="dev-scope-manager">
        <div className="scope-types">
          <button className={scopeType === 'ROLE' ? 'active' : ''} onClick={() => setScopeType('ROLE')}>Regras por Cargo</button>
          <button className={scopeType === 'USER' ? 'active' : ''} onClick={() => setScopeType('USER')}>Regras por Usuário</button>
        </div>
        <div className="scope-targets">
          {scopeType === 'ROLE' && (
            <div className="scope-tabs">
              <button className={activeScope === 'GLOBAL' ? 'active' : ''} onClick={() => setActiveScope('GLOBAL')}>Global</button>
              <button className={activeScope === 'ADMIN' ? 'active' : ''} onClick={() => setActiveScope('ADMIN')}>Administradores</button>
              <button className={activeScope === 'LOJA' ? 'active' : ''} onClick={() => setActiveScope('LOJA')}>Lojistas</button>
              <button className={activeScope === 'MANUTENCAO' ? 'active' : ''} onClick={() => setActiveScope('MANUTENCAO')}>Técnicos</button>
            </div>
          )}
          {scopeType === 'USER' && (
            <select value={activeScope} onChange={e => setActiveScope(e.target.value)} className="dev-select-input">
              {usuariosLista?.map((u, i) => <option key={i} value={u.usuario}>{u.nome || u.usuario} ({u.role})</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="dev-grid">
        <div className="dev-col-left">
          <div className="dev-card">
            <div className="dev-card-header"><Settings2 size={20} /><h3>Restrições de Interface (UI)</h3></div>
            <div className="modulos-list compact">
              {TODOS_MODULOS.map(m => {
                const isAtivo = !regrasAtivas?.modulosOcultos?.includes(m.id);
                return (
                  <div key={m.id} className={`modulo-item ${!isAtivo ? 'desativado' : ''}`}>
                    <span>{m.nome.toUpperCase()}</span>
                    <button className={`btn-toggle-ui ${isAtivo ? 'on' : 'off'}`} onClick={() => handleToggleModulo(m.id)}>{isAtivo ? 'ON' : 'OFF'}</button>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="dev-card api-traffic-card">
              <div className="dev-card-header" style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '8px' }}><ActivitySquare size={16} className="pulse-icon" /><h3>Live Traffic</h3></div>
              <div className="api-traffic-box" ref={trafficContainerRef} style={{ height: '120px' }}>
                {apiTraffic.map((pkt) => <div key={pkt.id} className="traffic-line"><span className="traffic-indicator">►</span> {pkt.text}</div>)}
              </div>
            </div>

            <div className="dev-card api-traffic-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'linear-gradient(180deg, var(--card-bg) 0%, rgba(239, 68, 68, 0.05) 100%)' }}>
              <div className="dev-card-header" style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '8px' }}><ShieldX size={16} className="pulse-icon" /><h3>WAF / IDS Log</h3></div>
              <div className="api-traffic-box" style={{ height: '120px', color: '#ef4444', borderColor: '#ef4444' }}>
                {threats.map((pkt) => <div key={pkt.id} className="traffic-line error-text"><span className="traffic-indicator" style={{ color: '#ef4444' }}>✖</span> {pkt.text}</div>)}
              </div>
            </div>
          </div>
        </div>

        <div className="dev-col-right">
          <div className="dev-card">
            <div className="dev-card-header" style={{ color: 'var(--primary)' }}><Sliders size={20} /><h3>Regras de Negócios</h3></div>
            <div className="feature-flags-list compact">
              {['Permitir Exportações', 'Ativar Alertas de Áudio', 'Fluxo de Telemetria', 'Habilitar Chat', 'Modo de Leitura', 'Forçar Modo Escuro'].map(f => {
                const ativo = regrasAtivas?.features?.[f] ?? (f !== 'Modo de Leitura' && f !== 'Forçar Modo Escuro');
                return (
                  <div key={f} className="feature-item" onClick={() => handleToggleFeature(f)}>
                    <span>{f}</span> {ativo ? <ToggleRight size={28} color="var(--success)" /> : <ToggleLeft size={28} color="var(--text-muted)" />}
                  </div>
                );
              })}
              <div className="feature-item" onClick={() => { addLog('[NOC] Regras de Firewall atualizadas.', 'warning'); showToast('Filtro Regional aplicado.', 'info'); }}>
                <span style={{ color: '#38bdf8' }}><Globe size={16} /> IP Firewall Geofencing</span> <ToggleLeft size={28} color="var(--text-muted)" />
              </div>
            </div>
          </div>

          <div className="dev-card danger-zone">
            <div className="dev-card-header" style={{ color: 'var(--danger)' }}><Cpu size={20} /><h3>Infraestrutura Crítica</h3></div>
            <div className="server-metrics-box">
              <div className="metric-item"><span className="metric-label">CPU LOAD</span><span className="metric-value">{metrics.cpu}%</span></div>
              <div className="metric-item"><span className="metric-label">RAM</span><span className="metric-value">{metrics.ram} MB</span></div>
              <div className="metric-item"><span className="metric-label">REQ/s</span><span className="metric-value">{metrics.reqs}</span></div>
            </div>
            <div className="feature-item critical-flag" onClick={handleMaintenance}>
              <div><span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>DEFESA ATIVA (LOCKDOWN)</span><br /><span style={{ fontSize: '0.7rem' }}>Desativa logins. Só ROOT passa.</span></div>
              {sysConfig.maintenanceMode ? <ToggleRight size={32} color="var(--danger)" /> : <ToggleLeft size={32} color="var(--text-muted)" />}
            </div>
            <div className="danger-actions">
              <button className="btn btn-outline" onClick={() => { localStorage.setItem('termosync_force_reload', Date.now()); addLog('F5 Forçado.', 'success'); }} style={{ color: 'white', borderColor: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)' }}><Power size={18} /> Forçar F5 Remoto</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TelaSaaS = ({ api, sysConfig, updateSysConfig, filiaisDb, showToast, addLog }) => {
  const handleMudarPlano = (loja, plano) => { updateSysConfig(null, loja, 'saas_plan', null, plano); addLog(`[SAAS] Contrato de ${loja} alterado para ${plano}.`, plano === 'SUSPENSO' ? 'error' : 'success'); showToast(`Licença de ${loja} atualizada.`, plano === 'SUSPENSO' ? 'error' : 'success'); };
  const handleMudarRetencao = (loja, dias) => { addLog(`[CLOUD] Limite de retenção de ${loja} ajustado para ${dias}.`, 'info'); showToast(`Cluster de dados de ${loja} ajustado.`, 'success'); };

  const handleForcarLogout = (loja) => {
    localStorage.setItem('termosync_force_logout', `${loja}_${Date.now()}`);
    addLog(`[SECURITY] Sinal de KILL SWITCH disparado para a filial: ${loja}.`, 'error');
    showToast(`Comando de expulsão (Logout) enviado com sucesso para ${loja}.`, 'success');
  };

  const [chavesAPI, setChavesAPI] = useState({});
  const gerarChaveAPI = (loja) => {
    const key = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setChavesAPI(prev => ({ ...prev, [loja]: key }));
    addLog(`[API] Nova chave de integração gerada para ${loja}.`, 'success');
    showToast(`API Key gerada para ${loja}.`, 'success');
  };

  const loginAs = async (loja) => {
    addLog(`[AUTH] Solicitando token de Impersonate para ${loja}...`, 'warning');
    showToast(`Gerando acesso remoto para ${loja}...`, 'warning');
    try {
      const res = await api.post('/impersonate', { filialDestino: loja });
      const fakeToken = res.data.token;
      addLog(`[AUTH] Token recebido. Abrindo sessão espelho.`, 'success');
      const url = new URL(window.location.href);
      url.searchParams.set('impersonateToken', fakeToken);
      url.searchParams.set('impersonateLoja', loja);
      window.open(url.toString(), '_blank');
    } catch (err) {
      addLog(`[AUTH ERR] Falha ao forjar token: ${err.message}`, 'error');
      showToast('Erro ao criar sessão remota.', 'error');
    }
  };

  return (
    <div className="dev-tela-scroll">
      <div className="dev-card" style={{ marginBottom: '1.5rem' }}>
        <div className="dev-card-header" style={{ color: '#a855f7' }}><ShieldAlert size={20} /><h3>Contas Corporativas e Integrações API</h3></div>
        <div className="saas-clients-table">
          <div className="saas-table-header" style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1fr 100px' }}>
            <div>Cliente</div><div>Capacidade Cloud</div><div style={{ textAlign: 'center' }}>API Webhooks</div><div style={{ textAlign: 'right' }}>Licença (Acesso)</div><div style={{ textAlign: 'right' }}>Ações</div>
          </div>
          {filiaisDb?.map((filial, index) => {
            const planoAtual = sysConfig.planos?.[filial] || 'FREE';
            const isSuspenso = planoAtual === 'SUSPENSO';
            const storagePercent = isSuspenso ? 0 : (planoAtual === 'FREE' ? 85 : (planoAtual === 'PRO' ? 45 : 15));
            const storageColor = storagePercent > 80 ? 'var(--danger)' : (storagePercent > 50 ? 'var(--warning)' : 'var(--success)');

            return (
              <div className={`saas-client-row ${isSuspenso ? 'row-suspended' : ''}`} key={index} style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1fr 100px' }}>
                <div className="client-name" style={{ color: isSuspenso ? 'var(--danger)' : 'var(--text-main)' }}>{isSuspenso ? <Network size={16} /> : <Store size={16} />} {filial}</div>

                <div className="client-storage">
                  <div className="storage-bar-bg"><div className="storage-bar-fill" style={{ width: `${storagePercent}%`, backgroundColor: storageColor }}></div></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="storage-text"><Cloud size={10} /> {storagePercent}% Utilizado</span>
                    <select disabled={isSuspenso} onChange={(e) => handleMudarRetencao(filial, e.target.value)} style={{ background: 'transparent', border: 'none', fontSize: '0.6rem', color: 'var(--primary)', outline: 'none', cursor: 'pointer' }}>
                      <option value="30">30 Dias</option><option value="90">90 Dias</option><option value="365">1 Ano</option>
                    </select>
                  </div>
                </div>

                <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  {chavesAPI[filial] ? (
                    <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>{chavesAPI[filial].substring(0, 12)}...</span>
                  ) : (
                    <button className="btn-icon-small" title="Gerar API Key" onClick={() => gerarChaveAPI(filial)} disabled={isSuspenso}><Key size={14} /></button>
                  )}
                </div>

                <div className="client-plan-select">
                  <select value={planoAtual} onChange={(e) => handleMudarPlano(filial, e.target.value)} className={`plan-dropdown plan-${planoAtual.toLowerCase()}`}>
                    <option value="FREE">FREE (Básica)</option><option value="PRO">PRO (Avançada)</option><option value="ENTERPRISE">ENTERPRISE (Total)</option><option value="SUSPENSO">⚠️ LOCKDOWN</option>
                  </select>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                  <button className="btn-icon-small" title="Acessar Como Cliente (Impersonate)" onClick={() => loginAs(filial)}><UserCheck size={16} /></button>
                  <button className="btn-icon-small danger-text" title="Forçar Logout Remoto" onClick={() => handleForcarLogout(filial)}><Power size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const TelaBilling = ({ sysConfig, filiaisDb, showToast, addLog }) => {
  const [billingSetup, setBillingSetup] = useState(() => {
    const saved = localStorage.getItem('termosync_billing_setup');
    return saved ? JSON.parse(saved) : { pro: 299.90, ent: 899.90, diaVencimento: 10, multa: 2.0, juros: 1.0 };
  });

  const updateSetup = (key, val) => {
    const newSetup = { ...billingSetup, [key]: parseFloat(val) || 0 };
    setBillingSetup(newSetup);
    localStorage.setItem('termosync_billing_setup', JSON.stringify(newSetup));
  };

  const hoje = new Date();
  const atrasoDias = hoje.getDate() > billingSetup.diaVencimento ? hoje.getDate() - billingSetup.diaVencimento : 0;

  const getDetalhesFatura = (plano, isSuspenso) => {
    if (plano === 'FREE' && !isSuspenso) return null;
    let base = isSuspenso ? billingSetup.pro : (plano === 'ENTERPRISE' ? billingSetup.ent : billingSetup.pro);
    let valorMulta = 0; let valorJuros = 0; let status = "PAGO";

    if (isSuspenso || atrasoDias > 0) {
      status = isSuspenso ? "VENCIDA" : "ATRASADA";
      valorMulta = base * (billingSetup.multa / 100);
      valorJuros = (base * (billingSetup.juros / 100)) * (atrasoDias / 30);
    }

    return { base, multa: valorMulta, juros: valorJuros, total: base + valorMulta + valorJuros, status };
  };

  const metricasFinanceiras = useMemo(() => {
    let mrr = 0; let inadimplencia = 0; let ativos = 0;
    (filiaisDb || []).forEach((filial) => {
      const plano = sysConfig.planos?.[filial] || 'FREE';
      const fatura = getDetalhesFatura(plano, plano === 'SUSPENSO');
      if (fatura) {
        if (fatura.status === 'VENCIDA' || fatura.status === 'ATRASADA') inadimplencia += fatura.total;
        else { ativos++; mrr += fatura.total; }
      }
    });
    return { mrr, arr: mrr * 12, inadimplencia, ativos, total: (filiaisDb || []).length };
  }, [filiaisDb, sysConfig.planos, billingSetup, atrasoDias]);

  const dadosGraficoReceita = useMemo(() => {
    const m = metricasFinanceiras.mrr;
    return [
      { mes: 'Out', receita: m * 0.4 }, { mes: 'Nov', receita: m * 0.55 }, { mes: 'Dez', receita: m * 0.7 },
      { mes: 'Jan', receita: m * 0.8 }, { mes: 'Fev', receita: m * 0.95 }, { mes: 'Mar (Atual)', receita: m }
    ];
  }, [metricasFinanceiras.mrr]);

  const drawBarcode = (doc, x, y, width, height) => {
    let currentX = x;
    doc.setFillColor(0, 0, 0);
    while (currentX < x + width) {
      let barWidth = Math.random() > 0.5 ? 0.5 : 1.5;
      if (currentX + barWidth > x + width) break;
      doc.rect(currentX, y, barWidth, height, 'F');
      currentX += barWidth + (Math.random() > 0.5 ? 0.6 : 1.2);
    }
  };

  const gerarNotaFiscalPDF = (filial, fatura) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.text("PREFEITURA MUNICIPAL", 105, 20, { align: "center" });
    doc.setFontSize(12); doc.text("NOTA FISCAL DE SERVIÇOS ELETRÔNICA - NFS-e", 105, 28, { align: "center" });
    doc.setDrawColor(150); doc.setLineWidth(0.3); doc.rect(10, 35, 190, 240);
    doc.setFillColor(240, 240, 240); doc.rect(10, 35, 190, 8, 'F'); doc.rect(10, 35, 190, 8);
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.text("PRESTADOR DE SERVIÇOS", 12, 40);
    doc.setFontSize(11); doc.text("TERMOSYNC CORPORATION LTDA", 12, 50);
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.text("CNPJ: 12.345.678/0001-90", 12, 55); doc.text("Avenida da Tecnologia, 1000 - São Paulo/SP", 12, 60); doc.line(10, 65, 200, 65);
    doc.setFillColor(240, 240, 240); doc.rect(10, 65, 190, 8, 'F'); doc.rect(10, 65, 190, 8);
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.text("TOMADOR DE SERVIÇOS", 12, 70);
    doc.setFontSize(11); doc.text(filial.toUpperCase(), 12, 80);
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.text("CNPJ: 98.765.432/0001-10", 12, 85); doc.text(`Filial Registrada - ${filial}`, 12, 90); doc.line(10, 95, 200, 95);
    doc.setFillColor(240, 240, 240); doc.rect(10, 95, 190, 8, 'F'); doc.rect(10, 95, 190, 8);
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.text("DISCRIMINAÇÃO DOS SERVIÇOS", 12, 100); doc.setFont("helvetica", "normal");
    const obs = `Licenciamento SaaS TermoSync IoT.\nPlano: ${sysConfig.planos?.[filial] || 'PRO'}.\nEncargos: R$ ${(fatura.multa + fatura.juros).toFixed(2)} (Atraso/Juros).`;
    doc.text(obs, 12, 110);
    doc.line(10, 250, 200, 250); doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text("VALOR TOTAL DA NOTA: R$", 120, 260);
    doc.setFontSize(14); doc.text(`${fatura.total.toFixed(2).replace('.', ',')}`, 175, 260);
    doc.save(`NF_${filial}_${Date.now()}.pdf`);
    addLog(`[BILLING] NFS-e Oficial gerada para ${filial}.`, 'success'); showToast('Nota Fiscal gerada com sucesso.', 'success');
  };

  const gerarBoletoPDF = (filial, fatura) => {
    const doc = new jsPDF('p', 'mm', 'a4'); doc.setFont("helvetica", "bold");
    doc.setFontSize(10); doc.text("RECIBO DO PAGADOR", 10, 20); doc.setLineWidth(0.5); doc.line(10, 22, 200, 22);
    doc.setFontSize(16); doc.text("Banco TermoSync S.A.", 10, 30); doc.setFontSize(14); doc.text("| 001-9 |", 70, 30); doc.setFontSize(11); doc.text("00190.00009 01234.567890 00000.000000 1 89000000000000", 95, 30);
    doc.setLineWidth(0.2); doc.rect(10, 35, 190, 60); doc.line(10, 45, 200, 45); doc.line(10, 55, 200, 55); doc.line(150, 35, 150, 95);
    doc.setFontSize(6); doc.setFont("helvetica", "normal"); doc.text("Local de Pagamento", 12, 38); doc.text("Pagável em qualquer banco até o vencimento.", 12, 42);
    doc.text("Vencimento", 152, 38); doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text(`${billingSetup.diaVencimento}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`, 152, 42);
    doc.setFontSize(6); doc.setFont("helvetica", "normal"); doc.text("Beneficiário", 12, 48); doc.text("TermoSync Corp LTDA - CNPJ 12.345.678/0001-90", 12, 52); doc.text("Agência / Cód", 152, 48); doc.text("0001 / 12345-6", 152, 52);
    doc.text("Pagador", 12, 60); doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.text(filial.toUpperCase(), 12, 64);
    doc.setFontSize(6); doc.setFont("helvetica", "normal"); doc.text("(=) Valor Doc", 152, 60); doc.text(`R$ ${fatura.base.toFixed(2)}`, 152, 64); doc.text("(+) Multa/Juros", 152, 70); doc.text(`R$ ${(fatura.multa + fatura.juros).toFixed(2)}`, 152, 74);
    doc.text("(=) Cobrado", 152, 80); doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text(`R$ ${fatura.total.toFixed(2)}`, 152, 86);
    doc.setLineDashPattern([2, 2], 0); doc.line(10, 110, 200, 110); doc.setLineDashPattern([], 0);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16); doc.text("Banco TermoSync S.A.", 10, 130); doc.setFontSize(14); doc.text("| 001-9 |", 70, 130); doc.setFontSize(11); doc.text("00190.00009 01234.567890 00000.000000 1 89000000000000", 95, 130);
    doc.setLineWidth(0.2); doc.rect(10, 135, 190, 80); doc.line(10, 145, 200, 145); doc.line(10, 155, 200, 155); doc.line(10, 165, 200, 165); doc.line(150, 135, 150, 215);
    doc.setFontSize(6); doc.setFont("helvetica", "normal");
    doc.text("Local de Pagamento", 12, 138); doc.text("Pagável em qualquer banco até o vencimento.", 12, 143);
    doc.text("Vencimento", 152, 138); doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text(`${billingSetup.diaVencimento}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`, 152, 143);
    doc.setFontSize(6); doc.setFont("helvetica", "normal");
    doc.text("Beneficiário", 12, 148); doc.text("TermoSync Corp LTDA - CNPJ 12.345.678/0001-90", 12, 153);
    doc.text("Agência / Cód", 152, 148); doc.text("0001 / 12345-6", 152, 153);
    doc.text("Uso do Banco", 12, 158); doc.text("Carteira", 50, 158); doc.text("17", 50, 163); doc.text("Espécie", 80, 158); doc.text("R$", 80, 163);
    doc.text("(=) Valor do Documento", 152, 158); doc.text(`R$ ${fatura.base.toFixed(2)}`, 152, 163);
    doc.text("Instruções", 12, 170); doc.text(`Multa de ${billingSetup.multa}% e juros de ${billingSetup.juros}% após vencimento.`, 12, 175);
    doc.text("(=) Valor Cobrado", 152, 170); doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text(`R$ ${fatura.total.toFixed(2)}`, 152, 178);
    doc.setFontSize(7); doc.setFont("helvetica", "bold");
    doc.text("Pagador", 12, 200); doc.setFont("helvetica", "normal"); doc.text(`${filial} - CNPJ: 98.765.432/0001-10`, 12, 205);

    drawBarcode(doc, 10, 230, 100, 15);

    doc.save(`Boleto_${filial}_${Date.now()}.pdf`);
    addLog(`[BILLING] Boleto gerado para ${filial}.`, 'success'); showToast('Boleto Bancário gerado.', 'success');
  };

  const dispararCobrancaEmLote = () => {
    addLog(`[CRON] Rotina de emissão em lote iniciada para ${filiaisDb?.length} clientes...`, 'warning');
    setTimeout(() => { showToast('Faturamento em lote concluído.', 'success'); addLog('[CRON] Sucesso: Lote processado.', 'success'); }, 1500);
  };

  return (
    <div className="dev-tela-scroll">
      <div className="flex-header" style={{ padding: 0, background: 'transparent', boxShadow: 'none', marginBottom: '0' }}>
        <div className="dev-card" style={{ width: '100%', background: 'linear-gradient(90deg, #0f172a, #0b1120)' }}>
          <div className="dev-card-header" style={{ color: '#eab308', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Settings2 size={20} /><h3>Centro de Operações Financeiras (RevOps)</h3></div>
            <button className="btn btn-primary" onClick={dispararCobrancaEmLote} style={{ fontSize: '0.8rem', padding: '6px 12px' }}><RefreshCw size={14} /> Faturar Lote (CRON)</button>
          </div>
          <div className="billing-config-grid">
            <div className="config-box"><label>Plano PRO (R$)</label><div className="config-input-wrapper"><DollarSign size={14} /><input type="number" step="0.1" value={billingSetup.pro} onChange={(e) => updateSetup('pro', e.target.value)} /></div></div>
            <div className="config-box"><label>Plano ENTERPRISE (R$)</label><div className="config-input-wrapper"><DollarSign size={14} /><input type="number" step="0.1" value={billingSetup.ent} onChange={(e) => updateSetup('ent', e.target.value)} /></div></div>
            <div className="config-box"><label>Dia Vencimento</label><div className="config-input-wrapper"><Calendar size={14} /><input type="number" min="1" max="31" value={billingSetup.diaVencimento} onChange={(e) => updateSetup('diaVencimento', e.target.value)} /></div></div>
            <div className="config-box"><label>Multa Atraso (%)</label><div className="config-input-wrapper"><Percent size={14} /><input type="number" step="0.1" value={billingSetup.multa} onChange={(e) => updateSetup('multa', e.target.value)} /></div></div>
            <div className="config-box"><label>Juros Mês (%)</label><div className="config-input-wrapper"><Percent size={14} /><input type="number" step="0.1" value={billingSetup.juros} onChange={(e) => updateSetup('juros', e.target.value)} /></div></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="dev-card saas-kpi-card" style={{ margin: 0 }}><div className="kpi-icon-wrapper" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}><TrendingUp size={28} /></div><div className="kpi-data"><span className="kpi-label">MRR ESTIMADO</span><span className="kpi-value">R$ {metricasFinanceiras.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div></div>
          <div className="dev-card saas-kpi-card" style={{ margin: 0 }}><div className="kpi-icon-wrapper" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}><AlertTriangle size={28} /></div><div className="kpi-data"><span className="kpi-label">DÍVIDA CLIENTES</span><span className="kpi-value" style={{ color: 'var(--danger)' }}>R$ {metricasFinanceiras.inadimplencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div></div>
        </div>

        <div className="dev-card" style={{ margin: 0, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          <div className="dev-card-header" style={{ color: '#10b981', marginBottom: '10px' }}><LineChart size={18} /> <h3 style={{ fontSize: '0.9rem' }}>Evolução do MRR (6 Meses)</h3></div>
          <div style={{ flex: 1, width: '100%', minHeight: '140px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosGraficoReceita} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }} itemStyle={{ color: '#10b981', fontWeight: 'bold' }} formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Area type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dev-card">
        <div className="dev-card-header" style={{ color: '#eab308' }}><Receipt size={20} /><h3>Faturas Emitidas (Ciclo Atual)</h3></div>
        <div className="saas-clients-table">
          <div className="saas-table-header" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 150px' }}>
            <div>Cliente Pagador</div><div>Plano Base</div><div>Multa/Juros</div><div>Total (R$)</div><div>Status</div><div style={{ textAlign: 'center' }}>Geração Real</div>
          </div>

          {filiaisDb?.map((filial, index) => {
            const planoAtual = sysConfig.planos?.[filial] || 'FREE';
            const fatura = getDetalhesFatura(planoAtual, planoAtual === 'SUSPENSO');
            if (!fatura) return null;

            const isLate = fatura.status === 'VENCIDA' || fatura.status === 'ATRASADA';

            return (
              <div className={`saas-client-row ${isLate ? 'row-suspended' : ''}`} key={index} style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 150px' }}>
                <div className="client-name">{filial}</div>
                <div style={{ color: 'var(--text-muted)' }}>R$ {fatura.base.toFixed(2)}</div>
                <div style={{ color: isLate ? 'var(--danger)' : 'var(--text-muted)' }}>R$ {(fatura.multa + fatura.juros).toFixed(2)}</div>
                <div style={{ fontWeight: '900', color: 'var(--text-main)' }}>R$ {fatura.total.toFixed(2)}</div>
                <div><span className={`status-badge ${isLate ? 'danger' : 'success'}`}>{fatura.status}</span></div>
                <div style={{ textAlign: 'center', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                  <button className="btn-icon-small" title="Gerar NF-e (PDF)" onClick={() => gerarNotaFiscalPDF(filial, fatura)}><FileText size={16} /></button>
                  <button className="btn-icon-small" title="Gerar Boleto (PDF)" onClick={() => gerarBoletoPDF(filial, fatura)}><Banknote size={16} /></button>
                  {isLate && <button className="btn-icon-small danger-text" title="Notificar Cobrança" onClick={() => { addLog(`Aviso enviado a ${filial}.`, 'warning'); showToast('Aviso disparado.', 'info'); }}><Mail size={16} /></button>}
                </div>
              </div>
            );
          })}

          {filiaisDb?.filter(f => sysConfig.planos?.[f] !== 'FREE' || sysConfig.planos?.[f] === 'SUSPENSO').length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>Não existem faturas ativas no sistema de cobrança.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const TelaSistema = ({ api, showToast, addLog, sysConfig, updateSysConfig }) => {
  const [health, setHealth] = useState({ db: 'ONLINE', sockets: 3, total_records: 12450 });
  const [globalBanner, setGlobalBanner] = useState(sysConfig?.regras?.GLOBAL?.features?.globalBanner || '');

  const carregarSaude = async () => {
    try {
      const res = await api.get('/system/health');
      setHealth(res.data);
    } catch (e) {}
  };

  useEffect(() => { carregarSaude(); }, []);

  const handleSalvarBanner = () => {
    updateSysConfig('ROLE', 'GLOBAL', 'features', 'globalBanner', globalBanner);
    addLog(`[MSG] Banner global atualizado: ${globalBanner}`, 'warning');
    showToast('Comunicado global atualizado.', 'success');
  };

  const handlePurge = async () => {
    if(!window.confirm("ATENÇÃO: Esta ação é irreversível. Deseja apagar dados com mais de 90 dias?")) return;
    try {
      const res = await api.post('/system/purge', { dias: 90 });
      showToast(`Registros antigos apagados com sucesso.`, 'success');
      addLog(`[DB] Exclusão executada: ${res.data.deleted || 0} linhas removidas do cluster MySQL.`, 'error');
      carregarSaude();
    } catch (e) { showToast('Falha na exclusão.', 'error'); }
  };

  return (
    <div className="dev-tela-scroll">
      <div className="dev-grid">
        <div className="dev-col-left">
          <div className="dev-card">
            <div className="dev-card-header" style={{color: 'var(--warning)'}}><Mail size={20}/><h3>Comunicado de Sistema (Broadcasting)</h3></div>
            <p className="text-muted" style={{fontSize: '0.8rem', marginBottom: '1rem'}}>Esta mensagem aparecerá no topo de todos os painéis da rede, ideal para avisos de manutenção.</p>
            <textarea 
              className="textarea-input w-100" 
              style={{minHeight: '80px', marginBottom: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '10px', borderRadius: '8px', outline: 'none'}} 
              placeholder="Ex: Manutenção agendada para hoje às 23:00..."
              value={globalBanner}
              onChange={e => setGlobalBanner(e.target.value)}
            />
            <button className="btn btn-primary w-100" onClick={handleSalvarBanner}>
               <Send size={16}/> TRANSMITIR PARA TODA A REDE
            </button>
          </div>

          <div className="dev-card">
            <div className="dev-card-header" style={{color: 'var(--success)'}}><Activity size={20}/><h3>Status dos Microsserviços</h3></div>
            <div className="saas-clients-table">
               <div className="saas-client-row" style={{gridTemplateColumns: '1fr auto', padding: '10px 15px'}}>
                  <span>Cluster MySQL de Persistência</span><span className="status-badge success">{health.db}</span>
               </div>
               <div className="saas-client-row" style={{gridTemplateColumns: '1fr auto', padding: '10px 15px'}}>
                  <span>Túneis WebSocket Ativos</span><span className="status-badge success">{health.sockets} Conexões</span>
               </div>
               <div className="saas-client-row" style={{gridTemplateColumns: '1fr auto', padding: '10px 15px'}}>
                  <span>WhatsApp API Gateway</span><span className="status-badge success">READY</span>
               </div>
               <div className="saas-client-row" style={{gridTemplateColumns: '1fr auto', padding: '10px 15px', borderBottom: 'none'}}>
                  <span>Volume de Telemetria (Total)</span><span style={{fontWeight: 'bold', color: 'var(--primary)'}}>{health.total_records.toLocaleString()} Linhas</span>
               </div>
            </div>
          </div>
        </div>

        <div className="dev-col-right">
           <div className="dev-card">
            <div className="dev-card-header" style={{color: 'var(--primary)'}}><BrainCircuit size={20}/><h3>Inteligência de Disparo (SLA)</h3></div>
            <div className="config-box" style={{marginBottom: '1.5rem'}}>
               <label style={{color: 'var(--text-main)', marginBottom: '8px', display: 'block', fontWeight: 'bold'}}>Delay para Alerta de Porta (Minutos)</label>
               <input type="range" min="1" max="30" defaultValue="5" className="w-100" />
            </div>
            <div className="config-box" style={{marginBottom: '1.5rem'}}>
               <label style={{color: 'var(--text-main)', marginBottom: '8px', display: 'block', fontWeight: 'bold'}}>Tolerância de Oscilação Térmica (Delta °C)</label>
               <input type="range" min="0.1" max="5.0" step="0.1" defaultValue="1.5" className="w-100" />
            </div>
            <p className="text-muted" style={{fontSize: '0.75rem', lineHeight: '1.4', margin: 0}}>Estes parâmetros definem a rapidez com que a sirene toca no NOC após o servidor detectar uma variação física enviada pelos sensores IoT.</p>
          </div>

          <div className="dev-card danger-zone">
            <div className="dev-card-header" style={{color: 'var(--danger)'}}><Eraser size={20}/><h3>Manutenção Destrutiva</h3></div>
            <p className="text-muted" style={{fontSize: '0.8rem', marginBottom: '15px'}}>Ações de limpeza profunda para otimização de queries no banco de dados principal.</p>
            <button className="btn btn-outline w-100" onClick={handlePurge} style={{color: 'var(--danger)', borderColor: 'var(--danger)', marginBottom: '10px', display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px'}}>
               <Database size={16}/> APAGAR DADOS ANTIGOS (+90 DIAS)
            </button>
            <button className="btn btn-outline w-100" style={{display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px', color: 'var(--text-main)', borderColor: 'var(--border)'}} onClick={() => {showToast('Dump SQL iniciado em background.', 'info'); addLog('Backup lógico solicitado pelo root.', 'info')}}>
               <FileOutput size={16}/> EXPORTAR DUMP DE SEGURANÇA (SQL)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TelaSOC = ({ api, showToast, addLog }) => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const carregarDadosSOC = useCallback(async () => {
    try {
      const [resSessoes, resAuditoria] = await Promise.all([
        api.get('/soc/sessoes'),
        api.get('/soc/auditoria')
      ]);
      
      const sessoesFormatadas = resSessoes.data.map(s => ({
        ...s,
        loginTime: new Date(s.loginTime).toLocaleString()
      }));
      
      const auditoriaFormatada = resAuditoria.data.map(a => ({
        ...a,
        time: new Date(a.data_hora).toLocaleString()
      }));

      setActiveSessions(sessoesFormatadas);
      setAuditLogs(auditoriaFormatada);
    } catch (e) {
      // Falha silenciosa para evitar spam de toasts no auto-refresh
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    carregarDadosSOC();
    const interval = setInterval(carregarDadosSOC, 10000);
    return () => clearInterval(interval);
  }, [carregarDadosSOC]);

  const handleRevoke = async (id, user) => {
    try {
      await api.post(`/soc/revogar/${id}`);
      setActiveSessions(prev => prev.filter(s => s.id !== id));
      showToast(`Token JWT revogado. A conexão de ${user} foi derrubada.`, 'success');
      addLog(`[SOC] Sessão forçada ao encerramento: ${user}`, 'error');
      carregarDadosSOC(); 
    } catch (e) {
      showToast('Erro ao revogar sessão.', 'error');
    }
  };

  return (
    <div className="dev-tela-scroll">
      <div className="dev-grid">
        <div className="dev-col-left">
          
          <div className="dev-card">
            <div className="dev-card-header" style={{color: '#a855f7'}}><Fingerprint size={20}/><h3>Sessões JWT Ativas</h3></div>
            <p className="text-muted" style={{fontSize: '0.8rem', marginBottom: '15px'}}>Monitorização Zero-Trust em tempo real.</p>
            
            <div className="saas-clients-table">
              <div className="saas-table-header" style={{ gridTemplateColumns: '1fr 1fr 1fr 80px' }}>
                <div>Usuário</div><div>Endereço IP</div><div>Hora do Login</div><div style={{textAlign: 'right'}}>Ação</div>
              </div>
              
              {isLoading && <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-muted)'}}>Analisando tráfego de rede...</div>}
              
              {!isLoading && activeSessions.map((session) => (
                <div key={session.id} className="saas-client-row" style={{ gridTemplateColumns: '1fr 1fr 1fr 80px' }}>
                  <div>
                    <div style={{fontWeight: 'bold', color: 'var(--text-main)'}}>{session.usuario}</div>
                    <div style={{fontSize: '0.7rem', color: 'var(--primary)'}}>{session.role}</div>
                  </div>
                  <div>
                    <div style={{fontFamily: 'monospace', color: 'var(--text-muted)'}}>{session.ip === '::1' ? 'Localhost' : session.ip}</div>
                    <div style={{fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px'}}><MapPin size={10}/>{session.location}</div>
                  </div>
                  <div style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>{session.loginTime}</div>
                  <div style={{textAlign: 'right'}}>
                    <button className="btn-icon-small danger-text" title="Derrubar Conexão (Revoke)" onClick={() => handleRevoke(session.id, session.usuario)}>
                      <UserX size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {!isLoading && activeSessions.length === 0 && <div style={{padding: '1rem', textAlign: 'center', color: 'var(--text-muted)'}}>Nenhuma sessão ativa encontrada.</div>}
            </div>
          </div>

        </div>

        <div className="dev-col-right">
          
          <div className="dev-card">
            <div className="dev-card-header" style={{color: 'var(--info)'}}><History size={20}/><h3>Ledger de Auditoria (Imutável)</h3></div>
            <p className="text-muted" style={{fontSize: '0.8rem', marginBottom: '15px'}}>Registro cronológico de operações críticas para compliance.</p>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px'}}>
              {isLoading && <div style={{textAlign: 'center', color: 'var(--text-muted)', padding: '1rem'}}>Lendo logs do banco de dados...</div>}
              
              {!isLoading && auditLogs.map((log, idx) => (
                <div key={idx} style={{background: 'var(--bg-color)', borderLeft: `3px solid var(--${log.severity})`, padding: '10px 15px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                    <span style={{color: `var(--${log.severity})`, fontWeight: 'bold', fontSize: '0.8rem'}}>{log.action}</span>
                    <span style={{color: 'var(--text-muted)', fontSize: '0.75rem'}}>Alvo: <span style={{color: 'var(--text-main)'}}>{log.target}</span> | Ator: <span style={{color: 'var(--text-main)'}}>{log.actor}</span></span>
                  </div>
                  <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', textAlign: 'right'}}>
                    <Clock size={12}/> {log.time}
                  </div>
                </div>
              ))}
              {!isLoading && auditLogs.length === 0 && <div style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>O livro-razão está vazio.</div>}
            </div>
            
            <button className="btn btn-outline w-100" style={{marginTop: '15px', padding: '10px'}} onClick={() => showToast('Exportando Logs para CSV...', 'info')}>
              <DownloadCloud size={16} style={{marginRight: '8px'}}/> EXPORTAR LOGS COMPLETOS
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-TELA 6: CENTRO DE INTELIGÊNCIA (BI) - DADOS REAIS DO BANCO DE DADOS
// ============================================================================
const TelaBI = ({ api, showToast, addLog, sysConfig, filiaisDb }) => {
  const gerarRelatorio = async (tipo, tema, cor) => {
    showToast(`Compilando matriz de dados reais para: ${tipo}...`, 'warning');
    try {
      // 1. Registra a ação no Ledger de Auditoria
      await api.post('/system/reports/log', { tipo, formato: 'PDF', solicitante: 'Root/Dev' });
      addLog(`[BI] Extração de dados reais iniciada: ${tipo}`, 'info');

      let head = [];
      let body = [];

      // 2. BUSCA DINÂMICA DE DADOS NA API (MYSQL)
      if (tipo === 'AUDITORIA_SOC') {
        const res = await api.get('/soc/auditoria');
        head = [['Data/Hora', 'Ação Realizada', 'Ator', 'Alvo', 'Severidade']];
        body = res.data.map(log => [
          new Date(log.data_hora).toLocaleString(),
          log.action,
          log.actor,
          log.target,
          log.severity.toUpperCase()
        ]);
        if(body.length === 0) body = [['--', 'Sem registros de auditoria', '--', '--', '--']];
        
      } else if (tipo === 'FINOPS_BILLING') {
        head = [['Cliente Pagador / Tenant', 'Plano Base', 'Custo Mensual', 'Status Financeiro']];
        body = (filiaisDb || []).map(filial => {
          const plano = sysConfig?.planos?.[filial] || 'FREE';
          let valor = plano === 'ENTERPRISE' ? 'R$ 899,90' : (plano === 'PRO' ? 'R$ 299,90' : 'R$ 0,00');
          let status = plano === 'SUSPENSO' ? 'BLOQUEADO (INADIMPLENTE)' : 'ATIVO / PAGO';
          return [filial, plano, valor, status];
        });
        if(body.length === 0) body = [['--', 'Sem clientes financeiros', '--', '--']];
        
      } else if (tipo === 'EDGE_HARDWARE') {
        const res = await api.get('/hardware');
        head = [['Edge Node (Máquina)', 'Localização', 'Endereço MAC', 'Sinal (dBm)', 'Uptime', 'Firmware']];
        body = res.data.map(node => [
          node.nome,
          node.filial || 'Principal',
          node.mac || '00:00:00:00:00:00',
          `${node.signal_dbm || -100} dBm`,
          node.uptime || 'N/A',
          node.fwVersion || 'v1.0.0'
        ]);
        if(body.length === 0) body = [['--', 'Nenhum hardware registrado', '--', '--', '--', '--']];
        
      } else if (tipo === 'CAOS_RESILIENCIA') {
        const res = await api.get('/notificacoes/historico');
        head = [['Data/Hora', 'Máquina (Nó)', 'Tipo de Anomalia', 'Mensagem do Sistema']];
        body = res.data.slice(0, 50).map(n => [
          new Date(n.data_hora).toLocaleString(),
          n.equipamento_nome,
          n.tipo_alerta,
          n.mensagem
        ]);
        if(body.length === 0) body = [['--', 'Sem anomalias detectadas', '--', '--']];

      } else if (tipo === 'ORGANIZACOES_TENANTS') {
        const res = await api.get('/empresas');
        head = [['Organização', 'Registro Legal', 'Contato', 'Email', 'Status']];
        body = res.data.map(emp => [
          emp.nome,
          emp.cnpj || 'ISENTO',
          emp.contato || 'Não informado',
          emp.email || 'Não informado',
          emp.status.toUpperCase()
        ]);
        if(body.length === 0) body = [['--', 'Nenhuma organização', '--', '--', '--']];

      } else if (tipo === 'SYSOPS_HEALTH') {
        const res = await api.get('/system/health');
        head = [['Métrica Vital do Servidor', 'Valor Atual', 'Status']];
        body = [
          ['Status do Cluster MySQL', res.data.db, 'NORMAL'],
          ['Túneis WebSocket Ativos', `${res.data.sockets} conexão(ões)`, 'NORMAL'],
          ['Volume de Telemetria (Registros totais)', `${res.data.total_records.toLocaleString()}`, 'NORMAL'],
          ['Tempo de Atividade (Uptime)', `${Math.floor(res.data.uptime / 60)} minutos`, 'NORMAL']
        ];
      }

      // 3. GERAÇÃO DO PDF (PT-BR)
      const doc = new jsPDF('landscape');
      doc.setFillColor(cor);
      doc.rect(0, 0, 300, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`TERMOSYNC ENTERPRISE - RELATÓRIO EXECUTIVO (DADOS REAIS)`, 15, 13);
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(14);
      doc.text(tema, 15, 30);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Data de Emissão: ${new Date().toLocaleString()}`, 15, 36);
      doc.text(`Classificação: CONFIDENCIAL / USO INTERNO`, 15, 41);

      autoTable(doc, { 
        head, 
        body, 
        startY: 50,
        headStyles: { fillColor: cor },
        styles: { fontSize: 9 }
      });

      doc.save(`TermoSync_Data_${tipo}_${Date.now()}.pdf`);
      showToast('Relatório executivo gerado e baixado com sucesso.', 'success');
    } catch (e) {
      showToast('Erro ao compilar o relatório. Verifique a conexão com o banco de dados.', 'error');
      console.error(e);
    }
  };

  const modulosBI = [
    { id: 'FINOPS_BILLING', titulo: 'Core Financeiro (RevOps)', desc: 'Exporta a relação completa de MRR, inadimplência e faturas emitidas por organização.', icon: DollarSign, color: '#10b981' },
    { id: 'AUDITORIA_SOC', titulo: 'Auditoria e Zero-Trust (SOC)', desc: 'Extrato oficial e imutável de logins, revogações de acesso e purgas do banco de dados.', icon: ShieldCheck, color: '#a855f7' },
    { id: 'EDGE_HARDWARE', titulo: 'Inventário Edge Computing', desc: 'Mapeamento global da frota de microcontroladores, sinal Wi-Fi, uptimes e versões de firmware.', icon: Server, color: '#38bdf8' },
    { id: 'CAOS_RESILIENCIA', titulo: 'Auditoria de Resiliência (Chaos)', desc: 'Relatório das anomalias injetadas ou detectadas no sistema e os tempos de resposta do servidor.', icon: Cpu, color: '#ef4444' },
    { id: 'ORGANIZACOES_TENANTS', titulo: 'Ecossistema de Organizações', desc: 'Lista de todos os tenants registrados, capacidades de storage contratadas e responsáveis legais.', icon: Building2, color: '#f59e0b' },
    { id: 'SYSOPS_HEALTH', titulo: 'Saúde da Plataforma (SysOps)', desc: 'Métricas vitais do cluster Node.js, conexões WebSocket simultâneas e volume de carga no banco MySQL.', icon: Activity, color: '#6366f1' }
  ];

  return (
    <div className="anim-fade-in stagger-1 dev-tela-scroll">
      <div className="flex-header" style={{ padding: 0, background: 'transparent', boxShadow: 'none', marginBottom: '0' }}>
        <div className="dev-card" style={{ width: '100%', background: 'var(--card-bg)' }}>
          <div className="dev-card-header" style={{ color: 'var(--primary)', marginBottom: '5px' }}>
            <PieChart size={24} />
            <h3 style={{fontSize: '1.2rem'}}>Centro de Inteligência e Analytics (BI)</h3>
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>
            Motor de extração de dados reais do MySQL. Todos os relatórios gerados são registrados na tabela de auditoria para conformidade jurídica.
          </p>
        </div>
      </div>

      <div className="bi-grid stagger-2">
        {modulosBI.map(mod => (
          <div key={mod.id} className="bi-card" style={{ '--theme-color': mod.color }}>
            <div className="bi-header">
              <div className="bi-icon-wrapper">
                <mod.icon size={24} />
              </div>
              <div>
                <h4 className="bi-title">{mod.titulo}</h4>
                <p className="bi-desc">{mod.desc}</p>
              </div>
            </div>
            
            <div className="bi-actions">
              <button className="btn-bi" onClick={() => gerarRelatorio(mod.id, mod.titulo, mod.color)}>
                <FileText size={16}/> Gerador PDF Dinâmico
              </button>
              <button className="btn-bi" onClick={() => { showToast('A extração CSV estará disponível na v10.6', 'info'); addLog(`[BI] Tentou exportar CSV: ${mod.id}`, 'warning'); }}>
                <FileSpreadsheet size={16}/> Exportar CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TerminalFooter = ({ logs, setLogs, addLog, filiaisDb }) => {
  const [cmdInput, setCmdInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const terminalContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && terminalContainerRef.current) terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
  }, [logs, isOpen]);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;
    const cmd = cmdInput.trim().toLowerCase();
    addLog(cmd, 'cmd-echo');
    setTimeout(() => {
      switch (cmd) {
        case 'help': addLog('Comandos: clear, ping, sysinfo, netstat, reboot, invoice --gen', 'info'); break;
        case 'clear': setLogs([{ time: new Date().toLocaleTimeString(), text: 'Console limpo.', status: 'info' }]); break;
        case 'ping': addLog(`Gateway Ping: 14ms.`, 'success'); break;
        case 'sysinfo': addLog(`TermoSync OS v10.5 | Root Access Granted.`, 'warning'); break;
        case 'invoice --gen': addLog(`Processamento de CRON JOB de faturamento concluído.`, 'success'); break;
        default: addLog(`ERR_UNKNOWN_CMD: O comando '${cmd}' não é reconhecido.`, 'error');
      }
    }, 400);
    setCmdInput('');
  };

  return (
    <div className={`os-terminal-footer ${isOpen ? 'open' : 'closed'}`}>
      <div className="terminal-header" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={14} color="var(--primary)" />
          <span>{isOpen ? '/dev/tty1 (INTERACTIVE SHELL)' : 'Abrir Linha de Comandos (Terminal)'}</span>
        </div>
        <div className="terminal-actions">
          {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </div>
      </div>

      {isOpen && (
        <>
          <div className="terminal-body" ref={terminalContainerRef}>
            {logs.map((log, index) => (
              <div key={index} className={`terminal-line ${log.status}`}>
                <span className="time">[{log.time}]</span>
                {log.status === 'cmd-echo' ? (<span className="prompt">root@termosync:~$ <span className="echo-text">{log.text}</span></span>) : (<><span className="prompt">root@termosync:~$</span> <span className="text">{log.text}</span></>)}
              </div>
            ))}
          </div>
          <form onSubmit={handleCommandSubmit} className="terminal-input-form">
            <span className="prompt">root@termosync:~$</span>
            <input type="text" value={cmdInput} onChange={e => setCmdInput(e.target.value)} placeholder="Digite um comando (ex: help)..." autoComplete="off" spellCheck="false" autoFocus />
            <button type="button" className="btn-clear-terminal" onClick={() => setLogs([])} title="Limpar Console"><Eraser size={14} /></button>
          </form>
        </>
      )}
    </div>
  );
};