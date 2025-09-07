import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Users, 
  Trophy, 
  TrendingUp, 
  Plus, 
  BarChart3, 
  Clock, 
  MapPin, 
  Filter,
  X,
  Star,
  Award,
  CheckCircle2,
  Eye,
  UserCheck,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Settings,
  BookOpen,
  UserPlus,
  Heart,
  Home,
  LogOut,
  Menu,
  ArrowLeft,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Types based on PostgreSQL schema
type UserRole = 'student' | 'admin';
type EventCategory = 'Workshop' | 'Fest' | 'Seminar' | 'Tech Talk' | 'Hackathon';
type AppMode = 'admin' | 'student';

interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

interface Event {
  event_id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  category: EventCategory;
  created_by: number;
  created_at: string;
}

interface Registration {
  registration_id: number;
  student_id: number;
  event_id: number;
  registration_date: string;
  checked_in: boolean;
}

interface EventWithStats extends Event {
  total_registrations: number;
  checkin_rate: number;
}

interface TopStudent {
  user_id: number;
  full_name: string;
  total_checkins: number;
  rank: number;
}

interface EventWithRegistration extends Event {
  is_registered: boolean;
  registration_id?: number;
}

// Mock Data
const initialUsers: User[] = [
  { user_id: 1, full_name: 'Dr. Sarah Mitchell', email: 'sarah.mitchell@college.edu', role: 'admin', created_at: '2024-01-01T00:00:00Z' },
  { user_id: 2, full_name: 'Prof. James Wilson', email: 'james.wilson@college.edu', role: 'admin', created_at: '2024-01-01T00:00:00Z' },
  { user_id: 3, full_name: 'Alex Chen', email: 'alex.chen@student.edu', role: 'student', created_at: '2024-01-15T00:00:00Z' },
  { user_id: 4, full_name: 'Emma Rodriguez', email: 'emma.rodriguez@student.edu', role: 'student', created_at: '2024-01-16T00:00:00Z' },
  { user_id: 5, full_name: 'Michael Johnson', email: 'michael.johnson@student.edu', role: 'student', created_at: '2024-01-17T00:00:00Z' },
  { user_id: 6, full_name: 'Sophia Kim', email: 'sophia.kim@student.edu', role: 'student', created_at: '2024-01-18T00:00:00Z' },
  { user_id: 7, full_name: 'David Brown', email: 'david.brown@student.edu', role: 'student', created_at: '2024-01-19T00:00:00Z' },
  { user_id: 8, full_name: 'Lisa Wang', email: 'lisa.wang@student.edu', role: 'student', created_at: '2024-01-20T00:00:00Z' },
  { user_id: 9, full_name: 'Carlos Garcia', email: 'carlos.garcia@student.edu', role: 'student', created_at: '2024-01-21T00:00:00Z' },
  { user_id: 10, full_name: 'Maya Patel', email: 'maya.patel@student.edu', role: 'student', created_at: '2024-01-22T00:00:00Z' },
  { user_id: 11, full_name: 'Ryan Thompson', email: 'ryan.thompson@student.edu', role: 'student', created_at: '2024-01-23T00:00:00Z' },
  { user_id: 12, full_name: 'Zoe Davis', email: 'zoe.davis@student.edu', role: 'student', created_at: '2024-01-24T00:00:00Z' }
];

