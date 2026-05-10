import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Send, Search, MoreVertical, Phone, PhoneCall, PhoneOff, 
  Paperclip, CheckCheck, Check, Reply, Copy, ChevronDown, Smile, Mic, 
  X, Trash2, User, MapPin, ArrowLeft, UploadCloud, Shield, Zap,
  Terminal, Radio, Activity, Navigation, ShieldAlert, MessageCircle, Globe, Crosshair
} from 'lucide-react';
import './Chat.css';

export default function Chat({ 
  contatosDb, nomeLogado, socket, userId, historicoChat, setHistoricoChat,
  contatoAtivo, setContatoAtivo, naoLidasPorContato, setNaoLidasPorContato
}) {
  const [pesquisa, setPesquisa] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [responderA, setResponderA] = useState(null); 
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isTyping, setIsTyping] = useState(false); 
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  
  // Gravador e Rádio PTT
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  
  // VoIP Chamadas
  const [callState, setCallState] = useState('idle');
  const [callPeer, setCallPeer] = useState(null); 
  const [callTime, setCallTime] = useState(0);
  
  // Paineis e Overlays
  const [showOptions, setShowOptions] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showSearchChat, setShowSearchChat] = useState(false);
  const [searchChat, setSearchChat] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Respostas Rápidas NOC
  const quickReplies = [
    "Estou no local 📍",
    "Anomalia resolvida ✅",
    "A aguardar aprovação ⏳",
    "Liguem-me urgente 📞",
    "Preciso de apoio tático 🆘"
  ];

  // Comandos de Terminal
  const slashCommands = [
    { cmd: '/status', label: 'Solicitar Ponto de Situação', icon: Activity, output: '[SYSTEM_REQ] Por favor, forneça o ponto de situação atualizado da intervenção.' },
    { cmd: '/loc', label: 'Pedir Coordenadas Exatas', icon: Navigation, output: '[SYSTEM_REQ] Transmita a sua localização GPS exata ou corredor de atuação.' },
    { cmd: '/alerta', label: 'Emitir Alerta Prioritário', icon: ShieldAlert, output: '⚠️ [ALERTA PRIORITÁRIO] Interrompa a operação atual e responda a este canal de imediato.' },
    { cmd: '/wa-bridge', label: 'Forçar Sincronização WhatsApp', icon: MessageCircle, output: '[SYSTEM] 🟢 Gateway WhatsApp ativado. Os próximos alertas críticos serão reencaminhados para o terminal móvel.' }
  ];

  const callIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const historyContainerRef = useRef(null);
  const fileInputRef = useRef(null); 
  const recordIntervalRef = useRef(null); 
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // --- CONTROLO DO INPUT E COMANDOS ---
  const handleInputChange = (e) => {
    const val = e.target.value;
    setMensagem(val);
    if (val === '/') setShowCommands(true);
    else setShowCommands(false);
  };

  const executarComando = (cmdObj) => {
    dispararMensagem(cmdObj.output);
    setMensagem('');
    setShowCommands(false);
  };

  const contatosFiltrados = useMemo(() => {
    if (!contatosDb) return [];
    return contatosDb.filter(c => 
      c.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.cargo.toLowerCase().includes(pesquisa.toLowerCase())
    );
  }, [contatosDb, pesquisa]);

  // Canal Global de Broadcast
  const canalGlobal = {
    id: 'todos',
    nome: 'Broadcast Global (NOC)',
    cargo: 'Toda a Equipa TermoSync',
    isGroup: true
  };

  const mensagensExibidas = useMemo(() => {
    if (!historicoChat) return [];
    let list = historicoChat.filter(m => 
      (String(m.remetenteId) === String(contatoAtivo?.id) && m.tipo === 'received') || 
      (String(m.destinoId) === String(contatoAtivo?.id) && m.tipo === 'sent') ||
      (contatoAtivo?.id === 'todos' && String(m.destinoId) === 'todos')
    );

    if (searchChat.trim()) {
      list = list.filter(m => m.texto?.toLowerCase().includes(searchChat.toLowerCase()));
    }
    return list;
  }, [historicoChat, contatoAtivo, searchChat]);

  useEffect(() => {
    if (!showSearchChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagensExibidas.length, isTyping, showSearchChat]); 

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollBottom((scrollHeight - scrollTop - clientHeight) > 150);
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSelecionarContato = (contato) => {
    setContatoAtivo(contato);
    setResponderA(null);
    setShowEmojiPicker(false);
    setShowCommands(false);
    setShowOptions(false);
    setShowSearchChat(false);
    setSearchChat('');
    setShowAgentModal(false); 
    
    if (naoLidasPorContato[contato.id]) {
      setNaoLidasPorContato(prev => {
        const next = { ...prev };
        delete next[contato.id];
        return next;
      });
    }
  };

  const dispararMensagem = (textoFinal) => {
    if (!textoFinal.trim() || !contatoAtivo || !socket) return;
    const novaMsg = { 
      id: Date.now(), remetenteId: userId, remetenteNome: nomeLogado,
      destinoId: contatoAtivo.id, texto: textoFinal, data: new Date(), tipo: 'sent' 
    };
    setHistoricoChat(prev => [...prev, novaMsg]);
    socket.emit('enviar_mensagem_chat', novaMsg);
  };

  const enviarMensagemTexto = (e) => {
    e?.preventDefault();
    if (!mensagem.trim() || mensagem === '/') return;

    let textoFinal = mensagem;
    if (responderA) textoFinal = `[REP:${responderA.texto}] ${mensagem}`;
    dispararMensagem(textoFinal);
    setMensagem('');
    setResponderA(null);
    setShowEmojiPicker(false);
  };
  
  // --- LÓGICA DE FICHEIROS E ÁUDIO ---
  const processFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { dispararMensagem(`[FILE:${file.name}|${file.type}]${reader.result}`); };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => { processFile(e.target.files[0]); e.target.value = ''; };
  const handleDragOver = (e) => { e.preventDefault(); if (contatoAtivo) setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); if (!contatoAtivo) return; processFile(e.dataTransfer.files[0]); };

  const iniciarGravacao = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.isCanceled = false; 
      recorder.ondataavailable = e => { if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data); };
      
      recorder.onstop = () => {
        if (recorder.isCanceled) { stream.getTracks().forEach(track => track.stop()); return; }
        const blob = new Blob(audioChunksRef.current, { type: 'audio/mp4' });
        const reader = new FileReader();
        reader.onloadend = () => { dispararMensagem(`[AUDIO]${reader.result}`); };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start(); 
      mediaRecorderRef.current = recorder;
      setIsRecording(true); setRecordTime(0); setShowEmojiPicker(false); setShowCommands(false);
      recordIntervalRef.current = setInterval(() => setRecordTime(prev => prev + 1), 1000);
    } catch (err) { alert('Permissão de microfone negada. Verifique as definições do telemóvel/browser.'); }
  };

  const pararEEnviarGravacao = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop(); 
    setIsRecording(false); clearInterval(recordIntervalRef.current);
  };

  const cancelarGravacao = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') { 
      mediaRecorderRef.current.isCanceled = true; mediaRecorderRef.current.stop(); 
    }
    setIsRecording(false); clearInterval(recordIntervalRef.current);
  };

  const apagarMensagemLocal = (idParaApagar) => { setHistoricoChat(prev => prev.filter(m => m.id !== idParaApagar)); };
  
  const encaminharParaWhatsApp = (texto) => {
    const textoFormatado = encodeURIComponent(`*Alerta Tático TermoSync:*\n\n${texto.replace(/\[.*?\]\s*/, '')}`);
    window.open(`https://wa.me/?text=${textoFormatado}`, '_blank');
  };

  const renderBubbleText = (textoBruto) => {
    if (!textoBruto) return '';
    
    if (textoBruto.startsWith('[CALL_END]')) return textoBruto.replace('[CALL_END]', '');
    if (textoBruto.startsWith('[SYSTEM_REQ]')) return textoBruto.replace('[SYSTEM_REQ]', '');
    if (textoBruto.startsWith('[SYSTEM]')) return textoBruto.replace('[SYSTEM]', '');

    if (textoBruto.startsWith('[AUDIO]')) {
      return (
        <div className="audio-bubble-content">
          <Radio size={18} opacity={0.8} />
          <audio controls src={textoBruto.substring(7)} preload="metadata" />
        </div>
      );
    }

    if (textoBruto.startsWith('[FILE:')) {
      const metaEnd = textoBruto.indexOf(']');
      if (metaEnd === -1) return "Ficheiro inválido";
      const metaInfo = textoBruto.substring(6, metaEnd).split('|');
      const fileName = metaInfo[0]; const fileType = metaInfo[1] || ''; const src = textoBruto.substring(metaEnd + 1);

      if (fileType.startsWith('image/')) {
        return (
          <div className="file-img-bubble">
            <img src={src} alt={fileName} onClick={() => setPreviewImage(src)} />
            <span>{fileName}</span>
          </div>
        );
      } else {
        return (
          <a href={src} download={fileName} className="chat-file-attachment">
            <Paperclip size={18} />
            <span>{fileName}</span>
          </a>
        );
      }
    }

    const repMatch = textoBruto.match(/\[REP:(.*?)\]\s*(.*)/);
    if (repMatch) {
      let repliedContent = repMatch[1];
      if (repliedContent.startsWith('[AUDIO]')) repliedContent = '🎤 Comunicação Rádio';
      else if (repliedContent.startsWith('[FILE:')) repliedContent = '📎 Documento Anexo';
      return (
        <>
          <div className="msg-reply-block"><strong>A responder a:</strong><p>{repliedContent}</p></div>
          {repMatch[2]}
        </>
      );
    }
    
    if (searchChat && textoBruto.toLowerCase().includes(searchChat.toLowerCase())) {
      const safeSearch = searchChat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = textoBruto.split(new RegExp(`(${safeSearch})`, 'gi'));
      return parts.map((part, i) => part.toLowerCase() === searchChat.toLowerCase() ? <mark key={i} className="search-highlight">{part}</mark> : part);
    }

    return textoBruto;
  };

  return (
    <div 
      className={`anim-fade-in chat-page-container ${contatoAtivo ? 'has-active-chat' : ''}`} 
      onClick={() => { setShowOptions(false); setShowCommands(false); }}
      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
    >
      {isDragging && contatoAtivo && (
        <div className="chat-drag-overlay">
          <div className="drag-content">
            <UploadCloud size={64} /><h2>Transmitir Ficheiro</h2><p>Largar para enviar a {contatoAtivo.nome}</p>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="lightbox-overlay" onClick={() => setPreviewImage(null)}>
          <button className="lightbox-close" onClick={() => setPreviewImage(null)}><X size={28} /></button>
          <img src={previewImage} className="lightbox-img" alt="Preview" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* --- SIDEBAR DE LISTAGEM --- */}
      <div className="chat-sidebar">
        <div className="chat-search-header">
          <div className="chat-search-box">
            <Search size={18} color="var(--text-muted)" />
            <input type="text" placeholder="Procurar agente de terreno..." value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
          </div>
        </div>
        
        <div className="chat-contacts-list">
          {(!pesquisa || canalGlobal.nome.toLowerCase().includes(pesquisa.toLowerCase())) && (
            <div className={`chat-contact-item channel-global ${contatoAtivo?.id === 'todos' ? 'active' : ''}`} onClick={() => handleSelecionarContato(canalGlobal)}>
              <div className="contact-avatar-wrapper">
                <div className="contact-avatar global-avatar"><Globe size={22} /></div>
              </div>
              <div className="contact-info">
                <span className="contact-name">{canalGlobal.nome}</span>
                <span className="contact-role">{canalGlobal.cargo}</span>
              </div>
            </div>
          )}

          <div className="contacts-divider">Agentes na Rede</div>

          {contatosFiltrados.length === 0 ? (
            <div className="chat-empty-contacts">
               <User size={32} />
               <p>Nenhum agente localizado no raio de pesquisa.</p>
            </div>
          ) : (
            contatosFiltrados.map(contato => {
              const qtdNaoLidas = naoLidasPorContato[contato.id] || 0;
              const isActive = contatoAtivo?.id === contato.id;
              return (
                <div key={contato.id} className={`chat-contact-item ${isActive ? 'active' : ''} ${qtdNaoLidas > 0 && !isActive ? 'has-unread' : ''}`} onClick={() => handleSelecionarContato(contato)}>
                  <div className="contact-avatar-wrapper">
                    <div className="contact-avatar">{contato.nome.charAt(0).toUpperCase()}</div>
                    <span className="status-indicator online"></span>
                  </div>
                  <div className="contact-info">
                    <span className="contact-name">{contato.nome}</span>
                    <span className="contact-role">{contato.cargo}</span>
                  </div>
                  {qtdNaoLidas > 0 && !isActive && <div className="contact-unread-badge">{qtdNaoLidas > 9 ? '9+' : qtdNaoLidas}</div>}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- ÁREA PRINCIPAL DO CHAT --- */}
      <div className="chat-main-area">
        {contatoAtivo ? (
          <>
            <div className="chat-main-header">
              {showSearchChat ? (
                <div className="chat-header-search-box anim-fade-in">
                  <Search size={18} color="var(--text-muted)" style={{marginRight: '8px'}}/>
                  <input type="text" placeholder="Procurar registo de log..." value={searchChat} onChange={e => setSearchChat(e.target.value)} autoFocus />
                  <X size={20} color="var(--text-muted)" style={{cursor: 'pointer'}} onClick={() => {setShowSearchChat(false); setSearchChat('');}} />
                </div>
              ) : (
                <div className="chat-active-user anim-fade-in" onClick={() => !contatoAtivo.isGroup && setShowAgentModal(true)} style={{cursor: contatoAtivo.isGroup ? 'default' : 'pointer'}}>
                  <button className="chat-header-btn mobile-back-btn" onClick={(e) => { e.stopPropagation(); setContatoAtivo(null); setShowAgentModal(false); }}>
                    <ArrowLeft size={24} color="var(--text-main)" />
                  </button>

                  <div className="contact-avatar-wrapper">
                    <div className={`contact-avatar ${contatoAtivo.isGroup ? 'global-avatar' : ''}`} style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
                      {contatoAtivo.isGroup ? <Globe size={20}/> : contatoAtivo.nome.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="chat-user-header-details">
                    <h3>{contatoAtivo.nome}</h3>
                    {isTyping && !contatoAtivo.isGroup ? <span className="chat-status-typing">A encriptar transmissão...</span> : <span className="chat-status-online"><span className="chat-status-dot"></span> Link Seguro Estabelecido</span>}
                  </div>
                </div>
              )}
              
              <div className="chat-header-actions">
                {!showSearchChat && <button className="chat-header-btn action-search-btn" onClick={() => setShowSearchChat(true)} title="Pesquisar Log"><Search size={20} /></button>}
                {!contatoAtivo.isGroup && (
                  <button className="chat-header-btn action-panel-btn" onClick={() => setShowAgentModal(true)} title="Telemetria do Agente"><Activity size={20} /></button>
                )}
              </div>
            </div>

            <div className="secure-channel-banner">
              <Shield size={14} /> Canal de Comunicação Tático (E2E AES-256)
            </div>

            <div className="chat-history-container">
              {showScrollBottom && <button className="scroll-bottom-btn" onClick={scrollToBottom}><ChevronDown size={24} /></button>}

              <div className="chat-history" onScroll={handleScroll} ref={historyContainerRef}>
                {mensagensExibidas.length === 0 && (
                  <div className="chat-secure-empty-state">
                    <Shield size={40} className="secure-icon pulse-soft" />
                    <p>
                      Comunicação ponto-a-ponto estabelecida.<br/>
                      Todos os pacotes de dados partilhados nesta frequência são auditados e confidenciais.
                    </p>
                  </div>
                )}
                
                {mensagensExibidas.map((msg, index) => {
                  const previousMsg = mensagensExibidas[index - 1];
                  const mostrarSeparadorData = !previousMsg || (new Date(msg.data).toDateString() !== new Date(previousMsg.data).toDateString());
                  const mostrarHora = !previousMsg || (new Date(msg.data).getMinutes() !== new Date(previousMsg.data).getMinutes()) || (msg.remetenteId !== previousMsg.remetenteId);
                  
                  const isSystemMsg = msg.texto?.includes('[SYSTEM_REQ]') || msg.texto?.includes('[CALL_END]') || msg.texto?.includes('[SYSTEM]');

                  if (isSystemMsg) {
                    return (
                      <React.Fragment key={msg.id}>
                        {mostrarSeparadorData && !searchChat && <div className="chat-date-separator"><span>{new Date(msg.data).toLocaleDateString()}</span></div>}
                        <div className={`system-msg-bubble ${msg.texto.includes('PRIORITÁRIO') ? 'critical' : ''} ${msg.texto.includes('WhatsApp') ? 'whatsapp-sys' : ''}`}>
                           <Terminal size={14} /> {renderBubbleText(msg.texto)}
                        </div>
                      </React.Fragment>
                    );
                  }

                  return (
                    <React.Fragment key={msg.id}>
                      {mostrarSeparadorData && !searchChat && <div className="chat-date-separator"><span>{new Date(msg.data).toLocaleDateString()}</span></div>}
                      
                      <div className={`msg-wrapper ${msg.tipo}`}>
                        <div className="msg-hover-actions">
                          <button type="button" className="msg-action-btn" onClick={() => encaminharParaWhatsApp(msg.texto)} title="Reencaminhar para WhatsApp"><MessageCircle size={16} /></button>
                          <button type="button" className="msg-action-btn" onClick={() => setResponderA(msg)}><Reply size={16} /></button>
                          <button type="button" className="msg-action-btn text-danger" onClick={() => apagarMensagemLocal(msg.id)}><Trash2 size={16} /></button>
                        </div>
                        <div className="msg-bubble">
                          {contatoAtivo.isGroup && msg.tipo === 'received' && <span className="msg-sender-name">{msg.remetenteNome}</span>}
                          {renderBubbleText(msg.texto)}
                        </div>
                        
                        {mostrarHora && (
                          <span className="msg-meta">
                            {new Date(msg.data).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                            {msg.tipo === 'sent' && <CheckCheck size={14} className="read-ticks" />}
                          </span>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
                {isTyping && !searchChat && <div className="msg-wrapper received"><div className="typing-indicator"><span></span><span></span><span></span></div></div>}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="chat-input-container">
              
              {isRecording ? (
                <div className="ptt-tactical-bar anim-slide-up">
                  <div className="ptt-status">
                    <span className="ptt-dot"></span>
                    <strong className="desktop-only-inline">TRANSMISSÃO ACTIVA</strong>
                    <span className="ptt-timer">{Math.floor(recordTime / 60)}:{String(recordTime % 60).padStart(2, '0')}</span>
                  </div>
                  
                  <div className="ptt-equalizer">
                    <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                  </div>

                  <div className="ptt-actions">
                    <button type="button" className="btn-ptt cancel" onClick={cancelarGravacao} title="Abortar"><X size={20}/></button>
                    <button type="button" className="btn-ptt send" onClick={pararEEnviarGravacao} title="Enviar Transmissão"><Send size={20}/></button>
                  </div>
                </div>
              ) : (
                <>
                  {!responderA && !showCommands && (
                    <div className="quick-replies-container anim-slide-up">
                      {quickReplies.map((reply, idx) => (
                        <button key={idx} className="quick-reply-btn" onClick={() => dispararMensagem(reply)}>{reply}</button>
                      ))}
                    </div>
                  )}

                  {showCommands && (
                    <div className="slash-command-menu anim-slide-up">
                      <div className="slash-header"><Terminal size={14}/> Comandos de Matriz Integrados</div>
                      {slashCommands.map((cmd, idx) => (
                        <div key={idx} className="slash-cmd-item" onClick={() => executarComando(cmd)}>
                          <div className="cmd-tag">{cmd.cmd}</div>
                          <div className="cmd-desc"><cmd.icon size={14}/> {cmd.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {responderA && (
                    <div className="reply-context-box">
                      <div className="reply-info">
                        <strong>A responder a {responderA.remetenteNome.split(' ')[0]}</strong>
                        <p>{responderA.texto.replace(/\[AUDIO\].*/, '🎤 Áudio').replace(/\[FILE:.*?\].*/, '📎 Anexo').replace(/\[REP:.*?\]\s*/, '')}</p>
                      </div>
                      <button type="button" className="btn-close-reply" onClick={() => setResponderA(null)}><X size={18} /></button>
                    </div>
                  )}

                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

                  <form className="chat-type-area" onSubmit={enviarMensagemTexto}>
                    <button type="button" className="chat-btn-icon file-attach-btn" onClick={() => fileInputRef.current.click()}><Paperclip size={22} /></button>
                    
                    <div className="chat-input-wrapper">
                      <input 
                        type="text" 
                        placeholder={showCommands ? "Selecione o protocolo..." : "Digite a mensagem ou '/' para comandos..."}
                        value={mensagem}
                        onChange={handleInputChange}
                        autoFocus={window.innerWidth > 768} 
                      />
                    </div>

                    {mensagem.trim() && !showCommands ? (
                      <button type="submit" className="btn-send"><Send size={20} style={{ marginLeft: '-2px' }} /></button>
                    ) : (
                      <button type="button" className="btn-ptt-trigger" onClick={iniciarGravacao} title="Rádio / PTT"><Radio size={20} /></button>
                    )}
                  </form>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="chat-empty-state">
            <div className="chat-empty-icon-wrapper"><Shield size={56} color="var(--primary)" /></div>
            <h3>Central de Transmissão Tática</h3>
            <p>A aguardar seleção de agente na grelha lateral para<br/>iniciar protocolo de comunicação segura.</p>
          </div>
        )}
      </div>

      {/* --- MODAL DE TELEMETRIA DO AGENTE --- */}
      {contatoAtivo && !contatoAtivo.isGroup && showAgentModal && (
        <div className="chat-modal-overlay anim-fade-in" onClick={() => setShowAgentModal(false)}>
          <div className="agent-modal-content" onClick={(e) => e.stopPropagation()}>
            
            <div className="agent-modal-header">
              <h4><Activity size={18}/> Perfil Operacional Tático</h4>
              <button className="btn-close-modal" onClick={() => setShowAgentModal(false)}><X size={20}/></button>
            </div>
            
            <div className="agent-modal-body">
              <div className="agent-avatar-large">{contatoAtivo.nome.charAt(0).toUpperCase()}</div>
              <h2 className="agent-name-large">{contatoAtivo.nome}</h2>
              <span className="agent-role-badge">{contatoAtivo.cargo}</span>

              <div className="agent-telemetry-metrics">
                
                <div className="telemetry-item">
                  <div className="t-icon-box success"><Zap size={18}/></div>
                  <div className="t-data">
                    <span className="t-label">Status Link</span>
                    <span className="t-value text-success">ONLINE (12ms)</span>
                  </div>
                </div>
                
                <div className="telemetry-item">
                  <div className="t-icon-box primary">
                    <div className="radar-icon-pulse">
                      <Crosshair size={18} />
                      <div className="radar-wave"></div>
                    </div>
                  </div>
                  <div className="t-data">
                    <span className="t-label">Sinal GPS / Filial</span>
                    <span className="t-value">{contatoAtivo.filial || 'Tracker Indisponível'}</span>
                  </div>
                </div>

              </div>

              {/* =========================================
                  PROTOCOLOS DE INTERVENÇÃO TÁTICA
                  ========================================= */}
              <div className="agent-tactical-protocols">
                <h5 className="protocol-title">Protocolos de Intervenção Tática</h5>
                
                <button className="btn-protocol whatsapp-protocol" onClick={() => { 
                  const cmd = slashCommands.find(c => c.cmd === '/wa-bridge');
                  if(cmd) dispararMensagem(cmd.output); 
                  setShowAgentModal(false); 
                }}>
                  <div className="protocol-icon"><MessageCircle size={20}/></div>
                  <div className="protocol-info">
                    <span className="protocol-name">Gateway WhatsApp</span>
                    <span className="protocol-desc">Espelhar alertas críticos no telemóvel do agente</span>
                  </div>
                </button>

                <button className="btn-protocol danger-protocol" onClick={() => { 
                  const cmd = slashCommands.find(c => c.cmd === '/alerta');
                  if(cmd) dispararMensagem(cmd.output); 
                  setShowAgentModal(false); 
                }}>
                  <div className="protocol-icon"><ShieldAlert size={20}/></div>
                  <div className="protocol-info">
                    <span className="protocol-name">Alerta Prioritário</span>
                    <span className="protocol-desc">Forçar notificação de emergência no terminal</span>
                  </div>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}