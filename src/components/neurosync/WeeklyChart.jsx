import React from 'react';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function WeeklyChart({ logs }) {
  // Build last 7 days completion counts from logs
  const today = new Date();
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = DAYS[d.getDay()];
    const victories = logs.filter(l => l.date === dateStr && l.type === 'victory').length;
    const tasks = logs.filter(l => l.date === dateStr && (l.type === 'victory' || l.type === 'level')).length;
    const isToday = i === 6;
    return { dayName, dateStr, victories, tasks, isToday };
  });

  const maxVal = Math.max(...weekData.map(d => d.tasks), 1);

  return (
    <div className="bg-secondary/40 border border-border p-7 rounded-[2.5rem] shadow-xl">
      <h3 className="text-sm font-black text-white uppercase italic tracking-widest mb-6">Progresso Semanal</h3>
      <div className="flex items-end gap-2 h-28">
        {weekData.map((day, i) => {
          const heightPct = (day.tasks / maxVal) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full bg-background rounded-t-lg overflow-hidden" style={{ height: '90px' }}>
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 ${day.isToday ? 'bg-gradient-to-t from-purple-600 to-blue-500' : 'bg-secondary'}`}
                  style={{ height: `${Math.max(heightPct, day.tasks > 0 ? 15 : 0)}%`, marginTop: `${100 - Math.max(heightPct, day.tasks > 0 ? 15 : 0)}%` }}
                />
              </div>
              <span className={`text-[8px] font-black uppercase ${day.isToday ? 'text-purple-400' : 'text-muted-foreground'}`}>{day.dayName}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-between text-[8px] font-black text-muted-foreground uppercase">
        <span>Eventos na semana: {weekData.reduce((s, d) => s + d.tasks, 0)}</span>
        <span>Hoje: {weekData[6].tasks}</span>
      </div>
    </div>
  );
}