const initialEvents: Event[] = [
  { event_id: 1, title: 'AI Workshop: Introduction to Machine Learning', description: 'Learn the fundamentals of machine learning and AI applications in this comprehensive workshop. Suitable for beginners and intermediate learners.', event_date: '2024-02-15T14:00:00Z', location: 'Computer Science Building, Room 101', category: 'Workshop', created_by: 1, created_at: '2024-01-25T00:00:00Z' },
  { event_id: 2, title: 'Spring Tech Fest 2024', description: 'Annual technology festival featuring student projects, industry speakers, and networking opportunities. Join us for an exciting day of innovation and learning.', event_date: '2024-03-20T09:00:00Z', location: 'Main Campus Auditorium', category: 'Fest', created_by: 1, created_at: '2024-01-26T00:00:00Z' },
  { event_id: 3, title: 'Cybersecurity in Modern World', description: 'Seminar on current cybersecurity threats and protection strategies. Learn from industry experts about the latest security trends.', event_date: '2024-02-28T16:00:00Z', location: 'Engineering Building, Hall A', category: 'Seminar', created_by: 2, created_at: '2024-01-27T00:00:00Z' },
  { event_id: 4, title: 'Google Tech Talk: Cloud Computing', description: 'Industry experts from Google discuss cloud technologies and career opportunities. Get insights into modern cloud infrastructure and development practices.', event_date: '2024-03-05T15:30:00Z', location: 'Main Campus Auditorium', category: 'Tech Talk', created_by: 1, created_at: '2024-01-28T00:00:00Z' },
  { event_id: 5, title: 'HackCollege 2024', description: '48-hour hackathon focused on solving real-world problems. Form teams, build innovative solutions, and compete for amazing prizes.', event_date: '2024-04-12T18:00:00Z', location: 'Innovation Lab', category: 'Hackathon', created_by: 2, created_at: '2024-01-29T00:00:00Z' },
  { event_id: 6, title: 'Web Development Bootcamp', description: 'Intensive workshop covering modern web development frameworks including React, Node.js, and database integration.', event_date: '2024-02-22T10:00:00Z', location: 'Computer Science Building, Room 205', category: 'Workshop', created_by: 1, created_at: '2024-01-30T00:00:00Z' },
  { event_id: 7, title: 'Cultural Fest: Unity in Diversity', description: 'Celebration of campus cultural diversity with performances, food, and cultural exchanges from around the world.', event_date: '2024-03-15T17:00:00Z', location: 'Central Quad', category: 'Fest', created_by: 2, created_at: '2024-01-31T00:00:00Z' },
  { event_id: 8, title: 'Research Methodology Seminar', description: 'Learn effective research techniques for academic and professional projects. Essential skills for graduate studies and research careers.', event_date: '2024-02-18T13:00:00Z', location: 'Library Conference Room', category: 'Seminar', created_by: 1, created_at: '2024-02-01T00:00:00Z' },
  { event_id: 9, title: 'Microsoft Tech Talk: Azure and AI', description: 'Microsoft engineers discuss Azure cloud services and AI integration. Explore the future of cloud computing and artificial intelligence.', event_date: '2024-03-08T14:00:00Z', location: 'Business Building, Lecture Hall 1', category: 'Tech Talk', created_by: 2, created_at: '2024-02-02T00:00:00Z' },
  { event_id: 10, title: 'Mobile App Development Workshop', description: 'Build your first mobile app using React Native. Learn cross-platform development and deploy to both iOS and Android.', event_date: '2024-02-25T11:00:00Z', location: 'Computer Science Building, Room 301', category: 'Workshop', created_by: 1, created_at: '2024-02-03T00:00:00Z' },
  { event_id: 11, title: 'Data Science Challenge', description: 'Competitive hackathon focused on data analysis and visualization. Work with real datasets and compete for prizes.', event_date: '2024-04-05T09:00:00Z', location: 'Data Science Lab', category: 'Hackathon', created_by: 2, created_at: '2024-02-04T00:00:00Z' },
  { event_id: 12, title: 'Entrepreneurship Seminar', description: 'Learn about starting your own tech company from successful founders. Get practical advice on building and scaling startups.', event_date: '2024-03-12T16:30:00Z', location: 'Business Building, Conference Room A', category: 'Seminar', created_by: 1, created_at: '2024-02-05T00:00:00Z' },
  { event_id: 13, title: 'Gaming Development Workshop', description: 'Create your first game using Unity and C#. Learn game design principles and development best practices.', event_date: '2024-03-01T10:30:00Z', location: 'Media Arts Building, Studio 1', category: 'Workshop', created_by: 2, created_at: '2024-02-06T00:00:00Z' },
  { event_id: 14, title: 'Alumni Tech Talk: Career Paths', description: 'Recent graduates share their career journeys in technology. Get insights into different career paths and industry trends.', event_date: '2024-03-18T15:00:00Z', location: 'Main Campus Auditorium', category: 'Tech Talk', created_by: 1, created_at: '2024-02-07T00:00:00Z' },
  { event_id: 15, title: 'Innovation Showcase', description: 'Student projects and research presentations with industry judges. Showcase your innovative ideas and get feedback from experts.', event_date: '2024-04-20T13:00:00Z', location: 'Innovation Center', category: 'Fest', created_by: 2, created_at: '2024-02-08T00:00:00Z' }
];

