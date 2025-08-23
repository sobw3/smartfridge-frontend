import React from 'react';
// Ícones adicionados: History para o novo histórico, FileText para faturas
import { Mail, Lock, User, Home, Building, Check, Search, ShoppingCart, Menu, X, ArrowLeft, ArrowRight, Trash2, Plus, Minus, BarChart, Users as UsersIcon, Package, LogOut, CreditCard, QrCode, Shield, Loader2, Edit, PlusCircle, Building2, Copy, ChevronDown, ChevronUp, DollarSign, KeyRound, Calendar, Wallet, Flame, AlertTriangle, Save, Filter, ArrowDownToLine, ArrowRightLeft, Ticket, Bell, PiggyBank, History, Phone, Refrigerator, CheckCircle2, Info, Ban, FileText } from 'lucide-react';

// --- CONFIGURAÇÃO DA API ---
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const MERCADOPAGO_PUBLIC_KEY = 'APP_USR-091cb324-37d0-42bd-a985-b2a8a77a10de';


// --- FUNÇÕES HELPER ---
const formatCPF = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').substring(0, 14);
};

const formatPhone = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 15);
};

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf === '') return false;
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;
    return true;
};

// --- COMPONENTES ---

const Toast = ({ message, show }) => {
    if (!show) return null;
    return (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg flex items-center gap-3 z-[999] animate-fade-in-fast">
            <CheckCircle2 size={20} />
            <span>{message}</span>
        </div>
    );
};

