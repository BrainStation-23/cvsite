import React, { useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Position,
} from '@reactflow/core';
import { Controls } from '@reactflow/controls';
import { Background, BackgroundVariant } from '@reactflow/background';
import '@reactflow/core/dist/style.css';
import '@reactflow/controls/dist/style.css';
import '@reactflow/background/dist/style.css';
import OrgChartNode from './OrgChartNode';
import { useOrgChart } from '@/hooks/use-org-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, UserCheck, UserPlus } from 'lucide-react';

const nodeTypes = {
  orgChartNode: OrgChartNode,
};

interface OrgChartProps {
  className?: string;
}

export default function OrgChart({ className }: OrgChartProps) {
  const { nodes: initialNodes, edges: initialEdges, isLoading, error, rawData } = useOrgChart();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Update nodes and edges when data changes
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading organizational chart...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-destructive mb-2">Failed to load organizational chart</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rawData || (nodes.length === 0 && edges.length === 0)) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Team Data Available</h3>
              <p className="text-muted-foreground">
                Unable to load organizational relationships at this time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Statistics Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{rawData.manager ? 1 : 0}</p>
                <p className="text-sm text-muted-foreground">Manager</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{rawData.peers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Peers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{rawData.reports?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Direct Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizational Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.5}
              maxZoom={1.5}
              defaultEdgeOptions={{
                animated: false,
                style: { strokeWidth: 2 },
              }}
            >
              <Controls />
              <Background 
                variant={BackgroundVariant.Dots} 
                gap={20} 
                size={1}
                className="opacity-50"
              />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}