const initialRegistrations: Registration[] = [
  // Alex Chen - Most active student (7 checkins)
  { registration_id: 1, student_id: 3, event_id: 1, registration_date: '2024-02-10T00:00:00Z', checked_in: true },
  { registration_id: 2, student_id: 3, event_id: 3, registration_date: '2024-02-20T00:00:00Z', checked_in: true },
  { registration_id: 3, student_id: 3, event_id: 4, registration_date: '2024-02-25T00:00:00Z', checked_in: true },
  { registration_id: 4, student_id: 3, event_id: 6, registration_date: '2024-02-15T00:00:00Z', checked_in: true },
  { registration_id: 5, student_id: 3, event_id: 8, registration_date: '2024-02-12T00:00:00Z', checked_in: true },
  { registration_id: 6, student_id: 3, event_id: 10, registration_date: '2024-02-18T00:00:00Z', checked_in: true },
  { registration_id: 7, student_id: 3, event_id: 13, registration_date: '2024-02-22T00:00:00Z', checked_in: true },
  
  // Emma Rodriguez - Second most active (6 checkins)
  { registration_id: 8, student_id: 4, event_id: 1, registration_date: '2024-02-11T00:00:00Z', checked_in: true },
  { registration_id: 9, student_id: 4, event_id: 2, registration_date: '2024-02-28T00:00:00Z', checked_in: true },
  { registration_id: 10, student_id: 4, event_id: 4, registration_date: '2024-02-26T00:00:00Z', checked_in: true },
  { registration_id: 11, student_id: 4, event_id: 6, registration_date: '2024-02-16T00:00:00Z', checked_in: true },
  { registration_id: 12, student_id: 4, event_id: 9, registration_date: '2024-02-24T00:00:00Z', checked_in: true },
  { registration_id: 13, student_id: 4, event_id: 12, registration_date: '2024-02-27T00:00:00Z', checked_in: true },
  
  // Michael Johnson - Third most active (5 checkins)
  { registration_id: 14, student_id: 5, event_id: 1, registration_date: '2024-02-09T00:00:00Z', checked_in: true },
  { registration_id: 15, student_id: 5, event_id: 3, registration_date: '2024-02-21T00:00:00Z', checked_in: true },
  { registration_id: 16, student_id: 5, event_id: 7, registration_date: '2024-03-01T00:00:00Z', checked_in: true },
  { registration_id: 17, student_id: 5, event_id: 10, registration_date: '2024-02-19T00:00:00Z', checked_in: true },
  { registration_id: 18, student_id: 5, event_id: 14, registration_date: '2024-03-05T00:00:00Z', checked_in: true },
  
  // Other students with various activity levels
  { registration_id: 19, student_id: 6, event_id: 2, registration_date: '2024-03-01T00:00:00Z', checked_in: true },
  { registration_id: 20, student_id: 6, event_id: 5, registration_date: '2024-03-15T00:00:00Z', checked_in: false },
  { registration_id: 21, student_id: 6, event_id: 11, registration_date: '2024-03-20T00:00:00Z', checked_in: true },
  { registration_id: 22, student_id: 6, event_id: 15, registration_date: '2024-04-01T00:00:00Z', checked_in: true },
  
  { registration_id: 23, student_id: 7, event_id: 1, registration_date: '2024-02-08T00:00:00Z', checked_in: false },
  { registration_id: 24, student_id: 7, event_id: 8, registration_date: '2024-02-13T00:00:00Z', checked_in: true },
  { registration_id: 25, student_id: 7, event_id: 12, registration_date: '2024-02-28T00:00:00Z', checked_in: true },
  
  { registration_id: 26, student_id: 8, event_id: 4, registration_date: '2024-02-27T00:00:00Z', checked_in: true },
  { registration_id: 27, student_id: 8, event_id: 7, registration_date: '2024-03-02T00:00:00Z', checked_in: false },
  { registration_id: 28, student_id: 8, event_id: 9, registration_date: '2024-02-25T00:00:00Z', checked_in: true },
  { registration_id: 29, student_id: 8, event_id: 13, registration_date: '2024-02-23T00:00:00Z', checked_in: true },
  
  { registration_id: 30, student_id: 9, event_id: 2, registration_date: '2024-03-03T00:00:00Z', checked_in: true },
  { registration_id: 31, student_id: 9, event_id: 6, registration_date: '2024-02-17T00:00:00Z', checked_in: false },
  { registration_id: 32, student_id: 9, event_id: 11, registration_date: '2024-03-21T00:00:00Z', checked_in: true },
  
  { registration_id: 33, student_id: 10, event_id: 3, registration_date: '2024-02-22T00:00:00Z', checked_in: true },
  { registration_id: 34, student_id: 10, event_id: 5, registration_date: '2024-03-16T00:00:00Z', checked_in: false },
  { registration_id: 35, student_id: 10, event_id: 14, registration_date: '2024-03-06T00:00:00Z', checked_in: true },
  
  { registration_id: 36, student_id: 11, event_id: 1, registration_date: '2024-02-07T00:00:00Z', checked_in: true },
  { registration_id: 37, student_id: 11, event_id: 8, registration_date: '2024-02-14T00:00:00Z', checked_in: false },
  { registration_id: 38, student_id: 11, event_id: 15, registration_date: '2024-04-02T00:00:00Z', checked_in: true },
  
  { registration_id: 39, student_id: 12, event_id: 4, registration_date: '2024-02-29T00:00:00Z', checked_in: true },
  { registration_id: 40, student_id: 12, event_id: 7, registration_date: '2024-03-04T00:00:00Z', checked_in: true }
];