const TransferConfirmationModal = ({ isOpen, onClose, onConfirm, recipient, amount, isTransferring }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in-fast">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
                <h2 className="text-xl font-bold mb-4 text-white">Confirmar Transferência</h2>
                <p className="text-gray-300 mb-6">Você está prestes a transferir <span className="font-bold text-orange-400">R$ {parseFloat(amount || 0).toFixed(2).replace('.', ',')}</span> para:</p>
                <div className="bg-gray-700 p-4 rounded-lg mb-6 text-left space-y-2">
                    <p><span className="text-gray-400 font-medium">Nome:</span> <span className="text-white">{recipient?.name}</span></p>
                    <p><span className="text-gray-400 font-medium">E-mail:</span> <span className="text-white">{recipient?.email}</span></p>
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancelar</button>
                    <button onClick={onConfirm} disabled={isTransferring} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-500 transition-colors">
                        {isTransferring ? <Loader2 className="animate-spin" /> : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TransferLoadingModal = ({ isOpen }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex flex-col justify-center items-center z-[999] animate-fade-in-fast">
            <Loader2 size={64} className="text-orange-400 animate-spin" />
            <p className="text-white text-xl mt-6 font-semibold">Processando transferência...</p>
            <p className="text-gray-400 mt-2">Aguarde, estamos concluindo a transação com segurança.</p>
        </div>
    );
};

const TransactionReceiptModal = ({ isOpen, onClose, transactionId, token }) => {
    const [details, setDetails] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (isOpen && transactionId) {
            const fetchDetails = async () => {
                setIsLoading(true);
                try {
                    const response = await fetch(`${API_URL}/api/wallet/transaction/${transactionId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setDetails(data);
                    } else {
                        setDetails(null);
                    }
                } catch (error) {
                    console.error("Failed to fetch transaction details:", error);
                    setDetails(null);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDetails();
        }
    }, [isOpen, transactionId, token]);

    const handlePrint = () => {
        window.print();
    };

    if (!isOpen) return null;

    const Logo = () => (
        <div className="text-center mb-6 print:text-black">
            <div className="flex justify-center items-baseline">
                <span className="text-3xl font-bold text-orange-400 print:text-orange-500">Smart</span>
                <span className="text-3xl font-light text-white print:text-black">Fridge</span>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 print:bg-white print:text-black">
            <div id="receipt" className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md print:shadow-none print:bg-white print:rounded-none">
                <Logo />
                <h2 className="text-xl font-bold mb-6 text-center text-gray-300 print:text-black">Comprovante de Transação</h2>
                {isLoading ? <div className="flex justify-center"><Loader2 className="animate-spin text-white print:text-black" /></div> : details ? (
                    <div className="space-y-3 text-gray-300 print:text-gray-800">
                        <p className="flex justify-between"><strong>ID da Transação:</strong> <span>{details.id}</span></p>
                        <p className="flex justify-between"><strong>Data e Hora:</strong> <span>{new Date(details.created_at).toLocaleString('pt-BR')}</span></p>

                        <hr className="border-gray-600 print:border-gray-300 my-4" />

                        <p className="flex justify-between"><strong>Tipo:</strong> <span className="font-semibold capitalize">{details.type?.replace(/_/g, ' ')}</span></p>
                        <p className="flex justify-between text-right"><strong>Descrição:</strong> <span className="ml-4">{details.description}</span></p>
                        <p className="flex justify-between text-2xl mt-4"><strong>Valor Total:</strong> <span className="font-bold text-orange-400 print:text-black">R$ {parseFloat(details.amount).toFixed(2).replace('.', ',')}</span></p>
                        
                        {details.items && details.items.length > 0 && (
                            <>
                                <hr className="border-gray-600 print:border-gray-300 my-4" />
                                <h3 className="font-bold text-lg text-gray-200 print:text-black">Itens da Compra</h3>
                                <div className="space-y-2 mt-2">
                                    {details.items.map(item => (
                                        <div key={item.product_id} className="flex justify-between text-sm">
                                            <span>{item.quantity}x {item.product_name}</span>
                                            <span>R$ {parseFloat(item.price_at_purchase).toFixed(2).replace('.', ',')}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {details.recipient && (
                            <>
                                <hr className="border-gray-600 print:border-gray-300 my-4" />
                                <h3 className="font-bold text-lg text-gray-200 print:text-black">Detalhes do Destinatário</h3>
                                <p className="flex justify-between"><strong>Nome:</strong> <span>{details.recipient.name}</span></p>
                                <p className="flex justify-between"><strong>E-mail:</strong> <span>{details.recipient.email}</span></p>
                                <p className="flex justify-between"><strong>Condomínio:</strong> <span>{details.recipient.condominium_name}</span></p>
                            </>
                        )}
                    </div>
                ) : <p className="text-red-400 text-center">Não foi possível carregar os detalhes da transação.</p>}
                <div className="flex justify-center gap-4 mt-8 print:hidden">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">Fechar</button>
                    <button onClick={handlePrint} disabled={isLoading || !details} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-500">Salvar / Imprimir</button>
                </div>
                <style>
                    {`@media print { body * { visibility: hidden; } #receipt, #receipt * { visibility: visible; } #receipt { position: absolute; left: 0; top: 0; width: 100%; } }`}
                </style>
            </div>
        </div>
    );
};

const CountdownTimer = ({ endDate }) => {
    const calculateTimeLeft = React.useCallback(() => {
        const difference = +new Date(endDate) - +new Date();
        let timeLeft = {};
        if (difference > 0) {
            timeLeft = {
                d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                m: Math.floor((difference / 1000 / 60) % 60),
                s: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    }, [endDate]);
    const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());
    React.useEffect(() => {
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });
    if (Object.keys(timeLeft).length === 0) return <span className="text-xs font-bold text-gray-400">Encerrada!</span>;
    const formatTime = (value) => (value || 0).toString().padStart(2, '0');
    const timerComponents = [];
    if (timeLeft.d > 0) timerComponents.push(`${timeLeft.d}d`);
    if (timeLeft.h > 0 || timeLeft.d > 0) timerComponents.push(`${formatTime(timeLeft.h)}h`);
    timerComponents.push(`${formatTime(timeLeft.m)}m`);
    timerComponents.push(`${formatTime(timeLeft.s)}s`);
    return <div className="text-xs font-bold tabular-nums">{timerComponents.join(':')}</div>;
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (!totalPages || totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-2 mt-6">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 bg-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-600 transition"><ArrowLeft size={16} /></button>
            <span className="text-gray-400">Página {currentPage} de {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 bg-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-600 transition"><ArrowRight size={16} /></button>
        </div>
    );
};

const ProgressBar = ({ currentStep, totalSteps }) => {
    const progress = (currentStep / totalSteps) * 100;
    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-8">
            <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
    );
};

const AdminLoginModal = ({ show, onClose, onAdminLogin }) => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
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
            if (!response.ok) throw new Error(data.message || 'Erro ao autenticar.');
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
                <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-orange-400">Acesso Restrito</h2><button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button></div>
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

const LoginPage = ({ onLogin, onAdminLogin, onSwitchToRegister, setPage }) => {
    const [cpf, setCpf] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [showAdminModal, setShowAdminModal] = React.useState(false);
    const handleCpfChange = (e) => { setCpf(formatCPF(e.target.value)); };
    const handleLoginSubmit = async (e) => {
        e.preventDefault(); setIsLoading(true); setError('');
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cpf, password })
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || 'Erro ao fazer login.'); }
            onLogin(data.token, data.user);
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
                        <div className="flex justify-between items-center mt-6">
                            <button onClick={() => setPage('forgot-password')} className="text-sm text-orange-400 hover:text-orange-300 transition">Esqueci minha senha</button>
                            <button onClick={onSwitchToRegister} className="text-sm text-orange-400 hover:text-orange-300 transition">Não tem uma conta? Cadastre-se</button>
                        </div>
                        <div className="text-center mt-4 border-t border-gray-700 pt-4"><button onClick={() => setShowAdminModal(true)} className="text-sm text-gray-400 hover:text-white transition">Acessar como Administrador</button></div>
                    </div>
                </div>
            </div>
        </>
    );
};

const ForgotPasswordPage = ({ setPage }) => {
    const [step, setStep] = React.useState(1);
    const [cpf, setCpf] = React.useState('');
    const [birthDate, setBirthDate] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const handleVerifyUser = async (e) => {
        e.preventDefault(); setIsLoading(true); setError('');
        try {
            const response = await fetch(`${API_URL}/api/auth/verify-user`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cpf: formatCPF(cpf), birth_date: birthDate })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha na verificação.');
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { setError('As senhas não coincidem.'); return; }
        if (newPassword.length < 6) { setError('A nova senha deve ter pelo menos 6 caracteres.'); return; }
        setIsLoading(true); setError(''); setSuccess('');
        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cpf: formatCPF(cpf), newPassword })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao alterar a senha.');
            setSuccess(data.message);
            setTimeout(() => setPage('login'), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl">
                <button onClick={() => setPage('login')} className="text-orange-400 hover:text-orange-300 mb-6 flex items-center gap-2"><ArrowLeft size={16} /> Voltar para o Login</button>
                <h2 className="text-2xl font-bold text-center mb-6">Recuperar Senha</h2>
                {step === 1 && (
                    <form onSubmit={handleVerifyUser}>
                        <p className="text-center text-gray-400 mb-6">Insira os seus dados para verificarmos a sua identidade.</p>
                        <div className="mb-4 relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Seu CPF" value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" required /></div>
                        <div className="mb-6 relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" required /></div>
                        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg flex justify-center items-center" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : 'Verificar'}</button>
                    </form>
                )}
                {step === 2 && (
                    <form onSubmit={handleResetPassword}>
                        <p className="text-center text-green-400 mb-6">Utilizador verificado! Agora, crie uma nova senha.</p>
                        <div className="mb-4 relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="password" placeholder="Nova senha (mín. 6 caracteres)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" required /></div>
                        <div className="mb-6 relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="password" placeholder="Confirme a nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" required /></div>
                        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                        {success && <p className="text-green-400 text-sm text-center mb-4">{success}</p>}
                        <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex justify-center items-center" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : 'Alterar Senha'}</button>
                    </form>
                )}
            </div>
        </div>
    );
};

const RegisterPage = ({ onRegister, onSwitchToLogin }) => {
    const [step, setStep] = React.useState(1);
    const [formData, setFormData] = React.useState({ name: '', cpf: '', email: '', phone_number: '', birthDate: '', condoId: '', apartmentBlock: '', apartmentNumber: '', password: '', confirmPassword: '', terms: false });
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [availableCondos, setAvailableCondos] = React.useState([]);
    React.useEffect(() => {
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
    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
    const handleCpfChange = (e) => { setFormData({ ...formData, cpf: formatCPF(e.target.value) }); };
    const handlePhoneChange = (e) => { setFormData({ ...formData, phone_number: formatPhone(e.target.value) }); };
    const handleRegisterSubmit = async () => {
        setError('');
        if (!validateCPF(formData.cpf)) { setError('CPF inválido.'); return; }
        if (!validateEmail(formData.email)) { setError('Formato de e-mail inválido.'); return; }
        setIsLoading(true); setSuccess('');
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name, cpf: formData.cpf, email: formData.email, phone_number: formData.phone_number, password: formData.password, birth_date: formData.birthDate, condo_id: formData.condoId, apartment: `Bloco ${formData.apartmentBlock} - Apto ${formData.apartmentNumber}` })
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || 'Erro ao criar conta.'); }
            setSuccess('Conta criada! A fazer login...');
            onRegister(data.token, data.user);

        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    }
    const validateStep1 = () => {
        if (!formData.name || !validateEmail(formData.email) || formData.cpf.length !== 14 || formData.phone_number.length < 14 || !formData.birthDate) return false;
        const today = new Date(); const birthDate = new Date(formData.birthDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
        return age >= 10;
    }
    const validateStep2 = () => { return formData.condoId && formData.apartmentBlock && formData.apartmentNumber; }
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
                        <div className="mb-4 relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input name="name" type="text" placeholder="Nome Completo" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                        <div className="mb-4 relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input name="email" type="email" placeholder="E-mail" value={formData.email} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                        <div className="mb-4 relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="CPF" value={formData.cpf} onChange={handleCpfChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                        <div className="mb-4 relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input name="phone_number" type="tel" placeholder="Telefone (XX) XXXXX-XXXX" value={formData.phone_number} onChange={handlePhoneChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                        <div className="mb-4 relative"><label className="text-sm text-gray-400 mb-2 block">Data de Nascimento (mín. 10 anos)</label><Calendar className="absolute left-3 top-[calc(50%+10px)] -translate-y-1/2 text-gray-400" size={20} /><input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                    </div>
                )}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-semibold mb-4 text-orange-400">2. Endereço</h3>
                        <div className="mb-4 relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <select name="condoId" value={formData.condoId} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none">
                                <option value="">{availableCondos.length > 0 ? 'Selecione seu condomínio' : 'A carregar condomínios...'}</option>
                                {availableCondos.map(condo => <option key={condo.id} value={condo.id}>{condo.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4 relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <select name="apartmentBlock" value={formData.apartmentBlock} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none">
                                    <option value="">Bloco</option>
                                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="mb-4 relative"><Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input name="apartmentNumber" type="text" placeholder="Nº do Apto" value={formData.apartmentNumber} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-semibold mb-4 text-orange-400">3. Segurança</h3>
                        <div className="mb-4 relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input name="password" type="password" placeholder="Crie uma senha (mín. 6 caracteres)" value={formData.password} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                        <div className="mb-4 relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input name="confirmPassword" type="password" placeholder="Confirme sua senha" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                        <div className="flex items-center"><input id="terms" name="terms" type="checkbox" checked={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.checked })} className="h-4 w-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500" /><label htmlFor="terms" className="ml-2 text-sm text-gray-300">Eu declaro que as informações são verdadeiras.</label></div>
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

const HomePage = ({ user, onLogout, cart, addToCart, setPage, fridgeId }) => {
    const [showMenu, setShowMenu] = React.useState(false);
    const [products, setProducts] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [condos, setCondos] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [isSearchLoading, setIsSearchLoading] = React.useState(false);
    const [isSearchFocused, setIsSearchFocused] = React.useState(false);
    const [unreadTickets, setUnreadTickets] = React.useState(0);

    React.useEffect(() => {
        const fetchCondos = async () => {
            try {
                const response = await fetch(`${API_URL}/api/public/condominiums`);
                const data = await response.json();
                setCondos(data);
            } catch (err) { console.error(err) }
        };
        fetchCondos();
    }, []);

    const currentCondo = condos.find(c => c.id === user?.condoId);

    React.useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true); setError('');
            if (!user?.condoId) { setError('ID do condomínio não encontrado.'); setIsLoading(false); return; }
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
    }, [user?.condoId]);

    React.useEffect(() => {
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
    }, [searchQuery, user?.condoId]);

    React.useEffect(() => {
        const fetchUnreadTickets = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const response = await fetch(`${API_URL}/api/user/tickets/unread-count`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUnreadTickets(data.count);
                }
            } catch (error) {
                console.error("Erro ao buscar tiquetes não lidos:", error);
            }
        };
        fetchUnreadTickets();
        const interval = setInterval(fetchUnreadTickets, 60000);
        return () => clearInterval(interval);
    }, []);

    const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

    const SideMenu = () => (
        <div className={`fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-xl z-50 transform ${showMenu ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
            <div className="p-4">
                <div className="flex justify-between items-center mb-8"><span className="text-lg font-bold text-orange-500">Menu</span><button onClick={() => setShowMenu(false)}><X className="text-white" /></button></div>
                <nav className="flex flex-col gap-4">
                    <button onClick={() => setPage('wallet')} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition"><Wallet size={20} /> Minha Carteira</button>
                    <button onClick={() => setPage('credit')} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition"><CreditCard size={20} /> Meu Crédito</button>
                    <button onClick={() => setPage('history')} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition"><History size={20} /> Meu Histórico</button>
                    <button onClick={() => setPage('my-tickets')} className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-gray-700 transition">
                        <div className="flex items-center gap-3"><Ticket size={20} /> Meus Tiquetes</div>
                        {unreadTickets > 0 && <span className="bg-red-500 text-xs text-white rounded-full h-5 w-5 flex items-center justify-center">{unreadTickets}</span>}
                    </button>
                    <button onClick={() => setPage('my-account')} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition"><User size={20} /> Minha Conta</button>
                    <button onClick={() => {
                        localStorage.removeItem('savedFridgeId');
                        setPage('fridgeSelection');
                    }} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition"><Building size={20} /> Usar outra Geladeira</button>
                    <button onClick={onLogout} className="flex items-center gap-3 p-2 rounded-md hover:bg-red-500/20 text-red-400 transition"><LogOut size={20} /> Sair</button>
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
                        <button onClick={() => setShowMenu(true)} className="md:hidden relative">
                            <Menu />
                            {unreadTickets > 0 && <span className="absolute -top-1 -right-1 bg-red-500 h-2 w-2 rounded-full"></span>}
                        </button>
                        <div className="flex items-baseline cursor-pointer" onClick={() => setPage('home')}>
                            <span className="text-xl font-bold text-orange-500">Smart</span>
                            <span className="text-xl font-light text-white">Fridge</span>
                        </div>
                    </div>
                    <div className="flex-1 mx-4 max-w-lg relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Buscar um produto..." className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} />
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
                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex items-center gap-5 text-sm font-semibold">
                            <button onClick={() => setPage('wallet')} className="text-gray-300 hover:text-orange-400 transition">Carteira</button>
                            <button onClick={() => setPage('credit')} className="text-gray-300 hover:text-orange-400 transition">Meu Crédito</button>
                            <button onClick={() => setPage('history')} className="text-gray-300 hover:text-orange-400 transition">Meu Histórico</button>
                            <button onClick={() => setPage('my-tickets')} className="text-gray-300 hover:text-orange-400 transition relative">
                                Tiquetes
                                {unreadTickets > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px]">{unreadTickets}</span>}
                            </button>
                            <button onClick={() => setPage('my-account')} className="text-gray-300 hover:text-orange-400 transition">Minha Conta</button>
                            <button onClick={() => { localStorage.removeItem('savedFridgeId'); setPage('fridgeSelection'); }} className="text-gray-300 hover:text-orange-400 transition">Outra Geladeira</button>
                        </nav>
                        <div className="h-6 w-px bg-gray-600 hidden md:block"></div>
                        <button className="relative" onClick={() => setPage('cart')}>
                            <ShoppingCart />
                            {totalItemsInCart > 0 && <span className="absolute -top-2 -right-2 bg-orange-500 text-xs text-white rounded-full h-5 w-5 flex items-center justify-center">{totalItemsInCart}</span>}
                        </button>
                        <button onClick={onLogout} className="hidden md:flex items-center gap-2 text-gray-300 hover:text-red-400 transition">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
                <div className="container mx-auto px-4 pb-3 md:hidden">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Buscar um produto..." className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} />
                        {isSearchFocused && searchQuery && (
                            <div className="absolute top-full mt-2 w-full bg-gray-700 rounded-lg shadow-lg z-40 max-h-60 overflow-y-auto">
                                {/* Lógica de resultados da pesquisa */}
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="bg-gray-800 p-4 rounded-lg mb-8 flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl">Olá, <span className="font-bold text-orange-400">{user?.name}</span>!</h1>
                        <p className="text-gray-300">Você está vendo produtos no <span className="font-semibold">{currentCondo?.name || '...'}</span>.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 text-sm">Geladeira ID</p>
                        <p className="font-mono text-lg bg-gray-900 px-2 py-1 rounded">{fridgeId}</p>
                    </div>
                </div>
                {isLoading && (<div className="flex justify-center items-center h-64"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /></div>)}
                {error && (<div className="text-center p-8 bg-red-900/20 text-red-400 rounded-lg"><p>Oops! Algo deu errado.</p><p className="text-sm">{error}</p></div>)}
                {!isLoading && !error && (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {products.length > 0 ? products.map(product => (
                            <div key={product.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col group transition-all transform hover:-translate-y-1 hover:shadow-orange-500/20">
                                <div className="relative">
                                    {product.promotion_end_date && (
                                        <div className="absolute top-2 left-2 bg-black/70 text-white p-2 rounded-lg flex items-center gap-2 z-10">
                                            <Flame size={16} className="text-orange-400" />
                                            <div>
                                                <p className="text-xs font-bold leading-tight">PROMOÇÃO</p>
                                                <CountdownTimer endDate={product.promotion_end_date} />
                                            </div>
                                        </div>
                                    )}
                                    <img src={product.image_url || `https://placehold.co/300x300/374151/ffffff?text=${product.name.replace(' ', '+')}`} alt={product.name} className="w-full h-40 md:h-48 object-cover" />
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="font-semibold text-base flex-grow">{product.name}</h3>
                                    <div className="mt-2">
                                        {product.original_price ? (
                                            <div>
                                                <p className="text-sm text-gray-400 line-through">R$ {parseFloat(product.original_price).toFixed(2).replace('.', ',')}</p>
                                                <p className="text-xl font-bold text-orange-400">R$ {parseFloat(product.sale_price).toFixed(2).replace('.', ',')}</p>
                                            </div>
                                        ) : (
                                            <p className="text-lg font-bold text-orange-400">R$ {parseFloat(product.sale_price).toFixed(2).replace('.', ',')}</p>
                                        )}
                                    </div>
                                </div>
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

const CartPage = ({ cart, setCart, setPage, user, setPaymentData, setPaymentMethod, onPaymentSuccess, fridgeId }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const updateQuantity = (productId, amount) => {
        const newCart = cart.map(item => {
            if (item.id === productId) return { ...item, quantity: Math.max(0, item.quantity + amount) };
            return item;
        }).filter(item => item.quantity > 0);
        setCart(newCart);
    };
    const removeFromCart = (productId) => { setCart(cart.filter(item => item.id !== productId)); };
    const clearCart = () => { setCart([]); };
    const handleCreatePixPayment = async () => {
        setIsLoading(true); setError('');
        try {
            const response = await fetch(`${API_URL}/api/orders/create-pix`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ items: cart, fridgeId: fridgeId, user: user })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao gerar pagamento PIX.');
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
    const handlePayWithWallet = async () => {
        setIsLoading(true); setError('');
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/orders/pay-with-wallet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
               body: JSON.stringify({ items: cart, fridgeId: fridgeId, condoId: user.condoId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao pagar com saldo.');
            
            setPaymentData({ unlockToken: data.unlockToken });
            onPaymentSuccess();
            setPage('awaitingUnlock');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const creditLimit = parseFloat(user?.credit_limit || 0);
    const creditUsed = parseFloat(user?.credit_used || 0);
    const availableCredit = creditLimit - creditUsed;
    const canUseCredit = availableCredit >= cartTotal;

    const handlePayWithCredit = async () => {
        setIsLoading(true); setError('');
        try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/orders/pay-with-credit`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
             body: JSON.stringify({ items: cart, fridgeId: fridgeId, condoId: user.condoId })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Falha ao pagar com crédito.');
        }

        setPaymentData({ unlockToken: data.unlockToken });
        onPaymentSuccess();
        setPage('awaitingUnlock');
        
    } catch(err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('home')} className="text-orange-400 hover:text-orange-300"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold">Meu Carrinho</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                {cart.length === 0 ? (
                    <div className="text-center p-8 bg-gray-800 text-gray-400 rounded-lg">
                        <ShoppingCart size={48} className="mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Seu carrinho está vazio</h2>
                        <p>Adicione produtos da loja para começar a comprar.</p>
                        <button onClick={() => setPage('home')} className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition">Voltar para a Loja</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            {cart.map(item => (
                                <div key={item.id} className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
                                    <img src={item.image_url || `https://placehold.co/100x100/374151/ffffff?text=${item.name.replace(' ', '+')}`} alt={item.name} className="w-20 h-20 rounded-md object-cover" />
                                    <div className="flex-grow">
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-orange-400 font-bold">R$ {parseFloat(item.sale_price).toFixed(2).replace('.', ',')}</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-700 rounded-lg p-1">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-gray-600 rounded-md"><Minus size={16} /></button>
                                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-gray-600 rounded-md"><Plus size={16} /></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={20} /></button>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-800 rounded-lg p-6 h-fit sticky top-24">
                            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-4">Resumo do Pedido</h2>
                            <div className="flex justify-between mb-2 text-gray-300"><span>Subtotal</span><span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span></div>
                            <div className="flex justify-between mb-6 text-gray-300"><span>Taxas</span><span>R$ 0,00</span></div>
                            <div className="flex justify-between text-white font-bold text-xl mb-6 border-t border-gray-700 pt-4"><span>Total</span><span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span></div>
                            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                            <div className="flex flex-col gap-3">
                                <button onClick={handlePayWithWallet} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={isLoading || (parseFloat(user?.wallet_balance || 0) < cartTotal)}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : (<><Wallet /> Pagar com Saldo (R$ {user?.wallet_balance ? parseFloat(user.wallet_balance).toFixed(2).replace('.', ',') : '0,00'})</>)}
                                </button>
                                {creditLimit > 0 && (
                                    <button onClick={handlePayWithCredit} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={isLoading || !canUseCredit}>
                                        {isLoading ? <Loader2 className="animate-spin" /> : (<><CreditCard /> Smart Limite (Disp. R$ {availableCredit.toFixed(2).replace(',',',')})</>)}
                                    </button>
                                )}
                                <button onClick={handleCreditCardPayment} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"><CreditCard /> Pagar com Cartão</button>
                                <button onClick={handleCreatePixPayment} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : <><QrCode /> Pagar com PIX</>}</button>
                            </div>
                            <button onClick={clearCart} className="w-full mt-4 text-sm text-gray-400 hover:text-red-400 transition">Limpar Carrinho</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const PixPaymentPage = ({ paymentData, setPage, onPaymentSuccess }) => {
    const [copySuccess, setCopySuccess] = React.useState('');
    const [paymentConfirmed, setPaymentConfirmed] = React.useState(false);
    const isDeposit = paymentData && typeof paymentData.orderId !== 'number';
    const cancelTargetPage = 'home';

    React.useEffect(() => {
        const interval = setInterval(async () => {
            if (document.visibilityState === 'visible' && !paymentConfirmed) {
                const token = localStorage.getItem('token');
                try {
                    const statusUrl = isDeposit
                        ? `${API_URL}/api/wallet/deposit-status/${paymentData.orderId}`
                        : `${API_URL}/api/orders/${paymentData.orderId}/status`;

                    const response = await fetch(statusUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`[Polling] Erro na resposta do servidor: ${response.status}`, errorText);
                        return;
                    }
                    const data = await response.json();
                    if (data.status === 'paid') {
                        setPaymentConfirmed(true);
                        onPaymentSuccess(data.unlockToken);
                        clearInterval(interval);
                        setTimeout(() => setPage(isDeposit ? 'wallet' : 'awaitingUnlock'), 2000);
                    }
                } catch (error) {
                    console.error("[Polling] Erro ao processar a resposta do status:", error);
                }
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [paymentData.orderId, setPage, onPaymentSuccess, paymentConfirmed, isDeposit]);

    const handleCopy = () => {
        navigator.clipboard.writeText(paymentData.pix_qr_code_text);
        setCopySuccess('Copiado!');
        setTimeout(() => setCopySuccess(''), 2000);
    };

    const handleCancel = () => { setPage(cancelTargetPage); };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl text-center">
                {paymentConfirmed ? (
                    <>
                        <Check size={64} className="text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Pagamento Aprovado!</h1>
                        <p className="text-gray-400">A sua transação foi concluída. A redirecionar...</p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold mb-2">Pague com PIX para continuar</h1>
                        <p className="text-gray-400 mb-6">Escaneie o QR Code abaixo com o app do seu banco.</p>
                        <div className='p-4 bg-white rounded-lg inline-block'>
                            <img src={`data:image/jpeg;base64,${paymentData.pix_qr_code}`} alt="PIX QR Code" className="mx-auto" />
                        </div>
                        <div className="mt-6 p-3 bg-gray-900 rounded-lg break-words text-sm text-gray-300 relative">
                            {paymentData.pix_qr_code_text}
                            <button onClick={handleCopy} className="absolute top-2 right-2 p-1 bg-gray-700 rounded-md hover:bg-gray-600"><Copy size={16} /></button>
                        </div>
                        {copySuccess && <p className="text-green-400 text-sm mt-2">{copySuccess}</p>}
                        <div className="mt-8 flex justify-center items-center gap-3 text-orange-400">
                            <Loader2 className="animate-spin" />
                            <span>A aguardar confirmação do pagamento...</span>
                        </div>
                        <button onClick={handleCancel} className="w-full mt-6 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"><ArrowLeft size={18} /> Cancelar e Voltar</button>
                    </>
                )}
            </div>
        </div>
    );
};

const CardPaymentPage = ({ user, cart, setPage, onPaymentSuccess, setPaymentData }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [isMpReady, setIsMpReady] = React.useState(false);
    const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.sale_price) * item.quantity), 0);

    React.useEffect(() => {
        if (!MERCADOPAGO_PUBLIC_KEY) {
            setError("Chave pública do Mercado Pago não configurada.");
            return;
        }
        const scriptId = 'mercadopago-sdk';
        let script = document.getElementById(scriptId);
        const handleLoad = () => setIsMpReady(true);
        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://sdk.mercadopago.com/js/v2";
            script.async = true;
            script.addEventListener('load', handleLoad);
            document.body.appendChild(script);
        } else {
            setIsMpReady(true);
        }
        return () => { if (script) script.removeEventListener('load', handleLoad); };
    }, []);

    React.useEffect(() => {
        let cardPaymentBrick;
        if (isMpReady && cartTotal > 0) {
            try {
                const mp = new window.MercadoPago(MERCADOPAGO_PUBLIC_KEY);
                const bricksBuilder = mp.bricks();
                const renderCardPaymentBrick = async () => {
                    const container = document.getElementById("cardPaymentBrick_container");
                    if (container.innerHTML.trim().length > 0) return;
                    cardPaymentBrick = await bricksBuilder.create("cardPayment", "cardPaymentBrick_container", {
                        initialization: {
                            amount: cartTotal,
                            payer: { email: user.email },
                        },
                        customization: { visual: { style: { theme: 'dark' } } },
                        callbacks: {
                            onSubmit: async (cardFormData) => {
                                setIsLoading(true); setError('');
                                const token = localStorage.getItem('token');
                                try {
                                    const response = await fetch(`${API_URL}/api/orders/create-card`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({ ...cardFormData, items: cart, user: user })
                                    });
                                    const data = await response.json();
                                    if (!response.ok) throw new Error(data.message || 'Pagamento recusado.');

                                    setPaymentData({ unlockToken: data.unlockToken });
                                    onPaymentSuccess(data.unlockToken);
                                    setPage('awaitingUnlock');

                                } catch (err) {
                                    setError(err.message);
                                } finally {
                                    setIsLoading(false);
                                }
                            },
                            onError: (err) => setError('Ocorreu um erro ao processar os dados do cartão.'),
                        },
                    });
                };
                renderCardPaymentBrick();
            } catch (e) {
                setError("Erro ao inicializar o formulário de pagamento.");
            }
        }
    }, [isMpReady, cart, user, setPage, onPaymentSuccess, cartTotal, setPaymentData]);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('cart')} className="text-orange-400 hover:text-orange-300"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold">Pagamento com Cartão</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg">
                    {!isMpReady && !error && <div className="flex justify-center items-center flex-col gap-4"><Loader2 className="animate-spin" /><span>A carregar formulário...</span></div>}
                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                    <div id="cardPaymentBrick_container"></div>
                    {isLoading && <div className="flex justify-center mt-4"><Loader2 className="animate-spin" /><span>A processar...</span></div>}
                </div>
            </main>
        </div>
    );
};

const CardDepositPage = ({ user, depositData, setPage, onPaymentSuccess }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [isMpReady, setIsMpReady] = React.useState(false);
    const depositAmount = parseFloat(depositData?.amount || 0);

    React.useEffect(() => {
        if (!MERCADOPAGO_PUBLIC_KEY) { setError("Chave pública do Mercado Pago não configurada."); return; }
        const scriptId = 'mercadopago-sdk';
        let script = document.getElementById(scriptId);
        const handleLoad = () => setIsMpReady(true);
        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://sdk.mercadopago.com/js/v2";
            script.async = true;
            script.addEventListener('load', handleLoad);
            document.body.appendChild(script);
        } else {
            setIsMpReady(true);
        }
        return () => { if (script) script.removeEventListener('load', handleLoad); };
    }, []);

    React.useEffect(() => {
        let cardPaymentBrick;
        if (isMpReady && depositAmount > 0) {
            try {
                const mp = new window.MercadoPago(MERCADOPAGO_PUBLIC_KEY);
                const bricksBuilder = mp.bricks();
                const renderBrick = async () => {
                    const container = document.getElementById("cardDepositBrick_container");
                    if (container.innerHTML.trim().length > 0) return;
                    cardPaymentBrick = await bricksBuilder.create("cardPayment", "cardDepositBrick_container", {
                        initialization: {
                            amount: depositAmount,
                            payer: { email: user.email },
                        },
                        customization: { visual: { style: { theme: 'dark' } } },
                        callbacks: {
                            onSubmit: async (cardFormData) => {
                                setIsLoading(true); setError('');
                                const token = localStorage.getItem('token');
                                try {
                                    const response = await fetch(`${API_URL}/api/wallet/deposit-card`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({ ...cardFormData, amount: depositAmount, user: user })
                                    });
                                    const data = await response.json();
                                    if (!response.ok) throw new Error(data.message || 'Depósito recusado.');
                                    onPaymentSuccess();
                                    setPage('wallet');
                                } catch (err) {
                                    setError(err.message);
                                } finally {
                                    setIsLoading(false);
                                }
                            },
                            onError: (err) => setError('Ocorreu um erro ao processar os dados do cartão.'),
                        },
                    });
                };
                renderBrick();
            } catch (e) {
                setError("Erro ao inicializar o formulário de depósito.");
            }
        }
    }, [isMpReady, depositAmount, user, setPage, onPaymentSuccess]);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('wallet')} className="text-orange-400 hover:text-orange-300"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold">Depositar com Cartão</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg">
                    <p className="text-center text-lg text-gray-300 mb-4">Valor do depósito: <span className="font-bold text-orange-400">R$ {depositAmount.toFixed(2).replace('.', ',')}</span></p>
                    {!isMpReady && !error && <div className="flex justify-center items-center flex-col gap-4"><Loader2 className="animate-spin" /><span>A carregar formulário...</span></div>}
                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                    <div id="cardDepositBrick_container"></div>
                    {isLoading && <div className="flex justify-center mt-4"><Loader2 className="animate-spin" /><span>A processar...</span></div>}
                </div>
            </main>
        </div>
    );
};

