import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, X, CheckCircle, AlertCircle, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  preview?: string;
}

const ImageUpload = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (fileList: File[]) => {
    const imageFiles = fileList.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== fileList.length) {
      toast({
        title: "Invalid Files",
        description: "Only image files are allowed",
        variant: "destructive",
      });
    }

    const newFiles: UploadFile[] = imageFiles.map(file => {
      const preview = URL.createObjectURL(file);
      return {
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: 'pending',
        preview
      };
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFiles = async () => {
    if (!id || !user || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (const uploadFile of files) {
      if (uploadFile.status !== 'pending') continue;

      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'uploading' as const, progress: 0 }
            : f
        ));

        // Simulate upload progress
        for (let progress = 0; progress <= 90; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress }
              : f
          ));
        }

        // Get image dimensions
        const img = new Image();
        const dimensions = await new Promise<{width: number, height: number}>((resolve) => {
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.src = uploadFile.preview!;
        });

        // Create unique filename
        const fileExt = uploadFile.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${id}/${fileName}`;

        // Insert image record into database
        const { error } = await supabase
          .from('images')
          .insert({
            project_id: id,
            filename: fileName,
            original_filename: uploadFile.file.name,
            file_path: filePath,
            file_size: uploadFile.file.size,
            width: dimensions.width,
            height: dimensions.height,
            uploaded_by: user.id,
            status: 'pending'
          });

        if (error) throw error;

        // Complete progress and mark as success
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'success' as const, progress: 100 }
            : f
        ));

        successCount++;

      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error' as const, error: 'Upload failed' }
            : f
        ));
      }
    }

    setUploading(false);
    
    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${successCount} image(s)`,
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/projects/${id}`);
      }, 1500);
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'uploading':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>;
      default:
        return <FileImage className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const pendingFiles = files.filter(f => f.status === 'pending').length;
  const completedFiles = files.filter(f => f.status === 'success').length;
  const totalFiles = files.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Upload Images</h1>
            <p className="text-muted-foreground">Add images to your annotation project</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Select Images</CardTitle>
              <CardDescription>
                Drag and drop images here, or click to select files. Supports JPG, PNG, GIF and other image formats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                  ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                  ${files.length === 0 ? 'h-64' : 'h-32'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drop images here or click to browse
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Multiple files supported • Max 10MB per file
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                  className="hidden"
                  id="file-input"
                />
                <Button variant="outline">
                  Select Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upload Progress</CardTitle>
                    <CardDescription>
                      {completedFiles} of {totalFiles} files uploaded
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {pendingFiles > 0 && (
                      <Button 
                        onClick={uploadFiles} 
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading...' : `Upload ${pendingFiles} Files`}
                      </Button>
                    )}
                    {completedFiles === totalFiles && totalFiles > 0 && (
                      <Button onClick={() => navigate(`/projects/${id}`)}>
                        View Project
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {files.map((uploadFile) => (
                    <div key={uploadFile.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      {uploadFile.preview && (
                        <img 
                          src={uploadFile.preview} 
                          alt={uploadFile.file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {uploadFile.status === 'uploading' && (
                          <Progress value={uploadFile.progress} className="mt-2 h-1" />
                        )}
                        {uploadFile.error && (
                          <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(uploadFile.status)}
                        {uploadFile.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadFile.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;