
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  User as UserIcon, 
  Fuel, 
  Settings, 
  Plus, 
  ChevronRight,
  LogOut,
  History,
  LayoutDashboard,
  UserPlus,
  FileBarChart,
  Flag,
  Calculator
} from 'lucide-react';
import { Trip, User, TireRecord, MaintenanceFilters, Station, RetiredTireRecord, MiscExpense } from './types';

// Components
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import TripForm from './components/TripForm';
import MaintenanceView from './components/MaintenanceView';
import HistoryView from './components/HistoryView';
import RegistrationView from './components/RegistrationView';
import ReportsView from './components/ReportsView';
import FinancialView from './components/FinancialView';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trips' | 'maintenance' | 'reports' | 'registration' | 'financial'>('dashboard');
  const [tripStep, setTripStep] = useState<number>(1);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [miscExpenses, setMiscExpenses] = useState<MiscExpense[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [companies, setCompanies] = useState<Station[]>([]); 
  const [tires, setTires] = useState<TireRecord[]>([]);
  const [retiredTires, setRetiredTires] = useState<RetiredTireRecord[]>([]);
  const [filters, setFilters] = useState<MaintenanceFilters>({
    airFilter: { installKm: 0, installDate: '', history: [], threshold: 40000 },
    racorFilter: { installKm: 0, installDate: '', history: [], threshold: 10000 },
    engineOil: { installKm: 0, installDate: '', history: [], threshold: 20000 },
    gearboxOil: { installKm: 0, installDate: '', history: [], threshold: 80000 },
    diffOil: { installKm: 0, installDate: '', history: [], threshold: 80000 },
    apsFilter: { installKm: 0, installDate: '', history: [], threshold: 50000 },
    battery: { installKm: 0, installDate: '', history: [], threshold: 4 }, // threshold em meses
    others: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('truck_user');
    const savedAllUsers = localStorage.getItem('truck_all_users');
    const savedTrips = localStorage.getItem('truck_trips');
    const savedMiscExpenses = localStorage.getItem('truck_misc_expenses');
    const savedTires = localStorage.getItem('truck_tires');
    const savedRetiredTires = localStorage.getItem('truck_retired_tires');
    const savedFilters = localStorage.getItem('truck_filters');
    const savedStations = localStorage.getItem('truck_stations');
    const savedCompanies = localStorage.getItem('truck_companies');

    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedAllUsers) setAllUsers(JSON.parse(savedAllUsers));
    if (savedTrips) setTrips(JSON.parse(savedTrips));
    if (savedMiscExpenses) setMiscExpenses(JSON.parse(savedMiscExpenses));
    if (savedTires) setTires(JSON.parse(savedTires));
    if (savedRetiredTires) setRetiredTires(JSON.parse(savedRetiredTires));
    if (savedFilters) setFilters(JSON.parse(savedFilters));
    if (savedStations) setStations(JSON.parse(savedStations));
    else {
      setStations([
        { id: '1', name: 'Posto Graal' },
        { id: '2', name: 'Posto Ipiranga' },
        { id: '3', name: 'Posto Shell' }
      ]);
    }
    if (savedCompanies) setCompanies(JSON.parse(savedCompanies));

    // Supabase Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Fetch profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const mappedUser: User = {
            id: profile.id,
            companyName: profile.company_name,
            driverName: profile.driver_name,
            plate: profile.plate,
            email: session.user.email,
            truckRegistrationDate: profile.truck_registration_date,
            truckInitialKm: profile.truck_initial_km,
            truckCurrentKm: profile.truck_current_km,
            driverPhoto: profile.driver_photo,
            truckPhoto: profile.truck_photo
          };
          setCurrentUser(mappedUser);
          
          // Mantém a lista de perfis salvos pra login rápido
          setAllUsers(prev => {
            const exists = prev.find(u => u.id === mappedUser.id);
            if (!exists) return [...prev, mappedUser];
            return prev.map(u => u.id === mappedUser.id ? mappedUser : u);
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('truck_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('truck_user');
    }
    localStorage.setItem('truck_all_users', JSON.stringify(allUsers));
    localStorage.setItem('truck_trips', JSON.stringify(trips));
    localStorage.setItem('truck_misc_expenses', JSON.stringify(miscExpenses));
    localStorage.setItem('truck_tires', JSON.stringify(tires));
    localStorage.setItem('truck_retired_tires', JSON.stringify(retiredTires));
    localStorage.setItem('truck_filters', JSON.stringify(filters));
    localStorage.setItem('truck_stations', JSON.stringify(stations));
    localStorage.setItem('truck_companies', JSON.stringify(companies));
  }, [currentUser, allUsers, trips, miscExpenses, tires, retiredTires, filters, stations, companies]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const activeTrip = useMemo(() => trips.find(t => t.status === 'active'), [trips]);

  const openTripForm = (step: number = 1, tripId: string | null = null) => {
    setTripStep(step);
    setEditingTripId(tripId);
    setActiveTab('trips');
  };

  const saveTrip = React.useCallback((updatedTrip: Trip, shouldExit: boolean = false) => {
    let finalTrip = { ...updatedTrip };
    
    // Usamos o setTrips com função para não depender do estado trips atual na definição do useCallback
    setTrips(prevTrips => {
      const existing = prevTrips.find(t => t.id === updatedTrip.id);
      
      // Se a viagem está sendo finalizada agora (era ativa ou nova)
      if (updatedTrip.status === 'completed' && (!existing || existing.status === 'active')) {
        // Precisamos das miscExpenses aqui. Como elas somem depois, pegamos do estado atual.
        // Nota: para ser 100% puro, miscExpenses deveria estar nas dependências ou ser passadas.
        // Mas como miscExpenses muda pouco, incluímos no deps do useCallback.
        finalTrip.miscExpenses = [...(updatedTrip.miscExpenses || []), ...miscExpenses];
        setMiscExpenses([]); 
      }

      const index = prevTrips.findIndex(t => t.id === finalTrip.id);
      if (index > -1) {
        const newTrips = [...prevTrips];
        newTrips[index] = finalTrip;
        return newTrips;
      }
      return [finalTrip, ...prevTrips];
    });

    if (currentUser) {
      const tripEndKm = Number(updatedTrip.endKm) || 0;
      const tripStartKm = Number(updatedTrip.outbound.startKm) || 0;
      const highestKm = Math.max(tripEndKm, tripStartKm);
      
      if (highestKm > (currentUser.truckCurrentKm || 0)) {
        const updatedUser = { ...currentUser, truckCurrentKm: highestKm };
        setCurrentUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      }
    }
    
    if (shouldExit) {
      setActiveTab('dashboard');
    }
  }, [currentUser, miscExpenses]); // Dependências mínimas

  const addMiscExpense = (expense: MiscExpense) => {
    setMiscExpenses(prev => [...prev, expense]);
  };

  const deleteMiscExpense = (id: string) => {
    setMiscExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addStation = (name: string) => {
    const newStation: Station = { id: Date.now().toString(), name };
    setStations([...stations, newStation]);
  };

  const addCompany = (name: string) => {
    const newCompany: Station = { id: Date.now().toString(), name };
    setCompanies([...companies, newCompany]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400 font-black uppercase text-[10px] tracking-widest">Carregando...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} allUsers={allUsers} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            trips={trips} 
            user={currentUser} 
            filters={filters} 
            miscExpenses={miscExpenses}
            onNewTrip={() => openTripForm(1)} 
            onRegisterDiesel={() => openTripForm(3)}
            onAddExpense={() => openTripForm(4)}
            onOpenMaintenance={() => setActiveTab('maintenance')}
            onViewHistory={() => setActiveTab('reports')}
          />
        );
      case 'trips':
        const tripToEdit = editingTripId ? trips.find(t => t.id === editingTripId) : activeTrip;
        return (
          <TripForm 
            onSave={(trip, exit) => {
              saveTrip(trip, exit);
              if (exit) setEditingTripId(null);
            }} 
            user={currentUser} 
            initialStep={tripStep} 
            stations={stations}
            onAddStation={addStation}
            companies={companies}
            onAddCompany={addCompany}
            existingTrip={tripToEdit}
          />
        );
      case 'maintenance':
        return (
          <MaintenanceView 
            tires={tires} 
            setTires={setTires} 
            retiredTires={retiredTires}
            setRetiredTires={setRetiredTires}
            filters={filters} 
            setFilters={setFilters} 
            trips={trips}
            user={currentUser}
          />
        );
      case 'reports':
        return (
          <ReportsView 
            trips={trips} 
            miscExpenses={miscExpenses} 
            user={currentUser} 
            filters={filters}
            onEditTrip={(id) => openTripForm(1, id)}
          />
        );
      case 'financial':
        return (
          <FinancialView 
            trips={trips}
            miscExpenses={miscExpenses}
            user={currentUser}
          />
        );
      case 'registration':
        return (
          <RegistrationView 
            user={currentUser} 
            allUsers={allUsers}
            onUpdateUser={setCurrentUser} 
            onUpdateAllUsers={setAllUsers}
            onLogout={handleLogout} 
          />
        );
      default:
        return <DashboardView trips={trips} user={currentUser} filters={filters} miscExpenses={miscExpenses} onNewTrip={() => openTripForm(1)} onRegisterDiesel={() => openTripForm(3)} onAddExpense={() => openTripForm(4)} onOpenMaintenance={() => setActiveTab('maintenance')} onViewHistory={() => setActiveTab('reports')} />;
    }
  };

  return (
    <div className="min-h-screen pb-32 max-w-lg mx-auto bg-gray-50 relative shadow-2xl border-x border-gray-200 print:min-h-0 print:pb-0 print:shadow-none print:border-none print:bg-white print:max-w-none print:overflow-visible print:static print:block">
      <header className="sticky top-0 z-40 bg-white/80 ios-blur border-b border-gray-200 px-6 py-4 flex justify-between items-center no-print">
        <h1 className="text-xl font-black text-gray-900 tracking-tight">
          {activeTab === 'dashboard' ? 'Becker e Mendonça' : 
           activeTab === 'trips' ? 'Frete' : 
           activeTab === 'maintenance' ? 'Manutenção' : 
           activeTab === 'reports' ? 'Relatórios' : 
           activeTab === 'financial' ? 'Financeiro' :
           activeTab === 'registration' ? 'Cadastro' : 'Perfil'}
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Truck size={14} />
            {currentUser.plate}
          </div>
          <button 
            type="button"
            onClick={handleLogout}
            className="p-3 -mr-2 text-gray-400 hover:text-red-500 active:scale-90 active:text-red-600 transition-all"
            aria-label="Sair"
          >
            <LogOut size={22} />
          </button>
        </div>
      </header>

      <main className="animate-in fade-in duration-300 print:block print:opacity-100 print:overflow-visible">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/90 ios-blur border-t border-gray-200 px-2 pt-3 pb-8 flex justify-between items-center z-50 no-print">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={24} />} label="Início" />
        <NavButton 
          active={activeTab === 'trips'} 
          onClick={() => {
            if (activeTrip) {
              openTripForm(5); // Vai para o passo de finalizar (agora é o 5)
            } else {
              openTripForm(1); // Inicia nova se não houver ativa
            }
          }} 
          icon={<Flag className="bg-red-600 text-white rounded-full p-2 shadow-lg shadow-red-200" size={32} />} 
          label="Finalizar" 
        />
        <NavButton active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')} icon={<Settings size={24} />} label="Oficina" />
        <NavButton active={activeTab === 'financial'} onClick={() => setActiveTab('financial')} icon={<Calculator size={24} />} label="Financeiro" />
        <NavButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileBarChart size={24} />} label="Relatório" />
        <NavButton active={activeTab === 'registration'} onClick={() => setActiveTab('registration')} icon={<UserPlus size={24} />} label="Cadastro" />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 min-w-[50px]">
    <div className={`${active ? 'text-blue-600 scale-110' : 'text-gray-400'} transition-all duration-200`}>
      {icon}
    </div>
    <span className={`text-[8px] font-bold uppercase tracking-wider ${active ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
  </button>
);

export default App;
