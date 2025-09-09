import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera, Users, Zap, Shield, ArrowRight, Check } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-primary/10 rounded-3xl">
            <Camera className="h-16 w-16 text-primary" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Clarity Label
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Professional image annotation platform for training AI/ML models. 
          Streamline your dataset creation with advanced labeling tools and team collaboration.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-3">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="text-lg px-8 py-3">
            Learn More
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4 dark:bg-blue-900/20">
              <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast & Intuitive</h3>
            <p className="text-muted-foreground">
              Advanced annotation tools with bounding boxes, polygons, keypoints, and more. 
              Optimized for speed and accuracy.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4 dark:bg-green-900/20">
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
            <p className="text-muted-foreground">
              Assign tasks, track progress, and maintain quality with built-in review workflows 
              and role-based permissions.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4 dark:bg-purple-900/20">
              <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Export Ready</h3>
            <p className="text-muted-foreground">
              Export your datasets in multiple formats: COCO JSON, Pascal VOC XML, 
              YOLO TXT, and more.
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to create quality datasets</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Multiple Annotation Types</h4>
                  <p className="text-muted-foreground">Bounding boxes, polygons, keypoints, and classification tags</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Bulk Upload</h4>
                  <p className="text-muted-foreground">Drag & drop multiple images or upload entire folders</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Quality Control</h4>
                  <p className="text-muted-foreground">Review workflows with approve/reject functionality</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Progress Tracking</h4>
                  <p className="text-muted-foreground">Real-time dashboards and activity monitoring</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Role Management</h4>
                  <p className="text-muted-foreground">Admin, annotator, and reviewer roles with permissions</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Export Formats</h4>
                  <p className="text-muted-foreground">COCO, Pascal VOC, YOLO, CSV - ready for training</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 p-8 bg-muted/50 rounded-3xl">
          <h2 className="text-3xl font-bold mb-4">Ready to start labeling?</h2>
          <p className="text-muted-foreground mb-6 text-lg">
            Join teams worldwide who trust Clarity Label for their ML datasets
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
