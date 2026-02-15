import { useState } from 'react';
import { useAtom } from 'jotai';
import {
    storiesAtom,
    goalsAtom,
    projectsAtom,
    visionsAtom,
    bucketlistAtom,
    labelsAtom,
    rolesAtom,
    sprintsAtom,
    traditionsAtom,
    importantDatesAtom
} from '@/stores/appStore';
import { generateTestData } from '@/utils/testDataGenerator';
import { exportToExcel } from '@/utils/export';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Server,
    Code,
    Copy,
    Check,
    Play,
    RefreshCw,
    Search
} from 'lucide-react';

type ResourceType = 'stories' | 'goals' | 'projects' | 'visions' | 'bucketlist' | 'labels' | 'roles' | 'sprints' | 'traditions' | 'importantDates' | 'test-data' | 'export';
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiEndpoint {
    path: string;
    method: Method;
    description: string;
    resource: ResourceType;
}

const endpoints: ApiEndpoint[] = [
    { path: '/stories', method: 'GET', description: 'Get all stories', resource: 'stories' },
    { path: '/stories', method: 'POST', description: 'Create a new story', resource: 'stories' },
    { path: '/stories/:id', method: 'PUT', description: 'Update a story', resource: 'stories' },
    { path: '/stories/:id', method: 'DELETE', description: 'Delete a story', resource: 'stories' },
    { path: '/goals', method: 'GET', description: 'Get all goals', resource: 'goals' },
    { path: '/goals', method: 'POST', description: 'Create a new goal', resource: 'goals' },
    { path: '/goals/:id', method: 'PUT', description: 'Update a goal', resource: 'goals' },
    { path: '/goals/:id', method: 'DELETE', description: 'Delete a goal', resource: 'goals' },
    { path: '/projects', method: 'GET', description: 'Get all projects', resource: 'projects' },
    { path: '/projects', method: 'POST', description: 'Create a new project', resource: 'projects' },
    { path: '/projects/:id', method: 'PUT', description: 'Update a project', resource: 'projects' },
    { path: '/projects/:id', method: 'DELETE', description: 'Delete a project', resource: 'projects' },
    { path: '/visions', method: 'GET', description: 'Get all visions', resource: 'visions' },
    { path: '/visions', method: 'POST', description: 'Create a new vision', resource: 'visions' },
    { path: '/visions/:id', method: 'DELETE', description: 'Delete a vision', resource: 'visions' },
    { path: '/bucketlist', method: 'GET', description: 'Get all bucketlist items', resource: 'bucketlist' },
    { path: '/bucketlist', method: 'POST', description: 'Create bucketlist item', resource: 'bucketlist' },
    { path: '/bucketlist/:id', method: 'DELETE', description: 'Delete bucketlist item', resource: 'bucketlist' },
    { path: '/labels', method: 'GET', description: 'Get all labels', resource: 'labels' },
    { path: '/labels', method: 'POST', description: 'Create a new label', resource: 'labels' },
    { path: '/labels/:id', method: 'DELETE', description: 'Delete a label', resource: 'labels' },
    { path: '/roles', method: 'GET', description: 'Get all roles', resource: 'roles' },
    { path: '/roles', method: 'POST', description: 'Create a new role', resource: 'roles' },
    { path: '/roles/:id', method: 'DELETE', description: 'Delete a role', resource: 'roles' },
    { path: '/sprints', method: 'GET', description: 'Get all sprints', resource: 'sprints' },
    { path: '/traditions', method: 'GET', description: 'Get all traditions', resource: 'traditions' },
    { path: '/important-dates', method: 'GET', description: 'Get all important dates', resource: 'importantDates' },
    { path: '/test-data/generate', method: 'POST', description: 'Generate and append test data', resource: 'test-data' },
    { path: '/export/excel', method: 'POST', description: 'Export all data to Excel/CSV', resource: 'export' },
];

