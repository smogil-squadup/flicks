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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { createClient } from "@supabase/supabase-js";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component

interface TicketSale {
  created_at: string;
  amount: string;
}

interface ChartData {
  hour: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
}

export function TicketSalesLineChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
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
          .from("elysian")
          .select("created_at, amount")
          .gte("created_at", twentyFourHoursAgo.toISOString())
          .order("created_at", { ascending: true });

        if (error) throw error;

        const hourlyData = (data as TicketSale[]).reduce((acc, sale) => {
          const saleDate = new Date(sale.created_at);
          const hourKey = saleDate.toISOString().slice(0, 13); // Use ISO string for unique hour key
          const amount = parseFloat(sale.amount) || 0;

          if (!acc[hourKey]) {
            acc[hourKey] = { hour: saleDate, totalAmount: 0 };
          }
          acc[hourKey].totalAmount += amount;
          return acc;
        }, {} as Record<string, { hour: Date; totalAmount: number }>);

        const chartData = Object.values(hourlyData).map(
          ({ hour, totalAmount }) => {
            const startTime = new Date(hour);
            const endTime = new Date(
              startTime.getTime() + 59 * 60 * 1000 + 59 * 1000
            ); // Add 59 minutes and 59 seconds
            return {
              hour: startTime.getHours().toString(),
              startTime: startTime.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
              endTime: endTime.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
              totalAmount: Number(totalAmount.toFixed(2)),
            };
          }
        );

        setChartData(chartData);
        setTotalAmount(
          chartData.reduce((sum, entry) => sum + entry.totalAmount, 0)
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

  // Skeleton loading component
  const SkeletonLoader = () => (
    <Card className="w-full mx-auto">
      <CardHeader>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const { startTime, endTime, totalAmount } = payload[0]
        .payload as ChartData;
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow">
          <p className="font-semibold">{`${startTime} - ${endTime}`}</p>
          <p>{`Total Amount: $${totalAmount.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) return <SkeletonLoader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>
          ${totalAmount.toFixed(2)} in Sales Over the Last 24 Hours
        </CardTitle>
        <CardDescription>Total sales amount per hour</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                interval="preserveStartEnd"
                tickFormatter={(value) => `${value}:00`}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="totalAmount" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div>No data available for the line chart</div>
        )}
      </CardContent>
    </Card>
  );
}
