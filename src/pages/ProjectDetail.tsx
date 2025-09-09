import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Upload, Users, Settings, Image as ImageIcon, Tags } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  created_by: string;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (id) {
      fetchProject();
    }
  }, [user, navigate, id]);

  const fetchProject = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <Badge variant="outline">{project.status}</Badge>
              </div>
              <p className="text-muted-foreground">
                {project.description || 'No description provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="images" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="images" className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4" />
              <span>Images</span>
            </TabsTrigger>
            <TabsTrigger value="labels" className="flex items-center space-x-2">
              <Tags className="h-4 w-4" />
              <span>Labels</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Images</h2>
              <Button onClick={() => navigate(`/projects/${project.id}/upload`)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </Button>
            </div>

            <Card>
              <CardContent className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Images Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload images to start annotating
                </p>
                <Button onClick={() => navigate(`/projects/${project.id}/upload`)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Images
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="labels" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Labels</h2>
              <Button onClick={() => navigate(`/projects/${project.id}/labels`)}>
                <Tags className="h-4 w-4 mr-2" />
                Manage Labels
              </Button>
            </div>

            <Card>
              <CardContent className="text-center py-12">
                <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Labels Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create labels to categorize your annotations
                </p>
                <Button onClick={() => navigate(`/projects/${project.id}/labels`)}>
                  <Tags className="h-4 w-4 mr-2" />
                  Create Your First Label
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Team Members</h2>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Invite Members
              </Button>
            </div>

            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Just You</h3>
                <p className="text-muted-foreground mb-4">
                  Invite team members to collaborate on this project
                </p>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Invite Team Members
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-semibold">Project Settings</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>
                  Basic information about your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Project Name</label>
                    <p className="text-sm text-muted-foreground">{project.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <p className="text-sm text-muted-foreground">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <p className="text-sm text-muted-foreground">{project.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetail;