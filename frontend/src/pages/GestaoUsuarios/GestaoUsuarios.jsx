import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  UserPlus, Wrench, Settings, Users, Edit, X, Save, 
  ShieldAlert, Store, UserCircle, KeyRound, MapPin, 
  Search, Shield, ShieldCheck, Lock, Briefcase
} from 'lucide-react';
import './GestaoUsuarios.css';

export default function GestaoUsuarios({ api, showToast, setModalConfig }) {

  const roleLogada = sessionStorage.getItem('userRole') || 'LOJA';

  const formInicialUsuario = {
    id: '', usuario: '', senha: '', role: 'LOJA', filial: '', tipo_acesso: 'GERENTE', nome: '', empresa: ''
  };

  const [usuariosLocais, setUsuariosLocais] = useState([]);
  const [filiaisDb, setFiliaisDb] = useState([]);
  const [empresasDb, setEmpresasDb] = useState([]);
  
  const [formUsuario, setFormUsuario] = useState({ ...formInicialUsuario });
  const [modalUsuario, setModalUsuario] = useState(false);
  
  const [busca, setBusca] = useState('');
  const [filtroPrivilegio, setFiltroPrivilegio] = useState('TODOS');

  // ==========================================
  // BUSCA INDEPENDENTE DOS DADOS 
  // ==========================================
  const carregarUsuarios = useCallback(async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuariosLocais(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      showToast('Erro ao carregar a lista de identidades.', 'error');
    }
  }, [api, showToast]);

  const carregarDependencias = useCallback(async () => {
    try {
      const resF = await api.get('/auxiliares/filiais');
      setFiliaisDb(Array.isArray(resF.data) ? resF.data : []);
      
      // Se for DEV, carrega a lista de empresas para poder amarrar no momento de criar
      if (roleLogada === 'DEV') {
        const resE = await api.get('/empresas');
        setEmpresasDb(Array.isArray(resE.data) ? resE.data : []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [api, roleLogada]);

  useEffect(() => {
    carregarUsuarios();
    carregarDependencias();
  }, [carregarUsuarios, carregarDependencias]);

  // ==========================================
  // AÇÕES DO MODAL
  // ==========================================
  const abrirModalUsuario = (tipoAcesso) => {
    let roleTarget = 'LOJA';
    if (tipoAcesso === 'TECNICO') roleTarget = 'MANUTENCAO';
    if (tipoAcesso === 'OUTROS') roleTarget = 'ADMIN';

    setFormUsuario({ ...formInicialUsuario, role: roleTarget, tipo_acesso: tipoAcesso });
    setModalUsuario(true);
  };

  const salvarUsuario = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        usuario: formUsuario.usuario,
        role: formUsuario.role,
        nome: formUsuario.nome,
        empresa: formUsuario.empresa // Importante para o DEV
      };
      
      if (formUsuario.role === 'LOJA') payload.filial = formUsuario.filial;
      else payload.filial = null;

      if (formUsuario.senha) payload.senha = formUsuario.senha;

      if (formUsuario.role === 'MANUTENCAO') {
        payload.nome_tecnico = formUsuario.nome;
      } else if (formUsuario.role === 'LOJA') {
        if (formUsuario.tipo_acesso === 'GERENTE') payload.nome_gerente = formUsuario.nome;
        else if (formUsuario.tipo_acesso === 'COORDENADOR') payload.nome_coordenador = formUsuario.nome;
        else payload.nome = formUsuario.nome; 
      }

      if (formUsuario.id) {
        await api.put(`/usuarios/${formUsuario.id}`, payload);
        showToast('Credencial de acesso atualizada com sucesso.', 'success');
      } else {
        if (!payload.senha) return showToast('A senha inicial é obrigatória.', 'error');
        await api.post('/usuarios', payload);
        showToast('Nova identidade provisionada na rede.', 'success');
      }

      setModalUsuario(false);
      carregarUsuarios();
    } catch (err) {
      showToast('Falha na operação. Verifique se os dados estão corretos.', 'error');
    }
  };

  const pedirExclusaoUsuario = (id, nome) => {
    setModalConfig({
      isOpen: true,
      title: 'Revogar Credencial',
      message: `Atenção: Tem certeza que deseja revogar permanentemente o acesso de "${nome}"?`,
      isPrompt: false,
      onConfirm: async () => {
        try {
          await api.delete(`/usuarios/${id}`);
          showToast('Credencial revogada com sucesso.', 'success');
          carregarUsuarios();
        } catch (e) {
          showToast('Erro ao tentar revogar acesso.', 'error');
        }
      }
    });
  };

  // ==========================================
  // FILTROS E KPIS
  // ==========================================
  const usuariosExibidos = useMemo(() => {
    if (!usuariosLocais) return [];
    
    return usuariosLocais.filter(u => {
      const displayNome = u.nome || u.nome_tecnico || u.nome_gerente || u.nome_coordenador || u.usuario || '';
      
      const matchBusca = 
        displayNome.toLowerCase().includes(busca.toLowerCase()) ||
        (u.usuario && u.usuario.toLowerCase().includes(busca.toLowerCase())) ||
        (u.filial && u.filial.toLowerCase().includes(busca.toLowerCase()));
      
      const matchFiltro = filtroPrivilegio === 'TODOS' || u.role === filtroPrivilegio;
      
      return matchBusca && matchFiltro;
    }).sort((a, b) => {
      const roleWeight = { 'ADMIN': 3, 'MANUTENCAO': 2, 'LOJA': 1 };
      return (roleWeight[b.role] || 0) - (roleWeight[a.role] || 0);
    });
  }, [usuariosLocais, busca, filtroPrivilegio]);

  const kpis = useMemo(() => {
    if (!usuariosLocais) return { total: 0, admin: 0, tech: 0, loja: 0 };
    let admin = 0; let tech = 0; let loja = 0;
    
    usuariosLocais.forEach(u => {
      if (u.role === 'ADMIN') admin++;
      else if (u.role === 'MANUTENCAO') tech++;
      else if (u.role === 'LOJA') loja++;
    });

    return { total: usuariosLocais.length, admin, tech, loja };
  }, [usuariosLocais]);

  const getModalConfigInfo = () => {
    if (formUsuario.role === 'ADMIN') return { icon: ShieldAlert, color: 'var(--danger)', title: 'Privilégios Master (Admin)' };
    if (formUsuario.role === 'MANUTENCAO') return { icon: Wrench, color: 'var(--info)', title: 'Acesso Técnico Global' };
    return { icon: Store, color: 'var(--success)', title: 'Operação Local (Loja)' };
  };
  const modalHeaderInfo = getModalConfigInfo();

  return (
    <div className="anim-fade-in stagger-1">
      
      <div className="flex-header iam-header">
        <div className="iam-title-box">
          <div className="icon-circle" style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--info)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <KeyRound size={26} />
          </div>
          <div>
            <h3 className="iam-main-title">Controle de Acessos e Identidade (IAM)</h3>
            <span className="iam-subtitle">Provisionamento seguro de credenciais, privilégios e revogações.</span>
          </div>
        </div>

        <div className="iam-provision-actions">
          <button className="btn btn-outline tech-btn" onClick={() => abrirModalUsuario('TECNICO')}>
            <Wrench size={16} /> Emitir Acesso Técnico
          </button>
          <button className="btn btn-outline store-btn" onClick={() => abrirModalUsuario('GERENTE')}>
            <Store size={16} /> Registrar Operador
          </button>

          {/* 🔥 APENAS O DESENVOLVEDOR (DEV) PODE CRIAR NOVOS ADMINISTRADORES MASTER */}
          {roleLogada === 'DEV' && (
            <button className="btn btn-danger-outline" onClick={() => abrirModalUsuario('OUTROS')}>
              <ShieldAlert size={16} /> Provisionar Master
            </button>
          )}

        </div>
      </div>

      <div className="iam-control-panel stagger-2">
        <div className="iam-kpi-bar">
          <div className="kpi-item-small" onClick={() => setFiltroPrivilegio('TODOS')}>
            <span className="kpi-val">{kpis.total}</span>
            <span className="kpi-lbl">Credenciais Ativas</span>
          </div>
          <div className={`kpi-item-small danger ${filtroPrivilegio === 'ADMIN' ? 'active' : ''}`} onClick={() => setFiltroPrivilegio('ADMIN')}>
            <span className="kpi-val">{kpis.admin}</span>
            <span className="kpi-lbl">Acesso Master</span>
          </div>
          <div className={`kpi-item-small info ${filtroPrivilegio === 'MANUTENCAO' ? 'active' : ''}`} onClick={() => setFiltroPrivilegio('MANUTENCAO')}>
            <span className="kpi-val">{kpis.tech}</span>
            <span className="kpi-lbl">Equipe Técnica</span>
          </div>
          <div className={`kpi-item-small success ${filtroPrivilegio === 'LOJA' ? 'active' : ''}`} onClick={() => setFiltroPrivilegio('LOJA')}>
            <span className="kpi-val">{kpis.loja}</span>
            <span className="kpi-lbl">Operadores (Loja)</span>
          </div>
        </div>

        <div className="search-box-iam">
          <Search size={18} color="var(--text-muted)" />
          <input type="text" placeholder="Pesquisar identidade, login ou filial..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
      </div>

      <div className="card table-responsive iam-table-card stagger-3">
        {(!usuariosExibidos || usuariosExibidos.length === 0) ? (
           <div className="empty-state">
             <Shield size={48} style={{ opacity: 0.3, marginBottom: '1rem', color: 'var(--text-main)' }} />
             <h3>Nenhuma credencial localizada</h3>
             <p>Ajuste os filtros de privilégio ou os termos de pesquisa.</p>
           </div>
        ) : (
          <table className="table iam-table">
            <thead>
              <tr>
                <th>Identidade Operacional</th>
                <th>Login (Sistema)</th>
                
                {/* 🔥 SE FOR DEV, MOSTRA A EMPRESA (TENANT) NA TABELA */}
                {roleLogada === 'DEV' && <th>Tenant Atribuído</th>}
                
                <th>Privilégio IAM</th>
                <th>Restrição de Filial</th>
                <th style={{ textAlign: 'right' }}>Auditoria e Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosExibidos.map(u => {
                
                const displayNome = u.nome || u.nome_tecnico || u.nome_gerente || u.nome_coordenador || u.usuario || 'Sem Nome';
                
                let displayCargo = u.cargo;
                if (!displayCargo) {
                  if (u.role === 'ADMIN') displayCargo = 'Administrador de Sistema';
                  else if (u.role === 'MANUTENCAO') displayCargo = 'Técnico de Manutenção';
                  else if (u.role === 'LOJA') {
                    if (u.nome_gerente) displayCargo = 'Gerente de Loja';
                    else if (u.nome_coordenador) displayCargo = 'Coordenador de Loja';
                    else displayCargo = 'Operador Local';
                  } else { displayCargo = 'Usuário Padrão'; }
                }

                let roleColor = 'var(--success)'; let roleBg = 'rgba(16, 185, 129, 0.1)'; let roleLabel = 'Operador Local'; let IconLevel = Store;
                if (u.role === 'ADMIN') { roleColor = 'var(--danger)'; roleBg = 'rgba(239, 68, 68, 0.1)'; roleLabel = 'Acesso Master (L3)'; IconLevel = ShieldAlert; } 
                else if (u.role === 'MANUTENCAO') { roleColor = 'var(--info)'; roleBg = 'rgba(56, 189, 248, 0.1)'; roleLabel = 'Equipe Técnica (L2)'; IconLevel = Wrench; }

                return (
                  <tr key={u.id} className="iam-table-row">
                    <td data-label="Identidade">
                      <div className="user-profile-box">
                        <div className="user-avatar-circle" style={{ background: `linear-gradient(135deg, ${roleColor}, color-mix(in srgb, ${roleColor} 40%, black))` }}>
                          {displayNome.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <span className="user-name-table">{displayNome}</span>
                          <span className="user-role-table">{displayCargo}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td data-label="Login">
                      <div className="login-badge"><UserCircle size={14} /> @{u.usuario}</div>
                    </td>

                    {/* 🔥 SE FOR DEV, MOSTRA A EMPRESA (TENANT) NA TABELA */}
                    {roleLogada === 'DEV' && (
                      <td data-label="Tenant">
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Briefcase size={14} color="var(--primary)"/> {u.empresa || 'Desconhecida'}
                        </span>
                      </td>
                    )}
                    
                    <td data-label="Privilégio">
                      <div className="role-security-badge" style={{ color: roleColor, background: roleBg, border: `1px solid color-mix(in srgb, ${roleColor} 30%, transparent)` }}>
                        <IconLevel size={14} /> {roleLabel}
                      </div>
                    </td>
                    
                    <td data-label="Restrição">
                      {u.role === 'LOJA' ? (
                        <span className="location-tag restricted"><MapPin size={12}/> {u.filial || 'Sem Filial'}</span>
                      ) : (
                        <span className="location-tag global"><Globe2 size={12}/> Acesso Global</span>
                      )}
                    </td>
                    
                    <td data-label="Ações" style={{ textAlign: 'right' }}>
                      <button className="btn btn-action edit" onClick={() => { 
                          let editTipoAcesso = 'OUTROS';
                          if (u.role === 'LOJA') {
                            if (u.nome_gerente) editTipoAcesso = 'GERENTE';
                            else if (u.nome_coordenador) editTipoAcesso = 'COORDENADOR';
                          } else if (u.role === 'MANUTENCAO') {
                            editTipoAcesso = 'TECNICO';
                          }

                          setFormUsuario({ ...u, nome: displayNome, senha: '', tipo_acesso: editTipoAcesso }); 
                          setModalUsuario(true); 
                        }} title="Reconfigurar Permissões">
                        <Settings size={18} />
                      </button>
                      <button className="btn btn-action delete" onClick={() => pedirExclusaoUsuario(u.id, displayNome)} title="Revogar Credencial Permanentemente">
                        <Lock size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalUsuario && (
        <div className="modal-overlay">
          <div className="modal-content iam-modal-content">
            
            <div className="iam-modal-header" style={{ borderBottomColor: modalHeaderInfo.color }}>
              <div className="iam-modal-icon-bg" style={{ background: `color-mix(in srgb, ${modalHeaderInfo.color} 15%, transparent)`, color: modalHeaderInfo.color }}>
                <modalHeaderInfo.icon size={28} />
              </div>
              <div>
                <h3>Emissão de Credencial</h3>
                <span style={{ color: modalHeaderInfo.color, fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  {modalHeaderInfo.title}
                </span>
              </div>
            </div>

            <form onSubmit={salvarUsuario} className="iam-modal-form">
              <div className="form-section-iam">
                <h4>1. Identificação Operacional</h4>
                <div className="form-grid">
                  
                  {/* 🔥 APENAS O DEV CONSEGUE ESCOLHER A QUAL EMPRESA O USUÁRIO VAI PERTENCER */}
                  {roleLogada === 'DEV' && (
                    <div style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
                      <label style={{ color: 'var(--primary)', fontWeight: '800' }}>Associar à Empresa (Tenant Exclusivo DEV)</label>
                      <select className="select-input w-100" style={{ border: '2px solid var(--primary)', background: 'rgba(5, 150, 105, 0.05)' }} value={formUsuario.empresa} onChange={e => setFormUsuario({ ...formUsuario, empresa: e.target.value })} required>
                        <option value="">Selecione a Empresa do Cliente...</option>
                        {empresasDb.map(emp => <option key={emp.id} value={emp.nome}>{emp.nome}</option>)}
                      </select>
                    </div>
                  )}

                  <div>
                    <label>Nome Completo (Identidade Oficial)</label>
                    <input type="text" value={formUsuario.nome} onChange={e => setFormUsuario({ ...formUsuario, nome: e.target.value })} placeholder="Ex: Engenheiro João Silva" required autoFocus />
                  </div>
                  {formUsuario.role === 'LOJA' && (
                    <div>
                      <label>Cargo Local</label>
                      <select className="select-input w-100" value={formUsuario.tipo_acesso} onChange={e => setFormUsuario({ ...formUsuario, tipo_acesso: e.target.value })} required>
                        <option value="GERENTE">Gerente de Loja</option>
                        <option value="COORDENADOR">Coordenador/Subgerente</option>
                        <option value="OUTROS">Outro Cargo</option>
                      </select>
                    </div>
                  )}
                  {formUsuario.role === 'LOJA' && (
                    <div>
                      <label>Restrição: Filial Física</label>
                      <select className="select-input w-100" value={formUsuario.filial} onChange={e => setFormUsuario({ ...formUsuario, filial: e.target.value })} required>
                        <option value="">Selecione a Filial...</option>
                        {filiaisDb?.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  )}
                  {formUsuario.role !== 'LOJA' && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="global-access-warning">
                        <ShieldCheck size={16} /> Esta credencial possui alcance global para as filiais do Cliente.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section-iam">
                <h4>2. Autenticação & Segurança</h4>
                <div className="form-grid">
                  <div>
                    <label>Login (Nome de Usuário)</label>
                    <input type="text" value={formUsuario.usuario} onChange={e => setFormUsuario({ ...formUsuario, usuario: e.target.value })} placeholder="Ex: jsilva.tech" required />
                  </div>
                  <div>
                    <label>
                      Chave Criptográfica (Senha) 
                      {formUsuario.id && <span className="password-hint"> (Deixe em branco para manter a atual)</span>}
                    </label>
                    <input type="password" value={formUsuario.senha} onChange={e => setFormUsuario({ ...formUsuario, senha: e.target.value })} placeholder="••••••••" required={!formUsuario.id} />
                  </div>
                </div>
              </div>

              <div className="modal-actions iam-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModalUsuario(false)}>Cancelar Emissão</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: modalHeaderInfo.color, borderColor: modalHeaderInfo.color, boxShadow: `0 4px 15px color-mix(in srgb, ${modalHeaderInfo.color} 40%, transparent)` }}>
                  <Save size={18} /> Consolidar Identidade
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}

const Globe2 = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);