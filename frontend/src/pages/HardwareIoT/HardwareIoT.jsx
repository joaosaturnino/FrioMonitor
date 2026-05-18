import React, { useState, useEffect, useMemo } from 'react';
import { Cpu, Wifi, Activity, Terminal, RefreshCw, Server, Power, Radio, Search, ServerCrash, Zap } from 'lucide-react';
import axios from 'axios';
import './HardwareIoT.css';

export default function HardwareIoT({ equipamentos, showToast, isOffline }) {
  
  const [hwNodes, setHwNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const carregarHardware = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const token = sessionStorage.getItem('token');
      const resposta = await axios.get('http://localhost:3000/api/hardware', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const agora = new Date().getTime();
      
      const formatado = resposta.data.map(eq => {
        // Verifica se a última comunicação foi há mais de 3 minutos (180.000 ms)
        const tempoDesdeUltimoSinal = eq.ultima_comunicacao ? (agora - new Date(eq.ultima_comunicacao).getTime()) : 999999999;
        const isNodeOffline = tempoDesdeUltimoSinal > 180000;
        
        let signalClass = 'signal-excellent';
        if (eq.signal_dbm < -70) signalClass = 'signal-weak';
        else if (eq.signal_dbm < -60) signalClass = 'signal-good';
        if (eq.signal_dbm < -80) signalClass = 'signal-bad';

        return {
          ...eq,
          mac: eq.mac || '00:00:00:00:00:00',
          ip: eq.ip || '0.0.0.0',
          signal: eq.signal_dbm || -100,
          signalClass,
          uptime: eq.uptime || '0h',
          fwVersion: eq.fwVersion || 'v1.0.0',
          isNodeOffline
        };
      });
      
      setHwNodes(formatado);
    } catch (error) {
      showToast('Erro de sincronização com os Edge Nodes.', 'error');
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 500);
        showToast('Varredura de rede concluída.', 'success');
      }
    }
  };

  useEffect(() => {
    if (!isOffline) {
      carregarHardware();
      const interval = setInterval(carregarHardware, 10000); // Polling a cada 10s
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isOffline]);

  const nodesFiltrados = useMemo(() => {
    if (!busca.trim()) return hwNodes;
    const termo = busca.toLowerCase();
    return hwNodes.filter(n => 
      n.nome?.toLowerCase().includes(termo) || 
      n.ip?.toLowerCase().includes(termo) ||
      n.mac?.toLowerCase().includes(termo)
    );
  }, [hwNodes, busca]);

  const kpis = useMemo(() => {
    const total = hwNodes.length;
    let online = 0;
    let offline = 0;
    hwNodes.forEach(n => {
      if (n.isNodeOffline) offline++;
      else online++;
    });
    return { total, online, offline };
  }, [hwNodes]);

  const handleReboot = (nome) => {
    if (isOffline) return showToast('Control Plane Offline. Comando abortado.', 'error');
    showToast(`Sinal SIGTERM enviado. Reiniciando nó ${nome}...`, 'warning');
  };

  const handleOTA = (nome) => {
    if (isOffline) return showToast('Control Plane Offline. Comando abortado.', 'error');
    showToast(`Iniciando injeção de Firmware (OTA Flash) no nó ${nome}.`, 'info');
  };

  return (
    <div className="anim-fade-in stagger-1">
      
      {/* HEADER & SEARCH */}
      <div className="edge-header-actions">
        <div>
          <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
            <Server style={{ marginRight: '10px', color: 'var(--secondary)' }}/> Gestão de Edge Computing
          </h3>
          <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
            Monitoramento de infraestrutura de borda (Sensores ESP32/Arduino).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-box-edge">
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Filtrar IP, MAC ou Nome..." value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
          <button className="btn btn-outline" onClick={() => carregarHardware(true)} title="Forçar Varredura de Rede" style={{ padding: '8px 12px' }}>
            <RefreshCw size={18} className={isRefreshing ? 'spinner' : ''} />
          </button>
        </div>
      </div>

      {/* KPI BAR */}
      <div className="edge-kpi-bar stagger-2">
        <div className="kpi-item total">
          <div className="kpi-icon"><Cpu size={22}/></div>
          <div className="kpi-data"><span className="kpi-value">{kpis.total}</span><span className="kpi-label">Nós Provisionados</span></div>
        </div>
        <div className="kpi-item success">
          <div className="kpi-icon"><Zap size={22}/></div>
          <div className="kpi-data"><span className="kpi-value" style={{color: 'var(--success)'}}>{kpis.online}</span><span className="kpi-label">Telemetria Ativa</span></div>
        </div>
        <div className="kpi-item danger">
          <div className="kpi-icon"><ServerCrash size={22}/></div>
          <div className="kpi-data"><span className="kpi-value" style={{color: 'var(--danger)'}}>{kpis.offline}</span><span className="kpi-label">Falhas de Conexão</span></div>
        </div>
      </div>

      {/* NODE GRID */}
      <div className="iot-fleet-grid stagger-3">
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
             <RefreshCw size={32} className="spinner" style={{ opacity: 0.5, marginBottom: '1rem' }} />
             <p>Mapeando topologia de rede...</p>
          </div>
        ) : nodesFiltrados.map(node => (
          <div key={node.id} className={`iot-node-card ${node.isNodeOffline ? 'card-offline' : 'card-online'}`}>
            
            <div className="node-header">
              <div className="node-ident">
                <div className="node-icon">
                  <Server size={22} />
                </div>
                <div>
                  <div className="node-name">{node.nome}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Radio size={12}/> {node.filial}
                  </div>
                </div>
              </div>
              <div className={`node-status ${node.isNodeOffline ? 'status-offline' : 'status-online'}`}>
                <Activity size={12} className={!node.isNodeOffline ? 'pulse-danger-icon' : ''} />
                {node.isNodeOffline ? 'OFFLINE' : 'ONLINE'}
              </div>
            </div>

            <div className="node-specs">
              <div className="spec-item">
                <span className="spec-label">Endereço IPv4 (LAN)</span>
                <span className="spec-value">{node.ip}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Endereço MAC Físico</span>
                <span className="spec-value">{node.mac}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Sinal Wi-Fi (RSSI)</span>
                <span className={`spec-value wifi-signal ${node.signalClass}`}>
                  <Wifi size={12} /> {node.signal} dBm
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Tempo em Execução</span>
                <span className="spec-value">{node.isNodeOffline ? 'N/A' : node.uptime}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Kernel / Firmware</span>
                <span className="spec-value" style={{ color: 'var(--secondary)', background: 'rgba(56, 189, 248, 0.05)' }}>{node.fwVersion}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Último Heartbeat</span>
                <span className="spec-value" style={{color: node.isNodeOffline ? 'var(--danger)' : 'inherit', background: node.isNodeOffline ? 'rgba(239, 68, 68, 0.05)' : ''}}>
                  {node.ultima_comunicacao ? new Date(node.ultima_comunicacao).toLocaleTimeString() : 'Desconhecido'}
                </span>
              </div>
            </div>

            <div className="node-actions">
              <button className="btn-node btn-reboot" onClick={() => handleReboot(node.nome)} title="Forçar reinício a quente">
                <Power size={14} /> REINICIAR (SIGTERM)
              </button>
              <button className="btn-node btn-ota" onClick={() => handleOTA(node.nome)} title="Enviar pacote de atualização">
                <RefreshCw size={14} /> INJETAR FIRMWARE
              </button>
            </div>

          </div>
        ))}

        {!loading && nodesFiltrados.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <Terminal size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Nenhum nó de telemetria localizado.</p>
            <p style={{ fontSize: '0.85rem' }}>Verifique os filtros de busca ou a conectividade do gateway.</p>
          </div>
        )}
      </div>
    </div>
  );
}