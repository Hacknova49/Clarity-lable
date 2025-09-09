import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderOpen, Users, Settings, LogOut, Camera } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

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
            Manage your annotation projects and datasets
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/projects')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                  <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge variant="secondary">New</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-1">Create Project</CardTitle>
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
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
                  <FolderOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-1">My Projects</CardTitle>
              <CardDescription>
                View and manage existing projects
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/20">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-1">Team Members</CardTitle>
              <CardDescription>
                Manage project collaborators
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900/20">
                <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-1">Settings</CardTitle>
              <CardDescription>
                Configure your preferences
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Your recently accessed annotation projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No projects yet. Create your first project to get started!
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>
                Latest updates from your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No recent activity. Start collaborating with your team!
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;