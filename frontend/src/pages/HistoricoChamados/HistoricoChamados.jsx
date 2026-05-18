import React, { useState, useMemo, memo } from 'react';
import { 
  Printer, Archive, MapPin, User, Wrench, CheckSquare, 
  CalendarCheck, Search, FileText, Trash2, AlertTriangle, 
  Loader2, ShieldCheck, Activity, Users
} from 'lucide-react';
import './HistoricoChamados.css';

// ============================================================================
// COMPONENTE OTIMIZADO (MEMO): Evita a re-renderização massiva da lista
// ============================================================================
const HistoricoCard = memo(({ c }) => {
  return (
    <div className="card historico-card">
      <div className="historico-header">
        <div className="historico-equip-title">
          <Activity size={20} color="var(--text-muted)" />
          {c.equipamento_nome}
        </div>
        <div className="historico-badges">
          {c.urgencia && <span className="historico-badge badge-urgencia">{c.urgencia}</span>}
          <span className="historico-badge">Auditoria Fechada</span>
        </div>
      </div>

      <div className="historico-desc-box">
        <span className="quote-mark">"</span>{c.descricao}<span className="quote-mark">"</span>
      </div>

      <div className="historico-meta-grid">
        <div className="historico-meta-item">
          <MapPin size={15} /> Local: <strong>{c.filial}</strong>
        </div>
        <div className="historico-meta-item">
          <User size={15} /> Abertura: <strong>{c.solicitante_nome || c.aberto_por}</strong>
        </div>
        <div className="historico-meta-item">
          <Wrench size={15} /> Técnico: <strong>{c.tecnico_responsavel || 'Equipe Geral'}</strong>
        </div>
      </div>

      <div className="historico-resolucao">
        <div className="historico-resolucao-title">
          <CheckSquare size={16} color="var(--success)" /> Laudo Técnico Registrado:
        </div>
        <div className="historico-resolucao-text">
          {c.nota_resolucao}
        </div>
        <div className="historico-resolucao-footer">
          <div className="historico-resolucao-date">
            <CalendarCheck size={14} />
            {c.data_conclusao ? new Date(c.data_conclusao).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Data indisponível'}
          </div>
          <div className="audit-stamp">VERIFICADO</div>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function HistoricoChamados({
  userRole, filialAtiva, nomeLogado, chamados = [], tecnicosDb = [], gerarLoteOS, 
  api, carregarChamados, showToast
}) {
  const [tecnicoFiltroOS, setTecnicoFiltroOS] = useState('todos');
  const [busca, setBusca] = useState('');
  
  // Estados para o Modal de Exclusão
  const [modalExcluir, setModalExcluir] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtro de Alta Performance (Single-Pass Loop)
  const chamadosHistoricoFiltrados = useMemo(() => {
    if (!chamados || chamados.length === 0) return [];

    const trintaDiasAtrasTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // Cálculo feito apenas uma vez
    const termo = busca.toLowerCase().trim();
    const roleAdmin = userRole === 'ADMIN';
    const roleManu = userRole === 'MANUTENCAO';

    let list = chamados.filter(c => {
        const dataConclusaoMs = c.data_conclusao ? new Date(c.data_conclusao).getTime() : 0;
        const isAntigo = dataConclusaoMs > 0 && dataConclusaoMs < trintaDiasAtrasTime;
        
        // Verifica se pertence ao arquivo histórico
        if (!c.arquivado && !(c.status === 'Concluído' && isAntigo)) return false;

        // Filtro de Role e Filial
        if (roleAdmin && filialAtiva !== 'Todas' && c.filial !== filialAtiva) return false;
        if (roleManu) {
            if (c.tecnico_responsavel !== nomeLogado) return false;
        } else if (tecnicoFiltroOS !== 'todos') {
            if (c.tecnico_responsavel !== tecnicoFiltroOS) return false;
        }

        // Filtro de Pesquisa de Texto
        if (termo) {
          const eqNome = c.equipamento_nome ? c.equipamento_nome.toLowerCase() : '';
          const desc = c.descricao ? c.descricao.toLowerCase() : '';
          const nota = c.nota_resolucao ? c.nota_resolucao.toLowerCase() : '';
          const tecResp = c.tecnico_responsavel ? c.tecnico_responsavel.toLowerCase() : '';
          
          if (!eqNome.includes(termo) && !desc.includes(termo) && !nota.includes(termo) && !tecResp.includes(termo)) {
              return false;
          }
        }

        return true;
    });

    // Ordenação do mais recente para o mais antigo
    return list.sort((a, b) => {
      const timeA = a.data_conclusao ? new Date(a.data_conclusao).getTime() : 0;
      const timeB = b.data_conclusao ? new Date(b.data_conclusao).getTime() : 0;
      return timeB - timeA;
    });
  }, [chamados, filialAtiva, userRole, nomeLogado, tecnicoFiltroOS, busca]);

  // KPIs de Auditoria
  const kpis = useMemo(() => {
    const total = chamadosHistoricoFiltrados.length;
    const tecnicosUnicos = new Set(chamadosHistoricoFiltrados.map(c => c.tecnico_responsavel).filter(Boolean)).size;
    return { total, tecnicosUnicos };
  }, [chamadosHistoricoFiltrados]);

  // ======================================================================
  // FUNÇÃO DE EXCLUSÃO
  // ======================================================================
  const handleExcluirHistorico = async () => {
    setIsDeleting(true);
    try {
      if (!api) throw new Error('Falha de conexão ao núcleo da API.');
      
      await api.delete('/chamados/arquivados');
      
      if (showToast) showToast('Arquivo histórico purgado com sucesso.', 'success');
      setModalExcluir(false);
      
      if (carregarChamados) carregarChamados();
      
    } catch (error) {
      const mensagemErro = error.response?.data?.error || error.message || 'Erro ao comunicar com o Banco de Dados';
      if (showToast) showToast(mensagemErro, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="anim-fade-in stagger-1">
      
      {/* CABEÇALHO */}
      <div className="flex-header historico-header">
        <div>
          <h3 className="historico-chamados-title">Arquivo de Intervenções</h3>
          <p className="historico-chamados-subtitle">Registro histórico de manutenções e laudos técnicos imutáveis.</p>
        </div>

        <div className="action-group">
          <div className="search-box-historico">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar máquina, laudo ou técnico..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {userRole !== 'MANUTENCAO' && (
            <select
              className="select-input historico-filter-select"
              value={tecnicoFiltroOS}
              onChange={e => setTecnicoFiltroOS(e.target.value)}
            >
              <option value="todos">Todos os Técnicos</option>
              {tecnicosDb?.map(tec => (
                <option key={tec.id} value={tec.nome_tecnico}>{tec.nome_tecnico}</option>
              ))}
            </select>
          )}

          <button
            className="btn btn-outline btn-print-history"
            onClick={() => gerarLoteOS(chamadosHistoricoFiltrados || [])}
          >
            <Printer size={18} /> Exportar Relatório PDF
          </button>

          {userRole === 'ADMIN' && chamadosHistoricoFiltrados.length > 0 && (
            <button
              className="btn btn-danger-outline"
              onClick={() => setModalExcluir(true)}
              title="Excluir todo o histórico"
            >
              <Trash2 size={18} /> Apagar Arquivo
            </button>
          )}
        </div>
      </div>

      {/* KPIs RÁPIDOS */}
      <div className="historico-kpis stagger-2">
        <div className="kpi-box">
          <div className="kpi-icon-wrap"><Archive size={20} /></div>
          <div>
            <div className="kpi-value">{kpis.total}</div>
            <div className="kpi-label">Laudos Arquivados</div>
          </div>
        </div>
        <div className="kpi-box">
          <div className="kpi-icon-wrap info"><Users size={20} /></div>
          <div>
            <div className="kpi-value">{kpis.tecnicosUnicos}</div>
            <div className="kpi-label">Técnicos Envolvidos</div>
          </div>
        </div>
        <div className="kpi-box">
          <div className="kpi-icon-wrap success"><ShieldCheck size={20} /></div>
          <div>
            <div className="kpi-value">100%</div>
            <div className="kpi-label">Conformidade (RDC)</div>
          </div>
        </div>
      </div>

      {/* ESTADO VAZIO */}
      {!chamadosHistoricoFiltrados || chamadosHistoricoFiltrados.length === 0 ? (
        <div className="empty-state dashboard-empty stagger-3" style={{ marginTop: '2rem' }}>
          <div className="empty-shield-box" style={{ background: 'rgba(100, 116, 139, 0.1)' }}>
            <FileText size={48} color="var(--text-muted)" />
          </div>
          <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Arquivo Limpo</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '400px' }}>
            {busca ? 'Tente utilizar outros termos na sua pesquisa.' : 'Não existem ordens de serviço arquivadas no banco de dados com os filtros atuais.'}
          </p>
        </div>
      ) : (
        /* LISTA DE CARTÕES DE AUDITORIA */
        <div className="grid-cards historico-grid stagger-3" style={{ marginTop: '1.5rem' }}>
          {chamadosHistoricoFiltrados.map(c => (
            <HistoricoCard key={c.id} c={c} />
          ))}
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (ZONA DE PERIGO) */}
      {modalExcluir && (
        <div className="historico-fixed-overlay anim-fade-in">
          <div className="historico-modal-box">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)', margin: '0 0 1rem 0', fontWeight: '900' }}>
              <AlertTriangle size={24} className="pulse-danger-icon" /> Purga de Arquivo Crítica
            </h3>
            
            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>
              Tem certeza que deseja <strong>excluir permanentemente</strong> todos os laudos técnicos arquivados? 
              <br/><br/>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Esta ação <strong>não pode ser desfeita</strong> e todos os registros usados para efeito de auditoria e métricas ESG serão eliminados do núcleo do servidor.
              </span>
            </p>
            
            <div className="modal-actions-historico">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setModalExcluir(false)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleExcluirHistorico}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 size={18} className="spinner" /> : <Trash2 size={18} />}
                {isDeleting ? 'Apagando...' : 'Sim, Apagar Todos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}