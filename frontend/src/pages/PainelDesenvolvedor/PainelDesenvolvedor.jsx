import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, ShieldAlert, Zap, Database, Cpu, 
  Eye, EyeOff, Trash2, Power, HardDrive, 
  Settings2, Activity, Globe, Lock, Wrench, 
  Server, Droplets, Archive, History, Store, Sliders, 
  ToggleLeft, ToggleRight, FileOutput, Volume2, Wifi, 
  BellOff, Moon, Bug, PlayCircle, MessageSquareOff, Users
} from 'lucide-react';
import './PainelDesenvolvedor.css';

export default function PainelDesenvolvedor({ showToast, sysConfig, updateSysConfig, tocarAlarme, usuariosLista }) {
  
  const [scopeType, setScopeType] = useState('ROLE'); 
  const [activeScope, setActiveScope] = useState('GLOBAL');
  
  const [terminalLogs, setTerminalLogs] = useState([
    { time: new Date().toLocaleTimeString(), text: 'Sessão ROOT iniciada.', status: 'info' },
    { time: new Date().toLocaleTimeString(), text: 'Túnel TLS 1.3 Estabelecido. Sincronização Real-Time ON.', status: 'success' }
  ]);
  const endOfTerminalRef = useRef(null);

  const addLog = (text, status = 'info') => {
    setTerminalLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text, status }]);
  };

  useEffect(() => { endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [terminalLogs]);

  // Gestão segura de alteração de escopo (Impede o crash por variável vazia)
  useEffect(() => {
    if (scopeType === 'ROLE') {
      setActiveScope('GLOBAL');
    } else if (scopeType === 'USER') {
      if (usuariosLista && usuariosLista.length > 0) {
        setActiveScope(usuariosLista[0].usuario); 
      } else {
        setActiveScope('');
      }
    }
  }, [scopeType, usuariosLista]);

  const modulosConfig = [
    { id: 'dashboard', nome: 'Dashboard Principal', icon: Activity },
    { id: 'motores', nome: 'Monitoramento Térmico', icon: Zap },
    { id: 'umidade', nome: 'Monitoramento de Umidade', icon: Droplets },
    { id: 'equipamentos', nome: 'Gestão de Ativos IoT', icon: Server },
    { id: 'chamados', nome: 'Service Desk (OS)', icon: Wrench },
    { id: 'historico_chamados', nome: 'Arquivo de Intervenções', icon: Archive },
    { id: 'chat', nome: 'Comunicação Interna', icon: Globe },
    { id: 'relatorios', nome: 'Relatórios ESG', icon: Database },
    { id: 'historico', nome: 'Auditoria de Logs', icon: History },
    { id: 'lojas', nome: 'Gestão de Filiais', icon: Store },
    { id: 'usuarios', nome: 'Gestão de Identidades', icon: Lock },
    { id: 'parametros', nome: 'Parâmetros Globais', icon: Sliders },
  ];

  const getRegrasAtivas = () => {
    try {
      if (scopeType === 'USER') {
        return sysConfig?.regras?.USERS?.[activeScope] || { modulosOcultos: [], features: {} };
      }
      return sysConfig?.regras?.[activeScope] || { modulosOcultos: [], features: {} };
    } catch (e) {
      return { modulosOcultos: [], features: {} };
    }
  };

  const regrasAtivas = getRegrasAtivas();

  const handleToggleModulo = (id) => {
    if (!activeScope) return showToast('Selecione um alvo válido primeiro.', 'warning');
    updateSysConfig(scopeType, activeScope, 'modulosOcultos', id);
    addLog(`[UI_CONTROL] Módulo '${id}' alterado via Signal(R) para o alvo [${activeScope}].`, 'warning');
    showToast(`Módulo atualizado para: <strong>${activeScope}</strong>. Sincronização efetuada.`, 'info');
  };

  const handleToggleFeature = (key) => {
    if (!activeScope) return showToast('Selecione um alvo válido primeiro.', 'warning');
    const currentState = regrasAtivas?.features?.[key] ?? true;
    updateSysConfig(scopeType, activeScope, 'features', key, !currentState);
    addLog(`[FLAG_CONTROL] Parâmetro ${key} alterado para ${!currentState} no alvo [${activeScope}].`, 'warning');
    showToast(`Política [${key}] sincronizada para: <strong>${activeScope}</strong>.`, 'info');
  };

  const handleMaintenanceMode = () => {
    const newState = !sysConfig.maintenanceMode;
    updateSysConfig('ROLE', null, 'maintenanceMode', null, newState);
    addLog(`[CRITICAL] SYSTEM_LOCKDOWN = ${newState}. O Core abaterá todas as sessões ativas (Exceto Root).`, newState ? 'error' : 'success');
    showToast(newState ? 'ALERTA: Manutenção Armada!' : 'Manutenção Cancelada.', newState ? 'warning' : 'success');
  };

  const handleForceReloadAll = () => {
    localStorage.setItem('termosync_force_reload', Date.now().toString());
    addLog(`[SYS_ACTION] Comando Remoto (Refresh -F) propagado a todos os clientes.`, 'success');
    showToast('Recarregamento Global Forçado!', 'success');
  };

  const handleInjectMockAlert = () => {
    addLog(`[QA_TEST] Anomalia crítica térmica fabricada para teste do motor visual.`, 'warning');
    tocarAlarme();
    showToast('[TESTE CORE] Anomalia extrema detetada na Câmara Fria! (Simulação)', 'error');
  };

  return (
    <div className="dev-panel-container anim-fade-in">
      
      {/* CABEÇALHO DO CONSOLE */}
      <div className="dev-header">
        <div>
          <h2 className="dev-title"><Terminal size={26} color="var(--primary)" /> Central de Comando (Core)</h2>
          <p className="dev-subtitle">Arquitetura de Controlo em Tempo Real (Zero Latency Sync).</p>
        </div>
        <div className="system-status-pill">
          <div className="live-dot green"></div>
          Signal(R) Broadcaster Ativo
        </div>
      </div>

      {/* SELETOR DE ESCOPO AVANÇADO (CARGOS OU USUÁRIOS) */}
      <div className="dev-scope-manager">
        <div className="scope-types">
          <button className={scopeType === 'ROLE' ? 'active' : ''} onClick={() => setScopeType('ROLE')}>Políticas de Grupo / Cargo</button>
          <button className={scopeType === 'USER' ? 'active' : ''} onClick={() => setScopeType('USER')}>Políticas de Utilizador (Específico)</button>
        </div>
        
        <div className="scope-targets">
          {scopeType === 'ROLE' && (
            <div className="scope-tabs">
              <button className={activeScope === 'GLOBAL' ? 'active' : ''} onClick={() => setActiveScope('GLOBAL')}>Global (Todo o Sistema)</button>
              <button className={activeScope === 'LOJA' ? 'active' : ''} onClick={() => setActiveScope('LOJA')}>Apenas Lojistas</button>
              <button className={activeScope === 'MANUTENCAO' ? 'active' : ''} onClick={() => setActiveScope('MANUTENCAO')}>Apenas Técnicos</button>
              <button className={activeScope === 'ADMIN' ? 'active' : ''} onClick={() => setActiveScope('ADMIN')}>Apenas Administradores</button>
            </div>
          )}
          
          {scopeType === 'USER' && (
            <div className="scope-user-select">
              <Users size={18} color="var(--primary)" />
              <select 
                value={activeScope} 
                onChange={e => setActiveScope(e.target.value)} 
                style={{
                  width: '100%', 
                  minWidth: '350px', 
                  padding: '8px 12px', 
                  borderRadius: '8px', 
                  background: 'transparent', 
                  color: 'var(--text-main)', 
                  border: '1px solid var(--border)',
                  outline: 'none',
                  fontWeight: '600'
                }}
              >
                {usuariosLista && usuariosLista.length > 0 ? (
                  usuariosLista.map((u, index) => {
                    // OTIMIZAÇÃO: Busca o nome em qualquer uma das colunas possíveis
                    const displayNome = u.nome || u.nome_gerente || u.nome_coordenador || u.nome_tecnico || u.usuario;
                    return (
                      <option key={u.usuario || index} value={u.usuario} style={{ background: 'var(--card-bg)' }}>
                        {displayNome} - (Cargo: {u.role})
                      </option>
                    );
                  })
                ) : (
                  <option value="">A carregar repositório de identidades...</option>
                )}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="dev-grid">
        
        {/* COLUNA 1: CONTROLE DE TELAS E QA */}
        <div className="dev-col-left">
          <div className="dev-card">
            <div className="dev-card-header">
              <Settings2 size={20} />
              <h3>Camadas de Interface (UI)</h3>
            </div>
            <div className="modulos-list">
              {modulosConfig.map(m => {
                const isAtivo = !regrasAtivas?.modulosOcultos?.includes(m.id);
                return (
                  <div key={m.id} className={`modulo-item ${!isAtivo ? 'desativado' : ''}`}>
                    <div className="modulo-info">
                      <m.icon size={18} className="modulo-icon" />
                      <span>{m.nome}</span>
                    </div>
                    <button 
                      className={`btn-toggle-ui ${isAtivo ? 'on' : 'off'}`}
                      onClick={() => handleToggleModulo(m.id)}
                    >
                      {isAtivo ? <Eye size={16} /> : <EyeOff size={16} />}
                      {isAtivo ? 'VISÍVEL' : 'BLOQUEADO'}
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="card-note">* Restrições ativadas desaparecem da tela dos utilizadores-alvo no exato milissegundo, sem necessidade de atualizar a página.</p>
          </div>

          <div className="dev-card" style={{ border: '1px solid var(--secondary)', background: 'linear-gradient(180deg, var(--card-bg) 0%, rgba(56, 189, 248, 0.05) 100%)' }}>
            <div className="dev-card-header" style={{ color: 'var(--secondary)' }}>
              <Bug size={20} />
              <h3>Validação de Resposta (QA)</h3>
            </div>
            <div className="qa-actions">
              <button className="btn btn-outline" onClick={handleInjectMockAlert} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                <PlayCircle size={18} /> Disparar Pânico Simulado
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA 2: FEATURE FLAGS E ZONA DE PERIGO */}
        <div className="dev-col-right">
          
          <div className="dev-card">
            <div className="dev-card-header" style={{ color: 'var(--primary)' }}>
              <Sliders size={20} />
              <h3>Capacidades do Sistema (Feature Flags)</h3>
            </div>
            
            <div className="feature-flags-list">
              
              <div className="feature-item" onClick={() => handleToggleFeature('allowExports')}>
                <div className="feature-info">
                  <div className="feature-title"><FileOutput size={16}/> Permissão de Extração (PDF/CSV)</div>
                </div>
                {regrasAtivas?.features?.allowExports ?? true ? <ToggleRight size={32} color="var(--success)"/> : <ToggleLeft size={32} color="var(--text-muted)"/>}
              </div>

              <div className="feature-item" onClick={() => handleToggleFeature('enableAudioAlerts')}>
                <div className="feature-info">
                  <div className="feature-title"><Volume2 size={16}/> Hardware de Som (Sirenes / Alertas)</div>
                </div>
                {regrasAtivas?.features?.enableAudioAlerts ?? true ? <ToggleRight size={32} color="var(--success)"/> : <ToggleLeft size={32} color="var(--text-muted)"/>}
              </div>

              <div className="feature-item" onClick={() => handleToggleFeature('enableToasts')}>
                <div className="feature-info">
                  <div className="feature-title"><BellOff size={16}/> Feed de Notificações (Balões UI)</div>
                </div>
                {regrasAtivas?.features?.enableToasts ?? true ? <ToggleRight size={32} color="var(--success)"/> : <ToggleLeft size={32} color="var(--text-muted)"/>}
              </div>

              <div className="feature-item" onClick={() => handleToggleFeature('telemetryStream')}>
                <div className="feature-info">
                  <div className="feature-title"><Wifi size={16}/> Consumo de Telemetria IoT</div>
                </div>
                {regrasAtivas?.features?.telemetryStream ?? true ? <ToggleRight size={32} color="var(--success)"/> : <ToggleLeft size={32} color="var(--text-muted)"/>}
              </div>
              
              <div className="feature-item" onClick={() => handleToggleFeature('enableChat')}>
                <div className="feature-info">
                  <div className="feature-title" style={{color: 'var(--warning)'}}><MessageSquareOff size={16}/> Protocolo de Chat Interno</div>
                </div>
                {regrasAtivas?.features?.enableChat ?? true ? <ToggleRight size={32} color="var(--success)"/> : <ToggleLeft size={32} color="var(--text-muted)"/>}
              </div>

              <div className="feature-item" onClick={() => handleToggleFeature('readOnlyMode')}>
                <div className="feature-info">
                  <div className="feature-title" style={{color: 'var(--danger)'}}><ShieldAlert size={16}/> Travar Edições (Apenas Leitura)</div>
                </div>
                {regrasAtivas?.features?.readOnlyMode ? <ToggleRight size={32} color="var(--danger)"/> : <ToggleLeft size={32} color="var(--text-muted)"/>}
              </div>

              <div className="feature-item" onClick={() => handleToggleFeature('forceDarkMode')}>
                <div className="feature-info">
                  <div className="feature-title"><Moon size={16}/> Forçar Motor Gráfico (Dark Theme)</div>
                </div>
                {regrasAtivas?.features?.forceDarkMode ? <ToggleRight size={32} color="var(--warning)"/> : <ToggleLeft size={32} color="var(--text-muted)"/>}
              </div>

            </div>
          </div>

          {/* DANGER ZONE (INFRA) */}
          <div className="dev-card danger-zone">
            <div className="dev-card-header" style={{ color: 'var(--danger)' }}>
              <Cpu size={20} />
              <h3>Ações Remotas Críticas</h3>
            </div>

            <div className="feature-item critical-flag" onClick={handleMaintenanceMode} style={{ marginBottom: '15px' }}>
              <div className="feature-info">
                <div className="feature-title" style={{color: 'var(--danger)'}}><ShieldAlert size={16}/> Modo de Defesa (Derrubar Sessões)</div>
                <div className="feature-desc">Asfixia as ligações não autorizadas. Apenas a conta Dev se manterá viva.</div>
              </div>
              {sysConfig.maintenanceMode ? <ToggleRight size={32} color="var(--danger)"/> : <ToggleLeft size={32} color="var(--text-muted)"/>}
            </div>

            <div className="danger-actions">
              <button className="btn btn-outline" onClick={handleForceReloadAll} style={{ color: 'white', borderColor: 'var(--danger)', background: 'rgba(239, 68, 68, 0.2)'}}>
                <Power size={18} /> Propagar Comando de Refresh
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* TERMINAL DE LOGS INTERATIVO */}
      <div className="terminal-footer">
        <div className="terminal-header">
          <span>CONSOLE OUTPUT - BROADCASTER /var/log/termosync.log</span>
          <div className="terminal-dots"><span className="dot r"></span><span className="dot y"></span><span className="dot g"></span></div>
        </div>
        <div className="terminal-body">
          {terminalLogs.map((log, index) => (
            <div key={index} className={`terminal-line ${log.status}`}>
              <span className="time">[{log.time}]</span>
              <span className="prompt">root@termosync:~$</span> 
              <span className="text">{log.text}</span>
            </div>
          ))}
          <div ref={endOfTerminalRef} />
        </div>
      </div>

    </div>
  );
}