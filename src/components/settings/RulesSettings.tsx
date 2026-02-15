import { useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Edit2, Check, X, Wand2 } from 'lucide-react';
import { settingsAtom, projectsAtom, goalsAtom } from '@/stores/appStore';
import { useStorySettings } from '@/utils/settingsMirror';
import type { Rule, RuleCondition, RuleAction, RuleOperator } from '@/types';

export function RulesSettings() {
    const [settings, setSettings] = useAtom(settingsAtom);
    const [projects] = useAtom(projectsAtom);
    const [goals] = useAtom(goalsAtom);
    const storySettings = useStorySettings();
    const [isEditing, setIsEditing] = useState(false);
    const [editingRule, setEditingRule] = useState<Rule | null>(null);

    const rules = settings.rules || [];

    const handleAddRule = () => {
        const newRule: Rule = {
            id: `rule-${Date.now()}`,
            name: 'New Rule',
            trigger: 'story-create',
            conditions: [],
            actions: [],
            enabled: true
        };
        setEditingRule(newRule);
        setIsEditing(true);
    };

    const handleEditRule = (rule: Rule) => {
        setEditingRule({ ...rule });
        setIsEditing(true);
    };

    const handleDeleteRule = (id: string) => {
        setSettings({
            ...settings,
            rules: rules.filter(r => r.id !== id)
        });
    };

    const handleToggleRule = (id: string, enabled: boolean) => {
        setSettings({
            ...settings,
            rules: rules.map(r => r.id === id ? { ...r, enabled } : r)
        });
    };

    const handleSaveRule = () => {
        if (!editingRule) return;

        const exists = rules.find(r => r.id === editingRule.id);
        const updatedRules = exists
            ? rules.map(r => r.id === editingRule.id ? editingRule : r)
            : [...rules, editingRule];

        setSettings({
            ...settings,
            rules: updatedRules
        });
        setIsEditing(false);
        setEditingRule(null);
    };

    const addCondition = () => {
        if (!editingRule) return;
        setEditingRule({
            ...editingRule,
            conditions: [...editingRule.conditions, { field: 'projectId', operator: 'exists' }]
        });
    };

    const updateCondition = (index: number, updates: Partial<RuleCondition>) => {
        if (!editingRule) return;
        const newConditions = [...editingRule.conditions];
        newConditions[index] = { ...newConditions[index], ...updates };
        setEditingRule({ ...editingRule, conditions: newConditions });
    };

    const removeCondition = (index: number) => {
        if (!editingRule) return;
        setEditingRule({
            ...editingRule,
            conditions: editingRule.conditions.filter((_, i) => i !== index)
        });
    };

    const addAction = () => {
        if (!editingRule) return;
        setEditingRule({
            ...editingRule,
            actions: [...editingRule.actions, { field: 'weight', value: '' }]
        });
    };

    const updateAction = (index: number, updates: Partial<RuleAction>) => {
        if (!editingRule) return;
        const newActions = [...editingRule.actions];
        newActions[index] = { ...newActions[index], ...updates };
        setEditingRule({ ...editingRule, actions: newActions });
    };

    const removeAction = (index: number) => {
        if (!editingRule) return;
        setEditingRule({
            ...editingRule,
            actions: editingRule.actions.filter((_, i) => i !== index)
        });
    };

    if (isEditing && editingRule) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <div>
                                <CardTitle>Edit Story Creation Rule</CardTitle>
                                <CardDescription>Configure automation logic when creating stories</CardDescription>
                            </div>            </div>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveRule}>
                                <Check className="h-4 w-4 mr-1" /> Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                                <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Rule Name</label>
                        <Input
                            value={editingRule.name}
                            onChange={e => setEditingRule({ ...editingRule, name: e.target.value })}
                            placeholder="e.g., Set priority for Project X"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                Conditions
                                <span className="text-xs font-normal text-muted-foreground">(When these are true)</span>
                            </h3>
                            <Button size="sm" variant="ghost" onClick={addCondition}>
                                <Plus className="h-4 w-4 mr-1" /> Add Condition
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {editingRule.conditions.map((condition, idx) => (
                                <div key={idx} className="flex gap-2 items-start p-3 border rounded-lg bg-muted/30">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                                        <Select
                                            value={condition.field}
                                            onValueChange={v => updateCondition(idx, { field: v })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="projectId">Project</SelectItem>
                                                <SelectItem value="goalId">Goal</SelectItem>
                                                <SelectItem value="roleId">Role</SelectItem>
                                                <SelectItem value="type">Type</SelectItem>
                                                <SelectItem value="status">Status</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={condition.operator}
                                            onValueChange={v => updateCondition(idx, { operator: v as RuleOperator })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="exists">Exists</SelectItem>
                                                <SelectItem value="not_exists">Doesn't Exist</SelectItem>
                                                <SelectItem value="equals">Equals</SelectItem>
                                                <SelectItem value="not_equals">Doesn't Equal</SelectItem>
                                                <SelectItem value="contains">Contains</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {['equals', 'not_equals', 'contains'].includes(condition.operator) && (
                                            <div className="flex flex-col gap-1">
                                                {condition.field === 'projectId' ? (
                                                    <Select
                                                        value={condition.value}
                                                        onValueChange={v => updateCondition(idx, { value: v })}
                                                    >
                                                        <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
                                                        <SelectContent>
                                                            {projects.map(p => (
                                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : condition.field === 'goalId' ? (
                                                    <Select
                                                        value={condition.value}
                                                        onValueChange={v => updateCondition(idx, { value: v })}
                                                    >
                                                        <SelectTrigger><SelectValue placeholder="Select Goal" /></SelectTrigger>
                                                        <SelectContent>
                                                            {goals.map(g => (
                                                                <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : condition.field === 'roleId' ? (
                                                    <Select
                                                        value={condition.value}
                                                        onValueChange={v => updateCondition(idx, { value: v })}
                                                    >
                                                        <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                                                        <SelectContent>
                                                            {settings.roles.map(r => (
                                                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        value={condition.value || ''}
                                                        onChange={e => updateCondition(idx, { value: e.target.value })}
                                                        placeholder="Value"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => removeCondition(idx)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            {editingRule.conditions.length === 0 && (
                                <p className="text-xs text-center text-muted-foreground py-2 italic">
                                    Always applies (no conditions)
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                Actions
                                <span className="text-xs font-normal text-muted-foreground">(Do this)</span>
                            </h3>
                            <Button size="sm" variant="ghost" onClick={addAction}>
                                <Plus className="h-4 w-4 mr-1" /> Add Action
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {editingRule.actions.map((action, idx) => (
                                <div key={idx} className="flex gap-2 items-start p-3 border rounded-lg bg-primary/5 border-primary/10">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                                        <Select
                                            value={action.field}
                                            onValueChange={v => updateAction(idx, { field: v })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="priority">Set Priority</SelectItem>
                                                <SelectItem value="weight">Set Weight</SelectItem>
                                                <SelectItem value="size">Set Size</SelectItem>
                                                <SelectItem value="type">Set Type</SelectItem>
                                                <SelectItem value="roleId">Set Role</SelectItem>
                                                <SelectItem value="goalId">Set Goal</SelectItem>
                                                <SelectItem value="projectId">Set Project</SelectItem>
                                                <SelectItem value="status">Set Status</SelectItem>
                                                <SelectItem value="description">Set Description</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {['priority', 'status', 'type', 'size', 'weight'].includes(action.field) ? (
                                            <Select
                                                value={action.value}
                                                onValueChange={v => updateAction(idx, { value: v })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Select Value" /></SelectTrigger>
                                                <SelectContent>
                                                    {action.field === 'priority' && ['Q1', 'Q2', 'Q3', 'Q4'].map(p => (
                                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                                    ))}
                                                    {action.field === 'status' && ['icebox', 'backlog', 'todo', 'progress', 'review', 'done'].map(s => (
                                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                                    ))}
                                                    {action.field === 'type' && storySettings.storyTypes.map(t => (
                                                        <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                                                    ))}
                                                    {action.field === 'size' && storySettings.storySizes.map(s => (
                                                        <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                                                    ))}
                                                    {action.field === 'weight' && [1, 3, 5, 8, 13, 21].map(w => (
                                                        <SelectItem key={String(w)} value={String(w)}>{w}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : ['visionId', 'roleId', 'goalId'].includes(action.field) ? (
                                            <Select
                                                value={action.value}
                                                onValueChange={v => updateAction(idx, { value: v })}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Select Value" /></SelectTrigger>
                                                <SelectContent>
                                                    {action.field === 'roleId' && settings.roles.map(r => (
                                                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                                    ))}
                                                    {action.field === 'roleId' && settings.roles.map(r => (
                                                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                                    ))}
                                                    {action.field === 'goalId' && goals.map(g => (
                                                        <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                value={action.value}
                                                onChange={e => updateAction(idx, { value: e.target.value })}
                                                placeholder="Value"
                                            />
                                        )}
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => removeAction(idx)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            {editingRule.actions.length === 0 && (
                                <p className="text-xs text-center text-muted-foreground py-2 italic text-destructive">
                                    Add at least one action
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Story Creation Rules</CardTitle>
                        <CardDescription>
                            Define rules to automatically set story field values based on creation context.
                        </CardDescription>
                    </div>
                    <Button size="sm" onClick={handleAddRule} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Story Rule
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {rules.map((rule) => (
                        <div
                            key={rule.id}
                            className={`flex items-center justify-between p-4 border rounded-xl transition-all duration-200 ${rule.enabled ? 'bg-card' : 'bg-muted/30 grayscale-[50%] opacity-70'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${rule.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    <Wand2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm sm:text-base">{rule.name}</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {rule.trigger} • {rule.conditions.length} conditions • {rule.actions.length} actions
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <Switch
                                    checked={rule.enabled}
                                    onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                                />
                                <Button size="sm" variant="outline" onClick={() => handleEditRule(rule)}>
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleDeleteRule(rule.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {rules.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                            <Wand2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                            <h3 className="text-lg font-medium text-muted-foreground">No rules created yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">Create your first rule to automate story fields.</p>
                            <Button variant="outline" onClick={handleAddRule}>
                                Create Story Rule
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
