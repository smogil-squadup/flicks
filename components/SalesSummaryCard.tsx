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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@supabase/supabase-js";
import { Skeleton } from "@/components/ui/skeleton";
import { BorderBeam } from "@/components/ui/border-beam";
import { format, parseISO } from "date-fns";

interface SalesSummary {
  event_name: string;
  ticket_count: number;
  credit_card_sales: number;
  cash_sales: number;
  total_sales: number;
}

// Add new interface for available dates
interface EventDate {
  date: string;
  formatted: string;
}

function trimEventName(eventName: string): string {
  const prefix = "X1 Entertainment presents:";
  return eventName.startsWith(prefix)
    ? eventName.slice(prefix.length).trim()
    : eventName;
}

export function SalesSummaryCard() {
  const [salesSummary, setSalesSummary] = useState<SalesSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<EventDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Fetch available dates
  useEffect(() => {
    async function fetchDates() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      try {
        const { data, error } = await supabase
          .from("flicks")
          .select("start_at")
          .order("start_at", { ascending: false });

        if (error) throw error;

        // Create unique dates array with proper timezone handling
        const uniqueDatesMap = new Map<string, EventDate>();

        data.forEach((item) => {
          // Parse the ISO string and format it to YYYY-MM-DD
          const date = parseISO(item.start_at);
          const dateKey = format(date, "yyyy-MM-dd");

          if (!uniqueDatesMap.has(dateKey)) {
            uniqueDatesMap.set(dateKey, {
              date: dateKey,
              formatted: format(date, "MMMM d, yyyy"),
            });
          }
        });

        const uniqueDates = Array.from(uniqueDatesMap.values());
        setAvailableDates(uniqueDates);
        if (uniqueDates.length > 0) {
          setSelectedDate(uniqueDates[0].date);
        }
      } catch (err) {
        console.error("Error fetching dates:", err);
        setError("Failed to fetch dates");
      }
    }

    fetchDates();
  }, []);

  // Fetch sales data for selected date
  useEffect(() => {
    if (!selectedDate) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      try {
        // Use a range query to cover the full day in any timezone
        const startOfDay = `${selectedDate}T00:00:00`;
        const endOfDay = `${selectedDate}T23:59:59`;

        const { data, error } = await supabase
          .from("flicks")
          .select("event_name, quantity, amount, payment_method")
          .gte("start_at", startOfDay)
          .lte("start_at", endOfDay);

        if (error) throw error;

        // Process and group the data
        const summaryMap = new Map<string, SalesSummary>();

        data.forEach((sale) => {
          const eventName = sale.event_name;
          const amount = parseFloat(sale.amount);
          const quantity = parseInt(sale.quantity);

          if (!summaryMap.has(eventName)) {
            summaryMap.set(eventName, {
              event_name: eventName,
              ticket_count: 0,
              credit_card_sales: 0,
              cash_sales: 0,
              total_sales: 0,
            });
          }

          const summary = summaryMap.get(eventName)!;
          summary.ticket_count += quantity;
          summary.total_sales += amount;

          if (sale.payment_method === "credit_card") {
            summary.credit_card_sales += amount;
          } else if (sale.payment_method === "cash") {
            summary.cash_sales += amount;
          }
        });

        const summaryArray = Array.from(summaryMap.values());
        setSalesSummary(summaryArray);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  if (isLoading) {
    return (
      <div className="relative w-full rounded-lg">
        <BorderBeam size={500} />
        <Card className="w-full mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(5)].map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    {[...Array(5)].map((_, i) => (
                      <TableCell key={i}>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="relative w-full rounded-lg">
      <BorderBeam colorFrom="#000000" colorTo="#000000" />
      <Card className="w-full mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales Summary</CardTitle>
              <CardDescription>Summary of sales by event date</CardDescription>
            </div>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem key={date.date} value={date.date}>
                    {date.formatted}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead className="text-right">Ticket Count</TableHead>
                <TableHead className="text-right">Credit Card Sales</TableHead>
                <TableHead className="text-right">Cash Sales</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesSummary.map((summary, index) => (
                <TableRow key={index}>
                  <TableCell className="max-w-xs">
                    {trimEventName(summary.event_name)}
                  </TableCell>
                  <TableCell className="text-right">
                    {summary.ticket_count}
                  </TableCell>
                  <TableCell className="text-right">
                    ${summary.credit_card_sales.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${summary.cash_sales.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${summary.total_sales.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
