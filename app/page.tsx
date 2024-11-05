import Image from "next/image";
import { TicketSalesPieChart } from "@/components/TicketSalesPieChart";
import { TicketSalesLineChart } from "@/components/TicketSalesLineChart";
import { RecentSalesCard } from "@/components/RecentSalesCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SalesSummaryCard } from "@/components/SalesSummaryCard";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/logo.jpg"
          alt="Flicks Logo"
          width={600}
          height={240}
          priority
          className="mb-4"
        />
        {/* <h1 className="text-3xl md:text-5xl font-extrabold mb-8 md:mb-16 text-center tracking-tight">
          Box Office Dashboard
        </h1> */}
      </div>
      <div className="w-full flex flex-col gap-4 md:gap-6">
        <SalesSummaryCard />
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mx-auto">
          <TicketSalesPieChart />
          <TicketSalesLineChart />
        </div>
        <RecentSalesCard />
      </div>
      <Link
        href="https://squadup.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 md:mt-12 mb-4 md:mb-8">
        <Button
          variant="outline"
          className="text-base md:text-lg flex items-center gap-2">
          View More on SquadUP
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 md:w-5 md:h-5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </Button>
      </Link>
    </main>
  );
}