const PaymentPage = ({ paymentData, setPage, paymentMethod, user, cart, onPaymentSuccess, setPaymentData }) => {
    switch (paymentMethod) {
        case 'pix':
            return <PixPaymentPage paymentData={paymentData} setPage={setPage} onPaymentSuccess={(unlockToken) => { onPaymentSuccess(); setPaymentData({ unlockToken }); }} />;
        case 'card':
            return <CardPaymentPage user={user} cart={cart} setPage={setPage} onPaymentSuccess={onPaymentSuccess} setPaymentData={setPaymentData} />;
        default:
            setPage('cart');
            return null;
    }
};

const AwaitingUnlockPage = ({ setPage, paymentData }) => {
    React.useEffect(() => {
        const simTimeout = setTimeout(() => {
            setPage('enjoy');
        }, 5000);

        return () => {
            clearTimeout(simTimeout);
        };
    }, [setPage]);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4 text-center">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl">
                <div className="relative w-32 h-32 mx-auto mb-6">
                    <Refrigerator size={80} className="text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute inset-0 border-4 border-orange-400 rounded-full animate-ping"></div>
                </div>
                <h1 className="text-3xl font-bold mb-2">Pagamento Aprovado!</h1>
                <p className="text-gray-300 mb-6">A sua SmartFridge será destravada em instantes. Aproxime-se para abrir a porta.</p>
                <Loader2 size={48} className="text-orange-400 mx-auto animate-spin" />
            </div>
        </div>
    );
};

const EnjoyPage = ({ setPage }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setPage('home');
        }, 8000);
        return () => clearTimeout(timer);
    }, [setPage]);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4 text-center">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl">
                <Check size={80} className="text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">Porta Destravada!</h1>
                <p className="text-gray-300 mb-6">Retire os seus produtos e feche a porta. Bom apetite!</p>
            </div>
        </div>
    );
};

const MyAccountPage = ({ user, setPage, onAccountUpdate }) => {
    const [formData, setFormData] = React.useState({ name: user?.name || '', email: user?.email || '', password: '', newPassword: '', confirmNewPassword: '' });
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); setError(''); setSuccess('');
        if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
            setError('As novas senhas não coincidem.'); setIsLoading(false); return;
        }
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao atualizar os dados.');
            setSuccess('Dados atualizados com sucesso!');
            onAccountUpdate(data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    const ReadOnlyField = ({ label, value, icon }) => (
        <div>
            <label className="block text-gray-400 mb-1 text-sm">{label}</label>
            <div className="w-full bg-gray-700/50 p-3 rounded-md flex items-center gap-3">{icon}<span>{value || 'Não informado'}</span></div>
        </div>
    );
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('home')} className="text-orange-400 hover:text-orange-300"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold">Minha Conta</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg">
                    <form onSubmit={handleSubmit}>
                        <h3 className="text-xl font-bold mb-6 text-orange-400">Dados Pessoais</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div><label className="block text-gray-400 mb-1">Nome Completo</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 p-3 rounded-md" required /></div>
                            <div><label className="block text-gray-400 mb-1">E-mail</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-700 p-3 rounded-md" required /></div>
                            <ReadOnlyField label="CPF" value={user?.cpf} icon={<User size={20} />} />
                            <ReadOnlyField label="Telefone" value={user?.phone_number} icon={<Phone size={20} />} />
                            <ReadOnlyField label="Apartamento" value={user?.apartment} icon={<Home size={20} />} />
                        </div>
                        <h3 className="text-xl font-bold mb-6 mt-10 pt-6 border-t border-gray-700 text-orange-400">Alterar Senha</h3>
                        <div className="mb-4"><label className="block text-gray-400 mb-2">Senha Atual</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md" placeholder="Deixe em branco para não alterar" /></div>
                        <div className="mb-4"><label className="block text-gray-400 mb-2">Nova Senha</label><input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md" /></div>
                        <div className="mb-6"><label className="block text-gray-400 mb-2">Confirmar Nova Senha</label><input type="password" name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md" /></div>
                        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                        {success && <p className="text-green-400 text-center mb-4">{success}</p>}
                        <button type="submit" className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : 'Salvar Alterações'}</button>
                    </form>
                </div>
            </main>
        </div>
    );
};

