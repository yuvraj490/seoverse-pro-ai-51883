import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, CreditCard, Activity, Check, X, Trash2, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, generations: 0, credits: 0, payments: 0, totalRevenue: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [generations, setGenerations] = useState<any[]>([]);
  const [showGenerations, setShowGenerations] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        checkAdmin(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdmin = async (userId: string) => {
    try {
      const { data } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (data) {
        setIsAdmin(true);
        await fetchData();
      } else {
        toast.error("Unauthorized access");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Admin check error:", error);
      toast.error("Failed to verify admin access");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [usersRes, gensRes, paymentsRes, allPaymentsRes] = await Promise.all([
        (supabase as any).from("profiles").select("*").order("created_at", { ascending: false }),
        (supabase as any).from("generations").select("*, profiles(email)").order("created_at", { ascending: false }).limit(50),
        (supabase as any).from("payment_requests").select("*, profiles(email)").eq("status", "pending"),
        (supabase as any).from("payment_requests").select("amount, status").eq("status", "approved"),
      ]);

      if (usersRes.error) throw usersRes.error;
      if (gensRes.error) throw gensRes.error;
      if (paymentsRes.error) throw paymentsRes.error;
      if (allPaymentsRes.error) throw allPaymentsRes.error;

      if (usersRes.data) {
        setUsers(usersRes.data);
        setFilteredUsers(usersRes.data);
        setStats((s) => ({
          ...s,
          users: usersRes.data.length,
          credits: usersRes.data.reduce((sum, u) => sum + u.credits, 0),
        }));
      }

      if (gensRes.data) {
        setGenerations(gensRes.data);
        setStats((s) => ({ ...s, generations: gensRes.data.length }));
      }

      if (paymentsRes.data) {
        setPaymentRequests(paymentsRes.data);
        setStats((s) => ({ ...s, payments: paymentsRes.data.length }));
      }

      if (allPaymentsRes.data) {
        const totalRevenue = allPaymentsRes.data.reduce((sum, p) => sum + p.amount, 0);
        setStats((s) => ({ ...s, totalRevenue }));
      }
    } catch (error: any) {
      console.error("Fetch data error:", error);
      toast.error("Failed to load admin data");
    }
  };

  useEffect(() => {
    handleSearch(searchQuery);
  }, [users]);

  const handleApprovePayment = async (requestId: string, userId: string) => {
    const { error: updateError } = await (supabase as any)
      .from("payment_requests")
      .update({ status: "approved" })
      .eq("id", requestId);

    if (updateError) {
      toast.error("Failed to approve payment");
      return;
    }

    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (profile) {
      await (supabase as any)
        .from("profiles")
        .update({ credits: profile.credits + 100 })
        .eq("id", userId);
    }

    toast.success("Payment approved and credits added!");
    fetchData();
  };

  const handleRejectPayment = async (requestId: string) => {
    const { error } = await (supabase as any)
      .from("payment_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to reject payment");
    } else {
      toast.success("Payment rejected");
      fetchData();
    }
  };

  const handleUpdateCredits = async (userId: string, newCredits: number) => {
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ credits: newCredits })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to update credits");
    } else {
      toast.success("Credits updated");
      fetchData();
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user: ${userEmail}?`)) return;

    try {
      const { data, error } = await supabase.functions.invoke("admin-actions", {
        body: { action: "delete_user", userId },
      });

      if (error) throw error;

      toast.success(`User ${userEmail} deleted successfully`);
      fetchData();
    } catch (error: any) {
      console.error("Delete user error:", error);
      toast.error(error.message || "Failed to delete user");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(lowercaseQuery) ||
      user.id.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredUsers(filtered);
  };

  const handleExportUsers = () => {
    const csvContent = [
      ['Email', 'Credits', 'Joined Date', 'User ID'].join(','),
      ...users.map(u => [
        u.email,
        u.credits,
        new Date(u.created_at).toLocaleDateString(),
        u.id
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Users exported successfully!');
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
    toast.success('Data refreshed!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto max-w-6xl py-8 relative z-10">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="hover:bg-primary/10 transition-all">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleRefresh} className="hover:bg-primary/10 transition-all">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/generate")} className="hover:bg-primary/10 transition-all">
              Go to Generate
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 animate-fade-in">
          <Card className="glass-effect border-primary/30 p-6 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all duration-300 hover:scale-105">
            <Users className="h-8 w-8 text-primary mb-2" />
            <p className="text-3xl font-bold text-primary">{stats.users}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </Card>
          <Card className="glass-effect border-accent/30 p-6 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all duration-300 hover:scale-105">
            <Activity className="h-8 w-8 text-accent mb-2" />
            <p className="text-3xl font-bold text-accent">{stats.generations}</p>
            <p className="text-sm text-muted-foreground">Generations</p>
          </Card>
          <Card className="glass-effect border-primary/30 p-6 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all duration-300 hover:scale-105">
            <CreditCard className="h-8 w-8 text-primary mb-2" />
            <p className="text-3xl font-bold text-primary">{stats.credits}</p>
            <p className="text-sm text-muted-foreground">Total Credits</p>
          </Card>
          <Card className="glass-effect border-accent/30 p-6 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all duration-300 hover:scale-105">
            <CreditCard className="h-8 w-8 text-accent mb-2" />
            <p className="text-3xl font-bold text-accent">{stats.payments}</p>
            <p className="text-sm text-muted-foreground">Pending Payments</p>
          </Card>
          <Card className="glass-effect border-primary/30 p-6 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all duration-300 hover:scale-105">
            <CreditCard className="h-8 w-8 text-primary mb-2" />
            <p className="text-3xl font-bold text-primary">₹{stats.totalRevenue}</p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </Card>
        </div>

        {/* Payment Requests */}
        {paymentRequests.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 gradient-text">Pending Payments</h2>
            <div className="space-y-4">
              {paymentRequests.map((req) => (
                <Card key={req.id} className="glass-effect border-primary/30 p-6 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">{req.profiles?.email}</p>
                      <p className="text-sm text-muted-foreground">Gmail: {req.gmail}</p>
                      <p className="text-sm text-primary font-semibold">Amount: ₹{req.amount}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(req.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprovePayment(req.id, req.user_id)}
                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectPayment(req.id)}
                        className="hover:scale-105 transition-all"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Generations */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold gradient-text">Recent Generations</h2>
            <Button
              variant="ghost"
              onClick={() => setShowGenerations(!showGenerations)}
              className="hover:bg-primary/10"
            >
              {showGenerations ? "Hide" : "Show"}
            </Button>
          </div>
          {showGenerations && (
            <div className="space-y-2">
              {generations.slice(0, 10).map((gen) => (
                <Card key={gen.id} className="glass-effect border-primary/30 p-4 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{gen.profiles?.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(gen.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">Topic: {gen.topic}</p>
                    {gen.title && <p className="text-sm">Title: {gen.title}</p>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Users */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold gradient-text">All Users ({stats.users})</h2>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search by email or ID..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-72 bg-background/50 border-primary/30"
              />
              <Button variant="ghost" size="sm" onClick={handleExportUsers} className="hover:bg-primary/10 transition-all">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="glass-effect border-primary/30 p-6 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-lg">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Credits: <span className="text-primary font-semibold">{user.credits}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      defaultValue={user.credits}
                      className="w-24 bg-background/50 border-primary/30"
                      onBlur={(e) => handleUpdateCredits(user.id, parseInt(e.target.value) || 0)}
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="hover:scale-105 transition-all"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;