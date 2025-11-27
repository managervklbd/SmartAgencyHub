import { useState } from "react";
import { Plus, Calendar, DollarSign, Video, Key, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertProjectSchema, type Project, type Client } from "@shared/schema";
import { z } from "zod";
import { normalizeProjectData } from "@/lib/normalizeDateInputs";

const projectFormSchema = insertProjectSchema.extend({
  deadline: z.string().optional(),
  shortVideoUrl: z.string().optional(),
  fullFeatureVideoUrl: z.string().optional(),
  hostingLink: z.string().optional(),
  adminLoginLink: z.string().optional(),
  adminUsername: z.string().optional(),
  adminPassword: z.string().optional(),
  credentialsNotes: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

export default function Projects() {
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createMutation = useMutation({
    mutationFn: (data: ProjectFormData) => apiRequest("POST", "/api/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Success", description: "Project created successfully" });
      setOpen(false);
      setEditingProject(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectFormData }) =>
      apiRequest("PATCH", `/api/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Success", description: "Project updated successfully" });
      setOpen(false);
      setEditingProject(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      clientId: "",
      name: "",
      description: "",
      status: "planning",
      budget: "0",
      progress: 0,
      shortVideoUrl: "",
      fullFeatureVideoUrl: "",
      hostingLink: "",
      adminLoginLink: "",
      adminUsername: "",
      adminPassword: "",
      credentialsNotes: "",
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    const normalizedData = normalizeProjectData(data);
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: normalizedData });
    } else {
      createMutation.mutate(normalizedData);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowPassword(false);
    form.reset({
      clientId: project.clientId,
      name: project.name,
      description: project.description || "",
      status: project.status,
      budget: project.budget || "0",
      progress: project.progress ?? 0,
      deadline: project.deadline ? (typeof project.deadline === 'string' ? project.deadline : new Date(project.deadline).toISOString().split('T')[0]) : "",
      shortVideoUrl: (project as any).shortVideoUrl || "",
      fullFeatureVideoUrl: (project as any).fullFeatureVideoUrl || "",
      hostingLink: (project as any).hostingLink || "",
      adminLoginLink: (project as any).adminLoginLink || "",
      adminUsername: (project as any).adminUsername || "",
      adminPassword: (project as any).adminPassword || "",
      credentialsNotes: (project as any).credentialsNotes || "",
    });
    setOpen(true);
  };

  const handleAddNew = () => {
    setEditingProject(null);
    setShowPassword(false);
    form.reset({
      clientId: "",
      name: "",
      description: "",
      status: "planning",
      budget: "0",
      progress: 0,
      shortVideoUrl: "",
      fullFeatureVideoUrl: "",
      hostingLink: "",
      adminLoginLink: "",
      adminUsername: "",
      adminPassword: "",
      credentialsNotes: "",
    });
    setOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning": return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      case "active": return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "on-hold": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
      case "completed": return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 bg-muted rounded w-32 mb-6 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-3 animate-pulse" />
                <div className="h-4 bg-muted rounded w-1/2 mb-4 animate-pulse" />
                <div className="h-2 bg-muted rounded w-full animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage client projects</p>
        </div>
        <Button data-testid="button-add-project" onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
              <DialogDescription>
                {editingProject ? "Update project information" : "Create a new project"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
                    <TabsTrigger value="videos" data-testid="tab-videos">
                      <Video className="w-4 h-4 mr-2" />
                      Videos
                    </TabsTrigger>
                    <TabsTrigger value="credentials" data-testid="tab-credentials">
                      <Key className="w-4 h-4 mr-2" />
                      Credentials
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Website Redesign" {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-client">
                                  <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent position="popper">
                                {clients?.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-status">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent position="popper">
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="on-hold">On Hold</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="5000" {...field} value={field.value ?? ""} data-testid="input-budget" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deadline</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value ?? ""} data-testid="input-deadline" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Project details..." {...field} value={field.value ?? ""} data-testid="input-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="videos" className="space-y-4 mt-4">
                    <div className="text-sm text-muted-foreground mb-4">
                      Add video presentation links for client review (YouTube, Vimeo, etc.)
                    </div>
                    <FormField
                      control={form.control}
                      name="shortVideoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Presentable Short Video</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="https://www.youtube.com/watch?v=..." 
                                {...field} 
                                value={field.value ?? ""} 
                                data-testid="input-short-video" 
                              />
                              {field.value && (
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => window.open(field.value || '', '_blank')}
                                  data-testid="button-open-short-video"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fullFeatureVideoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Software Feature Video</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="https://www.youtube.com/watch?v=..." 
                                {...field} 
                                value={field.value ?? ""} 
                                data-testid="input-full-video" 
                              />
                              {field.value && (
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => window.open(field.value || '', '_blank')}
                                  data-testid="button-open-full-video"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="credentials" className="space-y-4 mt-4">
                    <div className="text-sm text-muted-foreground mb-4">
                      Store project hosting and admin access credentials securely
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="hostingLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hosting Link</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input 
                                  placeholder="https://example.com" 
                                  {...field} 
                                  value={field.value ?? ""} 
                                  data-testid="input-hosting-link" 
                                />
                                {field.value && (
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => window.open(field.value || '', '_blank')}
                                    data-testid="button-open-hosting"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="adminLoginLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Login Link</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input 
                                  placeholder="https://example.com/admin" 
                                  {...field} 
                                  value={field.value ?? ""} 
                                  data-testid="input-admin-link" 
                                />
                                {field.value && (
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => window.open(field.value || '', '_blank')}
                                    data-testid="button-open-admin"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="adminUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="admin@example.com" 
                                {...field} 
                                value={field.value ?? ""} 
                                data-testid="input-admin-username" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="adminPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Password</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter password" 
                                  {...field} 
                                  value={field.value ?? ""} 
                                  data-testid="input-admin-password" 
                                />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => setShowPassword(!showPassword)}
                                  data-testid="button-toggle-password"
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="credentialsNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional credential notes..." 
                              {...field} 
                              value={field.value ?? ""} 
                              data-testid="input-credentials-notes" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" data-testid="button-submit-project">
                    {editingProject ? "Update Project" : "Create Project"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {!projects || projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first project</p>
            <Button onClick={() => setOpen(true)}>Add Project</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="hover-elevate cursor-pointer" 
              data-testid={`card-project-${project.id}`}
              onClick={() => handleEdit(project)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg" data-testid={`text-project-name-${project.id}`}>
                    {project.name}
                  </h3>
                  <Badge className={getStatusColor(project.status)} data-testid={`badge-status-${project.id}`}>
                    {project.status}
                  </Badge>
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                )}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress ?? 0} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    {project.budget && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span>${project.budget}</span>
                      </div>
                    )}
                    {project.deadline && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
