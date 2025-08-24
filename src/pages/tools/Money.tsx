import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, TrendingUp, Calendar, Trash2, PiggyBank, Coins, Target } from "lucide-react";
import ToolShell from "@/components/ToolShell";
import { safeGet, safeSet, generateId } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface MoneyWin {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  created: string;
}

const CATEGORIES = [
  { value: "income", label: "💼 Income", emoji: "💼" },
  { value: "savings", label: "🏦 Savings", emoji: "🏦" },
  { value: "investment", label: "📈 Investment", emoji: "📈" },
  { value: "side-hustle", label: "🚀 Side Hustle", emoji: "🚀" },
  { value: "bonus", label: "🎁 Bonus/Gift", emoji: "🎁" },
  { value: "refund", label: "↩️ Refund", emoji: "↩️" },
  { value: "found", label: "🔍 Found Money", emoji: "🔍" },
  { value: "other", label: "✨ Other", emoji: "✨" }
];

export default function Money() {
  const [moneyWins, setMoneyWins] = useState<MoneyWin[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isWinDialogOpen, setIsWinDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state with validation
  const [form, setForm] = useState({
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState<{ 
    amount?: string; 
    description?: string; 
    category?: string; 
    date?: string; 
  }>({});
  const [shake, setShake] = useState(false);
  const [touched, setTouched] = useState<{ 
    amount?: boolean; 
    description?: boolean; 
    category?: boolean; 
    date?: boolean; 
  }>({});

  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    deadline: ""
  });

  useEffect(() => {
    const savedWins = safeGet<MoneyWin[]>("fm_money_wins_v1", []);
    const savedGoals = safeGet<SavingsGoal[]>("fm_savings_goals_v1", []);
    setMoneyWins(savedWins);
    setSavingsGoals(savedGoals);
  }, []);

  // Validation function
  const validate = () => {
    const e: any = {};
    const amt = Number(form.amount);
    
    if (!form.amount || isNaN(amt) || amt <= 0) {
      e.amount = "Enter an amount greater than 0";
    }
    
    if (!form.description || form.description.trim().length < 2) {
      e.description = "Add a description (minimum 2 characters)";
    }
    
    if (!form.category) {
      e.category = "Please select a category";
    }
    
    if (!form.date) {
      e.date = "Please select a date";
    }
    
    return e;
  };

  // Update errors when form changes
  useEffect(() => {
    setErrors(validate());
  }, [form]);

  const isFormValid = Object.keys(errors).length === 0;

  const saveWins = (newWins: MoneyWin[]) => {
    setMoneyWins(newWins);
    safeSet("fm_money_wins_v1", newWins);
  };

  const addMoneyWin = () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      // Shake animation and focus first invalid field
      setShake(true);
      setTimeout(() => setShake(false), 400);
      
      const firstInvalidField = document.querySelector("[aria-invalid='true']") as HTMLElement | null;
      firstInvalidField?.focus();
      return;
    }

    const win: MoneyWin = {
      id: generateId(),
      amount: parseFloat(form.amount),
      description: form.description.trim(),
      category: form.category,
      date: form.date ? new Date(form.date).toISOString() : new Date().toISOString()
    };

    saveWins([win, ...moneyWins]);
    
    // Clear form and show success
    setForm({ 
      amount: "", 
      description: "", 
      category: "", 
      date: new Date().toISOString().split('T')[0] 
    });
    setTouched({});
    setIsWinDialogOpen(false);
    
    toast({
      title: "🎉 Celebration added!",
      description: `${win.description} - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(win.amount)}`
    });
  };

  const handleBlur = (field: keyof typeof form) => {
    setTouched({ ...touched, [field]: true });
  };

  const saveGoals = (newGoals: SavingsGoal[]) => {
    setSavingsGoals(newGoals);
    safeSet("fm_savings_goals_v1", newGoals);
  };

  const addSavingsGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) return;

    const goal: SavingsGoal = {
      id: generateId(),
      name: newGoal.name.trim(),
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      deadline: newGoal.deadline,
      created: new Date().toISOString()
    };

    saveGoals([...savingsGoals, goal]);
    setNewGoal({ name: "", targetAmount: "", deadline: "" });
    setIsGoalDialogOpen(false);
  };

  const deleteWin = (winId: string) => {
    saveWins(moneyWins.filter(w => w.id !== winId));
  };

  const deleteGoal = (goalId: string) => {
    saveGoals(savingsGoals.filter(g => g.id !== goalId));
  };

  const updateGoalAmount = (goalId: string, amount: number) => {
    const updatedGoals = savingsGoals.map(goal =>
      goal.id === goalId ? { ...goal, currentAmount: Math.max(0, amount) } : goal
    );
    saveGoals(updatedGoals);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStats = () => {
    const totalWins = moneyWins.reduce((sum, win) => sum + win.amount, 0);
    const thisMonthWins = moneyWins.filter(win => {
      const winDate = new Date(win.date);
      const now = new Date();
      return winDate.getMonth() === now.getMonth() && winDate.getFullYear() === now.getFullYear();
    }).reduce((sum, win) => sum + win.amount, 0);
    
    const totalGoals = savingsGoals.length;
    const achievedGoals = savingsGoals.filter(goal => goal.currentAmount >= goal.targetAmount).length;

    return { totalWins, thisMonthWins, totalGoals, achievedGoals };
  };

  const getCategoryEmoji = (category: string) => {
    return CATEGORIES.find(cat => cat.value === category)?.emoji || "✨";
  };

  const getPiggyBankLevel = (winsCount: number) => {
    if (winsCount === 0) return "🐷"; // Empty piggy
    if (winsCount < 5) return "🐽"; // Getting started
    if (winsCount < 15) return "🐷"; // Growing
    if (winsCount < 30) return "💰"; // Rich piggy
    return "🏆"; // Legendary wealth
  };

  const stats = getStats();

  return (
    <ToolShell title="Money Celebration Tracker">
      <div className="space-y-6">
        <div className="bg-gradient-kawaii rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-primary-foreground mb-3">🐷 Financial Joy</h2>
          <p className="text-primary-foreground/90">
            Celebrate every financial milestone, no matter how small! Track your money wins and watch your digital piggy bank grow with each achievement.
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center p-4">
            <CardContent className="p-0">
              <div className="text-lg font-bold text-primary">{formatCurrency(stats.totalWins)}</div>
              <div className="text-xs text-muted-foreground">Total Wins</div>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardContent className="p-0">
              <div className="text-lg font-bold text-primary">{formatCurrency(stats.thisMonthWins)}</div>
              <div className="text-xs text-muted-foreground">This Month</div>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardContent className="p-0">
              <div className="text-3xl">{getPiggyBankLevel(moneyWins.length)}</div>
              <div className="text-xs text-muted-foreground">Piggy Level</div>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardContent className="p-0">
              <div className="text-lg font-bold text-primary">{stats.achievedGoals}/{stats.totalGoals}</div>
              <div className="text-xs text-muted-foreground">Goals Met</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="wins" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wins">🎉 Money Wins</TabsTrigger>
            <TabsTrigger value="goals">🎯 Savings Goals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wins" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Celebrate Your Wins</h3>
              <Dialog open={isWinDialogOpen} onOpenChange={setIsWinDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Money Win
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>🎉 Celebrate a Money Win!</DialogTitle>
                  </DialogHeader>
                  <div className={`space-y-4 ${shake ? 'animate-shake' : ''}`}>
                    <div>
                      <Label htmlFor="amount" className="flex items-center gap-1">
                        Amount <span className="text-red-500 text-sm">*</span>
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        value={form.amount}
                        onChange={(e) => {
                          // Prevent non-numeric input
                          const value = e.target.value.replace(/[^0-9.-]/g, '');
                          setForm({ ...form, amount: value });
                        }}
                        onBlur={() => handleBlur('amount')}
                        placeholder="0.00"
                        required
                        aria-invalid={!!errors.amount}
                        aria-describedby={errors.amount ? "amount-error" : undefined}
                        className={errors.amount && touched.amount ? "ring-2 ring-red-300" : ""}
                      />
                      {errors.amount && touched.amount && (
                        <p id="amount-error" role="alert" className="text-xs text-red-600 mt-1">
                          {errors.amount}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description" className="flex items-center gap-1">
                        Description <span className="text-red-500 text-sm">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        onBlur={() => handleBlur('description')}
                        placeholder="What's this win about?"
                        rows={3}
                        required
                        aria-invalid={!!errors.description}
                        aria-describedby={errors.description ? "description-error" : undefined}
                        className={errors.description && touched.description ? "ring-2 ring-red-300" : ""}
                      />
                      {errors.description && touched.description && (
                        <p id="description-error" role="alert" className="text-xs text-red-600 mt-1">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category" className="flex items-center gap-1">
                        Category <span className="text-red-500 text-sm">*</span>
                      </Label>
                      <Select 
                        value={form.category} 
                        onValueChange={(value) => {
                          setForm({ ...form, category: value });
                          setTouched({ ...touched, category: true });
                        }}
                        required
                      >
                        <SelectTrigger 
                          id="category"
                          aria-invalid={!!errors.category}
                          aria-describedby={errors.category ? "category-error" : undefined}
                          className={errors.category && touched.category ? "ring-2 ring-red-300" : ""}
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && touched.category && (
                        <p id="category-error" role="alert" className="text-xs text-red-600 mt-1">
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="date" className="flex items-center gap-1">
                        Date <span className="text-red-500 text-sm">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        onBlur={() => handleBlur('date')}
                        required
                        aria-invalid={!!errors.date}
                        aria-describedby={errors.date ? "date-error" : undefined}
                        className={errors.date && touched.date ? "ring-2 ring-red-300" : ""}
                      />
                      {errors.date && touched.date && (
                        <p id="date-error" role="alert" className="text-xs text-red-600 mt-1">
                          {errors.date}
                        </p>
                      )}
                    </div>

                    <Button 
                      onClick={addMoneyWin} 
                      className={`w-full ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!isFormValid}
                    >
                      🎉 Add Celebration
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {moneyWins.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Money Wins Yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Start celebrating your financial achievements, big or small!
                  </p>
                  <Button onClick={() => setIsWinDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Win
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {moneyWins.map((win) => (
                  <Card key={win.id} className="p-4 group hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getCategoryEmoji(win.category)}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-bold text-green-600">{formatCurrency(win.amount)}</span>
                              <Badge variant="secondary" className="text-xs">
                                {CATEGORIES.find(c => c.value === win.category)?.label.replace(/^\S+\s/, '') || win.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground">{win.description}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(win.date)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteWin(win.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Savings Goals</h3>
              <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>🎯 Set a Savings Goal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="goalName">Goal Name</Label>
                      <Input
                        id="goalName"
                        value={newGoal.name}
                        onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                        placeholder="e.g., Emergency Fund"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetAmount">Target Amount</Label>
                      <Input
                        id="targetAmount"
                        type="number"
                        step="0.01"
                        value={newGoal.targetAmount}
                        onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deadline">Target Date</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newGoal.deadline}
                        onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      />
                    </div>
                    <Button onClick={addSavingsGoal} className="w-full">
                      🎯 Create Goal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {savingsGoals.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Savings Goals Yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Set your first savings goal and start building your financial future!
                  </p>
                  <Button onClick={() => setIsGoalDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Set First Goal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {savingsGoals.map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  const isCompleted = goal.currentAmount >= goal.targetAmount;
                  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <Card key={goal.id} className="p-4 group">
                      <CardContent className="p-0">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              🎯 {goal.name}
                              {isCompleted && <Badge className="bg-green-500">Achieved!</Badge>}
                            </h4>
                            <div className="text-sm text-muted-foreground">
                              <span>Target: {formatCurrency(goal.targetAmount)}</span>
                              {daysLeft > 0 ? (
                                <span className="ml-4">📅 {daysLeft} days left</span>
                              ) : (
                                <span className="ml-4 text-red-500">⚠️ Past deadline</span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteGoal(goal.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{formatCurrency(goal.currentAmount)}</span>
                            <span>{progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Add amount"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.target as HTMLInputElement;
                                  const amount = parseFloat(input.value);
                                  if (amount > 0) {
                                    updateGoalAmount(goal.id, goal.currentAmount + amount);
                                    input.value = '';
                                  }
                                }
                              }}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={(e) => {
                                const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                                const amount = parseFloat(input.value);
                                if (amount > 0) {
                                  updateGoalAmount(goal.id, goal.currentAmount + amount);
                                  input.value = '';
                                }
                              }}
                            >
                              <Coins className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ToolShell>
  );
}