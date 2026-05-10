import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, ShieldCheck, AlertTriangle, ClipboardCheck, Edit, X, 
  Thermometer, Droplets, PackageSearch, Settings, MapPin, 
  Server, Search, Activity, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import './Equipamentos.css';

export default function Equipamentos({ 
  api, showToast, isOffline, userRole, userFilial, filiaisDb, listaSetores, listaTipos, 
  carregarDadosBase, equipamentosFiltradosLista, editarEquipamento, pedirExclusao 
}) {
  
  const formInicial = { 
    nome: '', tipo: '', temp_min: '', temp_max: '', 
    umidade_min: '', umidade_max: '', intervalo_degelo: '', 
    duracao_degelo: '', setor: '', filial: userRole === 'LOJA' ? userFilial : '', 
    data_calibracao: new Date().toISOString().split('T')[0] 
  };
  
  const [formEquip, setFormEquip] = useState({ ...formInicial });
  const [isFormOpen, setIsFormOpen] = useState(false); // Controla o Painel Retrátil
  const [buscaAtivo, setBuscaAtivo] = useState('');

  // Auto-Preenchimento ANVISA
  const aplicarNormaANVISA = (tipoSelecionado) => {
    if (!tipoSelecionado) return showToast('Selecione um Tipo de Refrigeração na secção acima primeiro.', 'warning');
    const tipoEncontrado = (listaTipos || []).find(t => t.nome === tipoSelecionado);
    if (tipoEncontrado) {
      setFormEquip(prev => ({ 
        ...prev, 
        temp_min: tipoEncontrado.temp_min, temp_max: tipoEncontrado.temp_max, 
        umidade_min: tipoEncontrado.umidade_min, umidade_max: tipoEncontrado.umidade_max, 
        intervalo_degelo: tipoEncontrado.intervalo_degelo, duracao_degelo: tipoEncontrado.duracao_degelo 
      }));
      showToast('Padrão Técnico Operacional (SLA) aplicado com sucesso!', 'success');
    } else {
      showToast('Tipo de Refrigeração não encontrado no sistema.', 'error');
    }
  };

  const salvarNovoEquipamento = async (e) => {
    e.preventDefault(); 
    if (isOffline) return showToast('Ação bloqueada. Sem ligação à rede.', 'warning');
    
    const dadosFinais = { ...formEquip, filial: userRole === 'LOJA' ? userFilial : formEquip.filial };
    try { 
      await api.post('/equipamentos', dadosFinais); 
      showToast('Máquina registada no Inventário IoT.', 'success'); 
      setFormEquip({ ...formInicial, filial: userRole === 'LOJA' ? userFilial : '' }); 
      setIsFormOpen(false);
      carregarDadosBase(); 
    } catch (e) { showToast('Ocorreu um erro ao gravar a máquina.', 'error'); }
  };

  // Filtragem Inteligente Local
  const ativosExibidos = useMemo(() => {
    if (!equipamentosFiltradosLista) return [];
    if (!buscaAtivo.trim()) return equipamentosFiltradosLista;
    
    const termo = buscaAtivo.toLowerCase();
    return equipamentosFiltradosLista.filter(eq => 
      eq.nome.toLowerCase().includes(termo) || 
      eq.setor.toLowerCase().includes(termo) ||
      (eq.filial && eq.filial.toLowerCase().includes(termo)) ||
      (eq.tipo && eq.tipo.toLowerCase().includes(termo))
    );
  }, [equipamentosFiltradosLista, buscaAtivo]);

  // KPIs Preditivos de Metrologia e Saúde
  const kpis = useMemo(() => {
    if (!ativosExibidos) return { total: 0, riscoCalib: 0, offlines: 0, degelo: 0 };
    let riscoCalib = 0; let offlines = 0; let degelo = 0;

    ativosExibidos.forEach(eq => {
      const diasCalib = eq.data_calibracao ? Math.floor((Date.now() - new Date(eq.data_calibracao).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      if (diasCalib > 330) riscoCalib++; // Aviso 30 dias antes de fazer 1 ano
      if (!eq.motor_ligado) offlines++;
      if (eq.em_degelo) degelo++;
    });

    return { total: ativosExibidos.length, riscoCalib, offlines, degelo };
  }, [ativosExibidos]);

  return (
    <div className="anim-fade-in stagger-1">
      
      {/* CABEÇALHO DA GESTÃO DE ATIVOS */}
      <div className="flex-header equipamentos-header">
        <div>
          <h3 className="equipamentos-title">Inventário de Equipamentos & Metrologia</h3>
          <p className="equipamentos-subtitle">Gestão de ativos, calibração de sensores e SLA.</p>
        </div>

        <div className="action-group">
          <div className="search-box-iot">
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Procurar ativo, setor ou tipo..." 
              value={buscaAtivo}
              onChange={(e) => setBuscaAtivo(e.target.value)}
            />
          </div>
          
          <button 
            className={`btn ${isFormOpen ? 'btn-outline' : 'btn-primary'} btn-toggle-form`} 
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            {isFormOpen ? <X size={18}/> : <PlusCircle size={18}/>}
            {isFormOpen ? 'Cancelar' : 'Adicionar Equipamento'}
          </button>
        </div>
      </div>

      {/* PAINEL DE KPIs PREDITIVOS */}
      <div className="iot-kpi-bar stagger-2">
        <div className="kpi-item total">
          <div className="kpi-icon"><Server size={20}/></div>
          <div className="kpi-data">
            <span className="kpi-value">{kpis.total}</span>
            <span className="kpi-label">Equipamentos Instalados</span>
          </div>
        </div>
        <div className={`kpi-item ${kpis.riscoCalib > 0 ? 'danger pulse-danger-border' : 'success'}`}>
          <div className="kpi-icon"><ClipboardCheck size={20}/></div>
          <div className="kpi-data">
            <span className="kpi-value">{kpis.riscoCalib}</span>
            <span className="kpi-label">Risco de Calibração</span>
          </div>
        </div>
        <div className={`kpi-item ${kpis.offlines > 0 ? 'warning' : 'ok'}`}>
          <div className="kpi-icon"><AlertTriangle size={20}/></div>
          <div className="kpi-data">
            <span className="kpi-value">{kpis.offlines}</span>
            <span className="kpi-label">Sensores Inativos</span>
          </div>
        </div>
      </div>

      {/* SMART PANEL: FORMULÁRIO RETRÁTIL */}
      <div className={`smart-form-panel ${isFormOpen ? 'open' : ''}`}>
        <div className="card equipamentos-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <div className="equipamentos-card-header">
            <h3 className="equipamentos-card-title"><Settings size={20} color="var(--primary)" /> Perfil do Novo Ativo</h3>
          </div>
          
          <form onSubmit={salvarNovoEquipamento}>
            {/* SECÇÃO 1: Identificação */}
            <div className="form-section">
              <div className="form-section-header">
                <h4 className="form-section-title"><MapPin size={16} color="var(--text-muted)"/> Identificação Física</h4>
              </div>
              <div className="form-grid">
                <div>
                    <label>Identificador na Rede</label>
                    <input type="text" value={formEquip.nome} onChange={(e) => setFormEquip({ ...formEquip, nome: e.target.value })} placeholder="Ex: CONG-01 Corredor Frios" required />
                </div>
                <div>
                    <label>Filial Designada</label>
                    <select className="select-input" value={formEquip.filial} onChange={(e) => setFormEquip({ ...formEquip, filial: e.target.value })} required disabled={userRole === 'LOJA'} style={{ backgroundColor: userRole === 'LOJA' ? 'var(--bg-color)' : undefined }}>
                      <option value="">Selecione a Filial...</option>
                      {filiaisDb?.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div>
                    <label>Setor Operacional</label>
                    <select className="select-input" value={formEquip.setor} onChange={(e) => setFormEquip({ ...formEquip, setor: e.target.value })} required>
                      <option value="">Selecione o Setor...</option>
                      {listaSetores?.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                    </select>
                </div>
                <div>
                    <label>Padrão Técnico (Tipo)</label>
                    <select className="select-input" value={formEquip.tipo} onChange={(e) => setFormEquip({ ...formEquip, tipo: e.target.value })} required>
                      <option value="">Selecione o Tipo...</option>
                      {listaTipos?.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                    </select>
                </div>
              </div>
            </div>

            {/* SECÇÃO 2: Limites SLA (ANVISA AUTO) */}
            <div className="form-section">
              <div className="form-section-header">
                <h4 className="form-section-title"><ShieldCheck size={16} color="var(--success)"/> Parâmetros de SLA & Alertas</h4>
                <button 
                  type="button" 
                  className="btn btn-anvisa" 
                  onClick={() => aplicarNormaANVISA(formEquip.tipo)} 
                  disabled={!formEquip.tipo || isOffline}
                  title="Carregar configuração RDC/ANVISA automaticamente"
                >
                  <Zap size={14} /> Aplicar Perfil Normativo
                </button>
              </div>
              <div className="form-grid">
                <div>
                    <label>Temp. Mínima Crítica (°C)</label>
                    <input type="number" step="0.1" value={formEquip.temp_min} onChange={(e) => setFormEquip({ ...formEquip, temp_min: e.target.value })} required />
                </div>
                <div>
                    <label>Temp. Máxima Crítica (°C)</label>
                    <input type="number" step="0.1" value={formEquip.temp_max} onChange={(e) => setFormEquip({ ...formEquip, temp_max: e.target.value })} required />
                </div>
                <div>
                    <label>Humidade Mínima (%)</label>
                    <input type="number" step="0.1" value={formEquip.umidade_min} onChange={(e) => setFormEquip({ ...formEquip, umidade_min: e.target.value })} />
                </div>
                <div>
                    <label>Humidade Máxima (%)</label>
                    <input type="number" step="0.1" value={formEquip.umidade_max} onChange={(e) => setFormEquip({ ...formEquip, umidade_max: e.target.value })} />
                </div>
              </div>
            </div>

            {/* SECÇÃO 3: Metrologia */}
            <div className="form-section" style={{ marginBottom: 0 }}>
              <div className="form-section-header">
                <h4 className="form-section-title"><Thermometer size={16} color="var(--warning)"/> Metrologia Oficial e Ciclos</h4>
              </div>
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div>
                    <label>Data do Certificado de Calibração</label>
                    <input type="date" value={formEquip.data_calibracao} onChange={(e) => setFormEquip({ ...formEquip, data_calibracao: e.target.value })} required />
                </div>
                <div>
                    <label>Intervalo de Ciclo de Degelo (Horas)</label>
                    <input type="number" min="1" value={formEquip.intervalo_degelo} onChange={(e) => setFormEquip({ ...formEquip, intervalo_degelo: e.target.value })} required />
                </div>
                <div>
                    <label>Duração do Ciclo de Degelo (Min)</label>
                    <input type="number" min="1" value={formEquip.duracao_degelo} onChange={(e) => setFormEquip({ ...formEquip, duracao_degelo: e.target.value })} required />
                </div>
              </div>
            </div>
            
            <div className="equipamentos-form-actions">
              <button type="submit" className="btn btn-primary" disabled={isOffline}>
                <PlusCircle size={18} /> Salvar Equipamento
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* TABELA DE ATIVOS CADASTRADOS */}
      <div className="card table-responsive stagger-3">
        {(!ativosExibidos || ativosExibidos.length === 0) ? (
          <div className="empty-state dashboard-empty">
             <PackageSearch size={56} style={{ opacity: 0.3, marginBottom: '1rem', color: 'var(--text-main)' }} />
             <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Nenhum ativo localizado.</h3>
             <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>A pesquisa não retornou resultados ou esta filial ainda não tem sensores integrados.</p>
          </div>
        ) : (
          <table className="table iot-table">
            <thead>
              <tr>
                <th>Topologia (Local)</th>
                <th>Identificação do Hardware</th>
                <th style={{ width: '250px' }}>Metrologia (Saúde da Aferição)</th>
                <th>SLA Térmico Configurado</th>
                <th style={{ textAlign: 'right' }}>Painel de Controlo</th>
              </tr>
            </thead>
            <tbody>
              {ativosExibidos.map(eq => {
                 const diasCalib = eq.data_calibracao ? Math.floor((Date.now() - new Date(eq.data_calibracao).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                 // Calcula percentagem (Assumindo validade de 365 dias)
                 const calibPercent = Math.min(100, Math.max(0, (diasCalib / 365) * 100));
                 const isCritico = diasCalib > 330;
                 const isExpirado = diasCalib > 365;
                 
                 let ringColor = 'var(--success)';
                 let isPulse = false;
                 if (eq.em_degelo) ringColor = 'var(--secondary)';
                 else if (!eq.motor_ligado) { ringColor = 'var(--danger)'; isPulse = true; }

                 return (
                  <tr key={eq.id} className="iot-table-row">
                    <td data-label="Loja/Filial">
                      <div className="node-location">
                        <span 
                          className={`status-ring ${isPulse ? 'pulse' : ''}`} 
                          style={{ color: ringColor }}
                          title={eq.em_degelo ? 'Em Degelo' : (!eq.motor_ligado ? 'Motor Parado/Falha' : 'A Operar Normalmente')}
                        ></span> 
                        <strong>{eq.filial}</strong>
                      </div>
                    </td>
                    
                    <td data-label="Hardware">
                      <div className="equipamento-nome-box">
                        <span className="hw-name">{eq.nome}</span>
                        <span className="equipamento-subtitle">{eq.tipo} • {eq.setor}</span>
                      </div>
                    </td>
                    
                    <td data-label="Metrologia">
                      <div className="metrology-box">
                        <div className="metrology-labels">
                          <span style={{ color: isExpirado ? 'var(--danger)' : (isCritico ? 'var(--warning)' : 'var(--text-muted)') }}>
                            {isExpirado ? '⚠️ Certificado Expirado' : (isCritico ? 'Atenção: A expirar' : 'Dentro da Validade')}
                          </span>
                          <strong>{diasCalib} dias</strong>
                        </div>
                        <div className="metrology-track">
                          <div 
                            className={`metrology-fill ${isExpirado ? 'expired' : (isCritico ? 'warning' : 'ok')}`} 
                            style={{ width: `${calibPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    
                    <td data-label="SLA Operacional">
                      <div className="limites-box">
                        <span className="limit-tag termico">
                          <Thermometer size={14} /> {eq.temp_min}°C a {eq.temp_max}°C
                        </span>
                        {(eq.umidade_min || eq.umidade_max) && (
                          <span className="limit-tag higro">
                            <Droplets size={14} /> {eq.umidade_min || 40}% a {eq.umidade_max || 80}%
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td data-label="Controlo" style={{ textAlign: 'right' }}>
                      <button className="btn btn-action edit" onClick={() => editarEquipamento(eq)} disabled={isOffline} title="Reconfigurar Hardware">
                        <Settings size={18} />
                      </button>
                      <button 
                        className="btn btn-action delete" 
                        style={isOffline ? { color: 'var(--text-muted)', background: 'transparent' } : {}}
                        onClick={() => pedirExclusao(eq.id, eq.nome)} 
                        disabled={isOffline}
                        title="Desmantelar Ativo Permanentemente"
                      >
                        <X size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}