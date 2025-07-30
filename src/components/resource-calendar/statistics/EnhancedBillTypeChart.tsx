
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis,
  LabelList,
  Treemap,
  Rectangle
} from 'recharts';
import { EnhancedChartView } from './EnhancedChartViewSelector';

interface BillTypeData {
  name: string;
  value: number;
  percentage: number;
}

interface EnhancedBillTypeChartProps {
  data: BillTypeData[];
  view: EnhancedChartView;
  colors: string[];
  totalResources: number;
}

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = (entry: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = entry;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if percentage is > 5% to avoid cluttering
  if (percent < 0.05) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="12"
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTreemapContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, colors } = props;
  
  return (
    <g>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[index % colors.length],
          stroke: '#fff',
          strokeWidth: 2,
          strokeOpacity: 1,
        }}
      />
      {width > 60 && height > 40 && (
        <text
          x={x + width / 2}
          y={y + height / 2 - 10}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="600"
        >
          {payload.name}
        </text>
      )}
      {width > 60 && height > 40 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 5}
          textAnchor="middle"
          fill="white"
          fontSize="10"
        >
          {payload.value} ({payload.percentage.toFixed(1)}%)
        </text>
      )}
    </g>
  );
};

export const EnhancedBillTypeChart: React.FC<EnhancedBillTypeChartProps> = ({
  data,
  view,
  colors,
  totalResources,
}) => {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length]
  }));

  if (view === 'table') {
    return (
      <div className="h-96 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Bill Type</TableHead>
              <TableHead className="text-right">Resources</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data
              .sort((a, b) => b.value - a.value)
              .map((item, index) => (
                <TableRow key={item.name} className="hover:bg-muted/50">
                  <TableCell>
                    <div 
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right font-mono text-lg">
                    {item.value}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="bg-muted px-2 py-1 rounded-md text-sm">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (view === 'treemap') {
    return (
      <div className="h-96">
        <ChartContainer
          config={{
            value: {
              label: "Resources",
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={chartData}
              dataKey="value"
              aspectRatio={4/3}
              stroke="#fff"
              fill="#8884d8"
              content={<CustomTreemapContent colors={colors} />}
            />
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    );
  }

  if (view === 'bar') {
    return (
      <div className="h-96">
        <ChartContainer
          config={{
            value: {
              label: "Resources",
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData.sort((a, b) => b.value - a.value)}
              layout="horizontal"
              margin={{ top: 20, right: 60, left: 20, bottom: 20 }}
            >
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                width={100}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name, props) => [
                  `${value} resources (${props.payload.percentage.toFixed(1)}%)`,
                  'Resources'
                ]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  style={{ fill: 'currentColor', fontSize: '12px' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    );
  }

  // Enhanced donut chart view (pie)
  return (
    <div className="h-96 flex flex-col">
      <ChartContainer
        config={{
          value: {
            label: "Resources",
          },
        }}
        className="flex-1"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              innerRadius={60}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value, name, props) => [
                `${value} resources (${props.payload.percentage.toFixed(1)}%)`,
                props.payload.name
              ]}
            />
            {/* Center text showing total */}
            <text 
              x="50%" 
              y="50%" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              className="fill-foreground text-2xl font-bold"
            >
              {totalResources}
            </text>
            <text 
              x="50%" 
              y="50%" 
              dy={20}
              textAnchor="middle" 
              dominantBaseline="middle" 
              className="fill-muted-foreground text-sm"
            >
              Total Resources
            </text>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
