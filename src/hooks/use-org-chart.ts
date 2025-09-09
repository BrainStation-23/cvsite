import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Node, Edge, Position } from '@xyflow/react';
import { useMemo } from 'react';
import dagre from 'dagre';

interface ProfileRelation {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  employee_id: string;
}

interface ProfileRelationsResponse {
  peers: ProfileRelation[];
  manager: ProfileRelation | null;
  reports: ProfileRelation[];
}

const nodeWidth = 280;
const nodeHeight = 120;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  // Create a new dagre graph instance to avoid side effects
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

export function useOrgChart() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['org-chart', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID available');
      
      const { data, error } = await supabase.rpc('get_profile_relations', {
        target_id: user.id
      });

      if (error) throw error;
      return data as unknown as ProfileRelationsResponse;
    },
    enabled: !!user?.id,
  });

  const transformToFlowData = (relations: ProfileRelationsResponse, currentUserId: string) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Add current user node (center)
    nodes.push({
      id: currentUserId,
      type: 'orgChartNode',
      data: {
        id: currentUserId,
        first_name: user?.firstName || '',
        last_name: user?.lastName || '',
        employee_id: user?.employee_id || '',
        email: user?.email || '',
        isCurrentUser: true,
        nodeType: 'current'
      },
      position: { x: 0, y: 0 },
    });

    // Add manager node if exists
    if (relations.manager) {
      nodes.push({
        id: relations.manager.id,
        type: 'orgChartNode',
        data: {
          ...relations.manager,
          isCurrentUser: false,
          nodeType: 'manager'
        },
        position: { x: 0, y: 0 },
      });

      // Edge from manager to current user
      edges.push({
        id: `${relations.manager.id}-${currentUserId}`,
        source: relations.manager.id,
        target: currentUserId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'hsl(var(--primary))' },
      });
    }

    // Add peer nodes and connect them to manager
    relations.peers.forEach((peer, index) => {
      nodes.push({
        id: peer.id,
        type: 'orgChartNode',
        data: {
          ...peer,
          isCurrentUser: false,
          nodeType: 'peer'
        },
        position: { x: 0, y: 0 },
      });

      // Connect each peer to manager if manager exists
      if (relations.manager) {
        edges.push({
          id: `${relations.manager.id}-${peer.id}`,
          source: relations.manager.id,
          target: peer.id,
          type: 'smoothstep',
          animated: false,
          style: { stroke: 'hsl(var(--primary))' },
        });
      }
    });

    // Add report nodes
    relations.reports.forEach((report, index) => {
      nodes.push({
        id: report.id,
        type: 'orgChartNode',
        data: {
          ...report,
          isCurrentUser: false,
          nodeType: 'report'
        },
        position: { x: 0, y: 0 },
      });

      // Edge from current user to report
      edges.push({
        id: `${currentUserId}-${report.id}`,
        source: currentUserId,
        target: report.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'hsl(var(--primary))' },
      });
    });

    return getLayoutedElements(nodes, edges);
  };

  const flowData = useMemo(() => {
    if (!data || !user?.id) return { nodes: [], edges: [] };
    return transformToFlowData(data, user.id);
  }, [data, user?.id]);

  return {
    nodes: flowData.nodes,
    edges: flowData.edges,
    isLoading,
    error,
    rawData: data
  };
}