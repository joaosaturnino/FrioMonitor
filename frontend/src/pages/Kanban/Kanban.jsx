import React, { useState, useMemo } from 'react';
import { 
  Columns, Wrench, Clock, CheckCircle, ArrowRight, AlertTriangle, 
  Search, Calendar, MapPin, User, ActivitySquare, Server
} from 'lucide-react';
import './Kanban.css';

export default function Kanban({ chamados, api, carregarChamados, showToast, isOffline }) {
  
  const [busca, setBusca] = useState('');

  const colunas = [
    { id: 'Aberto', title: 'Novos / Triagem', icon: AlertTriangle, color: 'var(--danger)' },
    { id: 'Em Andamento', title: 'Intervenção (FSM)', icon: Wrench, color: 'var(--warning)' },
    { id: 'Aguardando Peça', title: 'Aguardando Logística', icon: Clock, color: 'var(--info)' },
    { id: 'Concluído', title: 'Auditoria Fechada', icon: CheckCircle, color: 'var(--success)' }
  ];

  const moverChamado = async (id, novoStatus) => {
    if (isOffline) return showToast('Control Plane Offline. Sem conexão.', 'error');
    try {
      await api.put(`/chamados/${id}/status`, { status: novoStatus });
      carregarChamados();
      showToast(`Incidente encaminhado para: ${novoStatus}`, 'success');
    } catch (e) { showToast('Erro de sincronização de ticket.', 'error'); }
  };

  const listaSeguraChamados = chamados || [];

  // Motor de Filtro (Pesquisa inteligente)
  const chamadosFiltrados = useMemo(() => {
    if (!busca.trim()) return listaSeguraChamados;
    const termo = busca.toLowerCase();
    return listaSeguraChamados.filter(c => 
      c.equipamento_nome?.toLowerCase().includes(termo) ||
      c.descricao?.toLowerCase().includes(termo) ||
      String(c.id).includes(termo) ||
      c.filial?.toLowerCase().includes(termo)
    );
  }, [listaSeguraChamados, busca]);

  // Motor de KPIs ITSM
  const kpis = useMemo(() => {
    const total = listaSeguraChamados.filter(c => !c.arquivado).length;
    const criticos = listaSeguraChamados.filter(c => c.status === 'Aberto' && !c.arquivado).length;
    const resolvidos = listaSeguraChamados.filter(c => c.status === 'Concluído' && !c.arquivado).length;
    return { total, criticos, resolvidos };
  }, [listaSeguraChamados]);

  return (
    <div className="anim-fade-in stagger-1 kanban-wrapper">
      
      {/* HEADER & SEARCH */}
      <div className="itsm-header-actions">
        <div>
          <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
            <Columns style={{ marginRight: '10px', color: 'var(--primary)' }}/> Gestão de Incidentes (ITSM)
          </h3>
          <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
            Field Service Management (FSM) e Orquestração de Equipes de Manutenção.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-box-itsm">
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Pesquisar OS, Máquina ou Filtro..." value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
        </div>
      </div>

      {/* KPI BAR */}
      <div className="itsm-kpi-bar stagger-2">
        <div className="kpi-item total">
          <div className="kpi-icon"><ActivitySquare size={22}/></div>
          <div className="kpi-data"><span className="kpi-value">{kpis.total}</span><span className="kpi-label">Tickets Ativos</span></div>
        </div>
        <div className="kpi-item danger">
          <div className="kpi-icon"><AlertTriangle size={22}/></div>
          <div className="kpi-data"><span className="kpi-value" style={{color: 'var(--danger)'}}>{kpis.criticos}</span><span className="kpi-label">Triagem Pendente (SLA)</span></div>
        </div>
        <div className="kpi-item success">
          <div className="kpi-icon"><CheckCircle size={22}/></div>
          <div className="kpi-data"><span className="kpi-value" style={{color: 'var(--success)'}}>{kpis.resolvidos}</span><span className="kpi-label">Aguardando Auditoria</span></div>
        </div>
      </div>

      {/* BOARD ITSM */}
      <div className="kanban-board stagger-3">
        {colunas.map(col => {
          const chamadosColuna = chamadosFiltrados.filter(c => c.status === col.id && !c.arquivado);
          
          return (
            <div key={col.id} className="kanban-column" style={{ borderTop: `4px solid ${col.color}` }}>
              
              <div className="kanban-column-header">
                <span className="kanban-column-title">
                  <col.icon size={16} color={col.color}/> {col.title}
                </span>
                <span className="kanban-badge">{chamadosColuna.length}</span>
              </div>
              
              <div className="kanban-list">
                {chamadosColuna.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Server size={32} style={{opacity: 0.2, margin: '0 auto 10px auto'}}/>
                    <p style={{ margin: 0, opacity: 0.6 }}>Fila de trabalho limpa.</p>
                  </div>
                ) : (
                  chamadosColuna.map(c => (
                    <div key={c.id} className="kanban-card" style={{ '--ticket-color': col.color }}>
                      
                      <div className="kanban-card-header">
                        <span className="kanban-equip-name">{c.equipamento_nome}</span>
                        <span className="kanban-id">OS-{c.id}</span>
                      </div>

                      <div className="ticket-meta">
                        <div className="ticket-meta-item" title="Localização">
                          <MapPin size={12}/> {c.filial || 'Indisponível'}
                        </div>
                        <div className="ticket-meta-item" title="Abertura">
                          <Calendar size={12}/> {c.data_abertura ? new Date(c.data_abertura).toLocaleDateString() : '--'}
                        </div>
                      </div>

                      <p className="kanban-desc">{c.descricao}</p>
                      
                      <div className="ticket-footer">
                        <div className="ticket-assignee" title="Autor do Chamado">
                           <div className="ticket-avatar">
                             {c.aberto_por ? c.aberto_por.charAt(0).toUpperCase() : 'U'}
                           </div>
                           {c.aberto_por || 'Sistema'}
                        </div>

                        <div className="kanban-actions">
                          {colunas.map(targetCol => {
                            if (targetCol.id === col.id) return null;
                            return (
                              <button 
                                key={targetCol.id} 
                                className="btn-kanban-move"
                                onClick={() => moverChamado(c.id, targetCol.id)} 
                                title={`Mudar Workflow: ${targetCol.title}`}
                              >
                                 {targetCol.id === 'Concluído' ? <CheckCircle size={14} color="var(--success)"/> : <ArrowRight size={14}/>}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          )
        })}
      </div>
    </div>
  );
}