
import React, { useState, useMemo } from 'react';
import { Trip, User, MiscExpense, TireRecord, DieselRecord, MaintenanceFilters } from '../types';
import { 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  ArrowRightLeft, 
  Fuel, 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Wallet, 
  Gauge, 
  Calendar,
  Truck,
  Receipt,
  Flag,
  MapPin,
  Download,
  FileText,
  Activity,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Navigation2,
  HandCoins,
  Percent,
  AlertTriangle,
  Info,
  Clock,
  Wrench,
  Droplets
} from 'lucide-react';

interface ReportsViewProps {
  trips: Trip[];
  miscExpenses: MiscExpense[];
  user: User;
  filters: MaintenanceFilters;
  onEditTrip?: (id: string) => void;
}

type Period = 'Weekly' | 'Monthly' | 'Yearly' | 'All' | 'Custom';

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return '---';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: '2-digit' 
  });
};

const ReportsView: React.FC<ReportsViewProps> = ({ trips, miscExpenses, user, filters, onEditTrip }) => {
  const [period, setPeriod] = useState<Period>('Monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [printSpecificTripId, setPrintSpecificTripId] = useState<string | null>(null);

  React.useEffect(() => {
    const handleAfterPrint = () => setPrintSpecificTripId(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handlePrint = () => {
    setPrintSpecificTripId(null);
    setTimeout(() => window.print(), 100);
  };

  const handlePrintSpecific = (id: string) => {
    setPrintSpecificTripId(id);
    setTimeout(() => window.print(), 100);
  };

  const filteredTrips = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Incluímos todas as viagens para que o usuário veja dados mesmo que não tenha finalizado a viagem
    let filtered = [...trips];

    if (period !== 'All') {
      if (period === 'Weekly') {
        // Últimos 7 dias
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(t => {
          if (!t.outbound.date) return false;
          const d = new Date(t.outbound.date + 'T12:00:00');
          return d >= lastWeek;
        });
      } else if (period === 'Monthly') {
        filtered = filtered.filter(t => {
          if (!t.outbound.date) return false;
          const d = new Date(t.outbound.date + 'T12:00:00');
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
      } else if (period === 'Yearly') {
        filtered = filtered.filter(t => {
          if (!t.outbound.date) return false;
          const d = new Date(t.outbound.date + 'T12:00:00');
          return d.getFullYear() === currentYear;
        });
      } else if (period === 'Custom') {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        filtered = filtered.filter(t => {
          if (!t.outbound.date) return false;
          const d = new Date(t.outbound.date + 'T12:00:00');
          return d >= start && d <= end;
        });
      }
    }

    return filtered.sort((a, b) => {
      const dateA = new Date((a.outbound.date || '') + 'T12:00:00').getTime() || 0;
      const dateB = new Date((b.outbound.date || '') + 'T12:00:00').getTime() || 0;
      return dateB - dateA;
    });
  }, [trips, period, startDate, endDate]);

  return (
    <div className="p-4 space-y-6 pb-28 animate-in fade-in duration-500 print:p-0 print:m-0 print:space-y-0 print:overflow-visible print:block">
      <div className="flex flex-col gap-4 no-print">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Relatórios Detalhados</h2>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="bg-gray-100 text-gray-600 p-3 rounded-2xl active:scale-95 transition-all flex items-center gap-2"
            >
              <Download size={18} />
              <span className="text-[10px] font-black uppercase">PDF</span>
            </button>
            <button 
              onClick={handlePrint}
              className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all flex items-center gap-2"
            >
              <Printer size={18} />
              <span className="text-[10px] font-black uppercase">Imprimir</span>
            </button>
          </div>
        </div>

        <div className="flex bg-gray-200 p-1 rounded-2xl">
          {(['Weekly', 'Monthly', 'Yearly', 'All', 'Custom'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${
                period === p ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              {p === 'Weekly' ? 'Semana' : p === 'Monthly' ? 'Mês' : p === 'Yearly' ? 'Ano' : p === 'Custom' ? 'Data' : 'Tudo'}
            </button>
          ))}
        </div>

        {period === 'Custom' && (
          <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Início</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-transparent border-none text-xs font-bold outline-none mt-1"
              />
            </div>
            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Fim</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-transparent border-none text-xs font-bold outline-none mt-1"
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 no-print">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-sm">Nenhuma viagem finalizada no período.</p>
          </div>
        ) : (
          filteredTrips.map(trip => (
            <TripReportCard 
              key={trip.id} 
              trip={trip} 
              allMiscExpenses={miscExpenses}
              isExpanded={expandedTripId === trip.id}
              onToggle={() => setExpandedTripId(expandedTripId === trip.id ? null : trip.id)}
              allTrips={trips}
              onEdit={onEditTrip}
              onPrint={handlePrintSpecific}
            />
          ))
        )}
      </div>

      {/* Container de Impressão (Folha A4) */}
      <div className="hidden print:block bg-white text-black font-sans w-full print:overflow-visible">
        {filteredTrips.filter(t => !printSpecificTripId || t.id === printSpecificTripId).map((trip, index) => (
          <div key={trip.id} className={`${index > 0 ? 'page-break mt-12 pt-8 border-t-2 border-dashed border-gray-300' : ''} w-full`}>
             <PrintTripDetail trip={trip} allMiscExpenses={miscExpenses} allTrips={trips} filters={filters} user={user} />
          </div>
        ))}
      </div>
    </div>
  );
};

const TripReportCard: React.FC<{ 
  trip: Trip; 
  allMiscExpenses: MiscExpense[]; 
  isExpanded: boolean; 
  onToggle: () => void; 
  allTrips: Trip[];
  onEdit?: (id: string) => void;
  onPrint?: (id: string) => void;
}> = ({ trip, allMiscExpenses, isExpanded, onToggle, allTrips, onEdit, onPrint }) => {
  const calculations = useMemo(() => calculateTripData(trip, allMiscExpenses), [trip, allMiscExpenses]);
  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const segments = useMemo(() => calculateSegments(trip, allTrips), [trip, allTrips]);

  const tireOccurrences = useMemo(() => {
    const savedTires: TireRecord[] = JSON.parse(localStorage.getItem('truck_tires') || '[]');
    const startDate = new Date(trip.outbound.date + 'T00:00:00');
    const endDate = trip.endDate ? new Date(trip.endDate + 'T23:59:59') : new Date();
    
    return savedTires.flatMap(t => (t.events || []).filter(ev => {
      const evDate = new Date(ev.date + 'T12:00:00');
      return evDate >= startDate && evDate <= endDate;
    }).map(ev => ({ ...ev, tirePos: t.position, tireBrand: t.brand })));
  }, [trip]);

  return (
    <div className={`bg-white rounded-[2.5rem] border overflow-hidden transition-all avoid-break ${isExpanded ? 'shadow-xl border-blue-200' : 'shadow-sm border-gray-100'}`}>
      <div onClick={onToggle} className="p-6 cursor-pointer flex justify-between items-center active:bg-gray-50">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl shadow-lg shadow-blue-100 ${isExpanded ? 'bg-blue-600 text-white' : 'bg-gray-50 text-blue-600'}`}>
            <Truck size={22} />
          </div>
          <div>
            <h4 className="font-black text-gray-900 leading-tight truncate max-w-[160px]">{trip.outbound.company || 'Empresa não informada'}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">( {formatDateShort(trip.outbound.date)} )</span>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${trip.status === 'completed' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'}`}>
                {trip.status === 'completed' ? 'Finalizada' : 'Em Aberto'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="font-black text-gray-900">{formatCurrency(calculations.totalFreight)}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Fretes</p>
          </div>
          {isExpanded ? <ChevronUp size={20} className="text-gray-300" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
          
          {/* Acerto de Contas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <HandCoins size={18} className="text-orange-600" />
              <h5 className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none">Acerto de Contas (Viagem)</h5>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-7 border border-gray-100 shadow-sm space-y-8">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">Adiantamentos Totais</p>
                   <p className="text-xl font-black text-gray-900 leading-none mt-2">{formatCurrency(calculations.totalAdvances)}</p>
                 </div>
                 <div className="text-right space-y-1">
                   <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">Total Gasto (Diesel+Desp)</p>
                   <p className="text-xl font-black text-red-500 leading-none mt-2">{formatCurrency(calculations.totalDieselCost + calculations.totalExpenses)}</p>
                 </div>
              </div>
              
              <div className="bg-gray-50/50 rounded-3xl p-6 flex flex-col items-center justify-center border border-gray-100 text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Saldo em Mãos</p>
                 <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mb-2">(Adiantamentos - Gastos)</p>
                 <span className="text-4xl font-black text-gray-900">
                   {formatCurrency(calculations.settlementResult)}
                 </span>
                 <div className="mt-5 flex items-center gap-2 px-4">
                    <AlertCircle size={14} className="text-orange-600 shrink-0"/>
                    <p className="text-[9px] font-black text-gray-500 uppercase leading-tight">
                      * O motorista deve devolver ou prestar contas de {formatCurrency(Math.abs(calculations.settlementResult))}
                    </p>
                 </div>
              </div>
            </div>
          </div>

          {/* Performance por Trecho */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Navigation2 size={18} className="text-blue-600" />
              <h5 className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none">Performance por Trecho (Posto a Posto)</h5>
            </div>
            <div className="space-y-4">
              {segments.length === 0 ? (
                <p className="text-center py-8 text-gray-300 font-bold uppercase text-[10px] tracking-widest bg-gray-50 rounded-3xl">Nenhum trecho registrado</p>
              ) : (
                segments.map((seg, idx) => (
                  <div key={idx} className="bg-gray-50/30 rounded-[2.5rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-1">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Trecho Percorrido</p>
                       {seg.isInefficient && (
                          <span className="text-[8px] font-black bg-red-100 text-red-600 px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm">Ineficiente</span>
                       )}
                    </div>
                    <p className="text-sm font-black text-gray-800 mb-5 leading-tight">{seg.label}</p>
                    <div className="grid grid-cols-3 gap-3">
                       <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-sm">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-2">Real</p>
                          <p className="text-xs font-black text-gray-900">{seg.real.toFixed(1)}L</p>
                       </div>
                       <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-sm">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-2">Meta</p>
                          <p className="text-xs font-black text-gray-500">{seg.meta > 0 ? `${seg.meta.toFixed(1)}L` : '---'}</p>
                       </div>
                       <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-sm">
                          <p className={`text-[8px] font-black uppercase mb-2 ${seg.desvio > 0 ? 'text-red-600' : 'text-green-600'}`}>Desvio</p>
                          <p className={`text-xs font-black ${seg.desvio > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {seg.meta > 0 ? `${seg.desvio > 0 ? '+' : ''}${seg.desvio.toFixed(1)}L` : '0.0L'}
                          </p>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Trajetos */}
          <div className="space-y-4">
            <div className="bg-gray-50/30 rounded-[2.5rem] p-7 border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md"><Package size={16} /></div>
                <h6 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Trajeto Ida</h6>
              </div>
              <div className="space-y-4">
                 <div className="grid grid-cols-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase">Origem (Cidade)</p>
                   <p className="text-base font-black text-gray-800">{trip.outbound.loadingCity || '---'}</p>
                 </div>
                 <div className="grid grid-cols-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase">Empresa Carregamento</p>
                   <p className="text-base font-black text-gray-800">{trip.outbound.company || '---'}</p>
                 </div>
                 <div className="grid grid-cols-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase">Data Carregamento</p>
                   <p className="text-sm font-black text-gray-800">( {formatDateShort(trip.outbound.date)} )</p>
                 </div>
                 <div className="grid grid-cols-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase">Peso da Carga</p>
                   <p className="text-sm font-black text-gray-800">{trip.outbound.weightTons ? `${trip.outbound.weightTons.toLocaleString()} kg` : '---'}</p>
                 </div>
                 <div className="grid grid-cols-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase">Destino</p>
                   <p className="text-sm font-black text-gray-800 leading-tight">{trip.outbound.destinations || '---'}</p>
                 </div>
                 <div className="grid grid-cols-1 pt-2 border-t border-blue-100/50">
                   <p className="text-[9px] font-black text-blue-600 uppercase">Valor do Frete</p>
                   <p className="text-base font-black text-gray-900">{formatCurrency(Number(trip.outbound.value) || 0)}</p>
                 </div>
              </div>
            </div>

            <div className="bg-gray-50/30 rounded-[2.5rem] p-7 border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-600 text-white rounded-xl shadow-md"><ArrowRightLeft size={16} /></div>
                <h6 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Trajeto Volta</h6>
              </div>
              <div className="space-y-4">
                 <div className="grid grid-cols-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase">Origem (Cidade)</p>
                   <p className="text-base font-black text-gray-800">{trip.inbound.loadingCity || '---'}</p>
                 </div>
                 <div className="grid grid-cols-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase">Empresa Carregamento</p>
                   <p className="text-base font-black text-gray-800">{trip.inbound.company || '---'}</p>
                 </div>
                 <div className="grid grid-cols-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase">Data Carregamento</p>
                   <p className="text-sm font-black text-gray-800">{trip.inbound.company ? `( ${formatDateShort(trip.inbound.date)} )` : '---'}</p>
                 </div>
                 <div className="grid grid-cols-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase">Peso da Carga</p>
                   <p className="text-sm font-black text-gray-800">{trip.inbound.weightTons ? `${trip.inbound.weightTons.toLocaleString()} kg` : '---'}</p>
                 </div>
                 <div className="grid grid-cols-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase">Destino</p>
                   <p className="text-sm font-black text-gray-800 leading-tight">{trip.inbound.destinations || '---'}</p>
                 </div>
                 <div className="grid grid-cols-1 pt-2 border-t border-orange-100/50">
                   <p className="text-[9px] font-black text-orange-600 uppercase">Valor do Frete</p>
                   <p className="text-base font-black text-gray-900">{formatCurrency(Number(trip.inbound.value) || 0)}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Desempenho */}
          <div className="space-y-4">
            <div className="bg-gray-50/30 rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
               <div className="flex items-center gap-2 mb-8 border-b border-gray-200 pb-4">
                  <Gauge size={18} className="text-blue-600" />
                  <h6 className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">Desempenho da Viagem</h6>
               </div>
               <div className="grid grid-cols-2 gap-y-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase leading-none">KM Percorrido</p>
                    <p className="text-lg font-black text-gray-900">{calculations.totalKm.toLocaleString()} KM</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase leading-none">Consumo Médio</p>
                    <p className="text-lg font-black text-blue-600">{calculations.avgKmL} KM/L</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase leading-none">Diesel Total</p>
                    <p className="text-lg font-black text-gray-900">{calculations.totalLitersDiesel} L</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase leading-none">Arla Total</p>
                    <p className="text-lg font-black text-gray-900">{calculations.totalLitersArla} L</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Resultado Empresa */}
          <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Calculator size={18} className="text-blue-600" />
                  <h5 className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none">Resultado Empresa</h5>
                </div>
                <div className="flex gap-2">
                  {onPrint && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrint(trip.id);
                      }}
                      className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Download size={12} /> PDF / Imprimir
                    </button>
                  )}
                  {onEdit && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(trip.id);
                      }}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Wrench size={12} /> Editar Lançamentos
                    </button>
                  )}
                </div>
              </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-gray-500">Valor Total Frete (Ida + Volta)</span>
                   <span className="text-base font-black text-gray-900">{formatCurrency(calculations.totalFreight)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-gray-500">Comissão Motorista (13%)</span>
                   <span className="text-base font-black text-red-500">- {formatCurrency(calculations.commission)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-gray-500">Total Diesel / Arla</span>
                   <span className="text-base font-black text-red-500">- {formatCurrency(calculations.totalDieselCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-gray-500">Total Despesas Diversas</span>
                   <span className="text-base font-black text-red-500">- {formatCurrency(calculations.totalExpenses)}</span>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                 <span className="text-sm font-black uppercase tracking-widest text-gray-400">Resultado Líquido</span>
                 <span className="text-3xl font-black text-green-600">{formatCurrency(calculations.netProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para Impressão (Sincronizado com Layout de Tela)
const PrintTripDetail: React.FC<{ trip: Trip; allMiscExpenses: MiscExpense[]; allTrips: Trip[]; filters: MaintenanceFilters; user: User }> = ({ trip, allMiscExpenses, allTrips, filters, user }) => {
  const calcs = calculateTripData(trip, allMiscExpenses);
  const segments = calculateSegments(trip, allTrips);
  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const maintenanceItems = [
    { label: 'Filtro Racor', data: filters.racorFilter, threshold: filters.racorFilter.threshold || 10000 },
    { label: 'Óleo Motor', data: filters.engineOil, threshold: filters.engineOil.threshold || 20000 },
    { label: 'Filtro Ar', data: filters.airFilter, threshold: filters.airFilter.threshold || 40000 },
    { label: 'Filtro APS', data: filters.apsFilter, threshold: filters.apsFilter.threshold || 50000 },
    { label: 'Óleo Câmb.', data: filters.gearboxOil, threshold: filters.gearboxOil.threshold || 80000 },
    { label: 'Óleo Difer.', data: filters.diffOil, threshold: filters.diffOil.threshold || 80000 },
    { label: 'Bateria', data: filters.battery, threshold: filters.battery.threshold || 4, isMonths: true },
  ];

  const currentKm = Math.max(trip.endKm || 0, trip.outbound.startKm || 0);

  return (
    <div className="p-6 bg-white text-black w-full print:min-h-0 print:overflow-visible">
      {/* Cabeçalho Impressão */}
      <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-3">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <div className="bg-black text-white p-1.5 rounded-lg"><Truck size={18} /></div>
             <h1 className="text-base font-black uppercase tracking-tighter leading-none">Relatório de Gestão Frota</h1>
           </div>
           <div className="flex flex-col gap-0.5">
             <p className="text-[10px] font-black text-gray-900 uppercase">Motorista: {user.name}</p>
             <p className="text-[10px] font-black text-gray-900 uppercase">Placa: {user.plate}</p>
             <p className="text-[10px] font-black text-gray-600 uppercase">Viagem: {trip.outbound.company}</p>
           </div>
        </div>
        <div className="text-right">
           <p className="text-[9px] font-black uppercase text-gray-400">Emissão em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</p>
           <p className="text-xs font-black">{trip.endDate ? `( ${formatDateShort(trip.endDate)} )` : '---'}</p>
           <span className="text-[9px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-md uppercase tracking-widest">FINALIZADA</span>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Acerto de Contas (IGUAL À TELA) */}
        <section className="space-y-3 avoid-break">
          <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] border-l-4 border-orange-600 pl-2">Acerto de Contas (Viagem)</h2>
          <div className="border border-gray-100 rounded-[2rem] p-6 space-y-6 bg-gray-50/20">
            <div className="grid grid-cols-2 gap-6">
               <div>
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">Adiantamentos Totais</p>
                  <p className="text-sm font-black text-gray-900 mt-1">{formatCurrency(calcs.totalAdvances)}</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">Total Gasto (Diesel+Desp)</p>
                  <p className="text-sm font-black text-red-600 mt-1">{formatCurrency(calcs.totalDieselCost + calcs.totalExpenses)}</p>
               </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center border border-gray-100 text-center shadow-sm">
               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 leading-none mb-1">Saldo em Mãos</p>
               <span className="text-base font-black text-black">
                 {formatCurrency(calcs.settlementResult)}
               </span>
               <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 w-full justify-center">
                  <AlertCircle size={14} className="text-orange-600 shrink-0"/>
                  <p className="text-[9px] font-black text-gray-600 uppercase leading-tight tracking-tight">
                    * O motorista deve devolver ou prestar contas de {formatCurrency(Math.abs(calcs.settlementResult))}
                  </p>
               </div>
            </div>
          </div>
        </section>

        {/* Performance por Trecho (IGUAL À TELA) */}
        <section className="space-y-3 avoid-break">
          <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] border-l-4 border-blue-600 pl-2">Performance por Trecho (Posto a Posto)</h2>
          <div className="grid grid-cols-1 gap-3">
             {segments.map((seg, idx) => (
               <div key={idx} className="bg-gray-50 border border-gray-200 rounded-[1.5rem] p-4 avoid-break">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-black text-black">{seg.label}</p>
                    {seg.isInefficient && (
                       <span className="text-[8px] font-black bg-red-600 text-white px-2 py-0.5 rounded-md uppercase tracking-widest">INEFICIENTE</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                     <div className="bg-white p-2 rounded-xl border border-gray-100 text-center">
                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Real</p>
                        <p className="text-[10px] font-black">{seg.real.toFixed(1)}L</p>
                     </div>
                     <div className="bg-white p-2 rounded-xl border border-gray-100 text-center">
                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Meta</p>
                        <p className="text-[10px] font-black text-gray-500">{seg.meta > 0 ? `${seg.meta.toFixed(1)}L` : '---'}</p>
                     </div>
                     <div className="bg-white p-2 rounded-xl border border-gray-100 text-center">
                        <p className={`text-[8px] font-black uppercase mb-1 ${seg.desvio > 0 ? 'text-red-600' : 'text-green-600'}`}>Desvio</p>
                        <p className={`text-[10px] font-black ${seg.desvio > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {seg.meta > 0 ? `${seg.desvio > 0 ? '+' : ''}${seg.desvio.toFixed(1)}L` : '0.0L'}
                        </p>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </section>

        {/* Trajetos (Ida e Volta) */}
        <section className="grid grid-cols-2 gap-6 avoid-break">
          <div className="space-y-3">
            <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] border-l-4 border-blue-600 pl-2">Trajeto Ida</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-[1.5rem] p-4 space-y-2">
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-[9px] font-black text-gray-400 uppercase">Origem</span>
                <span className="text-[10px] font-black">{trip.outbound.loadingCity || '---'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-[9px] font-black text-gray-400 uppercase">Empresa</span>
                <span className="text-[10px] font-black">{trip.outbound.company || '---'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-[9px] font-black text-gray-400 uppercase">Peso</span>
                <span className="text-[10px] font-black">{trip.outbound.weightTons ? `${trip.outbound.weightTons.toLocaleString()} kg` : '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[9px] font-black text-blue-600 uppercase">Valor Frete</span>
                <span className="text-[10px] font-black">{formatCurrency(Number(trip.outbound.value) || 0)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] border-l-4 border-orange-600 pl-2">Trajeto Volta</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-[1.5rem] p-4 space-y-2">
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-[9px] font-black text-gray-400 uppercase">Origem</span>
                <span className="text-[10px] font-black">{trip.inbound.loadingCity || '---'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-[9px] font-black text-gray-400 uppercase">Empresa</span>
                <span className="text-[10px] font-black">{trip.inbound.company || '---'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-[9px] font-black text-gray-400 uppercase">Peso</span>
                <span className="text-[10px] font-black">{trip.inbound.weightTons ? `${trip.inbound.weightTons.toLocaleString()} kg` : '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[9px] font-black text-orange-600 uppercase">Valor Frete</span>
                <span className="text-[10px] font-black">{formatCurrency(Number(trip.inbound.value) || 0)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Saúde da Frota (Óleos e Filtros) - EXCLUSIVO IMPRESSÃO */}
        <section className="space-y-3 avoid-break">
          <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] border-l-4 border-purple-600 pl-2">Saúde da Frota (Filtros e Óleos)</h2>
          <div className="grid grid-cols-5 gap-2">
            {maintenanceItems.map((item, idx) => {
              let usedValue = 0;
              if (item.isMonths) {
                if (item.data.installDate) {
                  const start = new Date(item.data.installDate + 'T12:00:00');
                  const now = new Date();
                  usedValue = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
                }
              } else {
                usedValue = currentKm > item.data.installKm ? currentKm - item.data.installKm : 0;
              }
              
              const threshold = item.threshold || 0;
              const progress = threshold > 0 ? Math.min((usedValue / threshold) * 100, 100) : 0;
              const isAlert = threshold > 0 && usedValue >= threshold;
              
              return (
                <div key={idx} className={`p-3 rounded-2xl border ${isAlert ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'} text-center`}>
                  <p className="text-[8px] font-black text-gray-400 uppercase mb-1 truncate">{item.label}</p>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Droplets size={10} className={isAlert ? 'text-red-600' : 'text-blue-600'} />
                    <span className={`text-[10px] font-black ${isAlert ? 'text-red-600' : 'text-gray-900'}`}>{progress.toFixed(0)}%</span>
                  </div>
                  <p className="text-[7px] font-bold text-gray-400 uppercase leading-none">Uso: {usedValue.toLocaleString()} {item.isMonths ? 'm' : 'km'}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Detalhamento de Despesas (UMA A UMA) - EXCLUSIVO IMPRESSÃO */}
        <section className="space-y-3 avoid-break">
          <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] border-l-4 border-red-600 pl-2">Detalhamento de Despesas (Uma a uma)</h2>
          <div className="bg-gray-50 border border-gray-100 rounded-[1.5rem] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-2 text-[8px] font-black text-gray-500 uppercase tracking-widest">Descrição / Categoria</th>
                  <th className="px-4 py-2 text-[8px] font-black text-gray-500 uppercase tracking-widest text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { label: 'Borracharia', value: Number(trip.expenses?.tireShop) || 0 },
                  { label: 'Enlonamento / Amarração', value: Number(trip.expenses?.binding) || 0 },
                  { label: 'Descarga', value: Number(trip.expenses?.unloading) || 0 },
                  { label: 'Gorjetas', value: Number(trip.expenses?.tip) || 0 },
                  { label: 'Lavagem', value: Number(trip.expenses?.wash) || 0 },
                  { label: 'Pedágio (Dinheiro)', value: Number(trip.expenses?.cashToll) || 0 },
                  { label: trip.expenses?.othersDesc || 'Outras Despesas', value: Number(trip.expenses?.othersValue) || 0 },
                  ...(trip.miscExpenses || []).map(me => ({ 
                    label: `${me.category}${me.description ? ` (${me.description})` : ''}`, 
                    value: me.value 
                  }))
                ].filter(exp => exp.value > 0).map((exp, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="px-4 py-2 text-[10px] font-bold text-gray-700 uppercase">{exp.label}</td>
                    <td className="px-4 py-2 text-[10px] font-black text-gray-900 text-right">{formatCurrency(exp.value)}</td>
                  </tr>
                ))}
                {(!trip.miscExpenses?.length && !Object.values(trip.expenses || {}).some(v => typeof v === 'number' && v > 0)) && (
                   <tr className="bg-white">
                     <td colSpan={2} className="px-4 py-4 text-[9px] font-bold text-gray-400 text-center uppercase italic">Nenhuma despesa registrada</td>
                   </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50/50">
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-2 text-[9px] font-black text-gray-900 uppercase">Total Detalhado</td>
                  <td className="px-4 py-2 text-[11px] font-black text-red-600 text-right">{formatCurrency(calcs.totalExpenses)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Resultado Empresa (IGUAL À TELA) */}
        <section className="space-y-3 avoid-break">
          <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] border-l-4 border-green-600 pl-2">Resultado Empresa</h2>
          <div className="bg-white text-black border-2 border-black rounded-[2rem] p-8 space-y-6">
             <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                   <span className="text-[10px] font-bold text-gray-500">Faturamento Total Bruto</span>
                   <span className="text-sm font-black">{formatCurrency(calcs.totalFreight)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                   <span className="text-[10px] font-medium">Comissão do Motorista (13%)</span>
                   <span className="text-sm font-bold">- {formatCurrency(calcs.commission)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                   <span className="text-[10px] font-medium">Combustível e Arla</span>
                   <span className="text-sm font-bold">- {formatCurrency(calcs.totalDieselCost)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                   <span className="text-[10px] font-medium">Despesas Operacionais Diversas</span>
                   <span className="text-sm font-bold">- {formatCurrency(calcs.totalExpenses)}</span>
                </div>
             </div>
             
             <div className="pt-6 border-t border-black flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Resultado Líquido</span>
                <span className="text-2xl font-black text-green-700">{formatCurrency(calcs.netProfit)}</span>
             </div>
          </div>
        </section>

        {/* Desempenho e Dados (Consumo) */}
        <section className="grid grid-cols-4 gap-3 pt-6 avoid-break">
           <div className="bg-gray-100 p-4 rounded-2xl text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">KM Rodado</p>
              <p className="text-xs font-black">{calcs.totalKm.toLocaleString()} KM</p>
           </div>
           <div className="bg-gray-100 p-4 rounded-2xl text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Média</p>
              <p className="text-xs font-black text-blue-600">{calcs.avgKmL} KM/L</p>
           </div>
           <div className="bg-gray-100 p-4 rounded-2xl text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Diesel</p>
              <p className="text-xs font-black">{calcs.totalLitersDiesel} L</p>
           </div>
           <div className="bg-gray-100 p-4 rounded-2xl text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Arla</p>
              <p className="text-xs font-black">{calcs.totalLitersArla} L</p>
           </div>
        </section>

      </div>
      
      {/* Rodapé Impressão */}
      <div className="mt-12 pt-6 border-t-2 border-black flex justify-between items-center opacity-30 text-[9px] font-black uppercase tracking-widest">
         <span>Becker e Mendonça Transportes</span>
         <span>TruckManager Pro v2.5</span>
         <span>Folha de Controle Analítico de Operação</span>
      </div>
    </div>
  );
};

// Funções auxiliares extraídas para reuso entre tela e impressão
const calculateSegments = (trip: Trip, allTrips: Trip[]) => {
  if (!trip.diesel || trip.diesel.length === 0) return [];
  
  const result = [];
  let prevStation = "Início da Viagem";
  
  const completedHistoricalTrips = allTrips.filter(t => t.status === 'completed' && t.plate === trip.plate && t.id !== trip.id);

  for (const entry of trip.diesel) {
    const startPoint = prevStation;
    const endPoint = entry.station;
    
    let historicalLitersPerTon: number[] = [];
    completedHistoricalTrips.forEach(ht => {
      if (!ht.diesel) return;
      let hPrevS = "Início da Viagem";
      for (const he of ht.diesel) {
        if (hPrevS === startPoint && he.station === endPoint) {
          const hWeight = (ht.outbound.weightTons || 0) + (ht.inbound.weightTons || 0);
          if (hWeight > 0) historicalLitersPerTon.push(he.litersDiesel / hWeight);
        }
        hPrevS = he.station;
      }
    });

    const currentWeight = (trip.outbound.weightTons || 0) + (trip.inbound.weightTons || 0);
    const real = Number(entry.litersDiesel) || 0;
    
    let meta = 0;
    let desvio = 0;
    let isInefficient = false;

    if (historicalLitersPerTon.length > 0) {
      const avgLitersPerTon = historicalLitersPerTon.reduce((a, b) => a + b, 0) / historicalLitersPerTon.length;
      meta = avgLitersPerTon * currentWeight;
      desvio = real - meta;
      isInefficient = desvio > 1;
    }

    result.push({ label: `${startPoint} → ${endPoint}`, real, meta, desvio, isInefficient });
    prevStation = entry.station;
  }
  return result;
};

const calculateTripData = (trip: Trip, allMiscExpenses: MiscExpense[]) => {
  const totalFreight = (Number(trip.outbound?.value) || 0) + (Number(trip.inbound?.value) || 0);
  const totalTollTag = (Number(trip.outbound?.tollTag) || 0) + (Number(trip.inbound?.tollTag) || 0);
  
  const totalAdvances = (
    (Number(trip.outbound?.advance) || 0) + 
    (Number(trip.outbound?.advanceMaintenance) || 0) + 
    (Number(trip.outbound?.advanceDiesel) || 0) +
    (Number(trip.inbound?.advance) || 0) + 
    (Number(trip.inbound?.advanceMaintenance) || 0) + 
    (Number(trip.inbound?.advanceDiesel) || 0)
  );
  
  const commission = (totalFreight + totalTollTag) * 0.13;
  const totalDieselCost = trip.diesel?.reduce((acc, d) => acc + (Number(d.totalCost) || 0), 0) || 0;
  const totalLitersDiesel = trip.diesel?.reduce((acc, d) => acc + (Number(d.litersDiesel) || 0), 0) || 0;
  const totalLitersArla = trip.diesel?.reduce((acc, d) => acc + (Number(d.litersArla) || 0), 0) || 0;

  // Soma todas as despesas do objeto expenses (legado/fixo)
  const legacyExpenses = (Number(trip.expenses?.tireShop) || 0) + 
                        (Number(trip.expenses?.binding) || 0) + 
                        (Number(trip.expenses?.unloading) || 0) + 
                        (Number(trip.expenses?.tip) || 0) + 
                        (Number(trip.expenses?.wash) || 0) + 
                        (Number(trip.expenses?.cashToll) || 0) + 
                        (Number(trip.expenses?.othersValue) || 0);

  // Soma as despesas da lista dinâmica da viagem
  const linkedMiscExpenses = trip.miscExpenses || [];
  const totalMiscExpenses = linkedMiscExpenses.reduce((acc, exp) => acc + (Number(exp.value) || 0), 0);
  
  const totalExpenses = legacyExpenses + totalMiscExpenses;

  const finalKmValue = Number(trip.endKm) || 0;
  const startKmValue = Number(trip.outbound.startKm) || 0;
  const totalKm = finalKmValue > startKmValue ? finalKmValue - startKmValue : 0;
  const avgKmL = totalLitersDiesel > 0 ? (totalKm / totalLitersDiesel).toFixed(2) : "0.00";

  return {
    totalFreight,
    totalAdvances,
    commission,
    totalDieselCost,
    totalLitersDiesel,
    totalLitersArla,
    totalExpenses,
    totalKm,
    avgKmL,
    netProfit: totalFreight - commission - totalDieselCost - totalExpenses,
    settlementResult: totalAdvances - totalDieselCost - totalExpenses
  };
};

export default ReportsView;
