import { Clock, MapPin } from 'lucide-react';

const events = [
  { title: 'Interview - Google', type: 'Interview', time: '10:00 AM', date: 'Today', location: 'Google Meet' },
  { title: 'Follow-up - Microsoft', type: 'Follow-up', time: '2:00 PM', date: 'Today', location: 'Email' },
  { title: 'Assessment - Amazon', type: 'Assessment', time: '9:00 AM', date: 'Tomorrow', location: 'Online' },
];

export default function CalendarPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your interviews, deadlines, and follow-ups.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold">March 2026</h2>
            <div className="flex gap-1">
              <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm">{'<'}</button>
              <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm">{'>'}</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1.5">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {Array.from({ length: 31 }, (_, i) => (
              <div key={i} className={`py-2 rounded-lg ${i + 1 === 15 ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted transition-colors'} ${[18, 20, 25].includes(i + 1) ? 'ring-1 ring-primary/30' : ''}`}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev.title} className="p-3 rounded-lg border border-border bg-muted/20">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ev.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ev.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>
                    </div>
                    <span className="text-xs text-primary font-medium mt-1.5 inline-block">{ev.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
