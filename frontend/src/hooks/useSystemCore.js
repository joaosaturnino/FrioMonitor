import { useState, useEffect, useCallback } from 'react';

const DEFAULT_FEATURES = { 
  allowExports: true, 
  enableAudioAlerts: true, 
  telemetryStream: true, 
  enableToasts: true, 
  forceDarkMode: false,
  enableChat: true,
  readOnlyMode: false
};

export function useSystemCore(userRole, loginAtivo, abaAtiva, setAbaAtiva) {
  
  // =========================================================================
  // 1. ESTADO GLOBAL DO SISTEMA (SysConfig V9)
  // =========================================================================
  const [sysConfig, setSysConfig] = useState(() => {
    const saved = localStorage.getItem('termosync_sysconfig_v9');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      maintenanceMode: false,
      regras: {
        'GLOBAL': { modulosOcultos: [], features: { ...DEFAULT_FEATURES } },
        'ADMIN': { modulosOcultos: [], features: { ...DEFAULT_FEATURES } },
        'LOJA': { modulosOcultos: [], features: { ...DEFAULT_FEATURES } },
        'MANUTENCAO': { modulosOcultos: [], features: { ...DEFAULT_FEATURES } },
        'DEV': { modulosOcultos: [], features: { ...DEFAULT_FEATURES } },
        'USERS': {}
      }
    };
  });

  // =========================================================================
  // 2. OUVINTE DE SINCRONIZAÇÃO EM TEMPO REAL (Múltiplas Abas)
  // =========================================================================
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'termosync_sysconfig_v9' && e.newValue) {
        try { setSysConfig(JSON.parse(e.newValue)); } catch (err) {}
      }
      if (e.key === 'termosync_force_reload') {
        window.location.reload(); 
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // =========================================================================
  // 3. MOTOR DE VALIDAÇÃO DE FEATURES (Com Fallbacks Seguros)
  // =========================================================================
  const isFeatureEnabled = useCallback((featureKey) => {
    if (userRole === 'DEV') {
      if (featureKey === 'readOnlyMode') return false; 
      if (featureKey === 'forceDarkMode') return sysConfig?.regras?.['GLOBAL']?.features?.forceDarkMode ?? false;
      return true;
    } 
    try {
      const globalFlag = sysConfig?.regras?.['GLOBAL']?.features?.[featureKey] ?? true;
      const roleFlag = sysConfig?.regras?.[userRole]?.features?.[featureKey] ?? true;
      const userFlag = sysConfig?.regras?.USERS?.[loginAtivo]?.features?.[featureKey] ?? true;
      
      if (featureKey === 'readOnlyMode' || featureKey === 'forceDarkMode') {
         return (sysConfig?.regras?.['GLOBAL']?.features?.[featureKey] === true) || 
                (sysConfig?.regras?.[userRole]?.features?.[featureKey] === true) || 
                (sysConfig?.regras?.USERS?.[loginAtivo]?.features?.[featureKey] === true);
      }
      return globalFlag && roleFlag && userFlag;
    } catch (e) { return true; }
  }, [sysConfig, userRole, loginAtivo]);

  // =========================================================================
  // 4. MOTOR DE VALIDAÇÃO DE MÓDULOS (TELAS)
  // =========================================================================
  const isModuloOculto = useCallback((moduleId) => {
    if (moduleId === 'dev_panel') return false; 
    try {
      const globalHidden = sysConfig?.regras?.['GLOBAL']?.modulosOcultos?.includes(moduleId) || false;
      const roleHidden = sysConfig?.regras?.[userRole]?.modulosOcultos?.includes(moduleId) || false;
      const userHidden = sysConfig?.regras?.USERS?.[loginAtivo]?.modulosOcultos?.includes(moduleId) || false;
      return globalHidden || roleHidden || userHidden;
    } catch (e) { return false; }
  }, [sysConfig, userRole, loginAtivo]);

  // =========================================================================
  // 5. FUNÇÃO DE ATUALIZAÇÃO DO KERNEL (Usada pelo Painel Dev)
  // =========================================================================
  const updateSysConfig = useCallback((scopeType, target, category, key, value) => {
    setSysConfig(prev => {
      try {
        const newConfig = JSON.parse(JSON.stringify(prev)); 
        if (!newConfig.regras) newConfig.regras = {};
        if (!newConfig.regras.USERS) newConfig.regras.USERS = {};

        let targetRef;
        if (scopeType === 'USER') {
            if (!target) return prev; 
            if (!newConfig.regras.USERS[target]) newConfig.regras.USERS[target] = { modulosOcultos: [], features: {...DEFAULT_FEATURES} };
            targetRef = newConfig.regras.USERS[target];
        } else {
            if (!target) target = 'GLOBAL';
            if (!newConfig.regras[target]) newConfig.regras[target] = { modulosOcultos: [], features: {...DEFAULT_FEATURES} };
            targetRef = newConfig.regras[target];
        }
        
        if (!targetRef.modulosOcultos) targetRef.modulosOcultos = [];
        if (!targetRef.features) targetRef.features = {...DEFAULT_FEATURES};

        if (category === 'maintenanceMode') {
          newConfig.maintenanceMode = value;
        } 
        else if (category === 'modulosOcultos') {
          if (targetRef.modulosOcultos.includes(key)) {
            targetRef.modulosOcultos = targetRef.modulosOcultos.filter(m => m !== key);
          } else {
            targetRef.modulosOcultos.push(key);
          }
          
          // Se a tela for ocultada enquanto o utilizador a vê, empurra-o para o Dashboard
          if ((scopeType === 'ROLE' && (target === 'GLOBAL' || target === userRole)) || (scopeType === 'USER' && target === loginAtivo)) {
             if (targetRef.modulosOcultos.includes(abaAtiva) && abaAtiva !== 'dashboard' && abaAtiva !== 'dev_panel') {
                setTimeout(() => setAbaAtiva('dashboard'), 0);
             }
          }
        } 
        else if (category === 'features') {
          targetRef.features[key] = value;
        }

        localStorage.setItem('termosync_sysconfig_v9', JSON.stringify(newConfig));
        localStorage.setItem('sysconfig_ping', Date.now().toString()); 
        return newConfig;
      } catch (e) {
        return prev;
      }
    });
  }, [abaAtiva, userRole, loginAtivo, setAbaAtiva]);

  // Retorna as funções prontas para o App.jsx utilizar
  return {
    sysConfig,
    isFeatureEnabled,
    isModuloOculto,
    updateSysConfig
  };
}