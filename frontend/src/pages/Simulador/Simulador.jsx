import React, { useState } from 'react';
import { Cpu, Send, Zap, Flame, Snowflake, WifiOff } from 'lucide-react';

export default function Simulador({ api, equipamentos, showToast }) {
  const [eqId, setEqId] = useState('');
  const [temp, setTemp] = useState('5.0');
  const [umidade, setUmidade] = useState('60');
  const [alerta, setAlerta] = useState('NENHUM');
  const [isEnviando, setIsEnviando] = useState(false);

  const injetarDados = async (e) => {
    e.preventDefault();
    if (!eqId) return showToast('Selecione uma máquina-alvo.', 'warning');
    setIsEnviando(true);
    try {
      await api.post('/leituras', {
        equipamento_id: eqId, temperatura: temp, umidade: umidade,
        alerta_forcado: alerta, consumo_kwh: (Math.random() * 2).toFixed(2),
        motor_ligado: alerta === 'MECANICA' ? false : true,
        em_degelo: alerta === 'DEGELO' ? true : false
      });
      showToast('Pacote de dados injetado no Node principal com sucesso!', 'success');
    } catch (err) { showToast('Falha na injeção.', 'error'); }
    setIsEnviando(false);
  };

  return (
    <div className="anim-fade-in stagger-1">
      <div className="flex-header">
        <div>
          <h3 className="section-title"><Cpu size={24} style={{ marginRight: '10px', color: 'var(--danger)' }}/> Simulador de Telemetria (Injeção de Pacotes)</h3>
          <p className="text-muted">Ferramenta Root para forçar anomalias no sistema contornando hardware real.</p>
        </div>
      </div>

      <div className="card" style={{ background: 'var(--card-bg)', padding: '2rem', maxWidth: '600px', margin: '0 auto', border: '1px solid var(--danger)' }}>
        <form onSubmit={injetarDados} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div className="form-group">
            <label>Máquina Alvo (Target Node)</label>
            <select className="select-input w-100" value={eqId} onChange={e => setEqId(e.target.value)} required>
              <option value="">-- Selecione o Ativo --</option>
              {equipamentos?.map(eq => <option key={eq.id} value={eq.id}>[{eq.filial}] {eq.nome}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Forçar Temperatura (°C)</label>
              <input type="number" step="0.1" className="w-100" value={temp} onChange={e => setTemp(e.target.value)} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Forçar Umidade (%)</label>
              <input type="number" step="0.1" className="w-100" value={umidade} onChange={e => setUmidade(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label>Injetar Anomalia no Cérebro (Payload)</label>
            <select className="select-input w-100" value={alerta} onChange={e => setAlerta(e.target.value)}>
              <option value="NENHUM">Nenhum (Operação Normal)</option>
              <option value="PORTA_ABERTA">Violação de Porta Aberta</option>
              <option value="REDE">Forçar Queda de Sinal WiFi/Rede</option>
              <option value="MECANICA">Forçar Parada Abrupta do Motor</option>
              <option value="DEGELO">Disparar Ciclo de Degelo Falso</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={isEnviando} style={{ marginTop: '10px', background: 'var(--danger)', border: 'none' }}>
            {isEnviando ? 'INJETANDO...' : <><Zap size={18} /> EXECUTAR INJEÇÃO DE DADOS</>}
          </button>
        </form>
      </div>
    </div>
  );
}