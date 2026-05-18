import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { Zap, CheckCircle, BrainCircuit, Thermometer, Clock3, FileText, ShieldCheck, Loader2, WifiOff, Filter, Activity, Terminal } from 'lucide-react';

import ptBR from 'date-fns/locale/pt-BR'; 
registerLocale('pt', ptBR);

import 'react-datepicker/dist/react-datepicker.css';
import './Relatorios.css';

export default function Relatorios({ 
  totalEnergia, slaCompliance, kpis, mktValueProcessado, dataInicio, setDataInicio, dataFim, setDataFim, 
  isOffline, equipamentoFiltro, setEquipamentoFiltro, equipamentosDaFilial, gerarExportacao, 
  dadosGraficoFiltrados, isDarkMode, equipamentoSelecionado, ultimasLeiturasRaw 
}) {

  // Função Tática de NOC: Filtros Rápidos de Tempo
  const setQuickRange = (hours) => {
    const end = new Date();
    const start = new Date();
    start.setHours(start.getHours() - hours);
    setDataInicio(start);
    setDataFim(end);
  };

  return (
    <div className="anim-fade-in stagger-1">
      
      {/* =========================================================
          SEÇÃO 1: KPIs SUPERIORES INTELIGENTES (INTELIGÊNCIA ESG)
          ========================================================= */}
      <div className="kpi-relatorios-grid stagger-1">
        
        {/* KPI 1: Sustentabilidade ESG (Energia Total) */}
        <div className="kpi-relatorios-card">
          <div className="kpi-relatorios-header">
            <span className="kpi-relatorios-title">Consumo Energético ESG</span>
            <div className="kpi-relatorios-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <Zap size={20} color="#f59e0b" />
            </div>
          </div>
          <div className="kpi-relatorios-value kpi-neon-blue">
            {totalEnergia?.toFixed(1) || '--'} <span style={{ fontSize: '1.2rem', opacity: 0.6 }}>kWh</span>
          </div>
          <span className="kpi-relatorios-subtitle">Impacto na pegada de carbono</span>
        </div>

        {/* KPI 2: Auditoria Legal (SLA) */}
        <div className="kpi-relatorios-card">
          <div className="kpi-relatorios-header">
            <span className="kpi-relatorios-title">Conformidade Legal (ANVISA)</span>
            <div className="kpi-relatorios-icon-box">
              <CheckCircle size={20} color="var(--success)" />
            </div>
          </div>
          <div className={`kpi-relatorios-value ${Number(slaCompliance) < 95 ? 'kpi-neon-red pulse-danger-text' : 'kpi-neon-green'}`}>
            {slaCompliance || '--'} <span style={{ fontSize: '1.2rem', opacity: 0.6 }}>%</span>
          </div>
          <span className="kpi-relatorios-subtitle">Tempo no limite seguro térmico</span>
        </div>

        {/* KPI 3: Inteligência Metrológica (MKT - Média Cinética) */}
        <div className="kpi-relatorios-card">
          <div className="kpi-relatorios-header">
            <span className="kpi-relatorios-title">MKT - Média Cinética</span>
            <div className="kpi-relatorios-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <BrainCircuit size={20} color="var(--info)" />
            </div>
          </div>
          <div className="kpi-relatorios-value kpi-neon-blue">
            {mktValueProcessado || '--'} <span style={{ fontSize: '1.2rem', opacity: 0.6 }}>°C</span>
          </div>
          <span className="kpi-relatorios-subtitle">Impacto termodinâmico/vida útil</span>
        </div>

        {/* KPI 4: Pico Térmico Registrado no Período */}
        <div className="kpi-relatorios-card">
          <div className="kpi-relatorios-header">
            <span className="kpi-relatorios-title">Pico Térmico Registrado</span>
            <div className="kpi-relatorios-icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <Thermometer size={20} color="var(--danger)" />
            </div>
          </div>
          <div className="kpi-relatorios-value kpi-neon-red">
            {kpis?.kpiMaxT || '--'} <span style={{ fontSize: '1.2rem', opacity: 0.6 }}>°C</span>
          </div>
          <span className="kpi-relatorios-subtitle">Excursão térmica máxima detectada</span>
        </div>
      </div>

      {/* =========================================================
          SEÇÃO 2: PAINEL DE CONTROLES E COMANDOS TÁTICOS
          ========================================================= */}
      <div className="card relatorios-controls-card stagger-2">
        <div className="relatorios-controls-header">
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
             <ShieldCheck size={22} color="var(--primary)" /> 
             Central de Auditoria RDC
          </h3>
          
          {isOffline ? (
            <div className="telemetry-tag error">
              <WifiOff size={14}/> SINAL PERDIDO
            </div>
          ) : (
            <div className="telemetry-tag success">
              <Loader2 size={14} className="spinner" /> SENSOR LINK ATIVO
            </div>
          )}
        </div>
        
        <div className="controls-section">
          {/* Filtro: Máquina */}
          <div className="filter-group">
            <label className="filter-label"><Filter size={14}/> Foco de Análise</label>
            <select className="select-input select-tactical" value={equipamentoFiltro} onChange={(e) => setEquipamentoFiltro(e.target.value)}>
              <option value="">Visão Global da Filial</option>
              {equipamentosDaFilial?.map(eq => <option key={eq.id} value={eq.nome}>{eq.nome}</option>)}
            </select>
          </div>
          
          {/* Range de Tempo Automático (Quick Filters NOC) */}
          <div className="filter-group quick-ranges">
             <label className="filter-label"><Clock3 size={14}/> Saltos Temporais</label>
             <div className="quick-range-buttons">
                <button className="btn-quick-range" onClick={() => setQuickRange(1)}>1 Hora</button>
                <button className="btn-quick-range" onClick={() => setQuickRange(24)}>24 Horas</button>
                <button className="btn-quick-range" onClick={() => setQuickRange(24 * 7)}>7 Dias</button>
             </div>
          </div>

          {/* Filtros Livres de Data */}
          <div className="filter-group date-group">
            <div style={{display: 'flex', gap: '10px'}}>
              <div>
                <label className="filter-label">Início</label>
                <DatePicker selected={dataInicio} onChange={(d) => setDataInicio(d)} selectsStart startDate={dataInicio} endDate={dataFim} showTimeSelect locale="pt" dateFormat="Pp" className="date-picker-custom" />
              </div>
              <div>
                <label className="filter-label">Fim</label>
                <DatePicker selected={dataFim} onChange={(d) => setDataFim(d)} selectsEnd startDate={dataInicio} endDate={dataFim} minDate={dataInicio} showTimeSelect locale="pt" dateFormat="Pp" className="date-picker-custom" />
              </div>
            </div>
          </div>

          {/* Extração de Dados */}
          <div className="relatorios-export-group">
            <button className="btn btn-primary btn-extract" onClick={() => gerarExportacao('pdf')} disabled={isOffline}>
              <FileText size={18} /> Exportar PDF (Legal)
            </button>
            <button className="btn btn-outline btn-extract csv" onClick={() => gerarExportacao('csv')} disabled={isOffline}>
              <Terminal size={18} /> Extrair CSV (Raw)
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          SEÇÃO 3: COMPONENTES VISUAIS (GRÁFICO RECHARTS & TABELA RAW)
          ========================================================= */}
      <div className="relatorios-grid stagger-3">
        
        {/* GRÁFICO DINÂMICO RECHARTS */}
        <div className="card chart-relatorios-container">
          <div className="flex-header" style={{ marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--primary)"/> Comportamento Termodinâmico
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amostragem em tempo real</span>
          </div>
          
          {!dadosGraficoFiltrados || dadosGraficoFiltrados.length === 0 ? (
            <div className="chart-loading">
              <div className="radar-scanner-small"></div>
              Varrendo base de dados térmica...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={dadosGraficoFiltrados} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                <XAxis dataKey="hora" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                <YAxis unit="°C" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                
                {/* Tooltip Estilo HUD Tático */}
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid var(--primary)', backdropFilter: 'blur(8px)', borderRadius: '8px',
                    boxShadow: '0 0 15px rgba(5, 150, 105, 0.2)', fontFamily: 'monospace'
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                
                {/* Linhas de SLA (Surgem apenas se houver 1 máquina filtrada) */}
                {equipamentoSelecionado && (
                  <>
                    <ReferenceLine y={equipamentoSelecionado.temp_max} label={{ position: 'top', value: 'MAX SLA', fill: 'var(--danger)', fontSize: 10, fontWeight: 'bold' }} stroke="var(--danger)" strokeDasharray="4 4" strokeWidth={1.5} opacity={0.6} />
                    <ReferenceLine y={equipamentoSelecionado.temp_min} label={{ position: 'bottom', value: 'MIN SLA', fill: '#38bdf8', fontSize: 10, fontWeight: 'bold' }} stroke="#38bdf8" strokeDasharray="4 4" strokeWidth={1.5} opacity={0.6} />
                  </>
                )}

                <Line type="monotone" dataKey="temperatura" name="Temp (°C)" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                
                {dadosGraficoFiltrados[0]?.umidade > 0 && (
                  <Line type="monotone" dataKey="umidade" name="Umidade (%)" stroke="#38bdf8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* TABELA DE RAW DATA (ESTILO TERMINAL LOG) */}
        <div className="card table-responsive" style={{ background: isDarkMode ? '#020617' : '#f8fafc' }}>
          <div className="flex-header" style={{ marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} color="var(--text-muted)"/> Data-Log do Sensor
            </h4>
          </div>
          <div className="table-raw-container">
            {!ultimasLeiturasRaw || ultimasLeiturasRaw.length === 0 ? (
              <div className="empty-state">Sem comunicações telemétricas pendentes no bloco.</div>
            ) : (
              <table className="table terminal-table">
                <thead style={{ position: 'sticky', top: 0, background: isDarkMode ? '#0f172a' : '#e2e8f0', zIndex: 1 }}>
                  <tr>
                    <th>TS (Hora)</th>
                    <th>Nó de Rede</th>
                    <th>T(°C)</th>
                    <th>H(%)</th>
                    <th>PWR</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasLeiturasRaw.map((d, i) => {
                    // Lógica de alerta visual para quebra de SLA no terminal
                    let eqLocal = equipamentoSelecionado;
                    if (!eqLocal) eqLocal = equipamentosDaFilial?.find(x => x.nome === d.nome);
                    
                    const isForaLimites = eqLocal && (d.temperatura < eqLocal.temp_min || d.temperatura > eqLocal.temp_max);
                    
                    return (
                      <tr key={i} className={isForaLimites ? 'log-critical' : 'log-normal'}>
                        <td className="log-time">[{d.hora}]</td>
                        <td className="log-node" title={`${d.filial} - ${d.nome}`}>{d.nome.substring(0, 12)}</td>
                        <td className={`log-val ${isForaLimites ? 'val-alert pulse-danger-text' : 'val-ok'}`}>
                          {d.temperatura.toFixed(1)}
                        </td>
                        <td className="log-val">{d.umidade > 0 ? d.umidade.toFixed(1) : '--'}</td>
                        <td className="log-val">{d.consumo_kwh.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}