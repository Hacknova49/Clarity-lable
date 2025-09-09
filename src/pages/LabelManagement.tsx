import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Edit2, Trash2, Tags } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AnnotationType = Database['public']['Enums']['annotation_type'];

interface ProjectLabel {
  id: string;
  name: string;
  color: string;
  annotation_type: AnnotationType;
  project_id: string;
  created_at: string;
}

const PREDEFINED_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

const ANNOTATION_TYPES = [
  { value: 'bounding_box', label: 'Bounding Box' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'keypoint', label: 'Keypoint' },
  { value: 'classification', label: 'Classification' },
  { value: 'mask', label: 'Mask' }
];

const LabelManagement = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [labels, setLabels] = useState<ProjectLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<ProjectLabel | null>(null);
  const [newLabel, setNewLabel] = useState({
    name: '',
    color: PREDEFINED_COLORS[0],
    annotation_type: 'bounding_box' as AnnotationType
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (id) {
      fetchLabels();
    }
  }, [user, navigate, id]);

  const fetchLabels = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setLabels(data || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
      toast({
        title: "Error",
        description: "Failed to load labels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newLabel.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('labels')
        .insert({
          project_id: id,
          name: newLabel.name.trim(),
          color: newLabel.color,
          annotation_type: newLabel.annotation_type
        })
        .select()
        .single();

      if (error) throw error;

      setLabels(prev => [...prev, data]);
      setNewLabel({ name: '', color: PREDEFINED_COLORS[0], annotation_type: 'bounding_box' as AnnotationType });
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Label created successfully",
      });
    } catch (error) {
      console.error('Error creating label:', error);
      toast({
        title: "Error",
        description: "Failed to create label",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLabel) return;

    try {
      const { data, error } = await supabase
        .from('labels')
        .update({
          name: editingLabel.name.trim(),
          color: editingLabel.color,
          annotation_type: editingLabel.annotation_type
        })
        .eq('id', editingLabel.id)
        .select()
        .single();

      if (error) throw error;

      setLabels(prev => prev.map(label => 
        label.id === editingLabel.id ? data : label
      ));
      setEditingLabel(null);
      
      toast({
        title: "Success",
        description: "Label updated successfully",
      });
    } catch (error) {
      console.error('Error updating label:', error);
      toast({
        title: "Error",
        description: "Failed to update label",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    try {
      const { error } = await supabase
        .from('labels')
        .delete()
        .eq('id', labelId);

      if (error) throw error;

      setLabels(prev => prev.filter(label => label.id !== labelId));
      
      toast({
        title: "Success",
        description: "Label deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting label:', error);
      toast({
        title: "Error",
        description: "Failed to delete label",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading labels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Label Management</h1>
              <p className="text-muted-foreground">Create and manage annotation labels</p>
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Label
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Label</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateLabel} className="space-y-4">
                <div>
                  <Label htmlFor="name">Label Name</Label>
                  <Input
                    id="name"
                    value={newLabel.name}
                    onChange={(e) => setNewLabel(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter label name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="annotation_type">Annotation Type</Label>
                  <Select
                    value={newLabel.annotation_type}
                    onValueChange={(value: AnnotationType) => setNewLabel(prev => ({ ...prev, annotation_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ANNOTATION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex space-x-2 mt-2">
                    {PREDEFINED_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          newLabel.color === color ? 'border-foreground' : 'border-muted'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewLabel(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Label</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {labels.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Labels Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create labels to categorize your annotations
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Label
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {labels.map((label) => (
              <Card key={label.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <CardTitle className="text-lg">{label.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingLabel(label)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLabel(label.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Type: {ANNOTATION_TYPES.find(t => t.value === label.annotation_type)?.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingLabel} onOpenChange={() => setEditingLabel(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Label</DialogTitle>
            </DialogHeader>
            {editingLabel && (
              <form onSubmit={handleUpdateLabel} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Label Name</Label>
                  <Input
                    id="edit-name"
                    value={editingLabel.name}
                    onChange={(e) => setEditingLabel(prev => 
                      prev ? { ...prev, name: e.target.value } : null
                    )}
                    placeholder="Enter label name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-annotation_type">Annotation Type</Label>
                  <Select
                    value={editingLabel.annotation_type}
                    onValueChange={(value: AnnotationType) => setEditingLabel(prev => 
                      prev ? { ...prev, annotation_type: value } : null
                    )}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ANNOTATION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex space-x-2 mt-2">
                    {PREDEFINED_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          editingLabel.color === color ? 'border-foreground' : 'border-muted'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditingLabel(prev => 
                          prev ? { ...prev, color } : null
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditingLabel(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Label</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LabelManagement;