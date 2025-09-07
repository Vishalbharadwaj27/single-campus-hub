
import React, { useState, useEffect, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import {
  Users, Briefcase, BarChart, Calendar, PlusCircle, Search, Sliders, Trash2, Edit, X,
  CheckCircle, ArrowLeft, Trophy, User, Building, Clock, MapPin, ChevronDown, ChevronUp, LogOut, Sun, Moon
} from 'lucide-react';
import { useTheme } from './components/theme-provider';
import { Button } from './components/ui/button';

// --- TYPES ---
type UserRole = 'student' | 'admin';
type EventCategory = 'Workshop' | 'Fest' | 'Seminar' | 'Tech Talk' | 'Hackathon';

interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: UserRole;
}

interface Event {
  event_id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  category: EventCategory;
  created_by: number;
}

interface Registration {
  registration_id: number;
  student_id: number;
  event_id: number;
  registration_date: string;
  checked_in: boolean;
}

// --- MOCK DATA ---
const initialUsers: User[] = [
  { user_id: 1, full_name: 'Admin User', email: 'admin@campus.com', role: 'admin' },
  { user_id: 2, full_name: 'Jane Doe', email: 'jane.doe@campus.com', role: 'admin' },
  { user_id: 3, full_name: 'John Doe', email: 'john.doe@campus.com', role: 'student' },
  { user_id: 4, full_name: 'Peter Pan', email: 'peter.pan@campus.com', role: 'student' },
  { user_id: 5, full_name: 'Mary Poppins', email: 'mary.poppins@campus.com', role: 'student' },
];

const initialEvents: Event[] = [
  { event_id: 1, title: 'React Workshop', description: 'A deep dive into React hooks.', event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), location: 'Auditorium A', category: 'Workshop', created_by: 1 },
  { event_id: 2, title: 'Annual Tech Fest', description: 'The biggest tech fest on campus.', event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), location: 'Main Grounds', category: 'Fest', created_by: 1 },
  { event_id: 3, title: 'AI Seminar', description: 'Exploring the future of AI.', event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), location: 'Hall B', category: 'Seminar', created_by: 2 },
];

