import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Home, Building, Check, Search, ShoppingCart, Menu, X, ArrowLeft, ArrowRight, Trash2, Plus, Minus, BarChart, Users, Package, Settings, LogOut, CreditCard, QrCode, Shield, Loader2, Edit, PlusCircle, Building2, Copy, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import QRCode from "react-qr-code";

// --- CONFIGURAÇÃO DA API ---
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; 

// --- PÁGINAS E COMPONENTES ---

const ProgressBar = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;
  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-8">
      <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

const formatCPF = (value) => {
  return value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').substring(0, 14);
};

const AdminLoginModal = ({ show, onClose, onAdminLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    if (!show) return null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao autenticar.');
            }

            localStorage.setItem('adminToken', data.token);
            onAdminLogin();
            onClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in-fast">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-sm">
                <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-orange-400">Acesso Restrito</h2><button onClick={onClose}><X className="text-gray-400 hover:text-white"/></button></div>
                <form onSubmit={handleLogin}>
                    <div className="mb-4 relative"><Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Utilizador" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" required /></div>
                    <div className="mb-4 relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" required /></div>
                    {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                    <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transform hover:scale-105 flex justify-center items-center" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Entrar no Painel'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const LoginPage = ({ onLogin, onAdminLogin, onSwitchToRegister }) => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);

  const handleCpfChange = (e) => { setCpf(formatCPF(e.target.value)); };

  const handleLoginSubmit = async (e) => {
      e.preventDefault(); setIsLoading(true); setError('');
      try {
          const response = await fetch(`${API_URL}/api/auth/login`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cpf, password })
          });
          const data = await response.json();
          if (!response.ok) { throw new Error(data.message || 'Erro ao fazer login.'); }
          localStorage.setItem('token', data.token); onLogin(data.user);
      } catch (err) {
          setError(err.message);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <>
      <AdminLoginModal show={showAdminModal} onClose={() => setShowAdminModal(false)} onAdminLogin={onAdminLogin} />
      <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8"><span className="text-4xl font-bold text-orange-500">Smart</span><span className="text-4xl font-light text-white">Fridge</span></div>
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
            <h2 className="text-2xl font-bold text-center mb-6">Acesse sua conta</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4 relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Seu CPF" value={cpf} onChange={handleCpfChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" required /></div>
              <div className="mb-6 relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" required /></div>
              {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 flex justify-center items-center" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : 'Entrar'}</button>
            </form>
            <div className="text-center mt-6"><button onClick={onSwitchToRegister} className="text-orange-400 hover:text-orange-300 transition">Não tem uma conta? Cadastre-se</button></div>
            <div className="text-center mt-4"><button onClick={() => setShowAdminModal(true)} className="text-sm text-gray-400 hover:text-white transition">Acessar como Administrador</button></div>
          </div>
        </div>
      </div>
    </>
  );
};

