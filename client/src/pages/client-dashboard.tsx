import { Briefcase, FileText, DollarSign, CheckCircle, Clock, AlertCircle, Globe, Key, Database, Play, Video, ExternalLink, Copy, Check, Server, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { type Project, type Invoice, type Payment, type ProjectCredentials } from "@shared/schema";

interface ClientDashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalInvoices: number;
  totalSpent: number;
  pendingAmount: number;
  paidInvoices: number;
}

export default function ClientDashboard() {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<ClientDashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: payments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const { data: credentials } = useQuery<ProjectCredentials[]>({
    queryKey: ["/api/project-credentials/client"],
  });

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const kpis = [
    {
      title: "Total Projects",
      value: stats?.totalProjects ?? 0,
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-950",
    },
    {
      title: "Active Projects",
      value: stats?.activeProjects ?? 0,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950",
    },
    {
      title: "Completed Projects",
      value: stats?.completedProjects ?? 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-950",
    },
    {
      title: "Total Spent",
      value: `${stats?.totalSpent?.toFixed(2) ?? "0.00"}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-950",
    },
    {
      title: "Pending Amount",
      value: `${stats?.pendingAmount?.toFixed(2) ?? "0.00"}`,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-950",
    },
    {
      title: "Paid Invoices",
      value: stats?.paidInvoices ?? 0,
      icon: FileText,
      color: "text-teal-600",
      bgColor: "bg-teal-100 dark:bg-teal-950",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      case "active": return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      case "on-hold": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
      case "completed": return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "draft": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      case "sent": return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      case "paid": return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "overdue": return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Client Portal</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2 animate-pulse" />
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
          <h1 className="text-3xl font-bold" data-testid="text-client-dashboard-title">Client Portal</h1>
          <p className="text-sm text-muted-foreground">Track your projects, invoices, and payments</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title} data-testid={`card-kpi-${kpi.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-md ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-${kpi.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects?.filter(p => p.status === "active").slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50" data-testid={`project-${project.id}`}>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{project.description}</p>
                    <Progress value={project.progress ?? 0} className="h-2" />
                  </div>
                  <Badge className={`ml-4 ${getStatusColor(project.status)}`}>
                    {project.progress}%
                  </Badge>
                </div>
              ))}
              {(!projects || projects.filter(p => p.status === "active").length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No active projects</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices?.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50" data-testid={`invoice-${invoice.id}`}>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">${Number(invoice.amount).toFixed(2)}</span>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!invoices || invoices.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No invoices yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments?.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50" data-testid={`payment-${payment.id}`}>
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment via {payment.paymentMethod}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </p>
                  {payment.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{payment.notes}</p>
                  )}
                </div>
                <span className="text-sm font-medium text-green-600">${Number(payment.amount).toFixed(2)}</span>
              </div>
            ))}
            {(!payments || payments.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No payments yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {credentials && credentials.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Project Credentials</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {credentials.map((credential) => (
              <Card key={credential.id} data-testid={`credential-card-${credential.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {credential.thumbnailUrl ? (
                      <img 
                        src={`/${credential.thumbnailUrl}`} 
                        alt={credential.projectName}
                        className="h-14 w-14 rounded-md object-cover border"
                        data-testid={`credential-thumbnail-${credential.id}`}
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-md bg-muted flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base" data-testid={`credential-name-${credential.id}`}>
                        {credential.projectName}
                      </CardTitle>
                      {credential.hostingPlatform && (
                        <Badge variant="secondary" className="mt-1">
                          <Server className="h-3 w-3 mr-1" />
                          {credential.hostingPlatform}
                        </Badge>
                      )}
                      {credential.shortDescription && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {credential.shortDescription}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {credential.liveLink && (
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                          <Globe className="h-4 w-4 shrink-0" />
                          <span className="truncate">Live Website</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyToClipboard(credential.liveLink!, `live-${credential.id}`)}
                            data-testid={`button-copy-live-${credential.id}`}
                          >
                            {copiedField === `live-${credential.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => window.open(credential.liveLink!, "_blank")}
                            data-testid={`button-open-live-${credential.id}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {credential.adminPanelLink && (
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                          <Key className="h-4 w-4 shrink-0" />
                          <span className="truncate">Admin Panel</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyToClipboard(credential.adminPanelLink!, `admin-${credential.id}`)}
                            data-testid={`button-copy-admin-${credential.id}`}
                          >
                            {copiedField === `admin-${credential.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => window.open(credential.adminPanelLink!, "_blank")}
                            data-testid={`button-open-admin-${credential.id}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {credential.databaseUrl && (
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                          <Database className="h-4 w-4 shrink-0" />
                          <span className="truncate">Database URL</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => copyToClipboard(credential.databaseUrl!, `db-${credential.id}`)}
                          data-testid={`button-copy-db-${credential.id}`}
                        >
                          {copiedField === `db-${credential.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    )}

                    {credential.serverCredentials && (
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                          <Server className="h-4 w-4 shrink-0" />
                          <span className="truncate">Server Credentials</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => copyToClipboard(credential.serverCredentials!, `server-${credential.id}`)}
                          data-testid={`button-copy-server-${credential.id}`}
                        >
                          {copiedField === `server-${credential.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    )}
                  </div>

                  {(credential.shortVideoUrl || credential.fullVideoUrl) && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      {credential.shortVideoUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(credential.shortVideoUrl!, "_blank")}
                          data-testid={`button-short-video-${credential.id}`}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Presentable Video
                        </Button>
                      )}
                      {credential.fullVideoUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(credential.fullVideoUrl!, "_blank")}
                          data-testid={`button-full-video-${credential.id}`}
                        >
                          <Video className="h-3 w-3 mr-1" />
                          Full Features Demo
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
