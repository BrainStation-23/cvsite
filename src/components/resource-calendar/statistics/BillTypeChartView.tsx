
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { ChartView } from './ChartViewSelector';

interface BillTypeData {
  name: string;
  value: number;
  percentage: number;
}

interface BillTypeChartViewProps {
  data: BillTypeData[];
  view: ChartView;
  colors: string[];
  showLegend?: boolean;
}

export const BillTypeChartView: React.FC<BillTypeChartViewProps> = ({
  data,
  view,
  colors,
  showLegend = true,
}) => {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length]
  }));

  if (view === 'table') {
    return (
      <div className="h-80 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill Type</TableHead>
              <TableHead className="text-right">Resources</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.name}>
                <TableCell className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span>{item.name}</span>
                </TableCell>
                <TableCell className="text-right font-medium">{item.value}</TableCell>
                <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (view === 'bar') {
    return (
      <div className="h-80">
        <ChartContainer
          config={{
            value: {
              label: "Resources",
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name, props) => [
                  `${value} resources (${props.payload.percentage.toFixed(1)}%)`,
                  'Resources'
                ]}
              />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    );
  }

  // Pie chart view
  return (
    <div className="h-80 flex flex-col">
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
              innerRadius={60}
              outerRadius={120}
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
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
      
      {/* Show built-in legend only if showLegend is true */}
      {showLegend && (
        <div className="mt-2 px-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 truncate">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="truncate" title={item.name}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
