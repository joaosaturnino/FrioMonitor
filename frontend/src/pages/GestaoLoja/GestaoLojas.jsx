import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Store, Edit, X, Save, MapPin, Phone, UserCheck, Users, Building2, RefreshCw, Search, ShieldAlert, BarChart3, PlusCircle, Briefcase, ToggleLeft, ToggleRight } from 'lucide-react';
import './GestaoLojas.css';

export default function GestaoLojas({ api, showToast, setModalConfig, carregarDadosBase }) {
  
  // 🔥 PROTEÇÃO ABSOLUTA: Só o DEV tem permissão para ver Empresas e Status
  const role = sessionStorage.getItem('userRole') || 'LOJA';

  const [lojasLocais, setLojasLocais] = useState([]);
  const [empresasDb, setEmpresasDb] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [buscaLoja, setBuscaLoja] = useState('');
  
  const formInicialLoja = { id: '', nome: '', endereco_loja: '', telefone_loja: '', empresa: '', status: 'Ativa' };
  const [formLoja, setFormLoja] = useState({ ...formInicialLoja });
  const [modalLoja, setModalLoja] = useState(false);

  // Busca a Tabela de Lojas do Servidor
  const buscarLojasServidor = useCallback(async () => {
    try {
      const res = await api.get('/lojas');
      setLojasLocais(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Erro ao buscar lojas do servidor:", error);
      showToast('Aviso: Falha ao carregar a lista de filiais.', 'error');
    }
  }, [api, showToast]);

  // Se o usuário for DEV, busca a Tabela de Empresas para o Menu Dropdown
  const buscarEmpresas = useCallback(async () => {
    if (role !== 'DEV') return;
    try {
      const res = await api.get('/empresas');
      setEmpresasDb(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Erro ao buscar empresas", error);
    }
  }, [api, role]);

  useEffect(() => {
    buscarLojasServidor();
    buscarEmpresas();
  }, [buscarLojasServidor, buscarEmpresas]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await buscarLojasServidor();
    if (role === 'DEV') await buscarEmpresas();
    if (typeof carregarDadosBase === 'function') await carregarDadosBase();
    setTimeout(() => setIsRefreshing(false), 600);
    showToast('Tabela de filiais atualizada!', 'success');
  };

  const lojasFiltradas = useMemo(() => {
    if (!buscaLoja.trim()) return lojasLocais;
    const termo = buscaLoja.toLowerCase().trim();
    return lojasLocais.filter(l =>
      (l?.nome && l.nome.toLowerCase().includes(termo)) ||
      (l?.endereco && l.endereco.toLowerCase().includes(termo))
    );
  }, [lojasLocais, buscaLoja]);

  const kpis = useMemo(() => {
    let gerentes = 0; let coordenadores = 0;
    lojasLocais.forEach(l => {
      if (l?.nome_gerente && l.nome_gerente.trim() !== '') gerentes++;
      if (l?.nome_coordenador && l.nome_coordenador.trim() !== '') coordenadores++;
    });
    return { total: lojasLocais.length, gerentes, coordenadores };
  }, [lojasLocais]);

  const salvarLoja = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nome: formLoja.nome,
        endereco: formLoja.endereco_loja,
        telefone: formLoja.telefone_loja,
        empresa: formLoja.empresa, // Guardado em segredo no backend se não for DEV
        status: formLoja.status
      };

      if (formLoja.id) {
        await api.put(`/lojas/${formLoja.id}`, payload);
        showToast('Dados da filial atualizados com sucesso!', 'success');
      } else {
        if (!formLoja.nome) return showToast('O nome comercial é obrigatório.', 'error');
        await api.post('/lojas', payload);
        showToast('Nova filial integrada ao sistema!', 'success');
      }

      setModalLoja(false);
      buscarLojasServidor();
      if (typeof carregarDadosBase === 'function') carregarDadosBase();

    } catch (err) {
      showToast('Ocorreu um erro. Verifique se o nome da filial já existe.', 'error');
    }
  };

  // 🔥 FUNÇÃO EXCLUSIVA DO DEV: Mudar o status instantaneamente clicando no Ícone
  const alternarStatusLoja = async (loja) => {
    try {
      const novoStatus = loja.status === 'Ativa' || !loja.status ? 'Suspensa' : 'Ativa';
      const payload = {
          nome: loja.nome,
          endereco: loja.endereco,
          telefone: loja.telefone,
          empresa: loja.empresa,
          status: novoStatus
      };
      await api.put(`/lojas/${loja.id}`, payload);
      showToast(`Filial alterada para ${novoStatus}.`, 'info');
      buscarLojasServidor();
    } catch (err) {
      showToast('Erro ao suspender a filial.', 'error');
    }
  };

  const pedirExclusaoLoja = (id, nome) => {
    setModalConfig({
      isOpen: true,
      title: 'Remover Filial do Sistema',
      message: `Tem certeza que deseja remover a filial "${nome}" permanentemente?`,
      isPrompt: false,
      onConfirm: async () => {
        try {
          await api.delete(`/lojas/${id}`);
          showToast('Filial removida com sucesso.', 'success');
          buscarLojasServidor();
          if (typeof carregarDadosBase === 'function') carregarDadosBase();
        } catch (e) {
          showToast('Ação bloqueada. Remova os equipamentos associados primeiro.', 'error');
        }
      }
    });
  };

  return (
    <div className="anim-fade-in stagger-1">
      <div className="flex-header gestao-lojas-header">
        <h3 className="gestao-lojas-title">
          <Store size={24} color="var(--primary)" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> 
          Gestão de Filiais
        </h3>
        
        <div className="action-group" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={handleRefresh} title="Sincronizar com o Servidor" style={{ padding: '8px 12px', border: '1px solid var(--border)' }}>
            <RefreshCw size={18} className={isRefreshing ? 'spinner' : ''} />
          </button>

          <div className="loja-search-box">
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Procurar filial..." value={buscaLoja} onChange={e => setBuscaLoja(e.target.value)} />
          </div>
          
          <button className="btn btn-primary" onClick={() => { setFormLoja({ ...formInicialLoja }); setModalLoja(true); }} style={{ boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)' }}>
            <PlusCircle size={18} /> Registrar Filial
          </button>
        </div>
      </div>

      <div className="lojas-kpi-bar stagger-2">
        <div className="kpi-item total"><div className="kpi-icon"><BarChart3 size={20}/></div><div className="kpi-data"><span className="kpi-value">{kpis.total}</span><span className="kpi-label">Total de Filiais</span></div></div>
        <div className="kpi-item warning"><div className="kpi-icon"><UserCheck size={20}/></div><div className="kpi-data"><span className="kpi-value">{kpis.gerentes}</span><span className="kpi-label">Gerentes Ativos</span></div></div>
        <div className="kpi-item info"><div className="kpi-icon"><Users size={20}/></div><div className="kpi-data"><span className="kpi-value">{kpis.coordenadores}</span><span className="kpi-label">Coordenadores Ativos</span></div></div>
      </div>

      {lojasFiltradas.length === 0 ? (
        <div className="empty-state stagger-3" style={{ marginTop: '2rem', padding: '4rem 2rem', background: 'var(--card-bg)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
          <Building2 size={64} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Nenhuma Filial Encontrada</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Comece por adicionar filiais ou clique no botão de Sincronizar.</p>
        </div>
      ) : (
        <div className="card table-responsive gestao-lojas-card stagger-3">
          <table className="table">
            <thead>
              <tr>
                <th>Identificação da Loja</th>
                {/* MOSTRADO APENAS PARA O DESENVOLVEDOR (ROOT) */}
                {role === 'DEV' && <th>Tenant (Empresa Associada)</th>}
                <th>Equipe de Liderança</th>
                <th>Localização e Contato</th>
                {/* MOSTRADO APENAS PARA O DESENVOLVEDOR (ROOT) */}
                {role === 'DEV' && <th style={{ textAlign: 'center' }}>Status</th>}
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lojasFiltradas.map(l => (
                <tr key={l?.id || Math.random()} className={`loja-table-row ${l.status === 'Suspensa' ? 'row-suspensa' : ''}`}>
                  <td data-label="Loja">
                    <div className="loja-name-box">
                      <div className="loja-icon-wrapper">
                        <Building2 size={18} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{l?.nome || 'Loja Indefinida'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>ID: #{l?.id || '---'}</span>
                      </div>
                    </div>
                  </td>

                  {/* MOSTRADO APENAS PARA O DESENVOLVEDOR (ROOT) */}
                  {role === 'DEV' && (
                    <td data-label="Empresa">
                      <span className="tenant-badge" title="Tenant Proprietário">
                        <Briefcase size={14}/> {l.empresa || 'Cliente Alpha (Padrão)'}
                      </span>
                    </td>
                  )}

                  <td data-label="Gestão Local">
                    <div className="leadership-box">
                      {l?.nome_gerente ? (<span className="leader-badge manager"><UserCheck size={14} /> {l.nome_gerente}</span>) : (<span className="leader-badge missing"><ShieldAlert size={14} /> Sem Gerente</span>)}
                      {l?.nome_coordenador ? (<span className="leader-badge coordinator"><Users size={14} /> {l.nome_coordenador}</span>) : (<span className="leader-badge missing"><ShieldAlert size={14} /> Sem Coordenador</span>)}
                    </div>
                  </td>

                  <td data-label="Contato">
                    <div className="contact-box">
                      <div className="contact-line"><MapPin size={14} /> {l?.endereco || 'Não registrado'}</div>
                      <div className="contact-line"><Phone size={14} /> {l?.telefone || 'Não registrado'}</div>
                    </div>
                  </td>

                  {/* MOSTRADO APENAS PARA O DESENVOLVEDOR (ROOT) */}
                  {role === 'DEV' && (
                    <td data-label="Status" style={{ textAlign: 'center' }}>
                      <button className="btn-toggle-status" onClick={() => alternarStatusLoja(l)} title="Alternar Estado da Filial">
                        {l.status === 'Ativa' || !l.status ? <ToggleRight size={28} color="var(--success)"/> : <ToggleLeft size={28} color="var(--danger)"/>}
                      </button>
                    </td>
                  )}

                  <td data-label="Ações" style={{ textAlign: 'right' }}>
                    <button className="btn btn-action edit" onClick={() => { setFormLoja({ id: l.id, nome: l.nome, endereco_loja: l.endereco || '', telefone_loja: l.telefone || '', empresa: l.empresa || '', status: l.status || 'Ativa' }); setModalLoja(true); }}><Edit size={18} /></button>
                    <button className="btn btn-action delete" onClick={() => pedirExclusaoLoja(l.id, l.nome)}><X size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL FLUTUANTE DE CADASTRO/EDIÇÃO */}
      {modalLoja && (
        <div className="modal-overlay gestao-lojas-modal">
          <div className="modal-content gestao-lojas-modal-content">
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={22} color="var(--primary)" />
              {formLoja.id ? 'Atualizar Dados da Filial' : 'Registrar Nova Filial'}
            </h3>

            <form onSubmit={salvarLoja}>
              <div className="form-grid gestao-lojas-form-grid">
                
                {/* APENAS O DEV CONSEGUE ESCOLHER A EMPRESA */}
                {role === 'DEV' && (
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Associar à Empresa (Tenant)</label>
                    <select className="w-100" style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--border)', color: 'var(--text-main)', outline: 'none' }} value={formLoja.empresa} onChange={(e) => setFormLoja({...formLoja, empresa: e.target.value})} required>
                      <option value="">Selecione a Empresa proprietária...</option>
                      {empresasDb.map(emp => <option key={emp.id} value={emp.nome}>{emp.nome}</option>)}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Nomenclatura da Filial (Nome Comercial)</label>
                  <input type="text" className="w-100" value={formLoja.nome} onChange={(e) => setFormLoja({ ...formLoja, nome: e.target.value })} required autoFocus />
                </div>
                <div className="form-group">
                  <label>Endereço Físico Completo</label>
                  <input type="text" className="w-100" value={formLoja.endereco_loja} onChange={(e) => setFormLoja({ ...formLoja, endereco_loja: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Contato Telefônico Direto</label>
                  <input type="text" className="w-100" value={formLoja.telefone_loja} onChange={(e) => setFormLoja({ ...formLoja, telefone_loja: e.target.value })} />
                </div>
              </div>

              <div className="modal-actions gestao-lojas-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModalLoja(false)}>
                  Descartar
                </button>
                <button type="submit" className="btn btn-primary" style={{ boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)' }}>
                  {formLoja.id ? <><RefreshCw size={18} /> Atualizar Filial</> : <><Save size={18} /> Cadastrar Filial</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}