const ChangeCondoPage = ({ user, setPage, onCondoChanged }) => {
    const [condos, setCondos] = React.useState([]);
    const [selectedCondoId, setSelectedCondoId] = React.useState(user?.condoId);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    React.useEffect(() => {
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
        setIsLoading(true); setError('');
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/auth/update-condo`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ condoId: selectedCondoId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao atualizar condomínio.');
            onCondoChanged(data.user);
            localStorage.removeItem('savedFridgeId');
            setPage('fridgeSelection');
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
                    <button onClick={() => setPage('home')} className="text-orange-400 hover:text-orange-300"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold">Mudar de Condomínio</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Selecione o seu novo condomínio</h2>
                    <div className="flex flex-col gap-3">
                        {condos.map(condo => (
                            <button key={condo.id} onClick={() => setSelectedCondoId(condo.id)} className={`w-full text-left p-4 rounded-lg transition ${selectedCondoId === condo.id ? 'bg-orange-500 font-bold' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                {condo.name}
                            </button>
                        ))}
                    </div>
                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                    <button onClick={handleUpdateCondo} disabled={isLoading || selectedCondoId === user.condoId} className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar Mudança'}
                    </button>
                </div>
            </main>
        </div>
    );
};

const WalletPage = ({ user, setPage, setPaymentData, setDepositData, setPaymentMethod, updateUserBalance, showToast }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [depositAmount, setDepositAmount] = React.useState('');
    const [recipientEmail, setRecipientEmail] = React.useState('');
    const [transferAmount, setTransferAmount] = React.useState('');
    const [transferError, setTransferError] = React.useState('');
    const [isTransferring, setIsTransferring] = React.useState(false);
    const [recipientDetails, setRecipientDetails] = React.useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = React.useState(false);
    const [showReceiptModal, setShowReceiptModal] = React.useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = React.useState(null);
    const [activeAction, setActiveAction] = React.useState(null);
    const [isFakeTransferLoading, setIsFakeTransferLoading] = React.useState(false);

    React.useEffect(() => {
        updateUserBalance();
    }, [updateUserBalance]);

    const handleProceedToCardDeposit = () => {
        const amount = parseFloat(depositAmount);
        const MIN_DEPOSIT = 30.00;
        if (!amount || amount < MIN_DEPOSIT) { setError(`O valor mínimo para depósito com cartão é R$ ${MIN_DEPOSIT.toFixed(2).replace('.', ',')}.`); return; }
        setError('');
        setDepositData({ amount: amount });
        setPage('card-deposit');
    };

    const handleCreatePixDeposit = async () => {
        const amount = parseFloat(depositAmount);
        const MIN_DEPOSIT = 30.00;
        if (!amount || amount < MIN_DEPOSIT) { setError(`O valor mínimo para depósito PIX é R$ ${MIN_DEPOSIT.toFixed(2).replace('.', ',')}.`); return; }
        setIsLoading(true); setError('');
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/wallet/deposit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao criar ordem de depósito.');
            setPaymentData(data);
            setPaymentMethod('pix');
            setPage('payment');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyRecipient = async () => {
        if (!recipientEmail || !transferAmount || parseFloat(transferAmount) <= 0) { setTransferError('Preencha o e-mail e um valor válido.'); return; }
        setIsTransferring(true); setTransferError('');
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/wallet/verify-recipient`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ recipientEmail })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setRecipientDetails({ name: data.name, email: data.email });
            setShowConfirmationModal(true);
        } catch (err) {
            setTransferError(err.message);
        } finally {
            setIsTransferring(false);
        }
    };

    const handleConfirmTransfer = async () => {
        setIsTransferring(true);
        setTransferError('');
        setShowConfirmationModal(false);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/wallet/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ recipientEmail, amount: parseFloat(transferAmount) })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setIsFakeTransferLoading(true);

            setTimeout(async () => {
                setIsFakeTransferLoading(false);
                showToast("Transferência concluída com sucesso!");
                setRecipientEmail('');
                setTransferAmount('');
                setActiveAction(null);
                await updateUserBalance();
                setSelectedTransactionId(data.transactionId);
                setShowReceiptModal(true);
            }, 5000);

        } catch (err) {
            setTransferError(err.message);
            setIsTransferring(false);
        }
    };
    
    const toggleAction = (action) => {
        setActiveAction(prev => prev === action ? null : action);
        setError('');
        setTransferError('');
    }
    return (
        <>
            <TransferConfirmationModal isOpen={showConfirmationModal} onClose={() => setShowConfirmationModal(false)} onConfirm={handleConfirmTransfer} recipient={recipientDetails} amount={transferAmount} isTransferring={isTransferring} />
            <TransactionReceiptModal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} transactionId={selectedTransactionId} token={localStorage.getItem('token')} />
            <TransferLoadingModal isOpen={isFakeTransferLoading} />
            <div className="min-h-screen bg-gray-900 text-white">
                <header className="bg-gray-800 shadow-md">
                    <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                        <button onClick={() => setPage('home')} className="text-orange-400 hover:text-orange-300"><ArrowLeft size={24} /></button>
                        <h1 className="text-2xl font-bold">Minha Carteira</h1>
                    </div>
                </header>
                <main className="container mx-auto p-4 md:p-8 flex flex-col gap-8">
                    <div className="bg-gray-800 p-6 rounded-lg text-center">
                        <p className="text-gray-300 text-lg">Saldo disponível</p>
                        <p className="text-5xl font-bold text-green-400">R$ {user?.wallet_balance ? parseFloat(user.wallet_balance).toFixed(2).replace('.', ',') : '0,00'}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => toggleAction('deposit')} className={`bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 ${activeAction === 'deposit' ? 'ring-2 ring-orange-500' : ''}`}>
                            <ArrowDownToLine size={24} /><span>Depositar</span>
                        </button>
                        <button onClick={() => toggleAction('transfer')} className={`bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 ${activeAction === 'transfer' ? 'ring-2 ring-orange-500' : ''}`}>
                            <ArrowRightLeft size={24} /><span>Transferir</span>
                        </button>
                    </div>
                    {activeAction === 'deposit' && (
                        <div className="bg-gray-800 p-6 rounded-lg animate-fade-in-fast">
                            <h3 className="text-xl font-semibold mb-4 text-white">Adicionar Saldo</h3>
                            <div className="relative mb-4"><label className="block text-sm text-gray-200 mb-1">Valor do Depósito (R$)</label><input type="number" placeholder="Min: 30,00" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                            <div className="flex flex-col md:flex-row gap-4">
                                <button onClick={handleCreatePixDeposit} disabled={isLoading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-gray-500">{isLoading ? <Loader2 className="animate-spin" /> : 'Gerar PIX'}</button>
                                <button onClick={handleProceedToCardDeposit} disabled={isLoading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-gray-500">{isLoading ? <Loader2 className="animate-spin" /> : 'Pagar com Cartão'}</button>
                            </div>
                            {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
                        </div>
                    )}
                    {activeAction === 'transfer' && (
                        <div className="bg-gray-800 p-6 rounded-lg animate-fade-in-fast">
                            <h3 className="text-xl font-semibold mb-4 text-white">Transferir Saldo</h3>
                            <div className="relative mb-4"><label className="block text-sm text-white mb-1">E-mail do Destinatário</label><input type="email" placeholder="email@exemplo.com" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 mt-1 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                            <div className="relative mb-4"><label className="block text-sm text-white mb-1">Valor da Transferência (R$)</label><input type="number" placeholder="0,00" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 mt-1 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                            <button onClick={handleVerifyRecipient} disabled={isTransferring} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-gray-500">{isTransferring ? <Loader2 className="animate-spin" /> : 'Verificar e Transferir'}</button>
                            {transferError && <p className="text-red-400 text-sm text-center mt-4">{transferError}</p>}
                        </div>
                    )}
                     <div className="bg-gray-800 p-6 rounded-lg text-center">
                        <button onClick={() => setPage('history')} className="text-orange-400 hover:text-orange-300 font-semibold flex items-center justify-center gap-2 w-full">
                           Ver Histórico Completo de Transações <ArrowRight size={18} />
                        </button>
                    </div>
                </main>
            </div>
        </>
    );
};

const AdminStatCard = ({ icon, label, value, colorClass = 'text-orange-400' }) => (
    <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-gray-700 ${colorClass}`}>{icon}</div>
        <div><p className="text-gray-400 text-sm">{label}</p><p className="text-2xl font-bold">{value}</p></div>
    </div>
);

const DailyPromotionsWidget = ({ token }) => {
    const [promotions, setPromotions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await fetch(`${API_URL}/api/admin/promotions/daily`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setPromotions(data);
                }
            } catch (error) {
                console.error("Erro ao buscar promoções:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPromotions();
    }, [token]);

    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Flame className="text-orange-400" /> Promoções do Dia</h3>
            {isLoading ? <Loader2 className="animate-spin" /> : promotions.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {promotions.map(p => (
                        <div key={p.id} className="bg-gray-700 p-2 rounded-md text-center">
                            <img src={p.image_url || 'https://placehold.co/100x100/374151/ffffff?text=Sem+Foto'} alt={p.name} className="w-full h-20 object-cover rounded-md mb-2" />
                            <p className="text-sm font-semibold truncate">{p.name}</p>
                            <p className="text-xs text-gray-400 line-through">R$ {parseFloat(p.sale_price).toFixed(2)}</p>
                            <p className="font-bold text-orange-400">R$ {parseFloat(p.promotional_price).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            ) : <p className="text-gray-400">Nenhuma promoção ativa hoje.</p>}
        </div>
    );
};

const EntradasVendasPage = ({ condominiums, token }) => {
    const [logData, setLogData] = React.useState({ log: [], pagination: {} });
    const getTodayInBrasilia = () => {
        const date = new Date();
        const [day, month, year] = date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }).split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };
    const [filterInputs, setFilterInputs] = React.useState({ condoId: condominiums[0]?.id || '', startDate: '', endDate: '' });
    const [activeFilters, setActiveFilters] = React.useState({ condoId: condominiums[0]?.id || '', startDate: '', endDate: '' });
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const fetchLogData = React.useCallback(async (page = 1) => {
        if (!activeFilters.condoId) return;
        setIsLoading(true); setError(''); setCurrentPage(page);
        const params = new URLSearchParams({ condoId: activeFilters.condoId, page: page, limit: 10 });
        if (activeFilters.startDate) params.append('startDate', activeFilters.startDate);
        if (activeFilters.endDate) params.append('endDate', activeFilters.endDate);
        try {
            const response = await fetch(`${API_URL}/api/admin/sales?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar dados de vendas e entradas.');
            const data = await response.json();
            setLogData({ log: data.log || [], pagination: data.pagination || {} });
        } catch (err) {
            setError(err.message);
            setLogData({ log: [], pagination: {} });
        } finally {
            setIsLoading(false);
        }
    }, [activeFilters, token]);
    React.useEffect(() => { fetchLogData(currentPage); }, [activeFilters, currentPage, fetchLogData]);
    const handleInputChange = (e) => { setFilterInputs(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleApplyFilters = () => { setCurrentPage(1); setActiveFilters(filterInputs); };
    const handleFilterToday = () => {
        const today = getTodayInBrasilia();
        const newFilters = { ...filterInputs, startDate: today, endDate: today };
        setFilterInputs(newFilters);
        setActiveFilters(newFilters);
        setCurrentPage(1);
    };
    const totalSales = logData.log.filter(item => item.type === 'Venda').reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const totalDeposits = logData.log.filter(item => item.type === 'Depósito').reduce((sum, item) => sum + parseFloat(item.amount), 0);
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Extrato de Entradas e Vendas</h2>
            <div className="mb-8"><DailyPromotionsWidget token={token} /></div>
            <div className="bg-gray-800 p-4 rounded-lg mb-6 flex flex-wrap items-end gap-4">
                <div><label className="text-sm text-gray-400 mb-1 block">Condomínio</label><select name="condoId" onChange={handleInputChange} value={filterInputs.condoId} className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-3">{condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="text-sm text-gray-400 mb-1 block">De</label><input name="startDate" type="date" onChange={handleInputChange} value={filterInputs.startDate} className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-3" /></div>
                <div><label className="text-sm text-gray-400 mb-1 block">Até</label><input name="endDate" type="date" onChange={handleInputChange} value={filterInputs.endDate} className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-3" /></div>
                <button onClick={handleFilterToday} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Hoje</button>
                <button onClick={handleApplyFilters} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Filter size={16} /> Aplicar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <AdminStatCard icon={<ShoppingCart size={32} />} label="Total em Vendas (no período)" value={`R$ ${totalSales.toFixed(2).replace('.', ',')}`} colorClass="text-green-400" />
                <AdminStatCard icon={<ArrowDownToLine size={32} />} label="Total em Depósitos (no período)" value={`R$ ${totalDeposits.toFixed(2).replace('.', ',')}`} colorClass="text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Histórico de Transações</h3>
            {isLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div> : error ? <p className="text-red-400">{error}</p> : (
                <div className="bg-gray-800 rounded-lg overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700"><tr><th className="p-4">Tipo</th><th className="p-4">Cliente</th><th className="p-4">Valor</th><th className="p-4">Método</th><th className="p-4">Data</th></tr></thead>
                        <tbody>
                            {logData.log?.length > 0 ? logData.log.map(item => (
                                <tr key={`${item.type}-${item.id}`} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.type === 'Venda' ? 'bg-green-800 text-green-300' : 'bg-blue-800 text-blue-300'}`}>{item.type}</span></td>
                                    <td className="p-4">{item.user_name} <span className="text-gray-400 text-sm">({item.user_cpf})</span></td>
                                    <td className="p-4 font-bold text-orange-400">R$ {parseFloat(item.amount).toFixed(2).replace('.', ',')}</td>
                                    <td className="p-4 capitalize">{item.payment_method || 'N/A'}</td>
                                    <td className="p-4 text-sm">{new Date(item.created_at).toLocaleString('pt-BR')}</td>
                                </tr>
                            )) : (<tr><td colSpan="5" className="text-center p-8 text-gray-400">Nenhuma transação encontrada para os filtros selecionados.</td></tr>)}
                        </tbody>
                    </table>
                    <Pagination currentPage={currentPage} totalPages={Math.ceil((logData?.pagination?.total || 0) / (logData?.pagination?.limit || 10))} onPageChange={fetchLogData} />
                </div>
            )}
        </div>
    );
};