const initialRegistrations: Registration[] = [
  { registration_id: 1, student_id: 3, event_id: 1, registration_date: new Date().toISOString(), checked_in: false },
  { registration_id: 2, student_id: 4, event_id: 1, registration_date: new Date().toISOString(), checked_in: true },
  { registration_id: 3, student_id: 3, event_id: 2, registration_date: new Date().toISOString(), checked_in: false },
];

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [appMode, setAppMode] = useState<'admin' | 'student'>('admin');
  const [page, setPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  const loggedInUser = useMemo(() => {
    return users.find(u => u.user_id === (appMode === 'admin' ? 1 : 3));
  }, [appMode, users]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [page, appMode]);

  const mockAPI = {
    createEvent: async (event: Omit<Event, 'event_id' | 'created_by'>) => {
      return new Promise<Event>(resolve => {
        setTimeout(() => {
          const newEvent: Event = {
            ...event,
            event_id: Math.max(...events.map(e => e.event_id), 0) + 1,
            created_by: loggedInUser!.user_id,
          };
          setEvents(prev => [...prev, newEvent]);
          resolve(newEvent);
        }, 500);
      });
    },
    updateEvent: async (event_id: number, updates: Partial<Event>) => {
      return new Promise<Event>(resolve => {
        setTimeout(() => {
          let updatedEvent: Event | null = null;
          setEvents(prev => prev.map(e => {
            if (e.event_id === event_id) {
              updatedEvent = { ...e, ...updates };
              return updatedEvent;
            }
            return e;
          }));
          resolve(updatedEvent!);
        }, 500);
      });
    },
    deleteEvent: async (event_id: number) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          setEvents(prev => prev.filter(e => e.event_id !== event_id));
          setRegistrations(prev => prev.filter(r => r.event_id !== event_id));
          resolve();
        }, 500);
      });
    },
    createRegistration: async (event_id: number) => {
      return new Promise<Registration>(resolve => {
        setTimeout(() => {
          const newRegistration: Registration = {
            registration_id: Math.max(...registrations.map(r => r.registration_id), 0) + 1,
            student_id: loggedInUser!.user_id,
            event_id,
            registration_date: new Date().toISOString(),
            checked_in: false,
          };
          setRegistrations(prev => [...prev, newRegistration]);
          resolve(newRegistration);
        }, 300);
      });
    },
    deleteRegistration: async (event_id: number) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          setRegistrations(prev => prev.filter(r => !(r.event_id === event_id && r.student_id === loggedInUser!.user_id)));
          resolve();
        }, 300);
      });
    },
    checkIn: async (registration_id: number) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          setRegistrations(prev => prev.map(r => r.registration_id === registration_id ? { ...r, checked_in: true } : r));
          resolve();
        }, 300);
      });
    }
  };

  const renderPage = () => {
    if (appMode === 'admin') {
      if (page === 'dashboard') return <AdminDashboard />;
      if (page === 'events-list') return <EventManagement />;
      if (page.startsWith('event-detail/')) {
        const eventId = parseInt(page.split('/')[1]);
        return <EventDetail eventId={eventId} />;
      }
      if (page === 'create-event' || page.startsWith('event-edit/')) {
        const eventId = page.startsWith('event-edit/') ? parseInt(page.split('/')[1]) : undefined;
        return <EventForm eventId={eventId} />;
      }
      if (page === 'reports') return <Reports />;
    } else {
      if (page === 'event-browser') return <StudentEventBrowser />;
      if (page === 'my-events') return <StudentMyEvents />;
    }
    return <div className="text-center p-8">Page not found</div>;
  };

  const AdminDashboard = () => {
    const upcomingEvents = events.filter(e => new Date(e.event_date) > new Date()).length;
    const recentRegistrations = [...registrations].sort((a, b) => new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime()).slice(0, 5);

    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Events" value={events.length} icon={<Calendar />} />
          <StatCard title="Total Registrations" value={registrations.length} icon={<Users />} />
          <StatCard title="Upcoming Events" value={upcomingEvents} icon={<Briefcase />} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            {loading ? <SkeletonList count={5} /> :
              recentRegistrations.length > 0 ? (
                <ul>
                  {recentRegistrations.map(reg => {
                    const student = users.find(u => u.user_id === reg.student_id);
                    const event = events.find(e => e.event_id === reg.event_id);
                    return (
                      <li key={reg.registration_id} className="flex items-center justify-between py-2 border-b border-gray-700">
                        <div>
                          <p className="font-semibold">{student?.full_name}</p>
                          <p className="text-sm text-gray-400">registered for {event?.title}</p>
                        </div>
                        <p className="text-sm text-gray-500">{new Date(reg.registration_date).toLocaleTimeString()}</p>
                      </li>
                    );
                  })}
                </ul>
              ) : <EmptyState message="No recent activity." />}
          </div>
          <div className="bg-gray-800 p-6 rounded-lg flex flex-col justify-center items-center">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex gap-4">
              <button onClick={() => setPage('create-event')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                <PlusCircle size={20} /> Create New Event
              </button>
              <button onClick={() => setPage('reports')} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                <BarChart size={20} /> View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EventManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<EventCategory | 'all'>('all');
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

    const filteredEvents = useMemo(() => {
      return events
        .filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(e => filterCategory === 'all' || e.category === filterCategory);
    }, [events, searchTerm, filterCategory]);

    const handleDelete = async () => {
      if (eventToDelete) {
        await mockAPI.deleteEvent(eventToDelete.event_id);
        toast.success(`Event "${eventToDelete.title}" deleted successfully.`);
        setEventToDelete(null);
      }
    };

    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Event Management</h1>
          <button onClick={() => setPage('create-event')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
            <PlusCircle size={20} /> Create Event
          </button>
        </div>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search events by title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value as EventCategory | 'all')}
              className="appearance-none w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {(['Workshop', 'Fest', 'Seminar', 'Tech Talk', 'Hackathon'] as EventCategory[]).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        {loading ? <SkeletonGrid /> :
          filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <div key={event.event_id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300 flex flex-col">
                  <div className="p-6 flex-grow cursor-pointer" onClick={() => setPage(`event-detail/${event.event_id}`)}>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <span className="text-xs font-semibold bg-blue-600 text-white px-2 py-1 rounded-full">{event.category}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-400 mb-2"><MapPin size={16} className="mr-2" /> {event.location}</div>
                    <div className="flex items-center text-sm text-gray-400"><Clock size={16} className="mr-2" /> {new Date(event.event_date).toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-900/50 px-6 py-3 flex justify-end gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setPage(`event-edit/${event.event_id}`); }} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"><Edit size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setEventToDelete(event); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-full"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState message="No events found." />}

        {eventToDelete && (
          <AlertDialog
            title="Are you sure?"
            description={`This will permanently delete the event "${eventToDelete.title}" and all its registrations. This action cannot be undone.`}
            onConfirm={handleDelete}
            onCancel={() => setEventToDelete(null)}
          />
        )}
      </div>
    );
  };

  const EventDetail = ({ eventId }: { eventId: number }) => {
    const event = events.find(e => e.event_id === eventId);
    const eventRegistrations = registrations.filter(r => r.event_id === eventId);

    const handleCheckIn = async (registration_id: number) => {
      await mockAPI.checkIn(registration_id);
      toast.success("Student checked in successfully.");
    };

    if (!event) return <div className="p-8 text-center">Event not found.</div>;

    return (
      <div className="p-8">
        <button onClick={() => setPage('events-list')} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft size={20} /> Back to Events
        </button>
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <span className="text-sm font-semibold bg-blue-600 text-white px-3 py-1 rounded-full">{event.category}</span>
          </div>
          <p className="text-gray-300 mb-6">{event.description}</p>
          <div className="flex flex-wrap gap-6 text-gray-400">
            <div className="flex items-center gap-2"><MapPin size={18} /> {event.location}</div>
            <div className="flex items-center gap-2"><Clock size={18} /> {new Date(event.event_date).toLocaleString()}</div>
            <div className="flex items-center gap-2"><User size={18} /> Created by {users.find(u => u.user_id === event.created_by)?.full_name}</div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Registered Students ({eventRegistrations.length})</h2>
          {loading ? <SkeletonList count={5} /> :
            eventRegistrations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Registered On</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventRegistrations.map(reg => {
                      const student = users.find(u => u.user_id === reg.student_id);
                      return (
                        <tr key={reg.registration_id} className="border-b border-gray-700 hover:bg-gray-700/50">
                          <td className="p-3">{student?.full_name}</td>
                          <td className="p-3 text-gray-400">{student?.email}</td>
                          <td className="p-3 text-gray-400">{new Date(reg.registration_date).toLocaleDateString()}</td>
                          <td className="p-3 text-center">
                            {reg.checked_in ? (
                              <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-green-900 text-green-300">
                                <CheckCircle size={16} /> Checked In
                              </span>
                            ) : (
                              <button
                                onClick={() => handleCheckIn(reg.registration_id)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded-full text-sm"
                              >
                                Check-in
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState message="No students have registered for this event yet." />}
        </div>
      </div>
    );
  };

  const EventForm = ({ eventId }: { eventId?: number }) => {
    const isEditMode = eventId !== undefined;
    const eventToEdit = isEditMode ? events.find(e => e.event_id === eventId) : null;

    const [title, setTitle] = useState(eventToEdit?.title || '');
    const [description, setDescription] = useState(eventToEdit?.description || '');
    const [event_date, setEventDate] = useState(eventToEdit ? new Date(eventToEdit.event_date).toISOString().substring(0, 16) : '');
    const [location, setLocation] = useState(eventToEdit?.location || '');
    const [category, setCategory] = useState<EventCategory>(eventToEdit?.category || 'Workshop');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      const eventData = { title, description, event_date: new Date(event_date).toISOString(), location, category };

      try {
        if (isEditMode && eventId) {
          await mockAPI.updateEvent(eventId, eventData);
          toast.success(`Event "${title}" updated successfully.`);
        } else {
          await mockAPI.createEvent(eventData);
          toast.success(`Event "${title}" created successfully.`);
        }
        setPage('events-list');
      } catch (error) {
        toast.error("An error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="p-8 max-w-4xl mx-auto">
        <button onClick={() => setPage('events-list')} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft size={20} /> Back to Events
        </button>
        <h1 className="text-3xl font-bold mb-8">{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Event Title">
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
            </FormField>
            <FormField label="Category">
              <select value={category} onChange={e => setCategory(e.target.value as EventCategory)} required>
                {(['Workshop', 'Fest', 'Seminar', 'Tech Talk', 'Hackathon'] as EventCategory[]).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Description">
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} required />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Date and Time">
              <input type="datetime-local" value={event_date} onChange={e => setEventDate(e.target.value)} required />
            </FormField>
            <FormField label="Location">
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} required />
            </FormField>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => setPage('events-list')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-blue-800 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const Reports = () => {
    const [filterCategory, setFilterCategory] = useState<EventCategory | 'all'>('all');

    const topStudents = useMemo(() => {
      const studentStats = users
        .filter(u => u.role === 'student')
        .map(student => {
          const checkedInCount = registrations.filter(r => r.student_id === student.user_id && r.checked_in).length;
          return { ...student, checkedInCount };
        })
        .sort((a, b) => b.checkedInCount - a.checkedInCount)
        .slice(0, 3);
      return studentStats;
    }, [users, registrations]);

    const eventAnalytics = useMemo(() => {
      return events
        .filter(e => filterCategory === 'all' || e.category === filterCategory)
        .map(event => {
          const totalRegs = registrations.filter(r => r.event_id === event.event_id).length;
          const checkedInRegs = registrations.filter(r => r.event_id === event.event_id && r.checked_in).length;
          const checkInRate = totalRegs > 0 ? (checkedInRegs / totalRegs) * 100 : 0;
          return { ...event, totalRegs, checkInRate };
        });
    }, [events, registrations, filterCategory]);

    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Reports & Analytics</h1>
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Top 3 Students by Check-ins</h2>
          {loading ? <div className="flex justify-around"><Skeleton /><Skeleton /><Skeleton /></div> :
            topStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                {topStudents.map((student, index) => (
                  <div key={student.user_id} className={`p-6 rounded-lg border-2 ${index === 0 ? 'border-yellow-400 bg-yellow-400/10' : index === 1 ? 'border-gray-400 bg-gray-400/10' : 'border-yellow-700 bg-yellow-700/10'}`}>
                    <Trophy size={40} className={`mx-auto mb-4 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-yellow-700'}`} />
                    <h3 className="text-xl font-bold">{student.full_name}</h3>
                    <p className="text-gray-400">{student.email}</p>
                    <p className="text-3xl font-bold mt-4">{student.checkedInCount} <span className="text-lg font-normal">Check-ins</span></p>
                  </div>
                ))}
              </div>
            ) : <EmptyState message="No check-in data available." />}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Event Analytics</h2>
            <div className="relative">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value as EventCategory | 'all')}
                className="appearance-none w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {(['Workshop', 'Fest', 'Seminar', 'Tech Talk', 'Hackathon'] as EventCategory[]).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          {loading ? <SkeletonTable /> :
            eventAnalytics.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="p-3">Event Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-center">Registrations</th>
                      <th className="p-3 text-center">Check-in Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventAnalytics.map(event => (
                      <tr key={event.event_id} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="p-3 font-medium">{event.title}</td>
                        <td className="p-3"><span className="text-xs font-semibold bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{event.category}</span></td>
                        <td className="p-3 text-gray-400">{new Date(event.event_date).toLocaleDateString()}</td>
                        <td className="p-3 text-center font-medium">{event.totalRegs}</td>
                        <td className="p-3 text-center font-medium">{event.checkInRate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState message="No events found for this category." />}
        </div>
      </div>
    );
  };

  const StudentEventBrowser = () => {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Browse Events</h1>
        {loading ? <SkeletonGrid /> :
          events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <div key={event.event_id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300 flex flex-col">
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <span className="text-xs font-semibold bg-blue-600 text-white px-2 py-1 rounded-full">{event.category}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-400 mb-2"><MapPin size={16} className="mr-2" /> {event.location}</div>
                    <div className="flex items-center text-sm text-gray-400"><Clock size={16} className="mr-2" /> {new Date(event.event_date).toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-900/50 px-6 py-4">
                    <button onClick={() => setSelectedEvent(event)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState message="No events available at the moment." />}
        {selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      </div>
    );
  };

  const StudentMyEvents = () => {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const myEventIds = registrations.filter(r => r.student_id === loggedInUser!.user_id).map(r => r.event_id);
    const myEvents = events.filter(e => myEventIds.includes(e.event_id));

    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">My Registered Events</h1>
        {loading ? <SkeletonGrid /> :
          myEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map(event => (
                <div key={event.event_id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300 flex flex-col">
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <span className="text-xs font-semibold bg-blue-600 text-white px-2 py-1 rounded-full">{event.category}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-400 mb-2"><MapPin size={16} className="mr-2" /> {event.location}</div>
                    <div className="flex items-center text-sm text-gray-400"><Clock size={16} className="mr-2" /> {new Date(event.event_date).toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-900/50 px-6 py-4">
                    <button onClick={() => setSelectedEvent(event)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState message="You have not registered for any events yet." />}
        {selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      </div>
    );
  };

  const EventDetailModal = ({ event, onClose }: { event: Event, onClose: () => void }) => {
    const isRegistered = registrations.some(r => r.student_id === loggedInUser!.user_id && r.event_id === event.event_id);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async () => {
      setIsSubmitting(true);
      await mockAPI.createRegistration(event.event_id);
      toast.success(`Successfully registered for "${event.title}".`);
      setIsSubmitting(false);
    };

    const handleUnregister = async () => {
      setIsSubmitting(true);
      await mockAPI.deleteRegistration(event.event_id);
      toast.info(`You have unregistered from "${event.title}".`);
      setIsSubmitting(false);
    };

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold">{event.title}</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"><X size={24} /></button>
          </div>
          <div className="p-6 overflow-y-auto">
            <p className="text-gray-300 mb-6">{event.description}</p>
            <div className="space-y-4 text-gray-400">
              <div className="flex items-center gap-3"><MapPin size={20} className="text-blue-400" /> <span>{event.location}</span></div>
              <div className="flex items-center gap-3"><Clock size={20} className="text-blue-400" /> <span>{new Date(event.event_date).toLocaleString()}</span></div>
              <div className="flex items-center gap-3"><Sliders size={20} className="text-blue-400" /> <span>{event.category}</span></div>
              <div className="flex items-center gap-3"><User size={20} className="text-blue-400" /> <span>Event by {users.find(u => u.user_id === event.created_by)?.full_name}</span></div>
            </div>
          </div>
          <div className="p-6 border-t border-gray-700 mt-auto">
            {isRegistered ? (
              <button onClick={handleUnregister} disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-red-800">
                {isSubmitting ? 'Processing...' : 'Unregister'}
              </button>
            ) : (
              <button onClick={handleRegister} disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-green-800">
                {isSubmitting ? 'Processing...' : 'Register Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- LAYOUT & UI COMPONENTS ---
  const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <div className={`bg-gray-900 text-white min-h-screen flex`}>
        <Toaster richColors position="top-right" />
        {appMode === 'admin' && <AdminSidebar />}
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    );
  };

  const Header = () => {
    return (
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 flex justify-between items-center">
        {appMode === 'student' && (
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold flex items-center gap-2"><Building size={24} /> CampusHub</h1>
            <nav className="flex gap-4">
              <button onClick={() => setPage('event-browser')} className={`px-3 py-2 rounded-md text-sm font-medium ${page === 'event-browser' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Browse Events</button>
              <button onClick={() => setPage('my-events')} className={`px-3 py-2 rounded-md text-sm font-medium ${page === 'my-events' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>My Events</button>
            </nav>
          </div>
        )}
        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{appMode === 'admin' ? 'Admin' : 'Student'}</span>
            <Switch checked={appMode === 'student'} onCheckedChange={() => {
              setAppMode(prev => prev === 'admin' ? 'student' : 'admin');
              setPage(appMode === 'admin' ? 'event-browser' : 'dashboard');
            }} />
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-gray-700">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">{loggedInUser?.full_name.charAt(0)}</div>
            <span className="text-sm font-medium">{loggedInUser?.full_name}</span>
            <button className="p-2 rounded-full hover:bg-gray-700"><LogOut size={20} /></button>
          </div>
        </div>
      </header>
    );
  };

  const AdminSidebar = () => {
    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: <BarChart /> },
      { id: 'events-list', label: 'Events', icon: <Calendar /> },
      { id: 'reports', label: 'Reports', icon: <Briefcase /> },
    ];
    return (
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Building size={28} /> CampusHub</h1>
        </div>
        <nav className="flex-1 p-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${page.startsWith(item.id) ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700/50'}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </Button>
        </div>
      </aside>
    );
  };

  const StatCard = ({ title, value, icon }: { title: string, value: number | string, icon: React.ReactNode }) => (
    <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-6">
      <div className="p-3 bg-blue-600/20 text-blue-400 rounded-lg">{icon}</div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold">{value}</p>}
      </div>
    </div>
  );

  const FormField: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            className: 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          });
        }
        return child;
      })}
    </div>
  );

  const AlertDialog = ({ title, description, onConfirm, onCancel }: { title: string, description: string, onConfirm: () => void, onCancel: () => void }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-sm w-full">
        <div className="p-6">
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-gray-400 mt-2">{description}</p>
        </div>
        <div className="bg-gray-900/50 px-6 py-3 flex justify-end gap-3">
          <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
          <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Delete</button>
        </div>
      </div>
    </div>
  );

  const Switch = ({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (checked: boolean) => void }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`${checked ? 'bg-blue-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
    >
      <span
        aria-hidden="true"
        className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );

  const Skeleton = ({ className = '' }: { className?: string }) => <div className={`bg-gray-700 animate-pulse rounded ${className}`} />;
  const SkeletonList = ({ count }: { count: number }) => <div className="space-y-4">{Array.from({ length: count }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  const SkeletonGrid = () => <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}</div>;
  const SkeletonTable = () => <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>;
  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12">
      <p className="text-gray-500">{message}</p>
    </div>
  );

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
};

export default App;
