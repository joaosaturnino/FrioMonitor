import React, { useState, useMemo } from 'react';
import { Store, Edit, X, Save, MapPin, Phone, UserCheck, Users, Building2, RefreshCw, Search, ShieldAlert, BarChart3, PlusCircle } from 'lucide-react';
import './GestaoLojas.css';

export default function GestaoLojas({ api, showToast, lojasCadastradas, carregarLojas, carregarDadosBase, setModalConfig }) {

  const formInicialLoja = {
    id: '',
    nome: '',
    endereco_loja: '',
    telefone_loja: ''
  };

  const [formLoja, setFormLoja] = useState({ ...formInicialLoja });
  const [modalLoja, setModalLoja] = useState(false);
  const [buscaLoja, setBuscaLoja] = useState('');

  // 1. Filtragem Instantânea (Search)
  const lojasFiltradas = useMemo(() => {
    if (!lojasCadastradas) return [];
    return lojasCadastradas.filter(l =>
      l.nome.toLowerCase().includes(buscaLoja.toLowerCase()) ||
      (l.endereco && l.endereco.toLowerCase().includes(buscaLoja.toLowerCase()))
    );
  }, [lojasCadastradas, buscaLoja]);

  // 2. Cálculo de KPIs Estratégicos (Quantidade de Liderança Ativa)
  const kpis = useMemo(() => {
    if (!lojasCadastradas) return { total: 0, gerentes: 0, coordenadores: 0 };
    let gerentes = 0;
    let coordenadores = 0;
    
    lojasCadastradas.forEach(l => {
      // Conta as lojas que têm o nome do gerente/coordenador preenchido
      if (l.nome_gerente && l.nome_gerente.trim() !== '') gerentes++;
      if (l.nome_coordenador && l.nome_coordenador.trim() !== '') coordenadores++;
    });

    return { total: lojasCadastradas.length, gerentes, coordenadores };
  }, [lojasCadastradas]);

  const salvarLoja = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nome: formLoja.nome,
        endereco: formLoja.endereco_loja,
        telefone: formLoja.telefone_loja
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
      carregarLojas();
      carregarDadosBase();

    } catch (err) {
      showToast('Ocorreu um erro. Verifique se o nome da filial já existe.', 'error');
    }
  };

  const pedirExclusaoLoja = (id, nome) => {
    setModalConfig({
      isOpen: true,
      title: 'Remover Filial do Sistema',
      message: `Tem a certeza que deseja remover a filial "${nome}" permanentemente? ATENÇÃO: Todos os equipamentos e históricos associados poderão ser perdidos.`,
      isPrompt: false,
      onConfirm: async () => {
        try {
          await api.delete(`/lojas/${id}`);
          showToast('Filial removida com sucesso.', 'success');
          carregarLojas();
          carregarDadosBase();
        } catch (e) {
          showToast('Ação bloqueada. Remova os equipamentos associados primeiro.', 'error');
        }
      }
    });
  };

  return (
    <div className="anim-fade-in stagger-1">
      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex-header gestao-lojas-header">
        <h3 className="gestao-lojas-title">
          <Store size={24} color="var(--primary)" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> 
          Gestão de Filiais
        </h3>
        
        <div className="action-group" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="loja-search-box">
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Procurar filial..." 
              value={buscaLoja} 
              onChange={e => setBuscaLoja(e.target.value)} 
            />
          </div>
          
          <button className="btn btn-primary" onClick={() => { setFormLoja({ ...formInicialLoja }); setModalLoja(true); }} style={{ boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)' }}>
            <PlusCircle size={18} /> Registar Nova Filial
          </button>
        </div>
      </div>

      {/* BARRA DE KPIs RÁPIDOS */}
      <div className="lojas-kpi-bar stagger-2">
        <div className="kpi-item total">
          <div className="kpi-icon"><BarChart3 size={20}/></div>
          <div className="kpi-data">
            <span className="kpi-value">{kpis.total}</span>
            <span className="kpi-label">Total de Filiais</span>
          </div>
        </div>
        <div className="kpi-item warning">
          <div className="kpi-icon"><UserCheck size={20}/></div>
          <div className="kpi-data">
            <span className="kpi-value">{kpis.gerentes}</span>
            <span className="kpi-label">Gerentes Ativos</span>
          </div>
        </div>
        <div className="kpi-item info">
          <div className="kpi-icon"><Users size={20}/></div>
          <div className="kpi-data">
            <span className="kpi-value">{kpis.coordenadores}</span>
            <span className="kpi-label">Coordenadores Ativos</span>
          </div>
        </div>
      </div>

      {/* ESTADO VAZIO */}
      {lojasFiltradas.length === 0 ? (
        <div className="empty-state stagger-3" style={{ marginTop: '2rem', padding: '4rem 2rem', background: 'var(--card-bg)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
          <Building2 size={64} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Nenhuma Filial Encontrada</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Comece por adicionar filiais ou reveja a sua pesquisa.</p>
        </div>
      ) : (
        /* TABELA DE DADOS DAS LOJAS */
        <div className="card table-responsive gestao-lojas-card stagger-3">
          <table className="table">
            <thead>
              <tr>
                <th>Identificação da Loja</th>
                <th>Equipe de Liderança</th>
                <th>Localização e Contato</th>
                <th style={{ textAlign: 'right' }}>Ações Administrativas</th>
              </tr>
            </thead>
            <tbody>
              {lojasFiltradas.map(l => (
                <tr key={l.id} className="loja-table-row">
                  <td data-label="Loja">
                    <div className="loja-name-box">
                      <div className="loja-icon-wrapper">
                        <Building2 size={18} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{l.nome}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>ID: #{l.id}</span>
                      </div>
                    </div>
                  </td>

                  <td data-label="Gestão Local">
                    <div className="leadership-box">
                      {l.nome_gerente ? (
                        <span className="leader-badge manager" title="Gerente Ativo"><UserCheck size={14} /> {l.nome_gerente}</span>
                      ) : (
                        <span className="leader-badge missing" title="Atenção: Filial sem gerente definido"><ShieldAlert size={14} /> Sem Gerente</span>
                      )}

                      {l.nome_coordenador ? (
                        <span className="leader-badge coordinator" title="Coordenador Ativo"><Users size={14} /> {l.nome_coordenador}</span>
                      ) : (
                        <span className="leader-badge missing"><ShieldAlert size={14} /> Sem Coordenador</span>
                      )}
                    </div>
                  </td>

                  <td data-label="Contato">
                    <div className="contact-box">
                      <div className="contact-line">
                        <MapPin size={14} /> {l.endereco || 'Endereço não registado'}
                      </div>
                      <div className="contact-line">
                        <Phone size={14} /> {l.telefone || 'Telefone não registado'}
                      </div>
                    </div>
                  </td>

                  <td data-label="Ações" style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-action edit"
                      title="Editar Informações da Loja"
                      onClick={() => {
                        setFormLoja({
                          id: l.id,
                          nome: l.nome,
                          endereco_loja: l.endereco || '',
                          telefone_loja: l.telefone || ''
                        });
                        setModalLoja(true);
                      }}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="btn btn-action delete"
                      title="Apagar Filial Permanentemente"
                      onClick={() => pedirExclusaoLoja(l.id, l.nome)}
                    >
                      <X size={18} />
                    </button>
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
              {formLoja.id ? 'Atualizar Dados da Filial' : 'Registar Nova Filial'}
            </h3>

            <form onSubmit={salvarLoja}>
              <div className="form-grid gestao-lojas-form-grid">
                <div className="form-group">
                  <label>Nomenclatura da Filial (Nome Comercial)</label>
                  <input
                    type="text"
                    className="w-100"
                    value={formLoja.nome}
                    onChange={(e) => setFormLoja({ ...formLoja, nome: e.target.value })}
                    placeholder="Ex: Supermercado Central"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Endereço Físico Completo</label>
                  <input
                    type="text"
                    className="w-100"
                    value={formLoja.endereco_loja}
                    onChange={(e) => setFormLoja({ ...formLoja, endereco_loja: e.target.value })}
                    placeholder="Rua, Bairro, Número"
                  />
                </div>
                <div className="form-group">
                  <label>Contato Telefónico Direto</label>
                  <input
                    type="text"
                    className="w-100"
                    value={formLoja.telefone_loja}
                    onChange={(e) => setFormLoja({ ...formLoja, telefone_loja: e.target.value })}
                    placeholder="Ex: (11) 90000-0000"
                  />
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