const RegisterPage = ({ onRegister, onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', cpf: '', email: '', birthDate: '', condoId: '', apartment: '', password: '', confirmPassword: '', terms: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableCondos, setAvailableCondos] = useState([]);

  useEffect(() => {
    const fetchCondos = async () => {
        try {
            const response = await fetch(`${API_URL}/api/public/condominiums`);
            if (!response.ok) { throw new Error('Não foi possível carregar a lista de condomínios.'); }
            const data = await response.json();
            setAvailableCondos(data);
        } catch (err) {
            setError(err.message);
        }
    };
    fetchCondos();
  }, []);

  const handleCpfChange = (e) => { setFormData({...formData, cpf: formatCPF(e.target.value)}); };
  
  const handleRegisterSubmit = async () => {
      setIsLoading(true); setError(''); setSuccess('');
      try {
          const response = await fetch(`${API_URL}/api/auth/register`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: formData.name, cpf: formData.cpf, email: formData.email, password: formData.password, birth_date: formData.birthDate, condo_id: formData.condoId })
          });
          const data = await response.json();
          if (!response.ok) { throw new Error(data.message || 'Erro ao criar conta.'); }

          setSuccess('Conta criada! A fazer login...');
          
          const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cpf: formData.cpf, password: formData.password })
          });

          const loginData = await loginResponse.json();
          if (!loginResponse.ok) { throw new Error('Erro ao fazer login automático após o cadastro.'); }

          localStorage.setItem('token', loginData.token);
          setTimeout(() => {
              onRegister(loginData.user);
          }, 1500);

      } catch (err) {
          setError(err.message);
          setIsLoading(false);
      }
  }
  
  const validateStep1 = () => {
      if (!formData.name || formData.cpf.length !== 14 || !formData.birthDate || !formData.email) return false;
      const today = new Date(); const birthDate = new Date(formData.birthDate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
      return age >= 10;
  }
  const validateStep2 = () => { return formData.condoId && formData.apartment; }
  const validateStep3 = () => { return formData.password.length >= 6 && formData.password === formData.confirmPassword && formData.terms; }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl bg-gray-800 p-8 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-4">Crie sua conta</h2>
        <p className="text-gray-400 text-center mb-6">Siga as etapas para ter acesso às geladeiras.</p>
        <ProgressBar currentStep={step} totalSteps={3} />
        {step === 1 && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-4 text-orange-400">1. Informações Pessoais</h3>
            <div className="mb-4 relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Nome Completo" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"/></div>
            <div className="mb-4 relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="email" placeholder="E-mail" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"/></div>
            <div className="mb-4 relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="CPF" value={formData.cpf} onChange={handleCpfChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"/></div>
            <div className="mb-4 relative"><label className="text-sm text-gray-400 mb-2 block">Data de Nascimento (mín. 10 anos)</label><input type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"/></div>
          </div>
        )}
        {step === 2 && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-4 text-orange-400">2. Endereço</h3>
            <div className="mb-4 relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select value={formData.condoId} onChange={(e) => setFormData({...formData, condoId: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none">
                  <option value="">{availableCondos.length > 0 ? 'Selecione seu condomínio' : 'A carregar condomínios...'}</option>
                  {availableCondos.map(condo => <option key={condo.id} value={condo.id}>{condo.name}</option>)}
              </select>
            </div>
            <div className="mb-4 relative"><Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Nº do Apartamento / Bloco" value={formData.apartment} onChange={(e) => setFormData({...formData, apartment: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"/></div>
          </div>
        )}
        {step === 3 && (
           <div className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-4 text-orange-400">3. Segurança</h3>
            <div className="mb-4 relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="password" placeholder="Crie uma senha (mín. 6 caracteres)" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"/></div>
            <div className="mb-4 relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="password" placeholder="Confirme sua senha" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"/></div>
            <div className="flex items-center"><input id="terms" type="checkbox" checked={formData.terms} onChange={(e) => setFormData({...formData, terms: e.target.checked})} className="h-4 w-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"/><label htmlFor="terms" className="ml-2 text-sm text-gray-300">Eu declaro que as informações são verdadeiras.</label></div>
           </div>
        )}
        <div className="mt-8 flex justify-between items-center">
            {step > 1 ? (<button onClick={() => setStep(step - 1)} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition"><ArrowLeft size={16} /> Voltar</button>) : (<button onClick={onSwitchToLogin} className="text-orange-400 hover:text-orange-300 transition">Já tenho conta</button>)}
            {step < 3 && (<button onClick={() => setStep(step + 1)} disabled={step === 1 ? !validateStep1() : !validateStep2()} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-500 disabled:cursor-not-allowed">Avançar <ArrowRight size={16} /></button>)}
            {step === 3 && (<button onClick={handleRegisterSubmit} disabled={!validateStep3() || isLoading} className="flex items-center justify-center gap-2 w-48 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-500 disabled:cursor-not-allowed">{isLoading ? <Loader2 className="animate-spin" /> : <>Finalizar Cadastro <Check size={16} /></>}</button>)}
        </div>
        {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
        {success && <p className="text-green-400 text-sm text-center mt-4">{success}</p>}
      </div>
    </div>
  );
};


const HomePage = ({ user, onLogout, cart, addToCart, setPage }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [condos, setCondos] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        const fetchCondos = async () => {
            try {
                const response = await fetch(`${API_URL}/api/public/condominiums`);
                const data = await response.json();
                setCondos(data);
            } catch (err) { console.error(err) }
        };
        fetchCondos();
    }, []);
    
    const currentCondo = condos.find(c => c.id === user.condoId);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true); setError('');
            if (!user.condoId) { setError('ID do condomínio não encontrado.'); setIsLoading(false); return; }
            try {
                const response = await fetch(`${API_URL}/api/products?condoId=${user.condoId}`);
                if (!response.ok) { const errData = await response.json(); throw new Error(errData.message || 'Falha ao buscar produtos.'); }
                const data = await response.json(); setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [user.condoId]);
    
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        setIsSearchLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchResults = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/products/search?q=${searchQuery}&condoId=${user.condoId}`);
                    const data = await response.json();
                    setSearchResults(data);
                } catch (err) {
                    console.error("Erro na pesquisa:", err);
                } finally {
                    setIsSearchLoading(false);
                }
            };
            fetchResults();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, user.condoId]);
    
    const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

    const SideMenu = () => (
      <div className={`fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-xl z-50 transform ${showMenu ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <div className="p-4">
              <div className="flex justify-between items-center mb-8"><span className="text-lg font-bold text-orange-500">Menu</span><button onClick={() => setShowMenu(false)}><X className="text-white"/></button></div>
              <nav className="flex flex-col gap-4">
                  <button onClick={() => setPage('my-account')} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition"><User size={20}/> Minha Conta</button>
                  <button onClick={() => setPage('changeCondo')} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition"><Building size={20}/> Trocar Condomínio</button>
                  <button onClick={onLogout} className="flex items-center gap-3 p-2 rounded-md hover:bg-red-500/20 text-red-400 transition"><LogOut size={20}/> Sair</button>
              </nav>
          </div>
      </div>
    );
    
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <SideMenu />
            {showMenu && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowMenu(false)}></div>}
            <header className="sticky top-0 bg-gray-800/80 backdrop-blur-sm shadow-md z-30">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowMenu(true)} className="md:hidden"><Menu/></button>
                        <div className="flex items-baseline"><span className="text-xl font-bold text-orange-500">Smart</span><span className="text-xl font-light text-white">Fridge</span></div>
                    </div>
                    <div className="flex-1 mx-4 max-w-lg">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Buscar um produto..." 
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            />
                            {isSearchFocused && searchQuery && (
                                <div className="absolute top-full mt-2 w-full bg-gray-700 rounded-lg shadow-lg z-40 max-h-60 overflow-y-auto">
                                    {isSearchLoading ? (
                                        <div className="p-4 text-center text-gray-400">A procurar...</div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map(product => (
                                            <div key={product.id} className="p-2 flex items-center gap-3 hover:bg-orange-500/20 cursor-pointer" onClick={() => { addToCart(product); setSearchQuery(''); }}>
                                                <img src={product.image_url || `https://placehold.co/100x100/374151/ffffff?text=Sem+Foto`} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                                                <span>{product.name}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-400">Nenhum resultado encontrado.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative" onClick={() => setPage('cart')}>
                           <ShoppingCart />
                           {totalItemsInCart > 0 && <span className="absolute -top-2 -right-2 bg-orange-500 text-xs text-white rounded-full h-5 w-5 flex items-center justify-center">{totalItemsInCart}</span>}
                        </button>
                        <button onClick={onLogout} className="hidden md:flex items-center gap-2 text-gray-300 hover:text-white transition"><LogOut size={18}/> Sair</button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="bg-gray-800 p-4 rounded-lg mb-8"><h1 className="text-xl md:text-2xl">Olá, <span className="font-bold text-orange-400">{user.name}</span>!</h1><p className="text-gray-300">Você está vendo produtos no <span className="font-semibold">{currentCondo?.name || '...'}</span>.</p></div>
                {isLoading && (<div className="flex justify-center items-center h-64"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /></div>)}
                {error && (<div className="text-center p-8 bg-red-900/20 text-red-400 rounded-lg"><p>Oops! Algo deu errado.</p><p className="text-sm">{error}</p></div>)}
                {!isLoading && !error && (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {products.length > 0 ? products.map(product => (
                            <div key={product.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col group transition-all transform hover:-translate-y-1 hover:shadow-orange-500/20">
                                <div className="relative"><img src={product.image_url || `https://placehold.co/300x300/374151/ffffff?text=${product.name.replace(' ', '+')}`} alt={product.name} className="w-full h-40 md:h-48 object-cover"/></div>
                                <div className="p-4 flex flex-col flex-grow"><h3 className="font-semibold text-base flex-grow">{product.name}</h3><p className="text-lg font-bold text-orange-400 mt-2">R$ {parseFloat(product.sale_price).toFixed(2).replace('.', ',')}</p></div>
                                <div className="p-2 grid grid-cols-2 gap-2">
                                    <button onClick={() => addToCart(product)} className="w-full bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-2 px-2 rounded-md transition">Adicionar</button>
                                    <button onClick={() => { addToCart(product); setPage('cart'); }} className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 px-2 rounded-md transition">Comprar</button>
                                </div>
                            </div>
                        )) : (<div className="col-span-full text-center p-8 bg-gray-800 text-gray-400 rounded-lg"><p className="text-xl font-semibold">Nenhum produto encontrado!</p><p>Parece que não há produtos disponíveis neste condomínio no momento.</p></div>)}
                    </div>
                )}
            </main>
        </div>
    );
}

const CartPage = ({ cart, setCart, setPage, user, setPaymentData, setPaymentMethod }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const updateQuantity = (productId, amount) => {
        const newCart = cart.map(item => {
            if (item.id === productId) {
                return { ...item, quantity: Math.max(0, item.quantity + amount) };
            }
            return item;
        }).filter(item => item.quantity > 0);
        setCart(newCart);
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const handleCreatePixPayment = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/orders/create-pix`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart, user: user })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Falha ao gerar pagamento PIX.');
            }
            setPaymentData(data);
            setPaymentMethod('pix');
            setPage('payment');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreditCardPayment = () => {
        setPaymentMethod('card');
        setPage('payment');
    };

    const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.sale_price) * item.quantity), 0);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
             <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('home')} className="text-orange-400 hover:text-orange-300">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold">Meu Carrinho</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                {cart.length === 0 ? (
                    <div className="text-center p-8 bg-gray-800 text-gray-400 rounded-lg">
                        <ShoppingCart size={48} className="mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Seu carrinho está vazio</h2>
                        <p>Adicione produtos da loja para começar a comprar.</p>
                        <button onClick={() => setPage('home')} className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition">
                            Voltar para a Loja
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            {cart.map(item => (
                                <div key={item.id} className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
                                    <img src={item.image_url || `https://placehold.co/100x100/374151/ffffff?text=${item.name.replace(' ', '+')}`} alt={item.name} className="w-20 h-20 rounded-md object-cover"/>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-orange-400 font-bold">R$ {parseFloat(item.sale_price).toFixed(2).replace('.', ',')}</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-700 rounded-lg p-1">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-gray-600 rounded-md"><Minus size={16}/></button>
                                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-gray-600 rounded-md"><Plus size={16}/></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={20}/></button>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-800 rounded-lg p-6 h-fit sticky top-24">
                            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-4">Resumo do Pedido</h2>
                            <div className="flex justify-between mb-2 text-gray-300">
                                <span>Subtotal</span>
                                <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between mb-6 text-gray-300">
                                <span>Taxas</span>
                                <span>R$ 0,00</span>
                            </div>
                            <div className="flex justify-between text-white font-bold text-xl mb-6 border-t border-gray-700 pt-4">
                                <span>Total</span>
                                <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                            <div className="flex flex-col gap-3">
                                <button onClick={handleCreditCardPayment} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2">
                                    <CreditCard /> Pagar com Cartão
                                </button>
                                <button onClick={handleCreatePixPayment} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : <><QrCode /> Pagar com PIX</>}
                                </button>
                            </div>
                             <button onClick={clearCart} className="w-full mt-4 text-sm text-gray-400 hover:text-red-400 transition">
                                Limpar Carrinho
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
const PixPaymentPage = ({ paymentData, setPage, setUnlockToken, setCurrentOrder }) => {
    const [copySuccess, setCopySuccess] = useState('');
    const [status, setStatus] = useState('pending');

    useEffect(() => {
        const interval = setInterval(async () => {
            if (document.visibilityState === 'visible') {
                const token = localStorage.getItem('token');
                try {
                    const response = await fetch(`${API_URL}/api/orders/${paymentData.orderId}/status`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (data.status === 'paid') {
                        setStatus('paid');
                        setUnlockToken(data.unlockToken);
                        setCurrentOrder({ id: paymentData.orderId });
                        clearInterval(interval);
                        setTimeout(() => setPage('success'), 1000);
                    }
                } catch (error) {
                    console.error("Erro ao verificar status do pagamento:", error);
                }
            }
        }, 5000); // Verifica a cada 5 segundos

        return () => clearInterval(interval);
    }, [paymentData.orderId, setPage, setUnlockToken, setCurrentOrder]);

    const handleCopy = () => {
        navigator.clipboard.writeText(paymentData.pix_qr_code_text);
        setCopySuccess('Copiado!');
        setTimeout(() => setCopySuccess(''), 2000);
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl text-center">
                {status === 'pending' ? (
                    <>
                        <h1 className="text-2xl font-bold mb-2">Pague com PIX para liberar</h1>
                        <p className="text-gray-400 mb-6">Escaneie o QR Code abaixo com a app do seu banco.</p>
                        <img 
                            src={`data:image/jpeg;base64,${paymentData.pix_qr_code}`} 
                            alt="PIX QR Code"
                            className="mx-auto rounded-lg"
                        />
                        <div className="mt-6 p-3 bg-gray-900 rounded-lg break-words text-sm text-gray-300 relative">
                            {paymentData.pix_qr_code_text}
                            <button onClick={handleCopy} className="absolute top-2 right-2 p-1 bg-gray-700 rounded-md hover:bg-gray-600">
                                <Copy size={16} />
                            </button>
                        </div>
                        {copySuccess && <p className="text-green-400 text-sm mt-2">{copySuccess}</p>}
                        <div className="mt-8 flex justify-center items-center gap-3 text-orange-400">
                            <Loader2 className="animate-spin" />
                            <span>A aguardar confirmação do pagamento...</span>
                        </div>
                    </>
                ) : (
                    <>
                        <Check size={64} className="text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Pagamento Aprovado!</h1>
                        <p className="text-gray-400">A redirecionar...</p>
                    </>
                )}
            </div>
        </div>
    );
};
const CardPaymentPage = ({ user, cart, setPage, setUnlockToken, setCart }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMpReady, setIsMpReady] = useState(false);

    useEffect(() => {
        if (!process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY) {
            setError("Chave pública do Mercado Pago não configurada. Verifique o ficheiro .env.");
            return;
        }

        const script = document.createElement("script");
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.async = true;
        
        script.onload = () => {
            setIsMpReady(true);
        };
        
        script.onerror = () => {
            setError("Não foi possível carregar o script de pagamento. Verifique a sua conexão.");
        };

        document.body.appendChild(script);

        return () => {
            let existingScript = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]');
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
        };
    }, []);

    useEffect(() => {
        if (isMpReady) {
            try {
                const mp = new window.MercadoPago(process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY);
                const bricksBuilder = mp.bricks();

                bricksBuilder.create("cardPayment", "cardPaymentBrick_container", {
                    initialization: {
                        amount: cart.reduce((total, item) => total + (parseFloat(item.sale_price) * item.quantity), 0),
                        payer: { email: user.email },
                    },
                    customization: {
                        visual: { style: { theme: 'dark' } },
                    },
                    callbacks: {
                        onReady: () => {},
                        onSubmit: async (cardFormData) => {
                            setIsLoading(true);
                            setError('');
                            const token = localStorage.getItem('token');
                            try {
                                const response = await fetch(`${API_URL}/api/orders/create-card`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        ...cardFormData,
                                        items: cart,
                                        user: user
                                    })
                                });
                                const data = await response.json();
                                if (!response.ok) {
                                    throw new Error(data.message || 'Pagamento recusado.');
                                }
                                setUnlockToken(data.unlockToken);
                                setCart([]);
                                setPage('success');
                            } catch (err) {
                                setError(err.message);
                            } finally {
                                setIsLoading(false);
                            }
                        },
                        onError: (err) => {
                            console.error(err);
                            setError('Ocorreu um erro ao processar os dados do cartão.');
                        },
                    },
                });
            } catch (e) {
                console.error("Erro ao inicializar o Mercado Pago:", e);
                setError("Ocorreu um erro ao inicializar o formulário de pagamento.");
            }
        }
    }, [isMpReady, cart, user, setPage, setUnlockToken, setCart]);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('cart')} className="text-orange-400 hover:text-orange-300">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold">Pagamento com Cartão</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg">
                    {!isMpReady && !error && <div className="flex justify-center items-center flex-col gap-4"><Loader2 className="animate-spin" /><span>A carregar formulário de pagamento...</span></div>}
                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                    <div id="cardPaymentBrick_container" style={{ display: isMpReady && !error ? 'block' : 'none' }}></div>
                    {isLoading && <div className="flex justify-center mt-4"><Loader2 className="animate-spin" /><span>A processar...</span></div>}
                </div>
            </main>
        </div>
    );
};
const PaymentPage = ({ paymentData, setPage, setUnlockToken, setCurrentOrder, paymentMethod, user, cart, setCart }) => {
    switch (paymentMethod) {
        case 'pix':
            return <PixPaymentPage paymentData={paymentData} setPage={setPage} setUnlockToken={setUnlockToken} setCurrentOrder={setCurrentOrder} />;
        case 'card':
            return <CardPaymentPage user={user} cart={cart} setPage={setPage} setUnlockToken={setUnlockToken} setCart={setCart} />;
        default:
            setPage('cart');
            return null;
    }
};
const SuccessPage = ({ setPage, unlockToken }) => {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl text-center">
                <h1 className="text-3xl font-bold mb-2">Pagamento Aprovado!</h1>
                <p className="text-gray-300 mb-6">Utilize o QR Code abaixo para abrir a sua SmartFridge.</p>
                
                <div className="p-4 bg-white rounded-lg inline-block">
                    {unlockToken ? (
                        <QRCode value={unlockToken} size={256} />
                    ) : (
                        <div className="p-8 bg-gray-200 rounded-lg">
                            <p className="text-red-500">Erro: Token de desbloqueio não recebido.</p>
                        </div>
                    )}
                </div>

                <button onClick={() => setPage('home')} className="mt-8 text-orange-400 hover:text-orange-300 transition">
                    Voltar para a Loja
                </button>
            </div>
        </div>
    );
};
const MyAccountPage = ({ user, setPage, onAccountUpdate }) => {
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        password: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
            setError('As novas senhas não coincidem.');
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Falha ao atualizar os dados.');
            }
            
            setSuccess('Dados atualizados com sucesso!');
            onAccountUpdate(data.user); // Atualiza o estado do utilizador na App principal

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('home')} className="text-orange-400 hover:text-orange-300">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold">Minha Conta</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg">
                    <form onSubmit={handleSubmit}>
                        <h3 className="text-xl font-bold mb-6 text-orange-400">Dados Pessoais</h3>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Nome Completo</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md" required />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-400 mb-2">E-mail</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md" required />
                        </div>

                        <h3 className="text-xl font-bold mb-6 mt-10 pt-6 border-t border-gray-700 text-orange-400">Alterar Senha</h3>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Senha Atual</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md" placeholder="Deixe em branco para não alterar" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Nova Senha</label>
                            <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-400 mb-2">Confirmar Nova Senha</label>
                            <input type="password" name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md" />
                        </div>

                        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                        {success && <p className="text-green-400 text-center mb-4">{success}</p>}

                        <button type="submit" className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Salvar Alterações'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};
