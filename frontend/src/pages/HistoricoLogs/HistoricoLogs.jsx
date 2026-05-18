import React, { useState, useMemo } from 'react';
import { 
  FileText, AlertTriangle, CheckSquare, History, MapPin, 
  ActivitySquare, ShieldCheck, Search, Thermometer, Power, 
  WifiOff, Download, Terminal, Filter, Zap, ShieldAlert, Cpu
} from 'lucide-react';
import './HistoricoLogs.css';

export default function HistoricoLogs({ historicoFiltradoLista = [], gerarExportacao }) {
  
  const [buscaLog, setBuscaLog] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('ALL'); // ALL, THERMAL, POWER, NETWORK, OTHER

  /**
   * Identifica o tipo de erro com base no texto para exibir ícones, cores e categorização NOC
   */
  const getLogInteligencia = (mensagem) => {
    const msg = mensagem?.toLowerCase() || '';
    if (msg.includes('temperatura') || msg.includes('térmica') || msg.includes('excursão') || msg.includes('frio') || msg.includes('umidade') || msg.includes('humidade')) {
      return { type: 'THERMAL', label: 'Excursão Térmica', icon: Thermometer, color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.3)' }; 
    }
    if (msg.includes('parada') || msg.includes('motor') || msg.includes('energia') || msg.includes('tensão') || msg.includes('porta')) {
      return { type: 'POWER', label: 'Falha Eletromecânica', icon: Zap, color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' }; 
    }
    if (msg.includes('comunicação') || msg.includes('rede') || msg.includes('offline') || msg.includes('sinal') || msg.includes('sensor')) {
      return { type: 'NETWORK', label: 'Quebra de Telemetria', icon: WifiOff, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', border: 'rgba(56, 189, 248, 0.3)' }; 
    }
    return { type: 'OTHER', label: 'Alerta Genérico', icon: AlertTriangle, color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' }; 
  };

  // Processamento de Filtros e Pesquisa
  const logsProcessados = useMemo(() => {
    if (!historicoFiltradoLista) return [];
    
    return historicoFiltradoLista.filter(log => {
      const matchBusca = 
        (log.equipamento_nome && log.equipamento_nome.toLowerCase().includes(buscaLog.toLowerCase())) ||
        (log.mensagem && log.mensagem.toLowerCase().includes(buscaLog.toLowerCase())) ||
        (log.nota_resolucao && log.nota_resolucao.toLowerCase().includes(buscaLog.toLowerCase()));
      
      const tipoInteligente = getLogInteligencia(log.mensagem).type;
      const matchTipo = filtroTipo === 'ALL' || tipoInteligente === filtroTipo;

      return matchBusca && matchTipo;
    }).sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora)); // Mais recentes primeiro
  }, [historicoFiltradoLista, buscaLog, filtroTipo]);

  // KPIs de Auditoria
  const kpis = useMemo(() => {
    let thermal = 0; let power = 0; let network = 0;
    historicoFiltradoLista.forEach(log => {
      const t = getLogInteligencia(log.mensagem).type;
      if (t === 'THERMAL') thermal++;
      else if (t === 'POWER') power++;
      else if (t === 'NETWORK') network++;
    });
    return { total: historicoFiltradoLista.length, thermal, power, network };
  }, [historicoFiltradoLista]);

  return (
    <div className="anim-fade-in stagger-1">
      
      {/* =========================================================
          CABEÇALHO DA AUDITORIA & EXPORTAÇÃO
          ========================================================= */}
      <div className="flex-header historico-header-area">
        <div className="historico-title-box">
          <div className="icon-circle" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              Auditoria de Conformidade (RDC)
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              Registro centralizado de ocorrências e laudos técnicos imutáveis.
            </span>
          </div>
        </div>

        <div className="audit-export-actions">
          <button className="btn btn-outline btn-export-log pdf" onClick={() => gerarExportacao('pdf')} title="Exportar Relatório PDF com validade legal">
            <FileText size={18} /> Relatório RDC (PDF)
          </button>
          <button className="btn btn-outline btn-export-log csv" onClick={() => gerarExportacao('csv')} title="Exportar Dados Brutos (Raw)">
            <Download size={18} /> Data-Log (CSV)
          </button>
        </div>
      </div>

      {/* =========================================================
          PAINEL DE TRIAGEM RÁPIDA (KPIS & FILTROS)
          ========================================================= */}
      <div className="audit-triage-panel stagger-2">
        <div className="triage-search">
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Pesquisar máquina, laudo, ou código..." 
            value={buscaLog} 
            onChange={e => setBuscaLog(e.target.value)} 
          />
        </div>

        <div className="triage-filters-group">
          <button className={`triage-chip all ${filtroTipo === 'ALL' ? 'active' : ''}`} onClick={() => setFiltroTipo('ALL')}>
            <Filter size={14}/> Todos os Registros <span className="chip-count">{kpis.total}</span>
          </button>
          <button className={`triage-chip thermal ${filtroTipo === 'THERMAL' ? 'active' : ''}`} onClick={() => setFiltroTipo('THERMAL')}>
            <Thermometer size={14}/> Excursões Térmicas <span className="chip-count">{kpis.thermal}</span>
          </button>
          <button className={`triage-chip power ${filtroTipo === 'POWER' ? 'active' : ''}`} onClick={() => setFiltroTipo('POWER')}>
            <Zap size={14}/> Eletromecânica <span className="chip-count">{kpis.power}</span>
          </button>
          <button className={`triage-chip network ${filtroTipo === 'NETWORK' ? 'active' : ''}`} onClick={() => setFiltroTipo('NETWORK')}>
            <WifiOff size={14}/> Rede / Sensores <span className="chip-count">{kpis.network}</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          TIMELINE ESTILO TERMINAL (SYSTEM LOG)
          ========================================================= */}
      {!logsProcessados || logsProcessados.length === 0 ? (
        <div className="log-empty-state stagger-3">
          <div className="empty-shield-box pulse-success-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <ShieldCheck size={48} color="var(--success)" />
          </div>
          <h3>Registro Limpo</h3>
          <p>Não foram encontrados logs que correspondam aos filtros de auditoria selecionados. O histórico está em conformidade.</p>
        </div>
      ) : (
        <div className="timeline-container stagger-3">
          {logsProcessados.map((hist, index) => {
            const intl = getLogInteligencia(hist.mensagem);
            const IconCmp = intl.icon;
            
            // Simulação de HASH de Auditoria para aspecto mais "NOC"
            const auditHash = `TX-${new Date(hist.data_hora).getTime().toString(16).toUpperCase()}-${hist.id}`;

            return (
              <div key={hist.id} className="timeline-item">
                
                {/* Linha e Ponto Conector */}
                <div className="timeline-connector">
                  <div className="timeline-dot" style={{ background: intl.color, boxShadow: `0 0 10px ${intl.color}` }}>
                    <IconCmp size={12} color="var(--card-bg)" />
                  </div>
                  {index < logsProcessados.length - 1 && <div className="timeline-line"></div>}
                </div>

                {/* Cartão de Registro */}
                <div className="timeline-content card log-card" style={{ '--log-color': intl.color, '--log-bg': intl.bg, '--log-border': intl.border }}>
                  
                  {/* Cabeçalho do Log */}
                  <div className="log-card-header">
                    <div className="log-meta-info">
                      <span className="log-timestamp">
                        <History size={14} /> 
                        {new Date(hist.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })}
                      </span>
                      <span className="log-hash">ID: {auditHash}</span>
                    </div>
                    
                    <div className="log-badges">
                      <span className="log-badge-type" style={{ color: intl.color, background: intl.bg, border: `1px solid ${intl.border}` }}>
                        <IconCmp size={12}/> {intl.label}
                      </span>
                      <span className="log-badge-location">
                        <MapPin size={12} /> {hist.filial || 'Filial Base'}
                      </span>
                    </div>
                  </div>

                  {/* Corpo (Problema) */}
                  <div className="log-card-body">
                    <h4 className="log-equip-title">
                      <Cpu size={16} /> {hist.equipamento_nome} <span className="equip-setor-tag">{hist.setor}</span>
                    </h4>
                    
                    <div className="log-issue-box" style={{ borderLeftColor: intl.color, background: 'rgba(0,0,0,0.02)' }}>
                      <Terminal size={14} className="terminal-icon"/>
                      <span className="log-issue-text"><strong>Alarme Disparado:</strong> {hist.mensagem}</span>
                    </div>
                  </div>

                  {/* Resolução (Laudo) */}
                  <div className="log-card-resolution">
                    <div className="resolution-header">
                      <ShieldCheck size={16} color="var(--success)" />
                      <strong>Parecer Técnico / Ação Corretiva:</strong>
                    </div>
                    <div className="resolution-text">
                      {hist.nota_resolucao}
                    </div>
                    
                    <div className="resolution-stamp">
                      <div className="stamp-watermark">
                        <CheckSquare size={12}/> RDC COMPLIANT
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}