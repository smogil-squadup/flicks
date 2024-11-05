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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@supabase/supabase-js";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component

interface RecentSale {
  quantity: string;
  amount: string;
  created_at: string;
  event_name: string;
  payment_method: string;
}

function trimEventName(eventName: string): string {
  const prefix = "X1 Entertainment presents:";
  return eventName.startsWith(prefix)
    ? eventName.slice(prefix.length).trim()
    : eventName;
}

export function RecentSalesCard() {
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
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

      try {
        const { data, error } = await supabase
          .from("flicks")
          .select("quantity, amount, created_at, event_name, payment_method")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;

        setRecentSales(data as RecentSale[]);
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-32" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  if (isLoading) return <SkeletonLoader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>The 5 most recent ticket sales</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quantity</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Event Name</TableHead>
              <TableHead>Payment Method</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentSales.map((sale, index) => (
              <TableRow key={index}>
                <TableCell>{sale.quantity}</TableCell>
                <TableCell>${parseFloat(sale.amount).toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(sale.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="max-w-xs">
                  {trimEventName(sale.event_name)}
                </TableCell>
                <TableCell>{sale.payment_method}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