const ChangeCondoPage = ({ user, setPage, onCondoChanged }) => {
    const [condos, setCondos] = useState([]);
    const [selectedCondoId, setSelectedCondoId] = useState(user.condoId);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCondos = async () => {
            try {
                const response = await fetch(`${API_URL}/api/public/condominiums`);
                const data = await response.json();
                setCondos(data);
            } catch (err) {
                setError('Falha ao carregar condomínios.');
            }
        };
        fetchCondos();
    }, []);

    const handleUpdateCondo = async () => {
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/auth/update-condo`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ condoId: selectedCondoId })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Falha ao atualizar condomínio.');
            }
            onCondoChanged(data.user);
            setPage('home');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('home')} className="text-orange-400 hover:text-orange-300">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold">Mudar de Condomínio</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Selecione o seu novo condomínio</h2>
                    <div className="flex flex-col gap-3">
                        {condos.map(condo => (
                            <button 
                                key={condo.id}
                                onClick={() => setSelectedCondoId(condo.id)}
                                className={`w-full text-left p-4 rounded-lg transition ${selectedCondoId === condo.id ? 'bg-orange-500 font-bold' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {condo.name}
                            </button>
                        ))}
                    </div>
                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                    <button 
                        onClick={handleUpdateCondo}
                        disabled={isLoading || selectedCondoId === user.condoId}
                        className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar Mudança'}
                    </button>
                </div>
            </main>
        </div>
    );
};
const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('sales');
    const [condominiums, setCondominiums] = useState([]);
    const [products, setProducts] = useState([]);
    const [profits, setProfits] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCondoModalOpen, setIsCondoModalOpen] = useState(false);
    const [currentCondo, setCurrentCondo] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [salesCondoId, setSalesCondoId] = useState('');
    const [salesSummary, setSalesSummary] = useState({ sales_count: 0, total_revenue: 0 });
    const [salesLog, setSalesLog] = useState([]);
    const [isSalesLoading, setIsSalesLoading] = useState(false);
    const [expandedSaleId, setExpandedSaleId] = useState(null);

    const fetchData = async (dataType, setData, params = '') => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/api/admin/${dataType}${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Falha ao buscar ${dataType}.`);
            const data = await response.json();
            setData(data);

            if (dataType === 'condominiums' && data.length > 0 && !salesCondoId) {
                setSalesCondoId(data[0].id);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'condominiums') {
            fetchData('condominiums', setCondominiums);
        } else if (activeTab === 'products') {
            fetchData('products', setProducts);
        } else if (activeTab === 'stock') {
            if(condominiums.length === 0) fetchData('condominiums', setCondominiums);
        } else if (activeTab === 'finance') {
            fetchData('profits', setProfits);
        } else if (activeTab === 'sales') {
            if(condominiums.length === 0) {
                fetchData('condominiums', setCondominiums);
            }
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'sales' && salesCondoId) {
            const fetchSalesData = async () => {
                setIsSalesLoading(true);
                const token = localStorage.getItem('adminToken');
                try {
                    const [summaryRes, logRes] = await Promise.all([
                        fetch(`${API_URL}/api/admin/sales/summary?condoId=${salesCondoId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                        fetch(`${API_URL}/api/admin/sales/log?condoId=${salesCondoId}`, { headers: { 'Authorization': `Bearer ${token}` } })
                    ]);
                    const summaryData = await summaryRes.json();
                    const logData = await logRes.json();
                    setSalesSummary(summaryData);
                    setSalesLog(logData);
                } catch (err) {
                    setError('Falha ao carregar dados de vendas.');
                } finally {
                    setIsSalesLoading(false);
                }
            };
            fetchSalesData();
        }
    }, [salesCondoId, activeTab]);
    
    const handleOpenCondoModal = (condo = null) => { setCurrentCondo(condo); setIsCondoModalOpen(true); };
    const handleCloseCondoModal = () => { setIsCondoModalOpen(false); setCurrentCondo(null); };
    const handleSaveCondo = async (condoData) => {
        const token = localStorage.getItem('adminToken');
        const method = condoData.id ? 'PUT' : 'POST';
        const url = condoData.id ? `${API_URL}/api/admin/condominiums/${condoData.id}` : `${API_URL}/api/admin/condominiums`;
        try {
            const response = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(condoData)
            });
            if (!response.ok) throw new Error('Falha ao salvar condomínio.');
            fetchData('condominiums', setCondominiums);
            handleCloseCondoModal();
        } catch (err) { alert(err.message); }
    };
    const handleDeleteCondo = async (id) => {
        if (window.confirm('Tem a certeza que quer apagar este condomínio?')) {
            const token = localStorage.getItem('adminToken');
            try {
                const response = await fetch(`${API_URL}/api/admin/condominiums/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Falha ao apagar condomínio.');
                fetchData('condominiums', setCondominiums);
            } catch (err) { alert(err.message); }
        }
    };

    const handleOpenProductModal = (product = null) => { setCurrentProduct(product); setIsProductModalOpen(true); };
    const handleCloseProductModal = () => { setIsProductModalOpen(false); setCurrentProduct(null); };
    const handleSaveProduct = async (productData) => {
        const token = localStorage.getItem('adminToken');
        const method = productData.id ? 'PUT' : 'POST';
        const url = productData.id ? `${API_URL}/api/admin/products/${productData.id}` : `${API_URL}/api/admin/products`;
        try {
            const response = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(productData)
            });
            if (!response.ok) throw new Error('Falha ao salvar produto.');
            fetchData('products', setProducts);
            handleCloseProductModal();
        } catch (err) { alert(err.message); }
    };
    const handleDeleteProduct = async (id) => {
        if (window.confirm('Tem a certeza que quer apagar este produto do catálogo?')) {
            const token = localStorage.getItem('adminToken');
            try {
                const response = await fetch(`${API_URL}/api/admin/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Falha ao apagar produto.');
                fetchData('products', setProducts);
            } catch (err) { alert(err.message); }
        }
    };

    const StockManagement = () => {
        const [selectedCondoId, setSelectedCondoId] = useState(condominiums[0]?.id || '');
        const [inventory, setInventory] = useState([]);
        const [inventoryQuantities, setInventoryQuantities] = useState({});
        const [isStockLoading, setIsStockLoading] = useState(false);

        useEffect(() => {
            if (selectedCondoId) {
                setIsStockLoading(true);
                const fetchInventory = async () => {
                    const token = localStorage.getItem('adminToken');
                    try {
                        const response = await fetch(`${API_URL}/api/admin/inventory?condoId=${selectedCondoId}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (!response.ok) throw new Error('Falha ao buscar o inventário.');
                        const data = await response.json();
                        setInventory(data);
                        const quantities = data.reduce((acc, item) => {
                            acc[item.id] = item.quantity;
                            return acc;
                        }, {});
                        setInventoryQuantities(quantities);
                    } catch (err) {
                        alert(err.message);
                    } finally {
                        setIsStockLoading(false);
                    }
                };
                fetchInventory();
            } else {
                setInventory([]);
                setInventoryQuantities({});
            }
        }, [selectedCondoId]);

        const handleInventoryChange = (productId, quantity) => {
            const newQuantity = Math.max(0, parseInt(quantity, 10) || 0);
            setInventoryQuantities(prev => ({ ...prev, [productId]: newQuantity }));
        };

        const handleSaveInventory = async (productId) => {
            const token = localStorage.getItem('adminToken');
            const quantity = inventoryQuantities[productId];
            try {
                const response = await fetch(`${API_URL}/api/admin/inventory`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ condo_id: selectedCondoId, product_id: productId, quantity })
                });
                if (!response.ok) throw new Error('Falha ao atualizar o estoque.');
                alert('Estoque atualizado com sucesso!');
            } catch (err) {
                alert(err.message);
            }
        };

        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Gestão de Estoque</h2>
                </div>
                <div className="mb-6">
                    <label className="text-sm text-gray-400 mb-2 block">Selecione o Condomínio</label>
                    <select onChange={(e) => setSelectedCondoId(e.target.value)} value={selectedCondoId} className="w-full max-w-xs bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">-- Selecione --</option>
                        {condominiums.map(condo => <option key={condo.id} value={condo.id}>{condo.name}</option>)}
                    </select>
                </div>

                {isStockLoading ? <Loader2 className="animate-spin" /> : selectedCondoId && (
                    <div className="bg-gray-800 rounded-lg overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-700"><tr><th className="p-4">Produto</th><th className="p-4 w-48">Quantidade em Estoque</th><th className="p-4 w-32">Ações</th></tr></thead>
                            <tbody>
                                {inventory.map(product => (
                                    <tr key={product.id} className="border-b border-gray-700">
                                        <td className="p-4 flex items-center gap-4"><img src={product.image_url || 'https://placehold.co/100x100/374151/ffffff?text=Sem+Foto'} className="h-12 w-12 rounded-md object-cover" alt={product.name}/><span>{product.name}</span></td>
                                        <td className="p-4">
                                            <input 
                                                type="number" 
                                                value={inventoryQuantities[product.id] || 0}
                                                onChange={(e) => handleInventoryChange(product.id, e.target.value)}
                                                className="w-24 bg-gray-900 p-2 rounded-md text-center"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <button onClick={() => handleSaveInventory(product.id)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-xs">Salvar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const CondoModal = ({ isOpen, onClose, onSave, condo }) => {
        const [formData, setFormData] = useState({});
        useEffect(() => { setFormData(condo || { name: '', address: '', syndic_name: '', syndic_contact: '', syndic_profit_percentage: 0, initial_investment: 0 }); }, [condo]);
        if (!isOpen) return null;
        const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
        const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
        return (
            <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
                <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg">
                    <h2 className="text-xl font-bold mb-6">{condo ? 'Editar' : 'Novo'} Condomínio</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Nome do Condomínio" className="bg-gray-700 p-2 rounded-md" required />
                        <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Endereço" className="bg-gray-700 p-2 rounded-md" />
                        <input name="syndic_name" value={formData.syndic_name || ''} onChange={handleChange} placeholder="Nome do Síndico" className="bg-gray-700 p-2 rounded-md" />
                        <input name="syndic_contact" value={formData.syndic_contact || ''} onChange={handleChange} placeholder="Contacto do Síndico" className="bg-gray-700 p-2 rounded-md" />
                        <input name="syndic_profit_percentage" type="number" step="0.01" value={formData.syndic_profit_percentage || ''} onChange={handleChange} placeholder="% Lucro Síndico" className="bg-gray-700 p-2 rounded-md" />
                        <input name="initial_investment" type="number" step="0.01" value={formData.initial_investment || ''} onChange={handleChange} placeholder="Investimento Inicial" className="bg-gray-700 p-2 rounded-md" />
                        <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded-md">Cancelar</button>
                            <button type="submit" className="bg-orange-500 hover:bg-orange-600 py-2 px-4 rounded-md">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const ProductModal = ({ isOpen, onClose, onSave, product }) => {
        const [formData, setFormData] = useState({});
        useEffect(() => { setFormData(product || { name: '', description: '', image_url: '', purchase_price: 0, sale_price: 0, critical_stock_level: 5 }); }, [product]);
        if (!isOpen) return null;
        const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
        const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
        return (
            <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
                <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg">
                    <h2 className="text-xl font-bold mb-6">{product ? 'Editar' : 'Novo'} Produto</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Nome do Produto" className="bg-gray-700 p-2 rounded-md md:col-span-2" required />
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Descrição" className="bg-gray-700 p-2 rounded-md md:col-span-2" rows="3"></textarea>
                        <input name="image_url" value={formData.image_url || ''} onChange={handleChange} placeholder="URL da Imagem" className="bg-gray-700 p-2 rounded-md md:col-span-2" />
                        <input name="purchase_price" type="number" step="0.01" value={formData.purchase_price || ''} onChange={handleChange} placeholder="Preço de Compra" className="bg-gray-700 p-2 rounded-md" required />
                        <input name="sale_price" type="number" step="0.01" value={formData.sale_price || ''} onChange={handleChange} placeholder="Preço de Venda" className="bg-gray-700 p-2 rounded-md" required />
                        <input name="critical_stock_level" type="number" value={formData.critical_stock_level || ''} onChange={handleChange} placeholder="Nível Crítico de Estoque" className="bg-gray-700 p-2 rounded-md" required />
                        <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded-md">Cancelar</button>
                            <button type="submit" className="bg-orange-500 hover:bg-orange-600 py-2 px-4 rounded-md">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const SalesPage = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Histórico de Vendas</h2>
                <select onChange={(e) => setSalesCondoId(e.target.value)} value={salesCondoId} className="w-full max-w-xs bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">-- Selecione um Condomínio --</option>
                    {condominiums.map(condo => <option key={condo.id} value={condo.id}>{condo.name}</option>)}
                </select>
            </div>

            {isSalesLoading ? <Loader2 className="animate-spin" /> : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4">
                            <ShoppingCart size={32} className="text-orange-400" />
                            <div>
                                <p className="text-gray-400 text-sm">Vendas Hoje</p>
                                <p className="text-2xl font-bold">{salesSummary.sales_count}</p>
                            </div>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4">
                            <DollarSign size={32} className="text-green-400" />
                            <div>
                                <p className="text-gray-400 text-sm">Faturamento Hoje</p>
                                <p className="text-2xl font-bold">R$ {parseFloat(salesSummary.total_revenue || 0).toFixed(2).replace('.',',')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="p-4">Pedido</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">CPF</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Método</th>
                                    <th className="p-4">Data</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesLog.map(sale => (
                                    <React.Fragment key={sale.id}>
                                        <tr className="border-b border-gray-700">
                                            <td className="p-4">#{sale.id}</td>
                                            <td className="p-4">{sale.user_name}</td>
                                            <td className="p-4">{sale.user_cpf}</td>
                                            <td className="p-4 font-bold text-orange-400">R$ {parseFloat(sale.total_amount).toFixed(2)}</td>
                                            <td className="p-4 capitalize">{sale.payment_method || 'N/A'}</td>
                                            <td className="p-4 text-sm">{new Date(sale.created_at).toLocaleString('pt-BR')}</td>
                                            <td className="p-4">
                                                <button onClick={() => setExpandedSaleId(expandedSaleId === sale.id ? null : sale.id)}>
                                                    {expandedSaleId === sale.id ? <ChevronUp /> : <ChevronDown />}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedSaleId === sale.id && (
                                            <tr className="bg-gray-900/50">
                                                <td colSpan="7" className="p-4">
                                                    <h4 className="font-semibold mb-2">Itens do Pedido:</h4>
                                                    {sale.items && sale.items[0] !== null ? sale.items.map((item, index) => (
                                                        <div key={index} className="flex justify-between text-sm text-gray-300 py-1">
                                                            <span>{item.quantity}x {item.product_name}</span>
                                                            <span>R$ {parseFloat(item.price).toFixed(2).replace('.', ',')}</span>
                                                        </div>
                                                    )) : <p className="text-sm text-gray-400">Sem itens detalhados.</p>}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

        </div>
    );
    
    const CondoManager = () => (
        <div>
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Gestão de Condomínios</h2><button onClick={() => handleOpenCondoModal()} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusCircle size={20} /> Novo Condomínio</button></div>
            <div className="bg-gray-800 rounded-lg overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-700"><tr><th className="p-4">Nome</th><th className="p-4">Endereço</th><th className="p-4">Síndico</th><th className="p-4">Ações</th></tr></thead><tbody>{condominiums.map(condo => (<tr key={condo.id} className="border-b border-gray-700"><td className="p-4">{condo.name}</td><td className="p-4">{condo.address}</td><td className="p-4">{condo.syndic_name}</td><td className="p-4 flex gap-2"><button onClick={() => handleOpenCondoModal(condo)} className="text-blue-400 hover:text-blue-300 p-2"><Edit size={18}/></button><button onClick={() => handleDeleteCondo(condo.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div>
        </div>
    );

    const ProductManager = () => (
        <div>
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Gestão de Produtos</h2><button onClick={() => handleOpenProductModal()} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusCircle size={20} /> Novo Produto</button></div>
            <div className="bg-gray-800 rounded-lg overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-700"><tr><th className="p-4">Produto</th><th className="p-4">Preço de Venda</th><th className="p-4">Preço de Compra</th><th className="p-4">Ações</th></tr></thead><tbody>{products.map(product => (<tr key={product.id} className="border-b border-gray-700"><td className="p-4 flex items-center gap-4"><img src={product.image_url || 'https://placehold.co/100x100/374151/ffffff?text=Sem+Foto'} className="h-12 w-12 rounded-md object-cover" alt={product.name}/><span>{product.name}</span></td><td className="p-4">R$ {parseFloat(product.sale_price).toFixed(2)}</td><td className="p-4">R$ {parseFloat(product.purchase_price).toFixed(2)}</td><td className="p-4 flex gap-2"><button onClick={() => handleOpenProductModal(product)} className="text-blue-400 hover:text-blue-300 p-2"><Edit size={18}/></button><button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div>
        </div>
    );

    const FinanceReport = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestão de Lucros</h2>
            </div>
            <div className="flex flex-col gap-6">
                {profits.map(report => (
                    <div key={report.id} className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-orange-400 border-b border-gray-700 pb-3 mb-4">{report.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <p className="text-sm text-gray-400">Investimento Inicial</p>
                                <p className="text-2xl font-bold">R$ {parseFloat(report.initial_investment || 0).toFixed(2).replace('.',',')}</p>
                            </div>
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <p className="text-sm text-gray-400">Faturamento Bruto</p>
                                <p className="text-2xl font-bold text-green-400">R$ {parseFloat(report.gross_revenue || 0).toFixed(2).replace('.',',')}</p>
                            </div>
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <p className="text-sm text-gray-400">Custo dos Produtos</p>
                                <p className="text-2xl font-bold text-red-400">R$ {parseFloat(report.cost_of_goods_sold || 0).toFixed(2).replace('.',',')}</p>
                            </div>
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <p className="text-sm text-gray-400">Lucro Líquido</p>
                                <p className="text-2xl font-bold text-teal-400">R$ {parseFloat(report.net_revenue || 0).toFixed(2).replace('.',',')}</p>
                            </div>
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <p className="text-sm text-gray-400">Comissão Síndico ({report.syndic_profit_percentage}%)</p>
                                <p className="text-2xl font-bold text-yellow-400">R$ {parseFloat(report.syndic_commission || 0).toFixed(2).replace('.',',')}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const renderContent = () => {
        if (isLoading && !isSalesLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /></div>;
        if (error) return <div className="text-red-400">Erro: {error}</div>;

        switch(activeTab) {
            case 'condominiums':
                return <CondoManager />;
            case 'products':
                 return <ProductManager />;
            case 'stock': 
                return <StockManagement />;
            case 'finance':
                return <FinanceReport />;
            case 'sales':
                return <SalesPage />;
            default: return <div>Selecione uma opção</div>;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            <CondoModal isOpen={isCondoModalOpen} onClose={handleCloseCondoModal} onSave={handleSaveCondo} condo={currentCondo} />
            <ProductModal isOpen={isProductModalOpen} onClose={handleCloseProductModal} onSave={handleSaveProduct} product={currentProduct} />
            <aside className="w-64 bg-gray-800 p-4 flex flex-col">
                <div className="text-center mb-10">
                    <span className="text-2xl font-bold text-orange-500">Smart</span>
                    <span className="text-2xl font-light text-white">Fridge</span>
                    <p className="text-sm text-gray-400">Admin</p>
                </div>
                <nav className="flex flex-col gap-2 flex-grow">
                    <button onClick={() => setActiveTab('sales')} className={`flex items-center gap-3 p-3 rounded-md transition ${activeTab === 'sales' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'}`}><DollarSign /> Vendas</button>
                    <button onClick={() => setActiveTab('condominiums')} className={`flex items-center gap-3 p-3 rounded-md transition ${activeTab === 'condominiums' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'}`}><Building2 /> Condomínios</button>
                    <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 p-3 rounded-md transition ${activeTab === 'products' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'}`}><Package /> Produtos</button>
                    <button onClick={() => setActiveTab('stock')} className={`flex items-center gap-3 p-3 rounded-md transition ${activeTab === 'stock' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'}`}><ShoppingCart /> Estoque</button>
                    <button onClick={() => setActiveTab('finance')} className={`flex items-center gap-3 p-3 rounded-md transition ${activeTab === 'finance' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'}`}><BarChart /> Gestão de Lucros</button>
                </nav>
                <div className="mt-auto">
                     <button onClick={onLogout} className="flex items-center w-full gap-3 p-3 rounded-md text-red-400 hover:bg-red-500/20 transition"><LogOut /> Sair do Painel</button>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">{renderContent()}</main>
        </div>
    )
};

export default function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [paymentData, setPaymentData] = useState(null);
  const [unlockToken, setUnlockToken] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
        const token = localStorage.getItem('token');
        const adminToken = localStorage.getItem('adminToken');

        if (adminToken) {
            setUser({ name: "Admin" });
            setPage('admin');
        } else if (token) {
            try {
                const response = await fetch(`${API_URL}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    setPage('home');
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error("Falha ao validar token", error);
                localStorage.removeItem('token');
            }
        }
        setIsInitializing(false);
    };
    validateToken();
  }, []);

  const handleLogin = (userData) => { setUser(userData); setPage('home'); };
  const handleAdminLogin = () => { setUser({name: "Admin"}); setPage('admin'); };
  const handleLogout = () => { 
      setUser(null); 
      setCart([]); 
      localStorage.removeItem('token'); 
      localStorage.removeItem('adminToken'); 
      setPage('login'); 
  };
  const handleRegister = (userData) => { setUser(userData); setPage('home'); };
  const handleAccountUpdate = (updatedUser) => {
      setUser(prevUser => ({...prevUser, ...updatedUser}));
  };
  const handleCondoChanged = (updatedUser) => {
      setUser(updatedUser);
  };
  const addToCart = (productToAdd) => {
    setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === productToAdd.id);
        if (existingItem) {
            return prevCart.map(item =>
                item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            return [...prevCart, { ...productToAdd, quantity: 1 }];
        }
    });
  };

  if (isInitializing) {
      return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><Loader2 className="w-16 h-16 text-orange-500 animate-spin" /></div>;
  }

  switch (page) {
    case 'register':
      return <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setPage('login')} />;
    case 'home':
      return user ? <HomePage user={user} onLogout={handleLogout} cart={cart} addToCart={addToCart} setPage={setPage} /> : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} />;
    case 'cart':
        return user ? <CartPage cart={cart} setCart={setCart} setPage={setPage} user={user} setPaymentData={setPaymentData} setPaymentMethod={setPaymentMethod} /> : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} />;
    case 'payment':
        return user ? <PaymentPage paymentData={paymentData} setPage={setPage} setCurrentOrder={setCurrentOrder} setUnlockToken={setUnlockToken} paymentMethod={paymentMethod} user={user} cart={cart} setCart={setCart} /> : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} />;
    case 'success':
        return <SuccessPage setPage={setPage} unlockToken={unlockToken} currentOrder={currentOrder} />;
    case 'my-account':
        return user ? <MyAccountPage user={user} setPage={setPage} onAccountUpdate={handleAccountUpdate} /> : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} />;
    case 'changeCondo':
        return user ? <ChangeCondoPage user={user} setPage={setPage} onCondoChanged={handleCondoChanged} /> : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} />;
    case 'admin':
        return <AdminDashboard onLogout={handleLogout} />;
    case 'login':
    default:
      return <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} />;
  }
}