const CentralCashierPage = ({ token }) => {
    const [summary, setSummary] = React.useState({ net_profit: 0, cost_of_goods: 0 });
    const [history, setHistory] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [withdrawalData, setWithdrawalData] = React.useState({ amount: '', type: 'net_profit', reason: '' });

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const [summaryRes, historyRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/central-cashier`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/admin/central-cashier/history`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (!summaryRes.ok || !historyRes.ok) throw new Error('Falha ao buscar dados do caixa.');
            const summaryData = await summaryRes.json();
            const historyData = await historyRes.json();
            setSummary(summaryData);
            setHistory(historyData);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleWithdrawalChange = (e) => {
        setWithdrawalData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleWithdrawalSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/admin/central-cashier/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    ...withdrawalData,
                    amount: parseFloat(withdrawalData.amount)
                })
            });
            if (!response.ok) throw new Error('Falha ao registrar retirada.');
            setIsModalOpen(false);
            setWithdrawalData({ amount: '', type: 'net_profit', reason: '' });
            fetchData(); // Refresh data
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Caixa Central</h2>
            {isLoading ? <Loader2 className="animate-spin" /> : error ? <p className="text-red-400">{error}</p> : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <AdminStatCard icon={<DollarSign size={32} />} label="Lucro Líquido Acumulado" value={`R$ ${parseFloat(summary.net_profit).toFixed(2)}`} colorClass="text-green-400" />
                        <AdminStatCard icon={<ShoppingCart size={32} />} label="Custo de Mercadoria Acumulado" value={`R$ ${parseFloat(summary.cost_of_goods).toFixed(2)}`} colorClass="text-yellow-400" />
                    </div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold">Histórico de Retiradas</h3>
                        <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusCircle size={20} /> Nova Retirada</button>
                    </div>
                    <div className="bg-gray-800 rounded-lg overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-700"><tr><th className="p-4">Data</th><th className="p-4">Tipo</th><th className="p-4">Valor</th><th className="p-4">Motivo</th></tr></thead>
                            <tbody>
                                {history.length > 0 ? history.map(item => (
                                    <tr key={item.id} className="border-b border-gray-700">
                                        <td className="p-4">{new Date(item.created_at).toLocaleString('pt-BR')}</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.type === 'net_profit' ? 'bg-green-800 text-green-300' : 'bg-yellow-800 text-yellow-300'}`}>{item.type === 'net_profit' ? 'Lucro' : 'Custo'}</span></td>
                                        <td className="p-4 font-bold text-red-400">- R$ {parseFloat(item.amount).toFixed(2)}</td>
                                        <td className="p-4">{item.reason}</td>
                                    </tr>
                                )) : <tr><td colSpan="4" className="text-center p-8 text-gray-400">Nenhuma retirada registrada.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
                    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-6">Registrar Nova Retirada</h2>
                        <form onSubmit={handleWithdrawalSubmit}>
                            <div className="mb-4"><label className="block text-sm mb-1">Valor (R$)</label><input type="number" step="0.01" name="amount" value={withdrawalData.amount} onChange={handleWithdrawalChange} className="w-full bg-gray-700 p-2 rounded-md" required /></div>
                            <div className="mb-4"><label className="block text-sm mb-1">Tipo de Retirada</label><select name="type" value={withdrawalData.type} onChange={handleWithdrawalChange} className="w-full bg-gray-700 p-2 rounded-md"><option value="net_profit">Lucro Líquido</option><option value="cost_of_goods">Custo de Mercadoria</option></select></div>
                            <div className="mb-6"><label className="block text-sm mb-1">Motivo/Descrição</label><input name="reason" value={withdrawalData.reason} onChange={handleWithdrawalChange} className="w-full bg-gray-700 p-2 rounded-md" required /></div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded-md">Cancelar</button>
                                <button type="submit" className="bg-orange-500 hover:bg-orange-600 py-2 px-4 rounded-md">Registrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const CriticalStockPage = ({ token }) => {
    const [criticalItems, setCriticalItems] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    React.useEffect(() => {
        const fetchCriticalStock = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/admin/critical-stock`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Falha ao buscar o estoque crítico.');
                const data = await response.json();
                setCriticalItems(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCriticalStock();
    }, [token]);
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Estoque Crítico</h2>
            <p className="text-gray-400 mb-6">Produtos que atingiram ou estão abaixo do nível de estoque mínimo definido.</p>
            {isLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div> : error ? <p className="text-red-400">{error}</p> : (
                <div className="bg-gray-800 rounded-lg overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700"><tr><th className="p-4">Produto</th><th className="p-4">Condomínio</th><th className="p-4">Qtd. Restante</th><th className="p-4">Nível Crítico</th></tr></thead>
                        <tbody>
                            {criticalItems.length > 0 ? criticalItems.map((item, index) => (
                                <tr key={`${item.product_name}-${item.condo_name}-${index}`} className="border-b border-gray-700">
                                    <td className="p-4">{item.product_name}</td>
                                    <td className="p-4">{item.condo_name}</td>
                                    <td className="p-4 font-bold text-red-400">{item.quantity}</td>
                                    <td className="p-4">{item.critical_stock_level}</td>
                                </tr>
                            )) : (<tr><td colSpan="4" className="text-center p-8 text-gray-400">Nenhum produto em nível crítico.</td></tr>)}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const UserManagementPage = ({ condominiums, token }) => {
    const [usersData, setUsersData] = React.useState({ users: [], pagination: {} });
    const [selectedCondoId, setSelectedCondoId] = React.useState(condominiums[0]?.id || '');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const fetchUsers = React.useCallback(async (page = 1) => {
        if (!selectedCondoId) return;
        setIsLoading(true); setError(''); setCurrentPage(page);
        try {
            const response = await fetch(`${API_URL}/api/admin/users-paginated?condoId=${selectedCondoId}&page=${page}&limit=10`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar utilizadores.');
            const data = await response.json();
            setUsersData(data);
        } catch (err) {
            setError(err.message);
            setUsersData({ users: [], pagination: {} });
        } finally {
            setIsLoading(false);
        }
    }, [selectedCondoId, token]);
    React.useEffect(() => { if (selectedCondoId) { fetchUsers(1); } }, [selectedCondoId, fetchUsers]);
    const handleOpenModal = (user) => { setSelectedUser(user); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedUser(null); };
    const handleSaveUser = () => { fetchUsers(currentPage); };
    return (
        <div>
            <UserEditModal user={selectedUser} isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveUser} token={token} />
            <h2 className="text-3xl font-bold mb-6">Gestão de Utilizadores</h2>
            <div className="bg-gray-800 p-4 rounded-lg mb-6 flex items-center gap-4">
                <label className="text-sm text-gray-400">Filtrar por Condomínio:</label>
                <select onChange={(e) => setSelectedCondoId(e.target.value)} value={selectedCondoId} className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-3">{condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            </div>
            {isLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div> : error ? <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg">{error}</p> : (
                <div className="bg-gray-800 rounded-lg overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700"><tr><th className="p-4">Nome</th><th className="p-4">CPF</th><th className="p-4">Apartamento</th><th className="p-4">Telefone</th><th className="p-4">Saldo</th><th className="p-4">Ações</th></tr></thead>
                        <tbody>
                            {usersData.users?.length > 0 ? usersData.users.map(user => (
                                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4 flex items-center gap-2">
                                        {user.name}
                                        {!user.is_active && <Ban size={16} className="text-red-500" title="Conta Bloqueada" />}
                                    </td>
                                    <td className="p-4">{user.cpf}</td>
                                    <td className="p-4">{user.apartment}</td>
                                    <td className="p-4">{user.phone_number}</td>
                                    <td className="p-4 font-bold text-green-400">R$ {parseFloat(user.wallet_balance || 0).toFixed(2)}</td>
                                    <td className="p-4"><button onClick={() => handleOpenModal(user)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-md flex items-center gap-2 text-sm"><Edit size={14} /> Editar</button></td>
                                </tr>
                            )) : (<tr><td colSpan="6" className="text-center p-8 text-gray-400">Nenhum utilizador encontrado neste condomínio.</td></tr>)}
                        </tbody>
                    </table>
                    <Pagination currentPage={currentPage} totalPages={Math.ceil((usersData?.pagination?.total || 0) / (usersData?.pagination?.limit || 10))} onPageChange={fetchUsers} />
                </div>
            )}
        </div>
    );
};

const CondoManager = ({ condominiums, onEdit, onDelete, onAddNew }) => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Gestão de Condomínios</h2>
            {/* CORREÇÃO APLICADA AQUI: Usamos uma arrow function para não passar o evento */}
            <button onClick={() => onAddNew()} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                <PlusCircle size={20} /> Novo Condomínio
            </button>
        </div>
        <div className="bg-gray-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-700"><tr><th className="p-4">Nome</th><th className="p-4">ID da Geladeira</th><th className="p-4">Síndico</th><th className="p-4">Ações</th></tr></thead>
                <tbody>
                    {condominiums.map(condo => (
                        <tr key={condo.id} className="border-b border-gray-700">
                            <td className="p-4">{condo.name}</td>
                            <td className="p-4 font-mono">{condo.fridge_id}</td>
                            <td className="p-4">{condo.syndic_name}</td>
                            <td className="p-4 flex gap-2">
                                <button onClick={() => onEdit(condo)} className="text-blue-400 hover:text-blue-300 p-2"><Edit size={18} /></button>
                                <button onClick={() => onDelete(condo.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
    

const StockManagement = ({ condominiums, token }) => {
    const [selectedCondoId, setSelectedCondoId] = React.useState(condominiums[0]?.id || '');
    const [inventory, setInventory] = React.useState([]);
    const [inventoryQuantities, setInventoryQuantities] = React.useState({});
    const [isStockLoading, setIsStockLoading] = React.useState(false);
    React.useEffect(() => {
        if (selectedCondoId) {
            setIsStockLoading(true);
            const fetchInventory = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/admin/inventory?condoId=${selectedCondoId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                    if (!response.ok) throw new Error('Falha ao buscar o inventário.');
                    const data = await response.json();
                    setInventory(data);
                    const quantities = data.reduce((acc, item) => { acc[item.id] = item.quantity; return acc; }, {});
                    setInventoryQuantities(quantities);
                } catch (err) { alert(err.message); } finally { setIsStockLoading(false); }
            };
            fetchInventory();
        } else {
            setInventory([]);
            setInventoryQuantities({});
        }
    }, [selectedCondoId, token]);
    const handleInventoryChange = (productId, quantity) => {
        const newQuantity = Math.max(0, parseInt(quantity, 10) || 0);
        setInventoryQuantities(prev => ({ ...prev, [productId]: newQuantity }));
    };
    const handleSaveInventory = async (productId) => {
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
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Gestão de Estoque Geral</h2></div>
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
                                    <td className="p-4 flex items-center gap-4"><img src={product.image_url || 'https://placehold.co/100x100/374151/ffffff?text=Sem+Foto'} className="h-12 w-12 rounded-md object-cover" alt={product.name} /><span>{product.name}</span></td>
                                    <td className="p-4"><input type="number" value={inventoryQuantities[product.id] || 0} onChange={(e) => handleInventoryChange(product.id, e.target.value)} className="w-24 bg-gray-900 p-2 rounded-md text-center" /></td>
                                    <td className="p-4"><button onClick={() => handleSaveInventory(product.id)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-xs">Salvar</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const FinanceReport = ({ profits, condominiums }) => {
    const [filter, setFilter] = React.useState('all');

    const filteredProfits = profits.filter(p => filter === 'all' || p.id === parseInt(filter));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Relatório Financeiro</h2>
                <div>
                    <label htmlFor="condoFilter" className="mr-2 text-gray-400">Filtrar:</label>
                    <select id="condoFilter" value={filter} onChange={e => setFilter(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-4">
                        <option value="all">Todos os Condomínios</option>
                        {condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex flex-col gap-6">
                {filteredProfits.map(report => {
                    const monthlyCost = parseFloat(report.monthly_fixed_cost || 0);
                    const grossRevenue = parseFloat(report.gross_revenue || 0);
                    const progressPercentage = monthlyCost > 0 ? Math.min((grossRevenue / monthlyCost) * 100, 100) : 0;

                    return (
                        <div key={report.id} className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-orange-400 border-b border-gray-700 pb-3 mb-4">{report.name}</h3>
                            {monthlyCost > 0 && (
                                <div className="mb-6 bg-gray-700 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2 text-sm">
                                        <span className="text-gray-300">Cobertura do Custo Fixo Mensal (R$ {monthlyCost.toFixed(2).replace('.', ',')})</span>
                                        <span className="font-bold text-white">{progressPercentage.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-900 rounded-full h-4">
                                        <div
                                            className="bg-gradient-to-r from-teal-500 to-green-500 h-4 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
                                        <span>R$ 0,00</span>
                                        <span>Faturado: R$ {grossRevenue.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <div className="bg-gray-700 p-4 rounded-lg"><p className="text-sm text-gray-400">Investimento Inicial</p><p className="text-2xl font-bold">R$ {parseFloat(report.initial_investment || 0).toFixed(2).replace('.', ',')}</p></div>
                                <div className="bg-gray-700 p-4 rounded-lg"><p className="text-sm text-gray-400">Faturamento Bruto</p><p className="text-2xl font-bold text-green-400">R$ {grossRevenue.toFixed(2).replace('.', ',')}</p></div>
                                <div className="bg-gray-700 p-4 rounded-lg"><p className="text-sm text-gray-400">Custo dos Produtos</p><p className="text-2xl font-bold text-red-400">R$ {parseFloat(report.cost_of_goods_sold || 0).toFixed(2).replace('.', ',')}</p></div>
                                <div className="bg-gray-700 p-4 rounded-lg"><p className="text-sm text-gray-400">Lucro Líquido</p><p className="text-2xl font-bold text-teal-400">R$ {parseFloat(report.net_revenue || 0).toFixed(2).replace('.', ',')}</p></div>
                                <div className="bg-gray-700 p-4 rounded-lg"><p className="text-sm text-gray-400">Comissão Síndico ({report.syndic_profit_percentage}%)</p><p className="text-2xl font-bold text-yellow-400">R$ {parseFloat(report.syndic_commission || 0).toFixed(2).replace('.', ',')}</p></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const CondoModal = ({ isOpen, onClose, onSave, condo }) => {
    const [formData, setFormData] = React.useState({});

    React.useEffect(() => {
        setFormData(condo || {
            name: '',
            address: '',
            syndic_name: '',
            syndic_contact: '',
            syndic_profit_percentage: 0,
            initial_investment: 0,
            monthly_fixed_cost: 0,
            fridge_id: ''
        });
    }, [condo]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-xl font-bold mb-6">{condo ? 'Editar' : 'Novo'} Condomínio</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Nome do Condomínio" className="bg-gray-700 p-2 rounded-md md:col-span-2" required />
                    <input name="fridge_id" value={formData.fridge_id || ''} onChange={handleChange} placeholder="ID da Geladeira (Ex: SF001)" className="bg-gray-700 p-2 rounded-md" required />
                    <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Endereço" className="bg-gray-700 p-2 rounded-md" />
                    <input name="syndic_name" value={formData.syndic_name || ''} onChange={handleChange} placeholder="Nome do Síndico" className="bg-gray-700 p-2 rounded-md" />
                    <input name="syndic_contact" value={formData.syndic_contact || ''} onChange={handleChange} placeholder="Contacto do Síndico" className="bg-gray-700 p-2 rounded-md" />
                    <input name="syndic_profit_percentage" type="number" step="0.01" value={formData.syndic_profit_percentage || ''} onChange={handleChange} placeholder="% Lucro Síndico" className="bg-gray-700 p-2 rounded-md" />
                    <input name="initial_investment" type="number" step="0.01" value={formData.initial_investment || ''} onChange={handleChange} placeholder="Investimento Inicial" className="bg-gray-700 p-2 rounded-md" />
                    <input name="monthly_fixed_cost" type="number" step="0.01" value={formData.monthly_fixed_cost || ''} onChange={handleChange} placeholder="Custo Fixo Mensal" className="bg-gray-700 p-2 rounded-md md:col-span-2" />
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
    const [formData, setFormData] = React.useState({});

    React.useEffect(() => {
        const initialData = {
            name: '',
            description: '',
            image_url: '',
            purchase_price: '',
            sale_price: '',
            critical_stock_level: 5,
            promotional_price: '',
            promotion_start_date: '',
            promotion_end_date: ''
        };
        const productData = product ? {
            ...product,
            promotion_start_date: product.promotion_start_date ? product.promotion_start_date.split('T')[0] : '',
            promotion_end_date: product.promotion_end_date ? product.promotion_end_date.split('T')[0] : ''
        } : initialData;

        setFormData(productData);
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            promotional_price: formData.promotional_price || null,
            promotion_start_date: formData.promotion_start_date || null,
            promotion_end_date: formData.promotion_end_date || null
        };
        onSave(dataToSave);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-6">{product ? 'Editar' : 'Novo'} Produto</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="md:col-span-2"><label className="text-sm text-gray-400">Nome do Produto</label><input name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md mt-1" required /></div>
                        <div className="md:col-span-2"><label className="text-sm text-gray-400">Descrição</label><textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md mt-1" rows="3"></textarea></div>
                        <div className="md:col-span-2"><label className="text-sm text-gray-400">URL da Imagem</label><input name="image_url" value={formData.image_url || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>
                        
                        <div className="md:col-span-2 border-t border-gray-700 mt-4 pt-4 font-bold text-orange-400">Precificação</div>
                        
                        <div><label className="text-sm text-gray-400">Preço de Compra (Custo)</label><input name="purchase_price" type="number" step="0.01" value={formData.purchase_price || ''} onChange={handleChange} placeholder="Ex: 5.50" className="w-full bg-gray-700 p-2 rounded-md mt-1" required /></div>
                        <div><label className="text-sm text-gray-400">Preço de Venda Padrão</label><input name="sale_price" type="number" step="0.01" value={formData.sale_price || ''} onChange={handleChange} placeholder="Ex: 9.99" className="w-full bg-gray-700 p-2 rounded-md mt-1" required /></div>
                        
                        <div className="md:col-span-2 border-t border-gray-700 mt-4 pt-4 font-bold text-orange-400">Promoção (Opcional)</div>

<div className="md:col-span-2 text-sm text-gray-400 bg-gray-700/50 p-3 rounded-md">
    <Info size={16} className="inline-block mr-2" />
    O preço promocional será calculado automaticamente (Custo + 30%) quando as datas de início e fim forem definidas.
</div>
                        <div><label className="text-sm text-gray-400">Início da Promoção</label><input name="promotion_start_date" type="date" value={formData.promotion_start_date || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>
                        <div><label className="text-sm text-gray-400">Fim da Promoção</label><input name="promotion_end_date" type="date" value={formData.promotion_end_date || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>

                        <div className="md:col-span-2 border-t border-gray-700 mt-4 pt-4 font-bold text-orange-400">Estoque</div>
                        <div><label className="text-sm text-gray-400">Nível Crítico de Estoque</label><input name="critical_stock_level" type="number" value={formData.critical_stock_level || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md mt-1" required /></div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded-md">Cancelar</button>
                        <button type="submit" className="bg-green-600 hover:bg-green-700 py-2 px-4 rounded-md">Salvar Produto</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const FridgeSelectionPage = ({ setFridgeId, setPage, user, onLogout, onCondoSelected }) => {
    const [condos, setCondos] = React.useState([]);
    const [selectedCondoId, setSelectedCondoId] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true); // Inicia como true para carregar os condomínios
    const [error, setError] = React.useState('');

        React.useEffect(() => {
        const fetchCondos = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/public/condominiums`);
                if (!response.ok) throw new Error('Não foi possível carregar a lista de condomínios.');
                const data = await response.json();
                setCondos(data);
                // Pré-seleciona o condomínio do utilizador, se existir na lista
                if (user?.condoId) {
                    setSelectedCondoId(user.condoId);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCondos();
    }, [user?.condoId]);


   const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!selectedCondoId) {
            setError('Por favor, selecione um condomínio.');
            setIsLoading(false);
            return;
        }

         const selectedCondo = condos.find(c => c.id === parseInt(selectedCondoId));
        if (!selectedCondo || !selectedCondo.fridge_id) {
             setError('Este condomínio não tem uma geladeira associada ou é inválido.');
             setIsLoading(false);
             return;
        }

                try {
            const token = localStorage.getItem('token');
            // Valida usando o ID do condomínio e o ID da geladeira selecionados
            const response = await fetch(`${API_URL}/api/public/validate-fridge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ condoId: selectedCondo.id, fridgeId: selectedCondo.fridge_id })
            });

            const data = await response.json();
            if (response.ok && data.valid) {
                // Chama a nova função para definir o condomínio e a geladeira para a sessão atual
                onCondoSelected(selectedCondo);
            } else {
                setError(data.message || 'Seleção inválida.');
            }
        } catch (err) {
            setError('Não foi possível validar a seleção. Verifique sua conexão.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8"><span className="text-4xl font-bold text-orange-500">Smart</span><span className="text-4xl font-light text-white">Fridge</span></div>
                <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
                    <h2 className="text-2xl font-bold text-center mb-2">Selecione sua Geladeira</h2>
                    <p className="text-gray-400 text-center mb-6">Escolha o condomínio para aceder à loja.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4 relative">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            {/* ALTERAÇÃO: Input substituído por Select */}
                            <select
                                value={selectedCondoId}
                                onChange={(e) => setSelectedCondoId(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                                required
                                disabled={isLoading || condos.length === 0}
                            >
                                <option value="">{isLoading ? 'A carregar...' : 'Selecione um condomínio'}</option>
                                {condos.map(condo => (
                                    <option key={condo.id} value={condo.id}>{condo.name}</option>
                                ))}
                            </select>
                        </div>
                        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 flex justify-center items-center" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Entrar na Loja'}
                        </button>
                    </form>
                    <div className="text-center mt-6 border-t border-gray-700 pt-4">
                        <button onClick={onLogout} className="text-sm text-gray-400 hover:text-red-400 transition flex items-center justify-center gap-2 w-full">
                            <LogOut size={16} /> Sair
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = React.useState('sales');
    const [condominiums, setCondominiums] = React.useState([]);
    const [products, setProducts] = React.useState([]);
    const [profits, setProfits] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [isCondoModalOpen, setIsCondoModalOpen] = React.useState(false);
    const [currentCondo, setCurrentCondo] = React.useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = React.useState(false);
    const [currentProduct, setCurrentProduct] = React.useState(null);
    const token = localStorage.getItem('adminToken');
    const fetchData = React.useCallback(async (dataType, setData, params = '') => {
        setIsLoading(true); setError('');
        try {
            const response = await fetch(`${API_URL}/api/admin/${dataType}${params}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error(`Falha ao buscar ${dataType}.`);
            const data = await response.json();
            setData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);
    React.useEffect(() => {
        if (condominiums.length === 0) { fetchData('condominiums', setCondominiums); }
        switch (activeTab) {
            case 'condominiums': fetchData('condominiums', setCondominiums); break;
            case 'products': fetchData('products', setProducts); break;
            case 'finance': fetchData('profits', setProfits); break;
            default: break;
        }
    }, [activeTab, condominiums.length, fetchData]);
    const handleOpenCondoModal = (condo = null) => { setCurrentCondo(condo); setIsCondoModalOpen(true); };
    const handleCloseCondoModal = () => { setIsCondoModalOpen(false); setCurrentCondo(null); };
    const handleSaveCondo = async (condoData) => {
        const method = condoData.id ? 'PUT' : 'POST';
        const url = condoData.id ? `${API_URL}/api/admin/condominiums/${condoData.id}` : `${API_URL}/api/admin/condominiums`;
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(condoData) });
            if (!response.ok) throw new Error('Falha ao salvar condomínio.');
            fetchData('condominiums', setCondominiums);
            handleCloseCondoModal();
        } catch (err) { alert(err.message); }
    };
    const handleDeleteCondo = async (id) => {
        if (window.confirm('Tem a certeza que quer apagar este condomínio?')) {
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
        const method = productData.id ? 'PUT' : 'POST';
        const url = productData.id ? `${API_URL}/api/admin/products/${productData.id}` : `${API_URL}/api/admin/products`;
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(productData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao salvar produto.');
            }
            fetchData('products', setProducts);
            handleCloseProductModal();
        } catch (err) {
            alert(err.message);
        }
    };
    const handleDeleteProduct = async (id) => {
        if (window.confirm('Tem a certeza que quer apagar este produto do catálogo?')) {
            try {
                const response = await fetch(`${API_URL}/api/admin/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Falha ao apagar produto.');
                fetchData('products', setProducts);
            } catch (err) { alert(err.message); }
        }
    };

    const ProductManager = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestão de Produtos</h2>
                <button onClick={() => handleOpenProductModal()} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <PlusCircle size={20} /> Novo Produto
                </button>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-700"><tr><th className="p-4">Produto</th><th className="p-4">Preço Venda</th><th className="p-4">Preço Compra</th><th className="p-4">Promoção</th><th className="p-4">Ações</th></tr></thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="border-b border-gray-700">
                                <td className="p-4 flex items-center gap-4"><img src={product.image_url || 'https://placehold.co/100x100/374151/ffffff?text=Sem+Foto'} className="h-12 w-12 rounded-md object-cover" alt={product.name}/><span>{product.name}</span></td>
                                <td className="p-4">R$ {parseFloat(product.sale_price).toFixed(2)}</td>
                                <td className="p-4">R$ {parseFloat(product.purchase_price).toFixed(2)}</td>
                                <td className="p-4">
                                    {product.promotional_price ? (
                                        <span className="text-green-400 font-bold">R$ {parseFloat(product.promotional_price).toFixed(2)}</span>
                                    ) : (
                                        <span className="text-gray-500">Não</span>
                                    )}
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => handleOpenProductModal(product)} className="text-blue-400 hover:text-blue-300 p-2"><Edit size={18}/></button>
                                    <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderContent = () => {
        if (isLoading && activeTab !== 'sales' && activeTab !== 'users' && activeTab !== 'central-cashier') return <div className="flex justify-center items-center h-full"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /></div>;
        if (error) return <div className="text-red-400">Erro: {error}</div>;
        switch (activeTab) {
            case 'sales': return <EntradasVendasPage condominiums={condominiums} token={token} />;
            case 'central-cashier': return <CentralCashierPage token={token} condominiums={condominiums} />;
            case 'critical-stock': return <CriticalStockPage token={token} />;
            case 'users': return <UserManagementPage condominiums={condominiums} token={token} />;
            case 'stock': return <StockManagement condominiums={condominiums} token={token} />;
            case 'condominiums': return <CondoManager condominiums={condominiums} onAddNew={handleOpenCondoModal} onEdit={handleOpenCondoModal} onDelete={handleDeleteCondo} />;
            case 'products': return <ProductManager />;
            case 'finance': return <FinanceReport profits={profits} condominiums={condominiums} />;
            default: return <div>Selecione uma opção</div>;
        }
    };
    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            <CondoModal isOpen={isCondoModalOpen} onClose={handleCloseCondoModal} onSave={handleSaveCondo} condo={currentCondo} />
            <ProductModal isOpen={isProductModalOpen} onClose={handleCloseProductModal} onSave={handleSaveProduct} product={currentProduct} />
            <aside className="w-64 bg-gray-800 p-4 flex flex-col shrink-0">
                <div className="text-center mb-10">
                    <span className="text-2xl font-bold text-orange-500">Smart</span><span className="text-2xl font-light text-white">Fridge</span><p className="text-sm text-gray-400">Painel Admin</p>
                </div>
                <nav className="flex flex-col gap-2 flex-grow">
                    <button onClick={() => setActiveTab('sales')} className={`flex items-center gap-3 p-3 rounded-md transition ${activeTab === 'sales' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'}`}><DollarSign /> Entradas e Vendas</button>
                    <button onClick={() => setActiveTab('central-cashier')} className={`flex items-center gap-3 p-3 rounded-md transition ${activeTab === 'central-cashier' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'}`}><PiggyBank /> Caixa Central</button>
                    <button onClick={() => setActiveTab('critical-stock')} className={`flex items-center gap-3 p-3 rounded-md transition ${activeTab === 'critical-stock' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'}`}><AlertTriangle /> Estoque Crítico</button>
                    <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 p-3 rounded-md transition ${activeTab === 'users' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'}`}><UsersIcon /> Gestão de Utilizadores</button>
                    <button onClick={() => setActiveTab('stock')} className={`flex items-center gap-3 p-3 rounded-md transition ${activeTab === 'stock' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'}`}><ShoppingCart /> Estoque Geral</button>
                    <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 p-3 rounded-md transition ${activeTab === 'products' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'}`}><Package /> Produtos</button>
                    <button onClick={() => setActiveTab('condominiums')} className={`flex items-center gap-3 p-3 rounded-md transition ${activeTab === 'condominiums' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'}`}><Building2 /> Condomínios</button>
                    <button onClick={() => setActiveTab('finance')} className={`flex items-center gap-3 p-3 rounded-md transition ${activeTab === 'finance' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'}`}><BarChart /> Financeiro</button>
                </nav>
                <div className="mt-auto"><button onClick={onLogout} className="flex items-center w-full gap-3 p-3 rounded-md text-red-400 hover:bg-red-500/20 transition"><LogOut /> Sair do Painel</button></div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">{renderContent()}</main>
        </div>
    )
};

const MyTicketsPage = ({ setPage }) => {
    const [tickets, setTickets] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const token = localStorage.getItem('token');
    const fetchTickets = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/user/tickets`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar tiquetes.');
            const data = await response.json();
            setTickets(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);
    React.useEffect(() => { fetchTickets(); }, [fetchTickets]);
    const handleMarkAsRead = async (ticketId) => {
        try {
            const response = await fetch(`${API_URL}/api/user/tickets/${ticketId}/read`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao marcar como lido.');
            setTickets(prevTickets => prevTickets.map(t => t.id === ticketId ? { ...t, is_read: true } : t));
        } catch (err) {
            alert(err.message);
        }
    };
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('home')} className="text-orange-400 hover:text-orange-300"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold">Meus Tiquetes</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto flex flex-col gap-4">
                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> :
                        error ? <p className="text-red-400 text-center">{error}</p> :
                            tickets.length > 0 ? tickets.map(ticket => (
                                <div key={ticket.id} className={`p-4 rounded-lg bg-gray-800 border-l-4 transition-all ${ticket.is_read ? 'border-gray-600 opacity-70' : 'border-orange-500'}`}>
                                    <p className="text-gray-300">{ticket.message}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-gray-500">{new Date(ticket.created_at).toLocaleString('pt-BR')}</p>
                                        {!ticket.is_read && (<button onClick={() => handleMarkAsRead(ticket.id)} className="text-xs bg-gray-700 hover:bg-gray-600 text-orange-400 font-semibold py-1 px-3 rounded-full">Marcar como lida</button>)}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center p-8 bg-gray-800 text-gray-400 rounded-lg">
                                    <Ticket size={48} className="mx-auto mb-4" />
                                    <h2 className="text-2xl font-semibold mb-2">Nenhum tiquete por aqui</h2>
                                    <p>Você não recebeu nenhuma mensagem ou notificação do administrador.</p>
                                </div>
                            )}
                </div>
            </main>
        </div>
    );
};

const UserEditModal = ({ user, isOpen, onClose, onSave, token }) => {
    const [formData, setFormData] = React.useState({});
    const [balanceToAdd, setBalanceToAdd] = React.useState('');
    const [balanceReason, setBalanceReason] = React.useState('');
    const [ticketMessage, setTicketMessage] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);
    const [modalError, setModalError] = React.useState('');
    const [modalSuccess, setModalSuccess] = React.useState('');
    const [creditLimit, setCreditLimit] = React.useState('');
    const [creditDueDay, setCreditDueDay] = React.useState('');
    const [userInvoices, setUserInvoices] = React.useState([]);

    const fetchUserData = React.useCallback(async () => {
        if (!user) return;
        const mockInvoices = [
            { id: 1, amount: '150.75', due_date: '2025-07-10', status: 'paid', paid_at: '2025-07-09' },
            { id: 2, amount: '88.20', due_date: '2025-08-10', status: 'late', paid_at: null },
            { id: 3, amount: '210.50', due_date: '2025-06-10', status: 'paid', paid_at: '2025-06-10' }
        ];
        setUserInvoices(mockInvoices);
        
        setFormData({ 
            name: user.name || '', 
            email: user.email || '', 
            apartment: user.apartment || '', 
            phone_number: user.phone_number || '', 
            cpf: user.cpf || '', 
            newPassword: '' 
        });
        setCreditLimit(user.credit_limit || '');
        setCreditDueDay(user.credit_due_day || '');
        setModalError(''); setModalSuccess(''); setTicketMessage(''); setBalanceToAdd(''); setBalanceReason('');
    }, [user]);

    React.useEffect(() => {
        fetchUserData();
    }, [user, fetchUserData]);

    if (!isOpen || !user) return null;

    const handleAction = async (action, body, successMessage) => {
        setIsSaving(true); setModalError(''); setModalSuccess('');
        try {
            const response = await action(body);
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Falha na operação: ${successMessage}`);
            }
            setModalSuccess(successMessage);
            onSave();
            fetchUserData();
        } catch (err) {
            setModalError(err.message);
        } finally {
            setIsSaving(false);
            setTimeout(() => { setModalSuccess(''); setModalError(''); }, 4000);
        }
    };

    const handleSaveInfo = () => {
        const body = { ...formData, credit_limit: creditLimit, credit_due_day: creditDueDay };
        handleAction(
            () => fetch(`${API_URL}/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            }),
            body,
            'Informações do usuário salvas com sucesso!'
        );
    };

    const handleAddBalance = () => {
        const body = { amount: parseFloat(balanceToAdd), reason: balanceReason };
        handleAction(
            () => fetch(`${API_URL}/api/admin/users/${user.id}/add-balance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            }),
            body,
            `Saldo de R$ ${parseFloat(balanceToAdd).toFixed(2)} adicionado com sucesso!`
        );
    };

    const handleSendTicket = () => {
        const body = { message: ticketMessage };
        handleAction(
            () => fetch(`${API_URL}/api/admin/users/${user.id}/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            }),
            body,
            'Tíquete enviado com sucesso!'
        );
    };
    
    const handleToggleUserStatus = () => {
        const action = user.is_active ? 'bloquear' : 'desbloquear';
        if (!window.confirm(`Tem certeza que deseja ${action} esta conta?`)) return;

        handleAction(
            () => fetch(`${API_URL}/api/admin/users/${user.id}/toggle-status`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            {},
            `Usuário ${action === 'bloquear' ? 'bloqueado' : 'desbloqueado'} com sucesso!`
        );
    };


    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in-fast">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Editar Utilizador: <span className="text-orange-400">{user.name}</span></h2>
                        {!user.is_active && <p className="text-red-500 font-bold text-sm flex items-center gap-2"><Ban size={16}/> CONTA BLOQUEADA</p>}
                    </div>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
                </div>

                {isSaving && <div className="absolute top-4 right-8"><Loader2 className="animate-spin text-orange-400" /></div>}
                {modalSuccess && <p className="text-green-400 text-center mb-4">{modalSuccess}</p>}
                {modalError && <p className="text-red-400 text-center mb-4">{modalError}</p>}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Coluna da Esquerda: Informações e Ações */}
                    <div>
                        <div className="mb-6 pb-6 border-b border-gray-700">
                            <h3 className="text-lg font-semibold mb-4">Informações do Utilizador</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="text-sm text-gray-400">Nome</label><input value={formData.name || ''} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>
                                <div><label className="text-sm text-gray-400">E-mail</label><input type="email" value={formData.email || ''} onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>
                                <div><label className="text-sm text-gray-400">CPF</label><input value={formData.cpf || ''} disabled className="w-full bg-gray-900 p-2 rounded-md mt-1 cursor-not-allowed" /></div>
                                <div><label className="text-sm text-gray-400">Telefone</label><input value={formData.phone_number || ''} onChange={(e) => setFormData(p => ({...p, phone_number: e.target.value}))} className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>
                                <div className="md:col-span-2"><label className="text-sm text-gray-400">Apartamento</label><input value={formData.apartment || ''} onChange={(e) => setFormData(p => ({...p, apartment: e.target.value}))} className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>
                            </div>
                        </div>

                        <div className="mb-6 pb-6 border-b border-gray-700">
                            <h3 className="text-lg font-semibold mb-4 text-purple-400">Crédito SmartFridge</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="text-sm text-gray-400">Limite de Crédito (R$)</label><input type="number" step="0.01" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} placeholder="Ex: 200.00" className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>
                                <div><label className="text-sm text-gray-400">Dia do Vencimento da Fatura</label><input type="number" min="1" max="31" value={creditDueDay} onChange={(e) => setCreditDueDay(e.target.value)} placeholder="Ex: 10" className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 items-center mb-6 pb-6 border-b border-gray-700">
                             <button onClick={handleSaveInfo} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition disabled:bg-gray-500"> <Save size={18} /> Salvar Informações </button>
                             <button onClick={handleToggleUserStatus} disabled={isSaving} className={`font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition disabled:bg-gray-500 ${user.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                 {user.is_active ? <><Ban size={18} /> Bloquear Conta</> : <><CheckCircle2 size={18} /> Desbloquear Conta</>}
                             </button>
                        </div>
                        
                        <div className="mb-6 pb-6 border-b border-gray-700">
                             <h3 className="text-lg font-semibold mb-4">Adicionar Saldo</h3>
                             <div className="flex gap-4 mb-2">
                                 <input type="number" step="0.01" value={balanceToAdd} onChange={e => setBalanceToAdd(e.target.value)} placeholder="Valor (R$)" className="w-1/2 bg-gray-700 p-2 rounded-md" />
                                 <input value={balanceReason} onChange={e => setBalanceReason(e.target.value)} placeholder="Motivo (Ex: Bônus)" className="w-1/2 bg-gray-700 p-2 rounded-md" />
                             </div>
                             <button onClick={handleAddBalance} disabled={isSaving || !balanceToAdd} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-gray-500"><PlusCircle size={18} /> Adicionar Saldo</button>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Enviar Tíquete / Notificação</h3>
                            <textarea value={ticketMessage} onChange={e => setTicketMessage(e.target.value)} placeholder="Digite sua mensagem para o usuário aqui..." className="w-full bg-gray-700 p-2 rounded-md mb-2" rows="3"></textarea>
                            <button onClick={handleSendTicket} disabled={isSaving || !ticketMessage} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-gray-500"><Ticket size={18} /> Enviar Tíquete</button>
                        </div>

                    </div>
                    {/* Coluna da Direita: Faturas e Histórico */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText /> Histórico de Faturas</h3>
                        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2">
                             {userInvoices.length > 0 ? userInvoices.map(invoice => (
                                 <div key={invoice.id} className="bg-gray-700/50 p-3 rounded-md">
                                     <div className="flex justify-between items-center">
                                         <p className="font-bold">Fatura de {new Date(invoice.due_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                                         <span className={`px-2 py-1 text-xs rounded-full font-semibold ${invoice.status === 'paid' ? 'bg-green-800 text-green-300' : 'bg-red-800 text-red-300'}`}>{invoice.status === 'late' ? 'Atrasada' : 'Paga'}</span>
                                     </div>
                                 </div>
                             )) : <p className="text-sm text-gray-500 text-center p-4">Nenhuma fatura encontrada.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CreditPage = ({ user, setPage, setPaymentData, setPaymentMethod }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const creditLimit = parseFloat(user?.credit_limit || 0);
    const creditUsed = parseFloat(user?.credit_used || 0);
    const availableCredit = creditLimit - creditUsed;
    const usagePercentage = creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0;

    const calculateInvoiceTotal = () => {
        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(user.credit_due_day || 31);

        let total = creditUsed;
        const fees = total * 0.10;
        let interest = 0;

        if (today > dueDate) {
            const diffTime = Math.abs(today - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            interest = total * 0.025 * diffDays;
        }

        return {
            base: creditUsed,
            fees,
            interest,
            total: total + fees + interest
        };
    };

    const invoice = calculateInvoiceTotal();

    const handlePayInvoice = async () => {
    setIsLoading(true);
    setError('');
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/credit/pay-invoice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Falha ao gerar PIX da fatura.');
        }
        
        setPaymentData(data);
        setPaymentMethod('pix');
        setPage('payment');

    } catch (err) {
        setError(err.message);
        alert(`Erro na comunicação com o servidor: ${err.message}`);
    } finally {
        setIsLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('home')} className="text-orange-400 hover:text-orange-300"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold">Meu Crédito SmartFridge</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8 max-w-2xl">
                <div className="bg-gray-800 p-6 rounded-lg">
                     <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white">
                         <div className="flex justify-between items-start">
                             <div>
                                 <p className="text-sm opacity-80">SmartFridge</p>
                                 <p className="font-bold text-lg">Crédito</p>
                             </div>
                             <CreditCard size={32} />
                         </div>
                         <div className="mt-6">
                             <p className="text-sm opacity-80">Fatura Atual</p>
                             <p className="text-3xl font-bold">R$ {creditUsed.toFixed(2).replace('.', ',')}</p>
                         </div>
                         <div className="mt-2 flex justify-between items-end">
                             <div>
                                 <p className="text-xs opacity-80">Limite Disponível</p>
                                 <p className="font-semibold">R$ {availableCredit.toFixed(2).replace('.', ',')}</p>
                             </div>
                             <p className="text-xs opacity-80">Vencimento: Dia {user.credit_due_day || 'N/D'}</p>
                         </div>
                     </div>
                     <div className="mt-4">
                         <div className="w-full bg-gray-700 rounded-full h-2.5">
                             <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${usagePercentage}%` }}></div>
                         </div>
                         <div className="flex justify-between text-xs mt-1 text-gray-400">
                             <span>Gasto: R$ {creditUsed.toFixed(2).replace('.', ',')}</span>
                             <span>Limite Total: R$ {creditLimit.toFixed(2).replace('.', ',')}</span>
                         </div>
                     </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg mt-8">
                    <h3 className="text-xl font-bold mb-4">Pagar Fatura</h3>
                    {creditUsed > 0 ? (
                        <>
                            <div className="space-y-2 text-gray-300 mb-4 border-b border-gray-700 pb-4">
                                <p className="flex justify-between"><span>Valor Gasto:</span> <span>R$ {invoice.base.toFixed(2).replace('.', ',')}</span></p>
                                <p className="flex justify-between"><span>Taxa de Serviço:</span> <span>R$ {invoice.fees.toFixed(2).replace('.', ',')}</span></p>
                                {invoice.interest > 0 && (
                                     <p className="flex justify-between text-red-400"><span>Juros por Atraso:</span> <span>R$ {invoice.interest.toFixed(2).replace('.', ',')}</span></p>
                                )}
                                <p className="flex justify-between text-white font-bold text-lg mt-2 pt-2 border-t border-gray-600"><span>Total a Pagar:</span> <span>R$ {invoice.total.toFixed(2).replace('.', ',')}</span></p>
                            </div>
                            <button
                                onClick={handlePayInvoice}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <> <QrCode/> Gerar PIX para Pagamento</>}
                            </button>
                        </>
                    ) : (
                        <p className="text-center text-gray-400">Sua fatura está zerada. Nenhum pagamento é necessário.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

const HistoryPage = ({ setPage, token, showToast }) => {
    const [historyData, setHistoryData] = React.useState({ transactions: [], pagination: {} });
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [showReceiptModal, setShowReceiptModal] = React.useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = React.useState(null);

    const fetchHistoryData = React.useCallback(async (page = 1) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/user/history?page=${page}&limit=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar o histórico.');
            const data = await response.json();
            setHistoryData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    React.useEffect(() => {
        fetchHistoryData(1);
    }, [fetchHistoryData]);

    const openReceiptModal = (transactionId) => {
        setSelectedTransactionId(transactionId);
        setShowReceiptModal(true);
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'deposit': return <ArrowDownToLine className="text-green-400" />;
            case 'transfer_in': return <ArrowRightLeft className="text-green-400" />;
            case 'transfer_out': return <ArrowRightLeft className="text-red-400" />;
            case 'purchase': return <ShoppingCart className="text-red-400" />;
            case 'credit_purchase': return <CreditCard className="text-red-400" />;
            case 'invoice_payment': return <FileText className="text-blue-400" />;
            default: return <DollarSign />;
        }
    };
    
    return (
        <>
            <TransactionReceiptModal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} transactionId={selectedTransactionId} token={token} />
            <div className="min-h-screen bg-gray-900 text-white">
                <header className="bg-gray-800 shadow-md">
                    <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                        <button onClick={() => setPage('home')} className="text-orange-400 hover:text-orange-300"><ArrowLeft size={24} /></button>
                        <h1 className="text-2xl font-bold">Meu Histórico</h1>
                    </div>
                </header>
                <main className="container mx-auto p-4 md:p-8">
                    <div className="max-w-3xl mx-auto flex flex-col gap-4">
                        {isLoading ? <Loader2 className="animate-spin mx-auto mt-10" size={48} /> :
                            error ? <p className="text-red-400 text-center">{error}</p> :
                                historyData.transactions?.length > 0 ? (
                                    <>
                                        {historyData.transactions.map(tx => (
                                            <div key={tx.id} onClick={() => openReceiptModal(tx.id)} className="bg-gray-800 p-4 rounded-lg flex items-start gap-4 cursor-pointer hover:bg-gray-700 transition">
                                                <div className="bg-gray-700 p-3 rounded-full mt-1">
                                                    {getTransactionIcon(tx.type)}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-bold text-white text-lg">{tx.description}</h3>
                                                        <p className={`font-bold text-lg ${tx.type === 'deposit' || tx.type === 'transfer_in' ? 'text-green-400' : 'text-red-400'}`}>
                                                            {tx.type === 'deposit' || tx.type === 'transfer_in' ? '+' : '-'} R$ {parseFloat(tx.amount).toFixed(2).replace('.', ',')}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-400">{new Date(tx.created_at).toLocaleString('pt-BR')}</p>
                                                    {tx.items && tx.items.length > 0 && (
                                                        <div className="mt-2 pl-4 border-l-2 border-gray-700">
                                                            {tx.items.map(item => (
                                                                <p key={item.product_id} className="text-sm text-gray-300">
                                                                    {item.quantity}x {item.product_name}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <Pagination currentPage={historyData?.pagination?.page} totalPages={Math.ceil((historyData?.pagination?.total || 0) / (historyData?.pagination?.limit || 10))} onPageChange={fetchHistoryData} />
                                    </>
                                ) : (
                                    <div className="text-center p-8 bg-gray-800 text-gray-400 rounded-lg">
                                        <History size={48} className="mx-auto mb-4" />
                                        <h2 className="text-2xl font-semibold mb-2">Nenhuma transação encontrada</h2>
                                        <p>Seu histórico de compras e transações aparecerá aqui.</p>
                                    </div>
                                )}
                    </div>
                </main>
            </div>
        </>
    );
};


export default function App() {
    const [page, setPage] = React.useState('login');
    const [user, setUser] = React.useState(null);
    const [cart, setCart] = React.useState([]);
    const [paymentData, setPaymentData] = React.useState(null);
    const [depositData, setDepositData] = React.useState(null);
    const [isInitializing, setIsInitializing] = React.useState(true);
    const [paymentMethod, setPaymentMethod] = React.useState(null);
    const [fridgeId, setFridgeId] = React.useState(null);
    const [toast, setToast] = React.useState({ show: false, message: '' });

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const handleCondoSelect = (selectedCondo) => {
        localStorage.setItem('savedFridgeId', selectedCondo.fridge_id);
        // Atualiza o utilizador na sessão para usar o novo condoId
        setUser(prevUser => ({ ...prevUser, condoId: selectedCondo.id }));
        setFridgeId(selectedCondo.fridge_id);
        setPage('home');
    };

    const updateUserBalance = React.useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                const fullUserData = await response.json();
                setUser(prevUser => ({ ...prevUser, ...fullUserData }));
            }
        } catch (error) {
            console.error("Falha ao atualizar dados do usuário:", error);
        }
    }, []);

    const handleLogin = async (token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData);
        await updateUserBalance();

        const savedFridgeId = localStorage.getItem('savedFridgeId');
        if (savedFridgeId) {
            try {
                const validationResponse = await fetch(`${API_URL}/api/public/validate-fridge`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ condoId: userData.condoId, fridgeId: savedFridgeId })
                });
                const validationData = await validationResponse.json();
                if (validationData.valid) {
                    setFridgeId(savedFridgeId);
                    setPage('home');
                    return;
                } else {
                    localStorage.removeItem('savedFridgeId');
                }
            } catch (error) {
                console.error("Falha ao validar geladeira salva:", error);
                localStorage.removeItem('savedFridgeId');
            }
        }
        setPage('fridgeSelection');
    };
    
    const handleLogout = () => {
        setUser(null);
        setCart([]);
        setFridgeId(null);
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('savedFridgeId');
        setPage('login');
    };

    React.useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');
            const adminToken = localStorage.getItem('adminToken');
            
            if (adminToken) {
                setUser({ name: "Admin" });
                setPage('admin');
            } else if (token) {
                try {
                    const meResponse = await fetch(`${API_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
                    if (meResponse.ok) {
                        const userData = await meResponse.json();
                        handleLogin(token, userData);
                    } else {
                        handleLogout();
                    }
                } catch (error) {
                    console.error("Falha ao validar token", error);
                    handleLogout();
                }
            }
            setIsInitializing(false);
        };
        validateToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handleAdminLogin = () => { setUser({ name: "Admin" }); setPage('admin'); };
    const handleRegister = (token, userData) => { 
        handleLogin(token, userData);
    };
    const handleAccountUpdate = (updatedUser) => { setUser(prevUser => ({ ...prevUser, ...updatedUser })); };
    const handleCondoChanged = (updatedUser) => { setUser(updatedUser); };
    
    const addToCart = (productToAdd) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === productToAdd.id);
            if (existingItem) {
                return prevCart.map(item => item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item);
            } else {
                return [...prevCart, { ...productToAdd, quantity: 1 }];
            }
        });
        showToast('Produto adicionado ao carrinho!');
    };

    if (isInitializing) {
        return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><Loader2 className="w-16 h-16 text-orange-500 animate-spin" /></div>;
    }

    return (
        <>
            <Toast show={toast.show} message={toast.message} />
            {(() => {
                switch (page) {
                    case 'register': return <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setPage('login')} />;
                    case 'fridgeSelection': return user ? <FridgeSelectionPage onCondoSelected={handleCondoSelect} setPage={setPage} user={user} onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
                    case 'home': return user && fridgeId ? <HomePage user={user} onLogout={handleLogout} cart={cart} addToCart={addToCart} setPage={setPage} fridgeId={fridgeId} /> : <FridgeSelectionPage setFridgeId={setFridgeId} setPage={setPage} user={user} onLogout={handleLogout} />;
                    case 'cart': return user ? <CartPage cart={cart} setCart={setCart} setPage={setPage} user={user} setPaymentData={setPaymentData} setPaymentMethod={setPaymentMethod} onPaymentSuccess={updateUserBalance} fridgeId={fridgeId} /> : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
                    case 'payment': return user ? <PaymentPage paymentData={paymentData} setPage={setPage} paymentMethod={paymentMethod} user={user} cart={cart} onPaymentSuccess={updateUserBalance} setPaymentData={setPaymentData} /> : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
                    case 'awaitingUnlock': return <AwaitingUnlockPage setPage={setPage} paymentData={paymentData} />;
                    case 'enjoy': return <EnjoyPage setPage={setPage} />;
                    case 'my-account': return user ? <MyAccountPage user={user} setPage={setPage} onAccountUpdate={handleAccountUpdate} /> : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
                    case 'changeCondo': return user ? <ChangeCondoPage user={user} setPage={setPage} onCondoChanged={handleCondoChanged} /> : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
                    case 'forgot-password': return <ForgotPasswordPage setPage={setPage} />;
                    case 'admin': return <AdminDashboard onLogout={handleLogout} />;
                    case 'wallet': return user ? <WalletPage user={user} setPage={setPage} setPaymentData={setPaymentData} setDepositData={setDepositData} setPaymentMethod={setPaymentMethod} updateUserBalance={updateUserBalance} showToast={showToast} /> : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
                    case 'card-deposit': return user ? <CardDepositPage user={user} depositData={depositData} setPage={setPage} onPaymentSuccess={() => { showToast('Depósito realizado com sucesso!'); updateUserBalance(); }} /> : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
                    case 'my-tickets': return user ? <MyTicketsPage setPage={setPage} /> : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
                    case 'credit': return user ? <CreditPage user={user} setPage={setPage} setPaymentData={setPaymentData} setPaymentMethod={setPaymentMethod} /> : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
                    case 'history': return user ? <HistoryPage setPage={setPage} token={localStorage.getItem('token')} showToast={showToast} /> : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
                    case 'login':
                    default: return <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
                }
            })()}
        </>
    )
}
