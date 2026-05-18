import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Building2, Edit, X, Save, Phone, Mail, PlusCircle, RefreshCw, 
  Search, Briefcase, ActivitySquare, ToggleLeft, ToggleRight, 
  ShieldAlert, ShieldCheck, Globe, Trash2, Calendar 
} from 'lucide-react';
import './GestaoEmpresas.css';

export default function GestaoEmpresas({ api, showToast, setModalConfig }) {
  const [empresas, setEmpresas] = useState([]);
  const [busca, setBusca] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const formInicial = { id: '', nome: '', cnpj: '', contato: '', email: '', status: 'Ativa' };
  const [form, setForm] = useState({ ...formInicial });
  const [modalAberto, setModalAberto] = useState(false);

  const carregarEmpresas = useCallback(async () => {
    try {
      const res = await api.get('/empresas');
      setEmpresas(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      showToast('Falha na comunicação com o Hub de Organizações.', 'error');
    }
  }, [api, showToast]);

  useEffect(() => {
    carregarEmpresas();
  }, [carregarEmpresas]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await carregarEmpresas();
    setTimeout(() => setIsRefreshing(false), 800);
    showToast('Sincronização de inquilinos concluída.', 'success');
  };

  const empresasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();
    return empresas.filter(e => 
      e.nome?.toLowerCase().includes(termo) || 
      e.cnpj?.toLowerCase().includes(termo)
    );
  }, [empresas, busca]);

  const kpis = useMemo(() => {
    const total = empresas.length;
    const ativas = empresas.filter(e => e.status === 'Ativa').length;
    return { total, ativas, suspensas: total - ativas };
  }, [empresas]);

  const salvarEmpresa = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/empresas/${form.id}`, form);
        showToast(`Organização "${form.nome}" atualizada.`);
      } else {
        await api.post('/empresas', form);
        showToast('Nova organização provisionada com sucesso!');
      }
      setModalAberto(false);
      carregarEmpresas();
    } catch (err) {
      showToast('Erro ao gravar dados no servidor SaaS.', 'error');
    }
  };

  const alternarStatus = async (empresa) => {
    const novoStatus = empresa.status === 'Ativa' ? 'Suspensa' : 'Ativa';
    try {
      await api.put(`/empresas/${empresa.id}`, { ...empresa, status: novoStatus });
      showToast(`Status de "${empresa.nome}" alterado para ${novoStatus.toUpperCase()}.`, 'info');
      carregarEmpresas();
    } catch (err) {
      showToast('Erro ao alterar privilégios da organização.', 'error');
    }
  };

  const pedirExclusao = (id, nome) => {
    setModalConfig({
      isOpen: true,
      title: 'Destruição de Tenant',
      message: `CUIDADO: A remoção de "${nome}" é irreversível e apagará todos os dados, lojas e sensores vinculados a esta organização. Deseja prosseguir?`,
      isPrompt: false,
      onConfirm: async () => {
        try {
          await api.delete(`/empresas/${id}`);
          showToast('Organização purgada do ecossistema.');
          carregarEmpresas();
        } catch (e) {
          showToast('Erro na exclusão. Verifique dependências ativas.', 'error');
        }
      }
    });
  };

  return (
    <div className="anim-fade-in stagger-1">
      <div className="gestao-empresas-header">
        <h3 className="gestao-empresas-title">
          <div className="empresa-icon-wrapper" style={{background: 'var(--primary)', color: 'white'}}>
            <Globe size={20} />
          </div>
          Gestão de Organizações (Multi-Tenant)
        </h3>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-box-tenant">
            <Search size={18} color="var(--text-muted)" />
            <input type="text" placeholder="Filtrar por nome ou CNPJ..." value={busca} onChange={e => setBusca(e.target.value)} />
          </div>

          <button className="btn btn-outline" onClick={handleRefresh} title="Sincronizar Base">
            <RefreshCw size={18} className={isRefreshing ? 'spinner' : ''} />
          </button>
          
          <button className="btn btn-primary" onClick={() => { setForm({ ...formInicial }); setModalAberto(true); }}>
            <PlusCircle size={18} /> Nova Organização
          </button>
        </div>
      </div>

      <div className="empresas-kpi-bar stagger-2">
        <div className="kpi-item total">
          <div className="kpi-icon"><Briefcase size={22}/></div>
          <div className="kpi-data"><span className="kpi-value">{kpis.total}</span><span className="kpi-label">Organizações</span></div>
        </div>
        <div className="kpi-item success">
          <div className="kpi-icon"><ShieldCheck size={22}/></div>
          <div className="kpi-data"><span className="kpi-value" style={{color: 'var(--success)'}}>{kpis.ativas}</span><span className="kpi-label">Em Conformidade</span></div>
        </div>
        <div className="kpi-item danger">
          <div className="kpi-icon"><ShieldAlert size={22}/></div>
          <div className="kpi-data"><span className="kpi-value" style={{color: 'var(--danger)'}}>{kpis.suspensas}</span><span className="kpi-label">Acessos Restritos</span></div>
        </div>
      </div>

      <div className="gestao-organizações-card stagger-3">
        <table className="table">
          <thead>
            <tr>
              <th>Identificação da Organização</th>
              <th>Registro Legal</th>
              <th>Canais de Contato</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
              <th style={{ textAlign: 'right' }}>Operações</th>
            </tr>
          </thead>
          <tbody>
            {empresasFiltradas.map(emp => (
              <tr key={emp.id} className={`empresa-row ${emp.status === 'Suspensa' ? 'row-suspensa' : ''}`}>
                <td>
                  <div className="empresa-name-box">
                    <div className="empresa-icon-wrapper">
                      <Building2 size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{fontSize: '1rem'}}>{emp.nome}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={10}/> Provisionado em: {new Date(emp.data_cadastro).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <code className="legal-info">{emp.cnpj || 'ISENTO'}</code>
                </td>
                <td>
                  <div className="contact-box-org">
                    <div className="contact-item"><Phone size={12}/> {emp.contato || '--'}</div>
                    <div className="contact-item"><Mail size={12}/> {emp.email || '--'}</div>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                   <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'}}>
                      <span className={`status-badge-pill ${emp.status === 'Ativa' ? 'active' : 'suspended'}`}>
                        {emp.status}
                      </span>
                      <button className="btn-toggle-status" onClick={() => alternarStatus(emp)} title="Alterar privilégios">
                        {emp.status === 'Ativa' ? <ToggleRight size={24} color="var(--success)"/> : <ToggleLeft size={24} color="var(--text-muted)"/>}
                      </button>
                   </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                    <button className="btn btn-action edit" onClick={() => { setForm(emp); setModalAberto(true); }} title="Editar Metadados"><Edit size={16} /></button>
                    <button className="btn btn-action delete" onClick={() => pedirExclusao(emp.id, emp.nome)} title="Remover Inquilino"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {empresasFiltradas.length === 0 && (
          <div style={{padding: '4rem', textAlign: 'center', color: 'var(--text-muted)'}}>
            <Building2 size={48} style={{opacity: 0.2, marginBottom: '1rem'}} />
            <p>Nenhuma organização encontrada nos registros core.</p>
          </div>
        )}
      </div>

      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '550px', borderTop: `4px solid ${form.id ? 'var(--primary)' : 'var(--secondary)'}`}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2rem'}}>
               <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                 {form.id ? <Edit size={22} color="var(--primary)"/> : <PlusCircle size={22} color="var(--secondary)"/>}
                 {form.id ? 'Parametrizar Organização' : 'Provisionar Nova Organização'}
               </h3>
               <button className="btn-close-drawer" onClick={() => setModalAberto(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={salvarEmpresa}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="input-group">
                  <label>Razão Social / Nome Fantasia *</label>
                  <div className="input-wrapper"><input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required autoFocus placeholder="Ex: Farmácia Central Ltda" /></div>
                </div>
                <div className="input-group">
                  <label>CNPJ ou Identificador Fiscal</label>
                  <div className="input-wrapper"><input type="text" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" /></div>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                   <div className="input-group">
                    <label>Telefone</label>
                    <div className="input-wrapper"><input type="text" value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} placeholder="(00) 00000-0000" /></div>
                  </div>
                  <div className="input-group">
                    <label>E-mail de Gestão</label>
                    <div className="input-wrapper"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@empresa.com" /></div>
                  </div>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-outline" style={{flex: 1}} onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{flex: 2}}>
                  <Save size={18} /> {form.id ? 'Confirmar Alterações' : 'Finalizar Provisionamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}