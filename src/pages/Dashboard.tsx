import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderOpen, LogOut, Camera, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface DashboardStats {
  totalProjects: number;
  totalImages: number;
  completedImages: number;
  recentProjects: Array<{
    id: string;
    name: string;
    status: string;
    created_at: string;
    imageCount: number;
  }>;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalImages: 0,
    completedImages: 0,
    recentProjects: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDashboardStats();
  }, [user, navigate]);

  const fetchDashboardStats = async () => {
    if (!user) return;

    try {
      // Fetch projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (projectsError) throw projectsError;

      // Fetch images for all projects
      const { data: images, error: imagesError } = await supabase
        .from('images')
        .select('project_id, status')
        .in('project_id', projects?.map(p => p.id) || []);

      if (imagesError) throw imagesError;

      // Calculate stats
      const totalImages = images?.length || 0;
      const completedImages = images?.filter(img => img.status === 'completed').length || 0;

      // Add image counts to projects
      const projectsWithCounts = projects?.map(project => ({
        ...project,
        imageCount: images?.filter(img => img.project_id === project.id).length || 0
      })) || [];

      setStats({
        totalProjects: projects?.length || 0,
        totalImages,
        completedImages,
        recentProjects: projectsWithCounts
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user) return null;

  const completionRate = stats.totalImages > 0 ? Math.round((stats.completedImages / stats.totalImages) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Clarity Label</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your annotation projects and progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                Active annotation projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Images</CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalImages}</div>
              <p className="text-xs text-muted-foreground">
                Images uploaded for annotation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedImages}</div>
              <p className="text-xs text-muted-foreground">
                Images fully annotated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Overall completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card 
            className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2"
            onClick={() => navigate('/projects')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <CardTitle className="text-lg mb-1">Create New Project</CardTitle>
              <CardDescription>
                Start a new annotation project
              </CardDescription>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/projects')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-center">
                <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/20">
                  <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <CardTitle className="text-lg mb-1">View All Projects</CardTitle>
              <CardDescription>
                Manage existing projects
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-center">
                <div className="p-3 bg-green-100 rounded-full dark:bg-green-900/20">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <CardTitle className="text-lg mb-1">View Analytics</CardTitle>
              <CardDescription>
                Track your progress
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>
                  Your recently created annotation projects
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/projects')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading projects...</p>
              </div>
            ) : stats.recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first project to get started with image annotation
                </p>
                <Button onClick={() => navigate('/projects')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentProjects.map((project) => (
                  <div 
                    key={project.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Camera className="h-3 w-3 mr-1" />
                            <span>{project.imageCount} images</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;