export function APISettings() {
    const [activeEndpoint, setActiveEndpoint] = useState<ApiEndpoint>(endpoints[0]);
    const [response, setResponse] = useState<string | null>(null);
    const [requestBody, setRequestBody] = useState<string>('{\n  "title": "New Item",\n  "description": "Created via API"\n}');
    const [resourceId, setResourceId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);

    // Access all stores
    const [stories, setStories] = useAtom(storiesAtom);
    const [goals, setGoals] = useAtom(goalsAtom);
    const [projects, setProjects] = useAtom(projectsAtom);
    const [visions, setVisions] = useAtom(visionsAtom);
    const [bucketlist, setBucketlist] = useAtom(bucketlistAtom);
    const [labels, setLabels] = useAtom(labelsAtom);
    const [roles, setRoles] = useAtom(rolesAtom);
    const [sprints, setSprints] = useAtom(sprintsAtom);
    const [traditions, setTraditions] = useAtom(traditionsAtom);
    const [importantDates, setImportantDates] = useAtom(importantDatesAtom);

    const handleCopy = () => {
        if (response) {
            navigator.clipboard.writeText(response);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            alert('Response copied to clipboard');
        }
    };

    const executeRequest = () => {
        setIsLoading(true);
        setResponse(null);
        setStatus(null);

        // Simulate network delay
        setTimeout(() => {
            try {
                let result: any;
                let statusCode = 200;

                if (activeEndpoint.resource === 'test-data') {
                    const testData = generateTestData();
                    setStories(prev => [...prev, ...testData.stories]);
                    setGoals(prev => [...prev, ...testData.goals]);
                    setProjects(prev => [...prev, ...testData.projects]);
                    setVisions(prev => [...prev, ...testData.visions]);
                    setBucketlist(prev => [...prev, ...testData.bucketlist]);
                    setImportantDates(prev => [...prev, ...testData.importantDates]);
                    setTraditions(prev => [...prev, ...testData.traditions]);
                    setSprints(prev => [...prev, ...testData.sprints]);

                    result = {
                        message: 'Test data generated successfully', count: {
                            stories: testData.stories.length,
                            goals: testData.goals.length,
                            projects: testData.projects.length
                        }
                    };
                } else if (activeEndpoint.resource === 'export') {
                    exportToExcel({
                        stories,
                        sprints,
                        goals,
                        projects,
                        visions,
                        bucketlist,
                        roles,
                        labels,
                        importantDates,
                        traditions
                    });
                    result = { message: 'Export initiated' };
                } else if (activeEndpoint.method === 'GET') {
                    switch (activeEndpoint.resource) {
                        case 'stories': result = stories; break;
                        case 'goals': result = goals; break;
                        case 'projects': result = projects; break;
                        case 'visions': result = visions; break;
                        case 'bucketlist': result = bucketlist; break;
                        case 'labels': result = labels; break;
                        case 'roles': result = roles; break;
                        case 'sprints': result = sprints; break;
                        case 'traditions': result = traditions; break;
                        case 'importantDates': result = importantDates; break;
                    }
                } else if (activeEndpoint.method === 'POST') {
                    const body = JSON.parse(requestBody);
                    // Basic validation and ID generation would go here
                    // This is a simplified simulation
                    const newItem = {
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        ...body
                    };

                    switch (activeEndpoint.resource) {
                        case 'stories': setStories([...stories, newItem]); break;
                        case 'goals': setGoals([...goals, newItem]); break;
                        case 'projects': setProjects([...projects, newItem]); break;
                        case 'visions': setVisions([...visions, newItem]); break;
                        case 'bucketlist': setBucketlist([...bucketlist, newItem]); break;
                        case 'labels': setLabels([...labels, newItem]); break;
                        case 'roles': setRoles([...roles, newItem]); break;
                        // Add other POST handlers as needed
                    }
                    result = newItem;
                    statusCode = 201;
                } else if (activeEndpoint.method === 'PUT') {
                    if (!resourceId) throw new Error('Resource ID is required');
                    const body = JSON.parse(requestBody);

                    switch (activeEndpoint.resource) {
                        case 'stories':
                            setStories(stories.map(item => item.id === resourceId ? { ...item, ...body, updatedAt: new Date().toISOString() } : item));
                            result = { id: resourceId, ...body, updatedAt: new Date().toISOString() };
                            break;
                        case 'goals':
                            setGoals(goals.map(item => item.id === resourceId ? { ...item, ...body, updatedAt: new Date().toISOString() } : item));
                            result = { id: resourceId, ...body, updatedAt: new Date().toISOString() };
                            break;
                        case 'projects':
                            setProjects(projects.map(item => item.id === resourceId ? { ...item, ...body, updatedAt: new Date().toISOString() } : item));
                            result = { id: resourceId, ...body, updatedAt: new Date().toISOString() };
                            break;
                        default:
                            throw new Error('Update not supported for this resource');
                    }
                } else if (activeEndpoint.method === 'DELETE') {
                    if (!resourceId) throw new Error('Resource ID is required');

                    switch (activeEndpoint.resource) {
                        case 'stories':
                            setStories(stories.filter(item => item.id !== resourceId));
                            break;
                        case 'goals':
                            setGoals(goals.filter(item => item.id !== resourceId));
                            break;
                        case 'projects':
                            setProjects(projects.filter(item => item.id !== resourceId));
                            break;
                        case 'visions':
                            setVisions(visions.filter(item => item.id !== resourceId));
                            break;
                        case 'bucketlist':
                            setBucketlist(bucketlist.filter(item => item.id !== resourceId));
                            break;
                        case 'labels':
                            setLabels(labels.filter((item: any) => item.id !== resourceId));
                            break;
                        case 'roles':
                            setRoles(roles.filter((item: any) => item.id !== resourceId));
                            break;
                        default:
                            throw new Error('Delete not supported for this resource');
                    }
                    result = { message: `Resource ${resourceId} deleted` };
                    statusCode = 200;
                }

                setResponse(JSON.stringify(result, null, 2));
                setStatus(statusCode);
            } catch (error: any) {
                setResponse(JSON.stringify({ error: error.message || 'Internal error' }, null, 2));
                setStatus(400);
            } finally {
                setIsLoading(false);
            }
        }, 600);
    };

    const getMethodBadgeVariant = (method: Method) => {
        switch (method) {
            case 'GET': return 'default'; // blue-ish in default theme usually, typically handled by className override
            case 'POST': return 'secondary'; // green-ish usually
            case 'PUT': return 'secondary';
            case 'DELETE': return 'destructive';
            default: return 'outline';
        }
    };

    const getMethodColorClass = (method: Method) => {
        switch (method) {
            case 'GET': return 'bg-blue-500 hover:bg-blue-600';
            case 'POST': return 'bg-green-500 hover:bg-green-600 text-white';
            case 'PUT': return 'bg-orange-500 hover:bg-orange-600 text-white';
            case 'DELETE': return 'bg-red-500 hover:bg-red-600';
            default: return '';
        }
    };
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Sidebar - Endpoints List */}
            <Card className="lg:col-span-1 flex flex-col h-full overflow-hidden">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        Endpoints
                    </CardTitle>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Filter..." className="pl-8 h-9" />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                    <div className="h-full overflow-auto">
                        <div className="flex flex-col p-2 gap-1">
                            {endpoints.map((endpoint, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setActiveEndpoint(endpoint);
                                        setResponse(null);
                                        setStatus(null);
                                        setResourceId('');
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left w-full ${activeEndpoint === endpoint
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Badge
                                        variant={getMethodBadgeVariant(endpoint.method)}
                                        className={`text-[10px] h-5 px-1.5 min-w-[36px] justify-center ${getMethodColorClass(endpoint.method)}`}
                                    >
                                        {endpoint.method}
                                    </Badge>
                                    <span className="truncate">{endpoint.path}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content - Request/Response */}
            <Card className="lg:col-span-3 flex flex-col h-full overflow-hidden">
                <CardHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Badge
                                className={`text-sm px-2.5 py-0.5 ${getMethodColorClass(activeEndpoint.method)}`}
                            >
                                {activeEndpoint.method}
                            </Badge>
                            <h2 className="text-xl font-mono">{activeEndpoint.path}</h2>
                        </div>
                        <Button onClick={executeRequest} disabled={isLoading}>
                            {isLoading ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4 mr-2" />
                            )}
                            Execute
                        </Button>
                    </div>
                    <CardDescription className="mt-2">
                        {activeEndpoint.description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                    <Tabs defaultValue="response" className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 pt-4">
                            <TabsList>
                                <TabsTrigger value="params" disabled={activeEndpoint.method === 'GET' && activeEndpoint.path.indexOf(':id') === -1}>
                                    Body / Params
                                </TabsTrigger>
                                <TabsTrigger value="response">Response</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="params" className="flex-1 p-6 pt-4 overflow-hidden data-[state=inactive]:hidden">
                            <div className="flex flex-col h-full gap-4">
                                {activeEndpoint.path.includes(':id') && (
                                    <div className="space-y-2">
                                        <Label>Resource ID</Label>
                                        <Input
                                            value={resourceId}
                                            onChange={(e) => setResourceId(e.target.value)}
                                            placeholder="e.g. story-123456"
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                )}

                                {(activeEndpoint.method === 'POST' || activeEndpoint.method === 'PUT') && activeEndpoint.resource !== 'test-data' && activeEndpoint.resource !== 'export' && (
                                    <div className="flex flex-col flex-1 gap-2">
                                        <Label>Request Body (JSON)</Label>
                                        <div className="flex-1 border rounded-md overflow-hidden bg-muted/30">
                                            <textarea
                                                value={requestBody}
                                                onChange={(e) => setRequestBody(e.target.value)}
                                                className="w-full h-full p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
                                                spellCheck={false}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="response" className="flex-1 p-6 pt-4 overflow-hidden data-[state=inactive]:hidden flex flex-col">
                            {status !== null && (
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-sm font-medium">Status:</span>
                                    <Badge variant={status >= 200 && status < 300 ? 'outline' : 'destructive'} className="font-mono">
                                        {status} {status === 200 ? 'OK' : status === 201 ? 'Created' : 'Error'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground ml-2">
                                        {new Date().toLocaleTimeString()}
                                    </span>
                                </div>
                            )}

                            <div className="relative flex-1 border rounded-md overflow-hidden bg-slate-950 text-slate-50">
                                {response ? (
                                    <>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                                            onClick={handleCopy}
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                        <div className="h-full w-full overflow-auto">
                                            <pre className="p-4 text-xs sm:text-sm font-mono leading-relaxed">
                                                {response}
                                            </pre>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                                        <Code className="w-12 h-12 opacity-20" />
                                        <p>Click "Execute" to see the response</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
