import React from 'react';
import { 
  ShieldCheck, Database, Award, Server, Cpu, GraduationCap, 
  Code2, GitBranch, Github, Linkedin, Globe, Terminal, Layers 
} from 'lucide-react';
import TermoSyncLogo from '../../components/TermoSyncLogo';
import './Sobre.css';

export default function Sobre() {
  return (
    <div className="sobre-container anim-fade-in stagger-1">
      
      {/* SEÇÃO HERO DA PLATAFORMA */}
      <div className="sobre-hero">
        <TermoSyncLogo size={90} color="var(--primary)" />
        <h1 style={{ fontSize: '3.8rem', margin: '1rem 0 0 0', fontWeight: '900', letterSpacing: '-1.5px', color: 'var(--text-main)' }}>
          TermoSync
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '900', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--secondary)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            NOC PLATFORM
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: '900', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            v10.5 ENTERPRISE
          </span>
        </div>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '750px', margin: '0 auto' }}>
          Sistema integrado de monitoramento geoespacial e orquestração de redes frias corporativas. Construído sobre uma arquitetura puramente assíncrona, o ecossistema realiza a ingestão massiva de telemetria proveniente de hardwares dedicados dispostos na borda operacional da rede.
        </p>
      </div>

      {/* TRIPÉ DA INFRAESTRUTURA TÉCNICA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        <Layers size={20} color="var(--primary)" />
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', uppercase: 'true', letterSpacing: '0.5px', color: 'var(--text-main)' }}>
          Especificações Arquiteturais
        </h3>
      </div>

      <div className="sobre-tech-grid stagger-2">
        <div className="sobre-tech-card" style={{ '--card-color': 'var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
            <Server size={24} />
            <strong style={{ fontSize: '1rem' }}>Edge Computing & IoT</strong>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
            Comunicação escalável em tempo real através de WebSockets bidirecionais (Socket.io) acoplados a microcontroladores ESP32/Arduino, operando sob barramentos estáveis de telemetria.
          </p>
        </div>

        <div className="sobre-tech-card" style={{ '--card-color': 'var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success)' }}>
            <ShieldCheck size={24} />
            <strong style={{ fontSize: '1rem' }}>Compliance & Governança</strong>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
            Rastreabilidade total das cadeias frias e conformidade automatizada com as normativas da ANVISA (RDC) e regras globais de HACCP para ativos termolábeis e insumos clínicos.
          </p>
        </div>

        <div className="sobre-tech-card" style={{ '--card-color': 'var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--warning)' }}>
            <Database size={24} />
            <strong style={{ fontSize: '1rem' }}>SaaS Isolation Core</strong>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
            Arquitetura de dados orientada ao isolamento lógico Multi-Tenant. Abstração completa de instâncias e criptografia adaptativa de tokens de acesso em logs imutáveis (SOC Ledger).
          </p>
        </div>
      </div>

      {/* PORTFÓLIO DO DESENVOLVEDOR */}
      <div className="stagger-3" style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <Award size={22} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', letterSpacing: '0.5px', color: 'var(--text-main)' }}>
            Engenharia de Plataforma
          </h3>
        </div>

        <div className="developer-profile-card">
          <div className="dev-avatar-container">
            <div className="dev-avatar">JH</div>
          </div>
          
          <div className="dev-info">
            <div className="dev-name-row">
              <div>
                <h2 className="dev-name">João Henrique</h2>
                <div className="dev-role">
                  <Code2 size={16} /> Software Architect & Full-Stack Engineer
                </div>
              </div>

              {/* REPOSITÓRIOS E REDES SOCIAIS */}
              <div className="dev-social-links">
                <a href="https://github.com/joaosaturnino" target="_blank" rel="noopener noreferrer" className="social-btn github">
                  <Github size={16} /> GitHub
                </a>
                <a href="https://www.linkedin.com/in/jo%C3%A3o-henrique-00288621a/" target="_blank" rel="noopener noreferrer" className="social-btn linkedin">
                  <Linkedin size={16} /> LinkedIn
                </a>
              </div>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 12px 0', lineHeight: '1.6' }}>
              Arquiteto responsável pela idealização full-stack do ecossistema, mapeamento de topologias de rede, projeto físico do banco de dados relacional e controle lógico dos microcontroladores de telemetria periférica.
            </p>

            {/* GRADE ACADÊMICA COMPLETA */}
            <div className="dev-courses-grid">
              <div className="course-badge" title="Desenvolvimento Web, Mobile e Engenharia de Software">
                <GraduationCap size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>Técnico em Desenvolvimento de Sistemas</span>
              </div>
              
              <div className="course-badge" title="Sistemas Web, Protocolos HTTP/REST e Cloud Computing">
                <Globe size={18} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                <span>Técnico em Informática para Internet</span>
              </div>
              
              <div className="course-badge" title="Infraestrutura de Redes, Firewall e Roteamento">
                <GitBranch size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <span>Técnico em Redes de Computadores</span>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}