// ============= CAMPUS EVENT PLATFORM MAIN COMPONENT =============
const CampusEventPlatform: React.FC = () => {
  // Global State Management
  const [users] = useState<User[]>(initialUsers);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  
  // App State
  const [appMode, setAppMode] = useState<AppMode>('admin');
  const [currentUserId] = useState<number>(appMode === 'admin' ? 1 : 3);
  const [page, setPage] = useState<string>('dashboard');
  
  // UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  
  const { toast } = useToast();

  // Mock API Functions with State Mutation
  const mockAPI = {
    async fetchEvents(): Promise<Event[]> {
      await new Promise(resolve => setTimeout(resolve, 300));
      return events;
    },
    
    async fetchEventWithStats(): Promise<EventWithStats[]> {
      await new Promise(resolve => setTimeout(resolve, 400));
      return events.map(event => {
        const eventRegistrations = registrations.filter(r => r.event_id === event.event_id);
        const checkedIn = eventRegistrations.filter(r => r.checked_in).length;
        return {
          ...event,
          total_registrations: eventRegistrations.length,
          checkin_rate: eventRegistrations.length > 0 ? Math.round((checkedIn / eventRegistrations.length) * 100) : 0
        };
      });
    },
    
    async fetchTopStudents(): Promise<TopStudent[]> {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const studentCheckins = registrations
        .filter(r => r.checked_in)
        .reduce((acc, reg) => {
          acc[reg.student_id] = (acc[reg.student_id] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);
      
      const topStudents = Object.entries(studentCheckins)
        .map(([studentId, checkins]) => {
          const student = users.find(u => u.user_id === parseInt(studentId));
          return {
            user_id: parseInt(studentId),
            full_name: student?.full_name || 'Unknown',
            total_checkins: checkins,
            rank: 0
          };
        })
        .sort((a, b) => b.total_checkins - a.total_checkins)
        .slice(0, 3)
        .map((student, index) => ({ ...student, rank: index + 1 }));
      
      return topStudents;
    },
    
    async fetchRecentRegistrations(): Promise<Array<{ student_name: string; event_title: string; registration_date: string }>> {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const recent = registrations
        .sort((a, b) => new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime())
        .slice(0, 5)
        .map(reg => {
          const student = users.find(u => u.user_id === reg.student_id);
          const event = events.find(e => e.event_id === reg.event_id);
          return {
            student_name: student?.full_name || 'Unknown',
            event_title: event?.title || 'Unknown Event',
            registration_date: reg.registration_date
          };
        });
      
      return recent;
    },
    
    async createEvent(eventData: Omit<Event, 'event_id' | 'created_at'>): Promise<Event> {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newEvent: Event = {
        ...eventData,
        event_id: Math.max(...events.map(e => e.event_id)) + 1,
        created_at: new Date().toISOString()
      };
      
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    },
    
    async updateEvent(eventId: number, eventData: Partial<Event>): Promise<Event> {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const updatedEvent = { ...events.find(e => e.event_id === eventId)!, ...eventData };
      setEvents(prev => prev.map(e => e.event_id === eventId ? updatedEvent : e));
      return updatedEvent;
    },
    
    async deleteEvent(eventId: number): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setEvents(prev => prev.filter(e => e.event_id !== eventId));
      setRegistrations(prev => prev.filter(r => r.event_id !== eventId));
    },
    
    async registerForEvent(studentId: number, eventId: number): Promise<Registration> {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newRegistration: Registration = {
        registration_id: Math.max(...registrations.map(r => r.registration_id)) + 1,
        student_id: studentId,
        event_id: eventId,
        registration_date: new Date().toISOString(),
        checked_in: false
      };
      
      setRegistrations(prev => [...prev, newRegistration]);
      return newRegistration;
    },
    
    async unregisterFromEvent(studentId: number, eventId: number): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setRegistrations(prev => prev.filter(r => !(r.student_id === studentId && r.event_id === eventId)));
    },
    
    async checkInStudent(registrationId: number): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setRegistrations(prev => prev.map(r => 
        r.registration_id === registrationId ? { ...r, checked_in: true } : r
      ));
    },
    
    async fetchEventRegistrations(eventId: number): Promise<Array<{registration: Registration; student: User}>> {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const eventRegistrations = registrations.filter(r => r.event_id === eventId);
      return eventRegistrations.map(reg => ({
        registration: reg,
        student: users.find(u => u.user_id === reg.student_id)!
      }));
    },
    
    async fetchStudentEvents(studentId: number): Promise<EventWithRegistration[]> {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return events.map(event => {
        const registration = registrations.find(r => r.student_id === studentId && r.event_id === event.event_id);
        return {
          ...event,
          is_registered: !!registration,
          registration_id: registration?.registration_id
        };
      });
    }
  };

  // Helper Functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: EventCategory): string => {
    const colors = {
      'Workshop': 'bg-blue-600',
      'Fest': 'bg-purple-600',
      'Seminar': 'bg-green-600',
      'Tech Talk': 'bg-orange-600',
      'Hackathon': 'bg-red-600'
    };
    return colors[category];
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 2: return <Award className="h-8 w-8 text-gray-400" />;
      case 3: return <Star className="h-8 w-8 text-orange-600" />;
      default: return null;
    }
  };

  const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
    <div className={`animate-pulse bg-muted rounded ${className}`}></div>
  );

  const EmptyState: React.FC<{ icon: React.ComponentType<any>; title: string; description: string }> = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </div>
  );

  // ============= NAVIGATION COMPONENTS =============
  const AdminSidebar: React.FC = () => {
    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'events-list', label: 'Events', icon: Calendar },
      { id: 'reports', label: 'Reports', icon: TrendingUp }
    ];

    return (
      <div className="w-64 bg-card border-r border-border flex flex-col h-screen">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary">Campus Events</h1>
          <p className="text-sm text-muted-foreground">Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = page === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setPage(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-smooth ${
                      isActive 
                        ? 'bg-primary text-primary-foreground glow-effect' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setAppMode('student')}
            className="w-full"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Switch to Student
          </Button>
        </div>
      </div>
    );
  };

  const StudentHeader: React.FC = () => {
    const navItems = [
      { id: 'event-browser', label: 'Browse Events', icon: BookOpen },
      { id: 'my-events', label: 'My Events', icon: Heart }
    ];

    return (
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">Campus Events</h1>
            <Badge variant="secondary">Student Portal</Badge>
          </div>
          
          <nav className="flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = page === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon size={16} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
            
            <Button
              variant="outline"
              onClick={() => setAppMode('admin')}
              size="sm"
            >
              <Settings className="mr-2 h-4 w-4" />
              Switch to Admin
            </Button>
          </nav>
        </div>
      </header>
    );
  };

  // ============= ADMIN COMPONENTS =============
  const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ totalEvents: 0, totalRegistrations: 0, upcomingEvents: 0 });
    const [recentActivity, setRecentActivity] = useState<Array<{ student_name: string; event_title: string; registration_date: string }>>([]);
    const [dashboardLoading, setDashboardLoading] = useState(true);

    useEffect(() => {
      const loadDashboardData = async () => {
        setDashboardLoading(true);
        try {
          const [fetchedEvents, recent] = await Promise.all([
            mockAPI.fetchEvents(),
            mockAPI.fetchRecentRegistrations()
          ]);
          
          const upcoming = fetchedEvents.filter(e => new Date(e.event_date) > new Date()).length;
          
          setStats({
            totalEvents: fetchedEvents.length,
            totalRegistrations: registrations.length,
            upcomingEvents: upcoming
          });
          
          setRecentActivity(recent);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        } finally {
          setDashboardLoading(false);
        }
      };

      loadDashboardData();
    }, [registrations.length]);

    if (dashboardLoading) {
      return (
        <div className="space-y-8 p-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="gradient-card">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your campus events efficiently</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="gradient-card glow-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card glow-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card glow-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setPage('create-event')} 
                className="w-full justify-start glow-effect"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Event
              </Button>
              <Button 
                onClick={() => setPage('reports')} 
                variant="outline" 
                className="w-full justify-start"
                size="lg"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                View Reports
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <EmptyState 
                  icon={Users} 
                  title="No Recent Activity" 
                  description="No recent registrations to display."
                />
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.student_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.event_title}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(activity.registration_date).split(',')[0]}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const EventsList: React.FC = () => {
    const [eventsList, setEventsList] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [eventsLoading, setEventsLoading] = useState(true);
    const [deleteEventId, setDeleteEventId] = useState<number | null>(null);

    useEffect(() => {
      const loadEvents = async () => {
        setEventsLoading(true);
        try {
          const fetchedEvents = await mockAPI.fetchEvents();
          setEventsList(fetchedEvents);
          setFilteredEvents(fetchedEvents);
        } catch (error) {
          console.error('Error loading events:', error);
        } finally {
          setEventsLoading(false);
        }
      };

      loadEvents();
    }, [events]);

    useEffect(() => {
      let filtered = eventsList;
      
      if (searchTerm) {
        filtered = filtered.filter(event => 
          event.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(event => event.category === categoryFilter);
      }
      
      setFilteredEvents(filtered);
    }, [eventsList, searchTerm, categoryFilter]);

    const handleDeleteEvent = async (eventId: number) => {
      setLoading(true);
      try {
        await mockAPI.deleteEvent(eventId);
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
        setDeleteEventId(null);
        
        // Refresh events list
        const fetchedEvents = await mockAPI.fetchEvents();
        setEventsList(fetchedEvents);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete event",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (eventsLoading) {
      return (
        <div className="space-y-6 p-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="gradient-card">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Event Management</h1>
            <p className="text-muted-foreground mt-2">Create, edit, and manage campus events</p>
          </div>
          
          <Button onClick={() => setPage('create-event')} className="glow-effect">
            <Plus className="mr-2 h-4 w-4" />
            Create New Event
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
              <SelectItem value="Fest">Fest</SelectItem>
              <SelectItem value="Seminar">Seminar</SelectItem>
              <SelectItem value="Tech Talk">Tech Talk</SelectItem>
              <SelectItem value="Hackathon">Hackathon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <EmptyState 
            icon={Calendar} 
            title="No Events Found" 
            description="No events match your current search and filter criteria."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.event_id} className="gradient-card hover:elevated-card transition-smooth cursor-pointer">
                <CardHeader onClick={() => setPage(`event-detail/${event.event_id}`)}>
                  <div className="flex items-center justify-between">
                    <Badge className={`${getCategoryColor(event.category)} text-white`}>
                      {event.category}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPage(`event-edit/${event.event_id}`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{event.title}"? This action cannot be undone and will also remove all registrations for this event.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteEvent(event.event_id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Event
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                </CardHeader>
                <CardContent onClick={() => setPage(`event-detail/${event.event_id}`)}>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      {formatDate(event.event_date)}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      {event.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const EventDetail: React.FC<{ eventId: number }> = ({ eventId }) => {
    const [event, setEvent] = useState<Event | null>(null);
    const [eventRegistrations, setEventRegistrations] = useState<Array<{registration: Registration; student: User}>>([]);
    const [detailLoading, setDetailLoading] = useState(true);

    useEffect(() => {
      const loadEventDetails = async () => {
        setDetailLoading(true);
        try {
          const fetchedEvents = await mockAPI.fetchEvents();
          const foundEvent = fetchedEvents.find(e => e.event_id === eventId);
          setEvent(foundEvent || null);
          
          if (foundEvent) {
            const registrations = await mockAPI.fetchEventRegistrations(eventId);
            setEventRegistrations(registrations);
          }
        } catch (error) {
          console.error('Error loading event details:', error);
        } finally {
          setDetailLoading(false);
        }
      };

      loadEventDetails();
    }, [eventId, registrations]);

    const handleCheckIn = async (registrationId: number) => {
      setLoading(true);
      try {
        await mockAPI.checkInStudent(registrationId);
        toast({
          title: "Success",
          description: "Student checked in successfully",
        });
        
        // Refresh registrations
        const updatedRegistrations = await mockAPI.fetchEventRegistrations(eventId);
        setEventRegistrations(updatedRegistrations);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to check in student",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (detailLoading) {
      return (
        <div className="space-y-6 p-8">
          <Button variant="ghost" onClick={() => setPage('events-list')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      );
    }

    if (!event) {
      return (
        <div className="p-8">
          <Button variant="ghost" onClick={() => setPage('events-list')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          <EmptyState 
            icon={AlertCircle} 
            title="Event Not Found" 
            description="The requested event could not be found."
          />
        </div>
      );
    }

    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setPage('events-list')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setPage(`event-edit/${event.event_id}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Event
            </Button>
          </div>
        </div>

        <Card className="gradient-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge className={`${getCategoryColor(event.category)} text-white`}>
                {event.category}
              </Badge>
            </div>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{event.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-muted-foreground">
                <Clock className="mr-2 h-5 w-5" />
                <span>{formatDate(event.event_date)}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-5 w-5" />
                <span>{event.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registered Students */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Registered Students ({eventRegistrations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {eventRegistrations.length === 0 ? (
              <EmptyState 
                icon={Users} 
                title="No Registrations" 
                description="No students have registered for this event yet."
              />
            ) : (
              <div className="space-y-3">
                {eventRegistrations.map(({ registration, student }) => (
                  <div key={registration.registration_id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-muted-foreground">
                        Registered: {formatDate(registration.registration_date)}
                      </span>
                      
                      {registration.checked_in ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Checked In
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(registration.registration_id)}
                          disabled={loading}
                          className="glow-effect"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Check In
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const EventForm: React.FC<{ eventId?: number }> = ({ eventId }) => {
    const isEdit = !!eventId;
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      event_date: '',
      location: '',
      category: 'Workshop' as EventCategory
    });
    const [formLoading, setFormLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);

    useEffect(() => {
      if (isEdit) {
        const loadEvent = async () => {
          setInitialLoading(true);
          try {
            const fetchedEvents = await mockAPI.fetchEvents();
            const event = fetchedEvents.find(e => e.event_id === eventId);
            if (event) {
              setFormData({
                title: event.title,
                description: event.description,
                event_date: event.event_date.slice(0, 16), // Format for datetime-local input
                location: event.location,
                category: event.category
              });
            }
          } catch (error) {
            console.error('Error loading event:', error);
          } finally {
            setInitialLoading(false);
          }
        };
        loadEvent();
      }
    }, [isEdit, eventId]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormLoading(true);
      
      try {
        const eventData = {
          ...formData,
          event_date: new Date(formData.event_date).toISOString(),
          created_by: currentUserId
        };

        if (isEdit) {
          await mockAPI.updateEvent(eventId!, eventData);
          toast({
            title: "Success",
            description: "Event updated successfully",
          });
        } else {
          await mockAPI.createEvent(eventData);
          toast({
            title: "Success",
            description: "Event created successfully",
          });
        }
        
        setPage('events-list');
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to ${isEdit ? 'update' : 'create'} event`,
          variant: "destructive",
        });
      } finally {
        setFormLoading(false);
      }
    };

    if (initialLoading) {
      return (
        <div className="space-y-6 p-8">
          <Button variant="ghost" onClick={() => setPage('events-list')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          
          <div className="max-w-2xl space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setPage('events-list')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </div>

        <Card className="gradient-card max-w-2xl">
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Event' : 'Create New Event'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Event Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter event title"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter event description"
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={formData.category} onValueChange={(value: EventCategory) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Fest">Fest</SelectItem>
                      <SelectItem value="Seminar">Seminar</SelectItem>
                      <SelectItem value="Tech Talk">Tech Talk</SelectItem>
                      <SelectItem value="Hackathon">Hackathon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter event location"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setPage('events-list')}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={formLoading}
                  className="glow-effect"
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{isEdit ? 'Update Event' : 'Create Event'}</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  const ReportsPage: React.FC = () => {
    const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
    const [eventStats, setEventStats] = useState<EventWithStats[]>([]);
    const [filteredEventStats, setFilteredEventStats] = useState<EventWithStats[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [reportsLoading, setReportsLoading] = useState(true);

    useEffect(() => {
      const loadReports = async () => {
        setReportsLoading(true);
        try {
          const [students, events] = await Promise.all([
            mockAPI.fetchTopStudents(),
            mockAPI.fetchEventWithStats()
          ]);
          
          setTopStudents(students);
          setEventStats(events);
          setFilteredEventStats(events);
        } catch (error) {
          console.error('Error loading reports:', error);
        } finally {
          setReportsLoading(false);
        }
      };

      loadReports();
    }, [registrations]);

    useEffect(() => {
      if (categoryFilter === 'all') {
        setFilteredEventStats(eventStats);
      } else {
        setFilteredEventStats(eventStats.filter(event => event.category === categoryFilter));
      }
    }, [eventStats, categoryFilter]);

    if (reportsLoading) {
      return (
        <div className="space-y-8 p-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="gradient-card">
                <CardHeader>
                  <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-24 mx-auto" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold">Event & Student Reports</h1>
          <p className="text-muted-foreground mt-2">Analytics and insights for campus events</p>
        </div>

        {/* Top 3 Students */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Top 3 Most Active Students</h2>
          {topStudents.length === 0 ? (
            <EmptyState 
              icon={Trophy} 
              title="No Student Activity" 
              description="No students have checked into events yet."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topStudents.map((student) => (
                <Card key={student.user_id} className="gradient-card elevated-card text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4">
                      {getRankIcon(student.rank)}
                    </div>
                    <CardTitle className="text-lg">#{student.rank} {student.full_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {student.total_checkins}
                    </div>
                    <p className="text-muted-foreground">Events Attended</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Event Analytics */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-semibold">Event Analytics</h2>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
                <SelectItem value="Fest">Fest</SelectItem>
                <SelectItem value="Seminar">Seminar</SelectItem>
                <SelectItem value="Tech Talk">Tech Talk</SelectItem>
                <SelectItem value="Hackathon">Hackathon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredEventStats.length === 0 ? (
            <EmptyState 
              icon={BarChart3} 
              title="No Events Found" 
              description="No events match the selected category filter."
            />
          ) : (
            <Card className="gradient-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-medium">Event Title</th>
                        <th className="text-left p-4 font-medium">Category</th>
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-center p-4 font-medium">Registrations</th>
                        <th className="text-center p-4 font-medium">Check-in Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEventStats.map((event) => (
                        <tr key={event.event_id} className="border-b border-border hover:bg-muted/20">
                          <td className="p-4 font-medium">{event.title}</td>
                          <td className="p-4">
                            <Badge className={`${getCategoryColor(event.category)} text-white`}>
                              {event.category}
                            </Badge>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {formatDate(event.event_date)}
                          </td>
                          <td className="p-4 text-center font-semibold">
                            {event.total_registrations}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${event.checkin_rate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{event.checkin_rate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  // ============= STUDENT COMPONENTS =============
  const EventBrowser: React.FC = () => {
    const [availableEvents, setAvailableEvents] = useState<EventWithRegistration[]>([]);
    const [browserLoading, setBrowserLoading] = useState(true);

    useEffect(() => {
      const loadEvents = async () => {
        setBrowserLoading(true);
        try {
          const studentEvents = await mockAPI.fetchStudentEvents(currentUserId);
          setAvailableEvents(studentEvents);
        } catch (error) {
          console.error('Error loading events:', error);
        } finally {
          setBrowserLoading(false);
        }
      };

      loadEvents();
    }, [currentUserId, registrations]);

    const handleEventClick = (event: EventWithRegistration) => {
      setSelectedEventId(event.event_id);
      setShowEventModal(true);
    };

    if (browserLoading) {
      return (
        <div className="space-y-6 p-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="gradient-card">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold">Browse Events</h1>
          <p className="text-muted-foreground mt-2">Discover and register for campus events</p>
        </div>

        {availableEvents.length === 0 ? (
          <EmptyState 
            icon={Calendar} 
            title="No Events Available" 
            description="There are currently no events available for registration."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableEvents.map((event) => (
              <Card key={event.event_id} className="gradient-card hover:elevated-card transition-smooth cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={`${getCategoryColor(event.category)} text-white`}>
                      {event.category}
                    </Badge>
                    {event.is_registered && (
                      <Badge variant="default" className="bg-green-600">
                        Registered
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      {formatDate(event.event_date)}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      {event.location}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleEventClick(event)}
                    className="w-full glow-effect"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const MyEvents: React.FC = () => {
    const [myEvents, setMyEvents] = useState<EventWithRegistration[]>([]);
    const [myEventsLoading, setMyEventsLoading] = useState(true);

    useEffect(() => {
      const loadMyEvents = async () => {
        setMyEventsLoading(true);
        try {
          const studentEvents = await mockAPI.fetchStudentEvents(currentUserId);
          const registeredEvents = studentEvents.filter(event => event.is_registered);
          setMyEvents(registeredEvents);
        } catch (error) {
          console.error('Error loading my events:', error);
        } finally {
          setMyEventsLoading(false);
        }
      };

      loadMyEvents();
    }, [currentUserId, registrations]);

    const handleEventClick = (event: EventWithRegistration) => {
      setSelectedEventId(event.event_id);
      setShowEventModal(true);
    };

    if (myEventsLoading) {
      return (
        <div className="space-y-6 p-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="gradient-card">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground mt-2">Events you have registered for</p>
        </div>

        {myEvents.length === 0 ? (
          <EmptyState 
            icon={Heart} 
            title="No Registered Events" 
            description="You haven't registered for any events yet. Browse events to get started!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myEvents.map((event) => {
              const registration = registrations.find(r => r.student_id === currentUserId && r.event_id === event.event_id);
              
              return (
                <Card key={event.event_id} className="gradient-card hover:elevated-card transition-smooth cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className={`${getCategoryColor(event.category)} text-white`}>
                        {event.category}
                      </Badge>
                      {registration?.checked_in && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Attended
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{event.description}</p>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {formatDate(event.event_date)}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {event.location}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleEventClick(event)}
                      className="w-full glow-effect"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const EventDetailModal: React.FC = () => {
    const [modalEvent, setModalEvent] = useState<EventWithRegistration | null>(null);
    const [modalLoading, setModalLoading] = useState(true);

    useEffect(() => {
      if (selectedEventId && showEventModal) {
        const loadModalEvent = async () => {
          setModalLoading(true);
          try {
            const studentEvents = await mockAPI.fetchStudentEvents(currentUserId);
            const event = studentEvents.find(e => e.event_id === selectedEventId);
            setModalEvent(event || null);
          } catch (error) {
            console.error('Error loading event for modal:', error);
          } finally {
            setModalLoading(false);
          }
        };

        loadModalEvent();
      }
    }, [selectedEventId, showEventModal, currentUserId, registrations]);

    const handleRegistration = async () => {
      if (!modalEvent) return;

      setLoading(true);
      try {
        if (modalEvent.is_registered) {
          await mockAPI.unregisterFromEvent(currentUserId, modalEvent.event_id);
          toast({
            title: "Unregistered",
            description: "You have been unregistered from this event",
          });
        } else {
          await mockAPI.registerForEvent(currentUserId, modalEvent.event_id);
          toast({
            title: "Registered!",
            description: "You have successfully registered for this event",
          });
        }
        
        // Refresh the modal event data
        const studentEvents = await mockAPI.fetchStudentEvents(currentUserId);
        const updatedEvent = studentEvents.find(e => e.event_id === modalEvent.event_id);
        setModalEvent(updatedEvent || null);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update registration",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const handleCloseModal = () => {
      setShowEventModal(false);
      setSelectedEventId(null);
      setModalEvent(null);
    };

    if (!showEventModal || !selectedEventId) return null;

    return (
      <Dialog open={showEventModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          {modalLoading ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <div className="flex justify-end space-x-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          ) : modalEvent ? (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${getCategoryColor(modalEvent.category)} text-white`}>
                    {modalEvent.category}
                  </Badge>
                  {modalEvent.is_registered && (
                    <Badge variant="default" className="bg-green-600">
                      Registered
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-xl">{modalEvent.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <DialogDescription className="text-base">
                  {modalEvent.description}
                </DialogDescription>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-2 h-5 w-5" />
                    <span>{formatDate(modalEvent.event_date)}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-5 w-5" />
                    <span>{modalEvent.location}</span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={handleCloseModal}>
                    Close
                  </Button>
                  <Button 
                    onClick={handleRegistration}
                    disabled={loading}
                    className={modalEvent.is_registered ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "glow-effect"}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : modalEvent.is_registered ? (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Unregister
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Register Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6">
              <EmptyState 
                icon={AlertCircle} 
                title="Event Not Found" 
                description="The requested event could not be loaded."
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  // ============= MAIN RENDER LOGIC =============
  const renderPage = () => {
    if (appMode === 'admin') {
      if (page === 'dashboard') return <AdminDashboard />;
      if (page === 'events-list') return <EventsList />;
      if (page === 'create-event') return <EventForm />;
      if (page.startsWith('event-edit/')) {
        const eventId = parseInt(page.split('/')[1]);
        return <EventForm eventId={eventId} />;
      }
      if (page.startsWith('event-detail/')) {
        const eventId = parseInt(page.split('/')[1]);
        return <EventDetail eventId={eventId} />;
      }
      if (page === 'reports') return <ReportsPage />;
    } else {
      if (page === 'event-browser') return <EventBrowser />;
      if (page === 'my-events') return <MyEvents />;
    }
    
    // Default fallback
    return appMode === 'admin' ? <AdminDashboard /> : <EventBrowser />;
  };

  // Set initial page based on app mode
  useEffect(() => {
    if (appMode === 'admin' && !['dashboard', 'events-list', 'reports', 'create-event'].some(p => page.startsWith(p))) {
      setPage('dashboard');
    } else if (appMode === 'student' && !['event-browser', 'my-events'].includes(page)) {
      setPage('event-browser');
    }
  }, [appMode, page]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {appMode === 'admin' ? (
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1">
            {renderPage()}
          </main>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen">
          <StudentHeader />
          <main className="flex-1">
            {renderPage()}
          </main>
        </div>
      )}
      
      {/* Event Detail Modal for Student App */}
      <EventDetailModal />
    </div>
  );
};

export default CampusEventPlatform;
