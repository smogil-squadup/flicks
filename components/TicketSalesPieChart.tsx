"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { createClient } from "@supabase/supabase-js";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component

interface TicketSale {
  event_name: string;
  quantity: string;
  amount: string;
}

interface ChartData {
  name: string;
  value: number;
}

export function TicketSalesPieChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalTicketsSold, setTotalTicketsSold] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      try {
        const { data, error } = await supabase
          .from("flicks")
          .select("event_name, quantity")
          .gte("created_at", twentyFourHoursAgo.toISOString());

        if (error) throw error;

        const aggregatedData = (data as TicketSale[]).reduce((acc, sale) => {
          const quantity = parseInt(sale.quantity, 10) || 0;
          const eventName = sale.event_name || "Unknown Event";
          acc[eventName] = (acc[eventName] || 0) + quantity;
          return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(aggregatedData)
          .map(([eventName, quantity]) => ({
            name: eventName,
            value: quantity,
          }))
          .filter((item) => item.value > 0)
          .sort((a, b) => b.value - a.value);

        setChartData(chartData);
        setTotalTicketsSold(
          chartData.reduce((sum, entry) => sum + entry.value, 0)
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Skeleton loading component
  const SkeletonLoader = () => (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <Skeleton className="h-[400px] w-[400px] rounded-full" />
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) return <SkeletonLoader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {totalTicketsSold} Ticket Sales in the Last 24 Hours
        </CardTitle>
        <CardDescription>Event sales breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height={400}
            className="h-[300px] md:h-[400px]">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`hsl(${(index * 360) / chartData.length}, 70%, 50%)`}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8">No event sales data available</div>
        )}
      </CardContent>
    </Card>
  );
}
