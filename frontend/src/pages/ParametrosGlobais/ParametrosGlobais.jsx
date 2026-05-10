import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, Edit, X, Thermometer, Droplets, 
  Snowflake, ShieldCheck, Sliders, Save, Search, 
  LayoutGrid, PackageOpen, Zap, AlertTriangle, Trash2
} from 'lucide-react';
import './ParametrosGlobais.css';

export default function ParametrosGlobais({ 
  api, showToast, listaSetores, listaTipos, 
  carregarParametrosGerais, carregarDadosBase, setModalConfig 
}) {
  
  const [buscaSetor, setBuscaSetor] = useState('');
  const [buscaTipo, setBuscaTipo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [modalParametro, setModalParametro] = useState({ 
    isOpen: false, entidade: 'SETOR', id: '', nome: '', 
    temp_min: '', temp_max: '', umidade_min: '', umidade_max: '', 
    intervalo_degelo: '', duracao_degelo: '' 
  });

  // Filtragem Instantânea
  const setoresFiltrados = useMemo(() => {
    if (!listaSetores) return [];
    return listaSetores.filter(s => s.nome.toLowerCase().includes(buscaSetor.toLowerCase()));
  }, [listaSetores, buscaSetor]);

  const tiposFiltrados = useMemo(() => {
    if (!listaTipos) return [];
    return listaTipos.filter(t => t.nome.toLowerCase().includes(buscaTipo.toLowerCase()));
  }, [listaTipos, buscaTipo]);

  // KPIs de Políticas
  const kpis = useMemo(() => {
    return {
      setores: listaSetores?.length || 0,
      tipos: listaTipos?.length || 0,
    };
  }, [listaSetores, listaTipos]);

  const salvarParametro = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const isSetor = modalParametro.entidade === 'SETOR';
      const endpoint = isSetor ? '/setores' : '/tipos-refrigeracao';
      
      const payload = { nome: modalParametro.nome };
      
      if (!isSetor) {
        payload.temp_min = modalParametro.temp_min;
        payload.temp_max = modalParametro.temp_max;
        payload.umidade_min = modalParametro.umidade_min || 0;
        payload.umidade_max = modalParametro.umidade_max || 0;
        payload.intervalo_degelo = modalParametro.intervalo_degelo;
        payload.duracao_degelo = modalParametro.duracao_degelo;
      }

      if (modalParametro.id) {
        await api.put(`${endpoint}/${modalParametro.id}`, payload);
        showToast('Política atualizada com sucesso.', 'success');
      } else {
        await api.post(endpoint, payload);
        showToast('Nova regra consolidada no núcleo.', 'success');
      }

      setModalParametro({ ...modalParametro, isOpen: false });
      carregarParametrosGerais();
      carregarDadosBase();
    } catch (err) {
      showToast('Falha na operação. Verifique se a nomenclatura já existe.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const pedirExclusaoParametro = (id, nome, entidade) => {
    const isSetor = entidade === 'SETOR';
    const endpoint = isSetor ? '/setores' : '/tipos-refrigeracao';
    
    setModalConfig({
      isOpen: true,
      title: `Eliminar ${isSetor ? 'Zona Operacional' : 'Matriz de SLA'}`,
      message: `Tem a certeza que deseja remover a política "${nome}"? Máquinas associadas a esta regra poderão necessitar de reconfiguração.`,
      isPrompt: false,
      onConfirm: async () => {
        try {
          await api.delete(`${endpoint}/${id}`);
          showToast('Regra eliminada do sistema.', 'success');
          carregarParametrosGerais();
          carregarDadosBase();
        } catch (e) {
          showToast('Ação bloqueada. Existem máquinas dependentes desta política.', 'error');
        }
      }
    });
  };

  const abrirModalNovo = (entidade) => {
    setModalParametro({ 
      isOpen: true, entidade, id: '', nome: '', 
      temp_min: '', temp_max: '', umidade_min: '', umidade_max: '', 
      intervalo_degelo: '', duracao_degelo: '' 
    });
  };

  return (
    <div className="anim-fade-in stagger-1">
      
      {/* CABEÇALHO DO MÓDULO */}
      <div className="flex-header parametros-header-area">
        <div className="parametros-title-box">
          <div className="icon-circle" style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--info)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <Sliders size={26} />
          </div>
          <div>
            <h3 className="parametros-main-title">Políticas Base e Compliance</h3>
            <span className="parametros-subtitle">Configuração central de zonas e matrizes de qualidade SLA (RDC).</span>
          </div>
        </div>

        <div className="parametros-actions">
          <button className="btn btn-outline zone-btn" onClick={() => abrirModalNovo('SETOR')}>
            <LayoutGrid size={16} /> Definir Novo Setor
          </button>
          <button className="btn btn-primary sla-btn" onClick={() => abrirModalNovo('TIPO')} style={{ boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)' }}>
            <ShieldCheck size={16} /> Criar Matriz SLA
          </button>
        </div>
      </div>

      {/* KPIs DE POLÍTICAS */}
      <div className="policy-kpi-bar stagger-2">
        <div className="kpi-item">
          <div className="kpi-icon zone"><LayoutGrid size={20}/></div>
          <div className="kpi-data">
            <span className="kpi-value">{kpis.setores}</span>
            <span className="kpi-label">Topologias (Setores)</span>
          </div>
        </div>
        <div className="kpi-item">
          <div className="kpi-icon sla"><ShieldCheck size={20}/></div>
          <div className="kpi-data">
            <span className="kpi-value">{kpis.tipos}</span>
            <span className="kpi-label">Matrizes Normativas</span>
          </div>
        </div>
        <div className="kpi-item success">
          <div className="kpi-icon"><Zap size={20}/></div>
          <div className="kpi-data">
            <span className="kpi-value">Ativo</span>
            <span className="kpi-label">Motor de Regras</span>
          </div>
        </div>
      </div>

      {/* GRELHA PRINCIPAL (SETORES vs TIPOS) */}
      <div className="parametros-grid stagger-3">
        
        {/* COLUNA 1: ZONAS / SETORES */}
        <div className="card policy-card">
          <div className="policy-card-header">
            <h4 className="policy-card-title"><LayoutGrid size={18} color="var(--info)" /> Topologia de Setores</h4>
            <div className="search-box-policy">
              <Search size={14} color="var(--text-muted)" />
              <input type="text" placeholder="Filtrar zona..." value={buscaSetor} onChange={e => setBuscaSetor(e.target.value)} />
            </div>
          </div>
          
          <div className="policy-list">
            {setoresFiltrados.length === 0 ? (
               <div className="empty-policy">
                 <PackageOpen size={32} opacity={0.3} />
                 <p>Nenhuma zona definida.</p>
               </div>
            ) : (
              setoresFiltrados.map(s => (
                <div key={s.id} className="policy-list-item">
                  <div className="policy-info">
                    <strong>{s.nome}</strong>
                    <span>ID: ZN-{s.id.toString().padStart(4, '0')}</span>
                  </div>
                  <div className="policy-actions">
                    <button className="btn-action-small edit" onClick={() => setModalParametro({ isOpen: true, entidade: 'SETOR', id: s.id, nome: s.nome })}><Edit size={16} /></button>
                    <button className="btn-action-small delete" onClick={() => pedirExclusaoParametro(s.id, s.nome, 'SETOR')}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUNA 2: MATRIZES SLA / TIPOS */}
        <div className="card policy-card border-green">
          <div className="policy-card-header">
            <h4 className="policy-card-title"><ShieldCheck size={18} color="var(--success)" /> Matrizes de Compliance (SLA)</h4>
            <div className="search-box-policy">
              <Search size={14} color="var(--text-muted)" />
              <input type="text" placeholder="Filtrar SLA..." value={buscaTipo} onChange={e => setBuscaTipo(e.target.value)} />
            </div>
          </div>
          
          <div className="policy-list">
            {tiposFiltrados.length === 0 ? (
               <div className="empty-policy">
                 <AlertTriangle size={32} opacity={0.3} />
                 <p>Nenhuma matriz de SLA configurada.</p>
               </div>
            ) : (
              tiposFiltrados.map(t => (
                <div key={t.id} className="policy-list-item sla-item">
                  <div className="policy-info-full">
                    <div className="sla-title-row">
                      <strong>{t.nome}</strong>
                      <div className="policy-actions">
                        <button className="btn-action-small edit" onClick={() => setModalParametro({ isOpen: true, entidade: 'TIPO', ...t })}><Edit size={16} /></button>
                        <button className="btn-action-small delete" onClick={() => pedirExclusaoParametro(t.id, t.nome, 'TIPO')}><Trash2 size={16} /></button>
                      </div>
                    </div>
                    
                    {/* Tags de Limites Operacionais (Blueprints) */}
                    <div className="sla-limits-grid">
                      <span className="sla-tag termico"><Thermometer size={12}/> {t.temp_min}°C a {t.temp_max}°C</span>
                      <span className="sla-tag higro"><Droplets size={12}/> {t.umidade_min || 0}% a {t.umidade_max || 0}%</span>
                      <span className="sla-tag degelo"><Snowflake size={12}/> A cada {t.intervalo_degelo}h ({t.duracao_degelo}m)</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE EDITOR DE POLÍTICAS */}
      {modalParametro.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content policy-modal-content">
            
            <div className={`policy-modal-header ${modalParametro.entidade === 'SETOR' ? 'info' : 'success'}`}>
              <div className="policy-modal-icon">
                {modalParametro.entidade === 'SETOR' ? <LayoutGrid size={24} /> : <ShieldCheck size={24} />}
              </div>
              <div>
                <h3>{modalParametro.id ? 'Reconfigurar' : 'Forjar Nova'} Regra</h3>
                <span>{modalParametro.entidade === 'SETOR' ? 'Topologia de Zona Operacional' : 'Matriz de Compliance (SLA)'}</span>
              </div>
            </div>

            <form onSubmit={salvarParametro} className="policy-modal-form">
              <div className="form-section-policy">
                <label>Nomenclatura Oficial da Regra</label>
                <input 
                  type="text" 
                  value={modalParametro.nome} 
                  onChange={e => setModalParametro({...modalParametro, nome: e.target.value})} 
                  placeholder={modalParametro.entidade === 'SETOR' ? "Ex: Corredor de Laticínios" : "Ex: Congelados Premium"} 
                  required autoFocus 
                />
              </div>

              {modalParametro.entidade === 'TIPO' && (
                <>
                  <div className="form-section-policy">
                    <h4 className="section-divider"><Thermometer size={14} color="var(--danger)"/> Limites Térmicos (°C)</h4>
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                      <div><label>Alarme Mínimo</label><input type="number" step="0.1" value={modalParametro.temp_min} onChange={e => setModalParametro({...modalParametro, temp_min: e.target.value})} required /></div>
                      <div><label>Alarme Máximo</label><input type="number" step="0.1" value={modalParametro.temp_max} onChange={e => setModalParametro({...modalParametro, temp_max: e.target.value})} required /></div>
                    </div>
                  </div>

                  <div className="form-section-policy">
                    <h4 className="section-divider"><Droplets size={14} color="var(--info)"/> Controlo Higrométrico (%)</h4>
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                      <div><label>Humidade Mínima</label><input type="number" step="0.1" value={modalParametro.umidade_min} onChange={e => setModalParametro({...modalParametro, umidade_min: e.target.value})} required /></div>
                      <div><label>Humidade Máxima</label><input type="number" step="0.1" value={modalParametro.umidade_max} onChange={e => setModalParametro({...modalParametro, umidade_max: e.target.value})} required /></div>
                    </div>
                  </div>

                  <div className="form-section-policy" style={{ marginBottom: 0 }}>
                    <h4 className="section-divider"><Snowflake size={14} color="var(--secondary)"/> Padrão de Degelo</h4>
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                      <div><label>Frequência (Horas)</label><input type="number" min="1" value={modalParametro.intervalo_degelo} onChange={e => setModalParametro({...modalParametro, intervalo_degelo: e.target.value})} required /></div>
                      <div><label>Duração (Minutos)</label><input type="number" min="1" value={modalParametro.duracao_degelo} onChange={e => setModalParametro({...modalParametro, duracao_degelo: e.target.value})} required /></div>
                    </div>
                  </div>
                </>
              )}
              
              <div className="modal-actions policy-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModalParametro({ ...modalParametro, isOpen: false })}>
                  Abortar Regra
                </button>
                <button type="submit" className="btn btn-primary" disabled={isProcessing} style={modalParametro.entidade === 'SETOR' ? { background: 'var(--info)' } : {}}>
                  <Save size={18}/> Consolidar Regra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}