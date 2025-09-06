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
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Types based on PostgreSQL schema
type UserRole = 'student' | 'admin';
type EventCategory = 'Workshop' | 'Fest' | 'Seminar' | 'Tech Talk' | 'Hackathon';

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

// Mock Data
const mockUsers: User[] = [
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

const mockEvents: Event[] = [
  { event_id: 1, title: 'AI Workshop: Introduction to Machine Learning', description: 'Learn the fundamentals of machine learning and AI applications.', event_date: '2024-02-15T14:00:00Z', location: 'Computer Science Building, Room 101', category: 'Workshop', created_by: 1, created_at: '2024-01-25T00:00:00Z' },
  { event_id: 2, title: 'Spring Tech Fest 2024', description: 'Annual technology festival featuring student projects and industry speakers.', event_date: '2024-03-20T09:00:00Z', location: 'Main Campus Auditorium', category: 'Fest', created_by: 1, created_at: '2024-01-26T00:00:00Z' },
  { event_id: 3, title: 'Cybersecurity in Modern World', description: 'Seminar on current cybersecurity threats and protection strategies.', event_date: '2024-02-28T16:00:00Z', location: 'Engineering Building, Hall A', category: 'Seminar', created_by: 2, created_at: '2024-01-27T00:00:00Z' },
  { event_id: 4, title: 'Google Tech Talk: Cloud Computing', description: 'Industry experts from Google discuss cloud technologies and career opportunities.', event_date: '2024-03-05T15:30:00Z', location: 'Main Campus Auditorium', category: 'Tech Talk', created_by: 1, created_at: '2024-01-28T00:00:00Z' },
  { event_id: 5, title: 'HackCollege 2024', description: '48-hour hackathon focused on solving real-world problems.', event_date: '2024-04-12T18:00:00Z', location: 'Innovation Lab', category: 'Hackathon', created_by: 2, created_at: '2024-01-29T00:00:00Z' },
  { event_id: 6, title: 'Web Development Bootcamp', description: 'Intensive workshop covering modern web development frameworks.', event_date: '2024-02-22T10:00:00Z', location: 'Computer Science Building, Room 205', category: 'Workshop', created_by: 1, created_at: '2024-01-30T00:00:00Z' },
  { event_id: 7, title: 'Cultural Fest: Unity in Diversity', description: 'Celebration of campus cultural diversity with performances and food.', event_date: '2024-03-15T17:00:00Z', location: 'Central Quad', category: 'Fest', created_by: 2, created_at: '2024-01-31T00:00:00Z' },
  { event_id: 8, title: 'Research Methodology Seminar', description: 'Learn effective research techniques for academic and professional projects.', event_date: '2024-02-18T13:00:00Z', location: 'Library Conference Room', category: 'Seminar', created_by: 1, created_at: '2024-02-01T00:00:00Z' },
  { event_id: 9, title: 'Microsoft Tech Talk: Azure and AI', description: 'Microsoft engineers discuss Azure cloud services and AI integration.', event_date: '2024-03-08T14:00:00Z', location: 'Business Building, Lecture Hall 1', category: 'Tech Talk', created_by: 2, created_at: '2024-02-02T00:00:00Z' },
  { event_id: 10, title: 'Mobile App Development Workshop', description: 'Build your first mobile app using React Native.', event_date: '2024-02-25T11:00:00Z', location: 'Computer Science Building, Room 301', category: 'Workshop', created_by: 1, created_at: '2024-02-03T00:00:00Z' },
  { event_id: 11, title: 'Data Science Challenge', description: 'Competitive hackathon focused on data analysis and visualization.', event_date: '2024-04-05T09:00:00Z', location: 'Data Science Lab', category: 'Hackathon', created_by: 2, created_at: '2024-02-04T00:00:00Z' },
  { event_id: 12, title: 'Entrepreneurship Seminar', description: 'Learn about starting your own tech company from successful founders.', event_date: '2024-03-12T16:30:00Z', location: 'Business Building, Conference Room A', category: 'Seminar', created_by: 1, created_at: '2024-02-05T00:00:00Z' },
  { event_id: 13, title: 'Gaming Development Workshop', description: 'Create your first game using Unity and C#.', event_date: '2024-03-01T10:30:00Z', location: 'Media Arts Building, Studio 1', category: 'Workshop', created_by: 2, created_at: '2024-02-06T00:00:00Z' },
  { event_id: 14, title: 'Alumni Tech Talk: Career Paths', description: 'Recent graduates share their career journeys in technology.', event_date: '2024-03-18T15:00:00Z', location: 'Main Campus Auditorium', category: 'Tech Talk', created_by: 1, created_at: '2024-02-07T00:00:00Z' },
  { event_id: 15, title: 'Innovation Showcase', description: 'Student projects and research presentations with industry judges.', event_date: '2024-04-20T13:00:00Z', location: 'Innovation Center', category: 'Fest', created_by: 2, created_at: '2024-02-08T00:00:00Z' }
];

const mockRegistrations: Registration[] = [
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

// Mock API Functions
const mockAPI = {
  async fetchEvents(): Promise<Event[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockEvents;
  },
  
  async fetchEventWithStats(): Promise<EventWithStats[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockEvents.map(event => {
      const registrations = mockRegistrations.filter(r => r.event_id === event.event_id);
      const checkedIn = registrations.filter(r => r.checked_in).length;
      return {
        ...event,
        total_registrations: registrations.length,
        checkin_rate: registrations.length > 0 ? Math.round((checkedIn / registrations.length) * 100) : 0
      };
    });
  },
  
  async fetchTopStudents(): Promise<TopStudent[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const studentCheckins = mockRegistrations
      .filter(r => r.checked_in)
      .reduce((acc, reg) => {
        acc[reg.student_id] = (acc[reg.student_id] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
    
    const topStudents = Object.entries(studentCheckins)
      .map(([studentId, checkins]) => {
        const student = mockUsers.find(u => u.user_id === parseInt(studentId));
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
    
    const recent = mockRegistrations
      .sort((a, b) => new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime())
      .slice(0, 5)
      .map(reg => {
        const student = mockUsers.find(u => u.user_id === reg.student_id);
        const event = mockEvents.find(e => e.event_id === reg.event_id);
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
      event_id: Math.max(...mockEvents.map(e => e.event_id)) + 1,
      created_at: new Date().toISOString()
    };
    
    mockEvents.push(newEvent);
    return newEvent;
  }
};

// Component: Navigation Sidebar
const Sidebar: React.FC<{ currentPage: string; onPageChange: (page: string) => void }> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: TrendingUp }
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">Campus Events</h1>
        <p className="text-sm text-muted-foreground">Admin Portal</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
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
    </div>
  );
};

// Component: Admin Dashboard
const AdminDashboard: React.FC<{ onPageChange: (page: string) => void }> = ({ onPageChange }) => {
  const [stats, setStats] = useState({ totalEvents: 0, totalRegistrations: 0, upcomingEvents: 0 });
  const [recentActivity, setRecentActivity] = useState<Array<{ student_name: string; event_title: string; registration_date: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [events, registrations, recent] = await Promise.all([
          mockAPI.fetchEvents(),
          Promise.resolve(mockRegistrations),
          mockAPI.fetchRecentRegistrations()
        ]);
        
        const upcoming = events.filter(e => new Date(e.event_date) > new Date()).length;
        
        setStats({
          totalEvents: events.length,
          totalRegistrations: registrations.length,
          upcomingEvents: upcoming
        });
        
        setRecentActivity(recent);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your campus events efficiently</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gradient-card elevated-card transition-smooth hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Active events on platform</p>
          </CardContent>
        </Card>

        <Card className="gradient-card elevated-card transition-smooth hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">Student registrations</p>
          </CardContent>
        </Card>

        <Card className="gradient-card elevated-card transition-smooth hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">Events this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => onPageChange('create-event')}
              className="w-full gradient-primary glow-effect transition-bounce hover:scale-105"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Event
            </Button>
            
            <Button
              onClick={() => onPageChange('reports')}
              variant="secondary"
              className="w-full transition-smooth hover:bg-primary hover:text-primary-foreground"
              size="lg"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                  <UserCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.student_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.event_title}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.registration_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Preview Section */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-primary" />
            <span>Student Experience Preview</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">How events appear to students</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StudentEventCard />
            <div className="flex items-center justify-center">
              <Button 
                variant="outline" 
                className="transition-smooth hover:bg-primary hover:text-primary-foreground"
                onClick={() => {/* This would open the modal in a real app */}}
              >
                Preview Registration Modal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Component: Reporting Page
const ReportingPage: React.FC = () => {
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [eventsWithStats, setEventsWithStats] = useState<EventWithStats[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventWithStats[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReportsData = async () => {
      try {
        const [students, events] = await Promise.all([
          mockAPI.fetchTopStudents(),
          mockAPI.fetchEventWithStats()
        ]);
        
        setTopStudents(students);
        setEventsWithStats(events);
        setFilteredEvents(events);
      } catch (error) {
        console.error('Error loading reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReportsData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredEvents(eventsWithStats);
    } else {
      setFilteredEvents(eventsWithStats.filter(event => event.category === selectedCategory));
    }
  }, [selectedCategory, eventsWithStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getTrophyIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 2: return <Award className="h-8 w-8 text-gray-400" />;
      case 3: return <Star className="h-8 w-8 text-amber-600" />;
      default: return <Trophy className="h-8 w-8 text-primary" />;
    }
  };

  const getRankColors = (rank: number) => {
    switch (rank) {
      case 1: return 'border-yellow-500/30 bg-yellow-500/10';
      case 2: return 'border-gray-400/30 bg-gray-400/10';
      case 3: return 'border-amber-600/30 bg-amber-600/10';
      default: return 'border-primary/30 bg-primary/10';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Event & Student Reports</h1>
        <p className="text-muted-foreground mt-2">Analytics and insights for campus events</p>
      </div>

      {/* Top 3 Most Active Students */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-primary" />
          <span>Top 3 Most Active Students</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topStudents.map((student) => (
            <Card key={student.user_id} className={`gradient-card elevated-card transition-bounce hover:scale-105 border-2 ${getRankColors(student.rank)}`}>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {getTrophyIcon(student.rank)}
                </div>
                <div className="text-4xl font-bold text-primary mb-2">#{student.rank}</div>
                <h3 className="text-xl font-semibold mb-2">{student.full_name}</h3>
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-lg font-medium">{student.total_checkins} Events Attended</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Event Analytics */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Event Analytics</h2>
        
        <Card className="gradient-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-primary" />
                <span>Filter by Category</span>
              </CardTitle>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
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
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Event Title</th>
                    <th className="text-left py-3 px-4 font-semibold">Category</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-center py-3 px-4 font-semibold">Registrations</th>
                    <th className="text-center py-3 px-4 font-semibold">Check-in Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.event_id} className="border-b border-border/50 hover:bg-muted/30 transition-smooth">
                      <td className="py-3 px-4 font-medium">{event.title}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                          {event.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(event.event_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">{event.total_registrations}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-semibold ${event.checkin_rate >= 70 ? 'text-green-500' : event.checkin_rate >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {event.checkin_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Component: Event Form
const EventForm: React.FC<{ onPageChange: (page: string) => void }> = ({ onPageChange }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    category: '' as EventCategory | ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.event_date || !formData.location || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      await mockAPI.createEvent({
        ...formData,
        category: formData.category as EventCategory,
        created_by: 1 // Current admin user
      });
      
      toast({
        title: "Success",
        description: "Event created successfully!"
      });
      
      setFormData({
        title: '',
        description: '',
        event_date: '',
        location: '',
        category: ''
      });
      
      setTimeout(() => {
        onPageChange('events');
      }, 1000);
      
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create New Event</h1>
        <p className="text-muted-foreground mt-2">Add a new event to the campus calendar</p>
      </div>

      <Card className="gradient-card">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Event Title</label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
                className="transition-smooth focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your event"
                rows={4}
                className="transition-smooth focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="event_date" className="text-sm font-medium">Date & Time</label>
                <Input
                  id="event_date"
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="transition-smooth focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as EventCategory })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">Location</label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Event location"
                className="transition-smooth focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 gradient-primary glow-effect transition-bounce hover:scale-105"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={() => onPageChange('events')}
                className="transition-smooth hover:bg-primary hover:text-primary-foreground"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Component: Events List
const EventsList: React.FC<{ onPageChange: (page: string) => void }> = ({ onPageChange }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await mockAPI.fetchEvents();
        setEvents(data);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Event Management</h1>
          <p className="text-muted-foreground mt-2">Manage all campus events</p>
        </div>
        
        <Button
          onClick={() => onPageChange('create-event')}
          className="gradient-primary glow-effect transition-bounce hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.event_id} className="gradient-card elevated-card transition-smooth hover:scale-105">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                  {event.category}
                </Badge>
              </div>
              <CardTitle className="text-lg">{event.title}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{new Date(event.event_date).toLocaleDateString()}</span>
                  <span className="text-muted-foreground">
                    {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Component: Student Event Card (Preview)
const StudentEventCard: React.FC = () => {
  const sampleEvent = mockEvents[0]; // Use first event as sample

  return (
    <Card className="gradient-card transition-smooth hover:scale-105 cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {sampleEvent.category}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {new Date(sampleEvent.event_date).toLocaleDateString()}
          </div>
        </div>
        <CardTitle className="text-lg">{sampleEvent.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{new Date(sampleEvent.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="truncate">{sampleEvent.location}</span>
        </div>
        
        <Button className="w-full gradient-primary glow-effect transition-bounce hover:scale-105">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

// Component: Student Registration Modal (Preview)
const StudentEventRegistrationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const sampleEvent = mockEvents[0];
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg gradient-card elevated-card">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">
                {sampleEvent.category}
              </Badge>
              <CardTitle className="text-xl">{sampleEvent.title}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{sampleEvent.description}</p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">{new Date(sampleEvent.event_date).toLocaleDateString()}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(sampleEvent.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div className="font-medium">{sampleEvent.location}</div>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button className="flex-1 gradient-primary glow-effect transition-bounce hover:scale-105">
              Register Now
            </Button>
            <Button variant="secondary" onClick={onClose} className="transition-smooth">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Campus Event Platform Component
const CampusEventPlatform: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard onPageChange={setCurrentPage} />;
      case 'reports':
        return <ReportingPage />;
      case 'create-event':
        return <EventForm onPageChange={setCurrentPage} />;
      case 'events':
        return <EventsList onPageChange={setCurrentPage} />;
      default:
        return <AdminDashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="flex-1 p-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default CampusEventPlatform;
