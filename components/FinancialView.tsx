
import React, { useState, useMemo } from 'react';
import { Trip, MiscExpense, User } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  User as UserIcon, 
  Gauge, 
  Calendar, 
  Download, 
  Printer, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Calculator,
  PieChart,
  BarChart3
} from 'lucide-react';

interface FinancialViewProps {
  trips: Trip[];
  miscExpenses: MiscExpense[];
  user: User;
}

type Period = 'Weekly' | 'Monthly' | 'Yearly' | 'All' | 'Custom';

const FinancialView: React.FC<FinancialViewProps> = ({ trips, miscExpenses, user }) => {
  const [period, setPeriod] = useState<Period>('Monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const filteredTrips = trips.filter(t => {
      if (!t.outbound.date) return false;
      const d = new Date(t.outbound.date + 'T12:00:00');
      
      if (period === 'Weekly') {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= lastWeek;
      }
      if (period === 'Monthly') {
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }
      if (period === 'Yearly') {
        return d.getFullYear() === currentYear;
      }
      if (period === 'Custom') {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        return d >= start && d <= end;
      }
      return true;
    });

    const filteredMisc = miscExpenses.filter(exp => {
      const d = new Date(exp.date + 'T12:00:00');
      if (period === 'Weekly') {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= lastWeek;
      }
      if (period === 'Monthly') {
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }
      if (period === 'Yearly') {
        return d.getFullYear() === currentYear;
      }
      if (period === 'Custom') {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        return d >= start && d <= end;
      }
      return true;
    });

    let totalFreight = 0;
    let totalDiesel = 0;
    let totalExpenses = 0;
    let totalKm = 0;
    let totalTollTag = 0;

    filteredTrips.forEach(t => {
      totalFreight += (Number(t.outbound?.value) || 0) + (Number(t.inbound?.value) || 0);
      totalTollTag += (Number(t.outbound?.tollTag) || 0) + (Number(t.inbound?.tollTag) || 0);
      totalDiesel += t.diesel?.reduce((acc, d) => acc + (Number(d.totalCost) || 0), 0) || 0;
      
      // Legacy expenses
      const legacy = (Number(t.expenses?.tireShop) || 0) + 
                    (Number(t.expenses?.binding) || 0) + 
                    (Number(t.expenses?.unloading) || 0) + 
                    (Number(t.expenses?.tip) || 0) + 
                    (Number(t.expenses?.wash) || 0) + 
                    (Number(t.expenses?.cashToll) || 0) + 
                    (Number(t.expenses?.othersValue) || 0);
      
      // Trip specific misc expenses
      const tripMisc = t.miscExpenses?.reduce((acc, exp) => acc + (Number(exp.value) || 0), 0) || 0;
      
      totalExpenses += legacy + tripMisc;

      const startKm = Number(t.outbound.startKm) || 0;
      const endKm = Number(t.endKm) || 0;
      if (endKm > startKm) {
        totalKm += (endKm - startKm);
      }
    });

    // Add global misc expenses
    const globalMisc = filteredMisc.reduce((acc, exp) => acc + (Number(exp.value) || 0), 0);
    totalExpenses += globalMisc;

    const commission = (totalFreight + totalTollTag) * 0.13;
    const netProfit = totalFreight - commission - totalDiesel - totalExpenses;

    return {
      totalFreight,
      totalDiesel,
      totalExpenses,
      totalKm,
      commission,
      netProfit,
      totalCosts: totalDiesel + totalExpenses + commission
    };
  }, [trips, miscExpenses, period, startDate, endDate]);

  const handlePrint = () => window.print();

  return (
    <div className="p-4 space-y-6 pb-28 animate-in fade-in duration-500 print:p-0 print:m-0 print:bg-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 1cm; }
          body { background: white !important; font-size: 12px !important; }
          h2 { font-size: 16px !important; }
          h4 { font-size: 16px !important; }
          p, span, div { font-size: 10px !important; }
          .print-value { font-size: 14px !important; font-weight: 900 !important; }
          .print-label { font-size: 10px !important; text-transform: uppercase !important; }
          .bg-gray-50, .bg-white { border: 1px solid #eee !important; background: transparent !important; }
          .shadow-sm, .shadow-lg { shadow: none !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}} />
      
      {/* Header & Filters */}
      <div className="flex flex-col gap-4 no-print">
        <div className="flex justify-between items-center px-2">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Consultivo Financeiro</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Visão geral de resultados</p>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all"
          >
            <Printer size={20} />
          </button>
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

      {/* Main Summary Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden print:rounded-none print:p-4 print:border-b-2 print:border-black">
        <div className="absolute top-0 right-0 p-8 opacity-5 print:hidden">
           <PieChart size={120} />
        </div>
        
        <div className="space-y-8 print:space-y-4">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 print-label">Lucro Líquido no Período</p>
            <h4 className={`text-5xl font-black tracking-tighter print-value ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.netProfit)}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 print:p-2 print:rounded-none">
               <div className="flex items-center gap-2 mb-2">
                 <TrendingUp size={14} className="text-blue-600" />
                 <p className="text-[9px] font-black text-gray-400 uppercase print-label">Faturamento</p>
               </div>
               <p className="text-lg font-black text-gray-900 print-value">{formatCurrency(stats.totalFreight)}</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 print:p-2 print:rounded-none">
               <div className="flex items-center gap-2 mb-2">
                 <Receipt size={14} className="text-red-500" />
                 <p className="text-[9px] font-black text-gray-400 uppercase print-label">Custos Totais</p>
               </div>
               <p className="text-lg font-black text-red-500 print-value">{formatCurrency(stats.totalCosts)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 gap-4 print:gap-2">
        
        {/* Comissão Card */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between print:p-3 print:rounded-none">
           <div className="flex items-center gap-4">
             <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl print:hidden"><UserIcon size={24}/></div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest print-label">Comissão Motorista</p>
                <p className="text-lg font-black text-gray-900 print-value">{formatCurrency(stats.commission)}</p>
             </div>
           </div>
           <div className="text-right">
             <p className="text-[8px] font-black text-gray-400 uppercase print-label">Base: 13%</p>
           </div>
        </div>

        {/* Despesas Card */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between print:p-3 print:rounded-none">
           <div className="flex items-center gap-4">
             <div className="p-4 bg-red-50 text-red-600 rounded-2xl print:hidden"><Calculator size={24}/></div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest print-label">Despesas Operacionais</p>
                <p className="text-lg font-black text-gray-900 print-value">{formatCurrency(stats.totalExpenses)}</p>
             </div>
           </div>
           <div className="text-right">
             <p className="text-[8px] font-black text-gray-400 uppercase print-label">Diversos</p>
           </div>
        </div>

        {/* Diesel Card */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between print:p-3 print:rounded-none">
           <div className="flex items-center gap-4">
             <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl print:hidden"><Receipt size={24}/></div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest print-label">Combustível / Arla</p>
                <p className="text-lg font-black text-gray-900 print-value">{formatCurrency(stats.totalDiesel)}</p>
             </div>
           </div>
           <div className="text-right">
             <p className="text-[8px] font-black text-gray-400 uppercase print-label">Diesel</p>
           </div>
        </div>

        {/* KM Card */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between print:p-3 print:rounded-none">
           <div className="flex items-center gap-4">
             <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl print:hidden"><Gauge size={24}/></div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest print-label">KM Percorrido</p>
                <p className="text-lg font-black text-gray-900 print-value">{stats.totalKm.toLocaleString()} KM</p>
             </div>
           </div>
           <div className="text-right">
             <p className="text-[8px] font-black text-gray-400 uppercase print-label">No Período</p>
           </div>
        </div>

      </div>

      {/* Print Only Footer */}
      <div className="hidden print:block pt-4 border-t-2 border-black mt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-black uppercase print-label" style={{ fontSize: '12px !important' }}>Becker e Mendonça Transportes</p>
            <p className="text-[10px] text-gray-500 uppercase print-label">Relatório Consolidado de Resultados</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold print-label">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
            <p className="text-[10px] font-bold print-label">Placa: {user.plate}</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FinancialView;
