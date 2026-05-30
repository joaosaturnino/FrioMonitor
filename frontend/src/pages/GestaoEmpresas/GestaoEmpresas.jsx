import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Building2, Edit, X, Save, Phone, Mail, PlusCircle, RefreshCw, 
  Search, Briefcase, ToggleLeft, ToggleRight, 
  ShieldAlert, ShieldCheck, Globe, Trash2, Calendar, Loader2, 
  CheckCircle2, AlertOctagon
} from 'lucide-react';
import './GestaoEmpresas.css'; // Mantemos o arquivo original por segurança

// ============================================================================
// INJEÇÃO DE ESTILOS MODERNOS (UI/UX)
// ============================================================================
const GestaoStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
    
    .gestao-container {
      font-family: 'Montserrat', sans-serif;
      animation: fadeInOS 0.4s ease-out;
    }
    
    .gestao-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .gestao-title-modern {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 900;
      font-size: 1.4rem;
      color: var(--text-main);
      letter-spacing: -0.5px;
    }

    .icon-box-primary {
      background: linear-gradient(135deg, var(--primary), #059669);
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      color: white;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }

    .search-modern {
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.03);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 16px;
      width: 100%;
      max-width: 380px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dark-theme .search-modern { background: rgba(255, 255, 255, 0.02); }
    .search-modern:focus-within {
      background: var(--card-bg);
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
    }

    .search-modern input {
      border: none;
      background: transparent;
      width: 100%;
      padding-left: 12px;
      color: var(--text-main);
      outline: none;
      font-family: 'Montserrat', sans-serif;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .kpi-grid-modern {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .kpi-card-modern {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.02);
      transition: all 0.3s ease;
      border-left: 4px solid var(--border);
    }

    .kpi-card-modern:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 20px rgba(0,0,0,0.06);
    }

    .kpi-card-modern.info { border-left-color: #38bdf8; }
    .kpi-card-modern.success { border-left-color: var(--success); }
    .kpi-card-modern.danger { border-left-color: var(--danger); }

    .kpi-text-box { display: flex; flex-direction: column; }
    .kpi-value-modern { font-size: 1.8rem; font-weight: 900; color: var(--text-main); line-height: 1.1; }
    .kpi-label-modern { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

    .table-container-modern {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
    }

    .modern-table { width: 100%; border-collapse: collapse; text-align: left; }
    .modern-table th {
      padding: 16px 24px;
      background: rgba(0, 0, 0, 0.02);
      color: var(--text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 1px solid var(--border);
      font-weight: 800;
    }
    
    .modern-table td {
      padding: 16px 24px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-main);
    }

    .modern-table tr { transition: background 0.2s ease; }
    .modern-table tr:hover { background: rgba(16, 185, 129, 0.03); }
    .modern-table tr.row-suspensa { background: rgba(239, 68, 68, 0.03); opacity: 0.85; }

    .badge-modern {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      letter-spacing: 0.5px;
    }

    .badge-modern.active { background: rgba(16, 185, 129, 0.1); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.2); }
    .badge-modern.suspended { background: rgba(239, 68, 68, 0.1); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.2); }

    .action-btn-modern {
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 8px;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .action-btn-modern:hover { background: var(--card-bg); color: var(--primary); border-color: var(--primary); box-shadow: 0 4px 10px rgba(16, 185, 129, 0.1); }
    .action-btn-modern.delete:hover { color: var(--danger); border-color: var(--danger); box-shadow: 0 4px 10px rgba(239, 68, 68, 0.1); }

    .modal-overlay-blur {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
      animation: fadeInOS 0.3s ease;
    }

    .modal-box-modern {
      background: var(--card-bg);
      border-radius: 24px;
      width: 100%;
      max-width: 550px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header-modern {
      padding: 24px 30px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.01);
    }

    .input-group-modern { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.2rem; }
    .input-group-modern label { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    
    .input-modern {
      background: rgba(0, 0, 0, 0.03);
      border: 1px solid var(--border);
      padding: 14px 16px;
      border-radius: 12px;
      color: var(--text-main);
      font-family: 'Montserrat', sans-serif;
      font-size: 0.95rem;
      font-weight: 500;
      transition: all 0.3s;
      width: 100%;
    }
    .dark-theme .input-modern { background: rgba(255, 255, 255, 0.02); }
    .input-modern:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15); background: transparent; }

    .skeleton-box {
      height: 70px;
      background: linear-gradient(90deg, rgba(0,0,0,0.03) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.03) 75%);
      background-size: 200% 100%;
      animation: skeletonLoading 1.5s infinite;
      border-bottom: 1px solid var(--border);
    }
    .dark-theme .skeleton-box { background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%); background-size: 200% 100%; }

    @keyframes skeletonLoading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @keyframes fadeInOS { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `}</style>
);

export default function GestaoEmpresas({ api, showToast, setModalConfig }) {
  const [empresas, setEmpresas] = useState([]);
  const [busca, setBusca] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formInicial = { id: '', nome: '', cnpj: '', contato: '', email: '', status: 'Ativa' };
  const [form, setForm] = useState({ ...formInicial });
  const [modalAberto, setModalAberto] = useState(false);

  const carregarEmpresas = useCallback(async () => {
    try {
      const res = await api.get('/empresas');
      setEmpresas(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      showToast('Falha na comunicação com o Hub de Organizações.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => {
    carregarEmpresas();
  }, [carregarEmpresas]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await carregarEmpresas();
    setTimeout(() => setIsRefreshing(false), 800);
    showToast('Sincronização concluída.', 'success');
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
    setIsSubmitting(true);
    try {
      if (form.id) {
        await api.put(`/empresas/${form.id}`, form);
        showToast(`Organização "${form.nome}" atualizada com sucesso.`, 'success');
      } else {
        await api.post('/empresas', form);
        showToast('Nova organização provisionada com sucesso!', 'success');
      }
      setModalAberto(false);
      await carregarEmpresas();
    } catch (err) {
      showToast('Erro ao gravar dados no servidor SaaS.', 'error');
    } finally {
      setIsSubmitting(false);
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
          showToast('Organização purgada do ecossistema.', 'success');
          carregarEmpresas();
        } catch (e) {
          showToast('Erro na exclusão. Verifique dependências ativas.', 'error');
        }
      }
    });
  };

  return (
    <div className="gestao-container">
      <GestaoStyles />
      
      {/* HEADER */}
      <div className="gestao-header-bar">
        <h3 className="gestao-title-modern">
          <div className="icon-box-primary">
            <Globe size={24} />
          </div>
          Gestão de Organizações (Tenants)
        </h3>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-modern">
            <Search size={18} color="var(--text-muted)" style={{marginRight: '8px'}} />
            <input type="text" placeholder="Filtrar por Nome ou CNPJ..." value={busca} onChange={e => setBusca(e.target.value)} />
          </div>

          <button className="btn btn-outline" onClick={handleRefresh} title="Sincronizar Base" style={{padding: '10px 14px', borderRadius: '12px'}}>
            <RefreshCw size={18} className={isRefreshing ? 'spin' : ''} />
          </button>
          
          <button className="btn btn-primary" onClick={() => { setForm({ ...formInicial }); setModalAberto(true); }} style={{padding: '10px 20px', borderRadius: '12px', display: 'flex', gap: '8px', fontWeight: 'bold'}}>
            <PlusCircle size={18} /> Provisionar Organização
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid-modern">
        <div className="kpi-card-modern info">
          <div style={{color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '12px'}}><Briefcase size={28}/></div>
          <div className="kpi-text-box">
            <span className="kpi-value-modern">{isLoading ? '-' : kpis.total}</span>
            <span className="kpi-label-modern">Total Registrado</span>
          </div>
        </div>
        <div className="kpi-card-modern success">
          <div style={{color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px'}}><ShieldCheck size={28}/></div>
          <div className="kpi-text-box">
            <span className="kpi-value-modern">{isLoading ? '-' : kpis.ativas}</span>
            <span className="kpi-label-modern">Em Conformidade</span>
          </div>
        </div>
        <div className="kpi-card-modern danger">
          <div style={{color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px'}}><ShieldAlert size={28}/></div>
          <div className="kpi-text-box">
            <span className="kpi-value-modern">{isLoading ? '-' : kpis.suspensas}</span>
            <span className="kpi-label-modern">Lockdown Ativo</span>
          </div>
        </div>
      </div>

      {/* TABELA DE DADOS */}
      <div className="table-container-modern">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Identificação do Tenant</th>
              <th>Registro Legal</th>
              <th>Canais de Contato</th>
              <th style={{ textAlign: 'center' }}>Estado Operacional</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <>
                <tr><td colSpan="5" style={{padding: 0}}><div className="skeleton-box"></div></td></tr>
                <tr><td colSpan="5" style={{padding: 0}}><div className="skeleton-box"></div></td></tr>
                <tr><td colSpan="5" style={{padding: 0}}><div className="skeleton-box"></div></td></tr>
              </>
            ) : empresasFiltradas.length > 0 ? (
              empresasFiltradas.map(emp => (
                <tr key={emp.id} className={emp.status === 'Suspensa' ? 'row-suspensa' : ''}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ background: emp.status === 'Ativa' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: emp.status === 'Ativa' ? 'var(--primary)' : 'var(--danger)', padding: '12px', borderRadius: '12px' }}>
                        <Building2 size={20} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <strong style={{fontSize: '1.05rem'}}>{emp.nome}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={12}/> {new Date(emp.data_cadastro).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code style={{ background: 'rgba(0,0,0,0.05)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.85rem' }}>
                      {emp.cnpj || 'ISENTO DE CNPJ'}
                    </code>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}><Phone size={14}/> {emp.contato || 'Não informado'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}><Mail size={14}/> {emp.email || 'Não informado'}</div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                     <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                        <span className={`badge-modern ${emp.status === 'Ativa' ? 'active' : 'suspended'}`}>
                          {emp.status === 'Ativa' ? <CheckCircle2 size={12}/> : <AlertOctagon size={12}/>}
                          {emp.status}
                        </span>
                        <button style={{background:'transparent', border:'none', cursor:'pointer'}} onClick={() => alternarStatus(emp)} title="Alterar privilégios">
                          {emp.status === 'Ativa' ? <ToggleRight size={28} color="var(--success)"/> : <ToggleLeft size={28} color="var(--text-muted)"/>}
                        </button>
                     </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                      <button className="action-btn-modern" onClick={() => { setForm(emp); setModalAberto(true); }} title="Parametrizar Organização"><Edit size={18} /></button>
                      <button className="action-btn-modern delete" onClick={() => pedirExclusao(emp.id, emp.nome)} title="Purgar Tenant"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">
                  <div style={{padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
                    <Building2 size={64} style={{opacity: 0.2}} />
                    <div>
                      <h4 style={{margin: '0 0 8px 0', color: 'var(--text-main)'}}>Nenhum registro encontrado</h4>
                      <p style={{margin: 0, fontSize: '0.9rem'}}>Não há organizações correspondentes aos critérios de busca.</p>
                    </div>
                    <button className="btn btn-outline" onClick={() => { setForm({ ...formInicial }); setModalAberto(true); }} style={{marginTop: '1rem', borderRadius: '10px'}}>
                      <PlusCircle size={16} style={{marginRight: '8px'}}/> Provisionar Agora
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE PROVISIONAMENTO */}
      {modalAberto && (
        <div className="modal-overlay-blur">
          <div className="modal-box-modern" style={{ borderTop: `4px solid ${form.id ? 'var(--primary)' : 'var(--secondary)'}` }}>
            
            <div className="modal-header-modern">
               <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.2rem', fontWeight: '900' }}>
                 {form.id ? <Edit size={24} color="var(--primary)"/> : <PlusCircle size={24} color="var(--secondary)"/>}
                 {form.id ? 'Parametrizar Organização' : 'Provisionar Nova Organização'}
               </h3>
               <button style={{background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:'4px'}} onClick={() => setModalAberto(false)}>
                 <X size={24}/>
               </button>
            </div>
            
            <form onSubmit={salvarEmpresa}>
              <div className="modern-modal-body">
                <div className="input-group-modern">
                  <label>Razão Social / Nome Fantasia *</label>
                  <input type="text" className="modern-input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required autoFocus placeholder="Ex: TermoSync Enterprise Solutions Ltda" />
                </div>
                
                <div className="input-group-modern">
                  <label>CNPJ ou Identificador Fiscal</label>
                  <input type="text" className="modern-input" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" />
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                   <div className="input-group-modern">
                    <label>Telefone de Contato</label>
                    <input type="text" className="modern-input" value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} placeholder="(00) 00000-0000" />
                  </div>
                  <div className="input-group-modern">
                    <label>E-mail Corporativo</label>
                    <input type="email" className="modern-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@empresa.com" />
                  </div>
                </div>
              </div>

              <div className="modern-modal-footer">
                <button type="button" className="btn btn-outline" style={{flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 'bold'}} onClick={() => setModalAberto(false)} disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{flex: 2, padding: '14px', borderRadius: '12px', display: 'flex', gap: '10px', justifyContent: 'center', fontWeight: 'bold'}} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={20} className="spin" /> : <Save size={20} />} 
                  {isSubmitting ? 'Processando Registro...' : (form.id ? 'Confirmar Alterações' : 'Finalizar Provisionamento')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}