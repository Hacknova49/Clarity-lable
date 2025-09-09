import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Upload, Image as ImageIcon, Tags, Download, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  created_by: string;
}

interface ProjectImage {
  id: string;
  filename: string;
  original_filename: string;
  status: string;
  created_at: string;
  width?: number;
  height?: number;
}

interface ProjectLabel {
  id: string;
  name: string;
  color: string;
  annotation_type: string;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [labels, setLabels] = useState<ProjectLabel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (id) {
      fetchProjectData();
    }
  }, [user, navigate, id]);

  const fetchProjectData = async () => {
    if (!id) return;
    
    try {
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from('images')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (imagesError) throw imagesError;
      setImages(imagesData || []);

      // Fetch labels
      const { data: labelsData, error: labelsError } = await supabase
        .from('labels')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });

      if (labelsError) throw labelsError;
      setLabels(labelsData || []);

    } catch (error) {
      console.error('Error fetching project data:', error);
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

  const getProgressStats = () => {
    const total = images.length;
    const completed = images.filter(img => img.status === 'completed').length;
    const inProgress = images.filter(img => img.status === 'in_progress').length;
    const pending = images.filter(img => img.status === 'pending').length;
    
    return {
      total,
      completed,
      inProgress,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
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

  const stats = getProgressStats();

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
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => navigate(`/projects/${project.id}/upload`)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{stats.completionRate}%</div>
              <Progress value={stats.completionRate} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="images" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="images" className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4" />
              <span>Images ({images.length})</span>
            </TabsTrigger>
            <TabsTrigger value="labels" className="flex items-center space-x-2">
              <Tags className="h-4 w-4" />
              <span>Labels ({labels.length})</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
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

            {images.length === 0 ? (
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map((image) => (
                  <Card key={image.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm truncate">{image.original_filename}</CardTitle>
                        <Badge variant={image.status === 'completed' ? 'default' : 'secondary'}>
                          {image.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-md mb-2 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {image.width && image.height && (
                          <p>{image.width} × {image.height}</p>
                        )}
                        <p>Added {new Date(image.created_at).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="labels" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Labels</h2>
              <Button onClick={() => navigate(`/projects/${project.id}/labels`)}>
                <Tags className="h-4 w-4 mr-2" />
                Manage Labels
              </Button>
            </div>

            {labels.length === 0 ? (
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {labels.map((label) => (
                  <Card key={label.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <CardTitle className="text-lg">{label.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Type: {label.annotation_type.replace('_', ' ')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-semibold">Project Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Annotation Progress</CardTitle>
                  <CardDescription>Track completion status of your images</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed</span>
                      <span className="text-sm font-medium">{stats.completed} / {stats.total}</span>
                    </div>
                    <Progress value={stats.completionRate} className="h-2" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{stats.inProgress}</div>
                        <div className="text-xs text-muted-foreground">In Progress</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-600">{stats.pending}</div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Label Distribution</CardTitle>
                  <CardDescription>Overview of your annotation labels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {labels.map((label) => (
                      <div key={label.id} className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-sm flex-1">{label.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {label.annotation_type.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                    {labels.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No labels created yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetail;