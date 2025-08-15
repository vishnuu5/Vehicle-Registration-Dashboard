"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Car, TrendingUp, Factory } from "lucide-react";

type VehicleTypeData = {
  date: string;
  "2W": number;
  "3W": number;
  "4W": number;
  total: number;
  yoy_growth: number;
  qoq_growth: number;
};

type ManufacturerData = {
  date: string;
  manufacturer: string;
  registrations: number;
  yoy_growth: number;
  qoq_growth: number;
};

type DashboardData = {
  vehicleTypeData: VehicleTypeData[];
  manufacturerData: ManufacturerData[];
  totalRegistrations: number;
  totalYoYGrowth: number;
  totalQoQGrowth: number;
};

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedVehicleType, setSelectedVehicleType] =
    useState<string>("total");
  const [selectedManufacturer, setSelectedManufacturer] =
    useState<string>("All");

  useEffect(() => {
    if (!dateRange) {
      setDateRange({
        from: subDays(new Date(), 365 * 2), // Default to last 2 years
        to: new Date(),
      });
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/data");
        if (!res.ok) {
          let errorMessage = `HTTP Error: ${res.status} ${res.statusText}`;
          try {
            const errorData = await res.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
            if (errorData.pythonOutput) {
              errorMessage += ` (Python Output: ${errorData.pythonOutput.substring(
                0,
                100
              )}...)`;
            }
          } catch (jsonError) {
            const textError = await res.text();
            errorMessage = `HTTP Error: ${res.status} ${
              res.statusText
            }. Response: ${textError.substring(0, 100)}...`;
          }
          throw new Error(errorMessage);
        }
        const result: DashboardData = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredVehicleTypeData = useMemo(() => {
    if (!data) return [];
    return data.vehicleTypeData.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        (!dateRange?.from || itemDate >= dateRange.from) &&
        (!dateRange?.to || itemDate <= dateRange.to)
      );
    });
  }, [data, dateRange]);

  const filteredManufacturerData = useMemo(() => {
    if (!data) return [];
    let filtered = data.manufacturerData.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        (!dateRange?.from || itemDate >= dateRange.from) &&
        (!dateRange?.to || itemDate <= dateRange.to)
      );
    });

    if (selectedManufacturer !== "All") {
      filtered = filtered.filter(
        (item) => item.manufacturer === selectedManufacturer
      );
    }
    return filtered;
  }, [data, dateRange, selectedManufacturer]);

  const uniqueManufacturers = useMemo(() => {
    if (!data) return [];
    const manufacturers = new Set(
      data.manufacturerData.map((item) => item.manufacturer)
    );
    return ["All", ...Array.from(manufacturers).sort()];
  }, [data]);

  const getGrowthColor = (value: number) => {
    if (value > 0) return "text-green-500";
    if (value < 0) return "text-red-500";
    return "text-gray-500";
  };

  if (loading) {
    return (
      <div className="p-2 md:p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardContent>
          </Card>
        ))}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 md:p-4 text-red-500">
        <p className="text-sm md:text-base">Error: {error}</p>
        <p className="text-xs md:text-sm mt-2">
          Please ensure the Python script is correctly set up and executable.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-2 md:p-4 text-sm md:text-base">No data available.</div>
    );
  }

  return (
    <div className="p-2 md:p-4 space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      {/* Controls Section - Mobile Responsive */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:gap-4 md:items-center md:justify-between">
        <div className="w-full md:w-auto">
          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
            className="w-full [&>button]:bg-muted [&>button]:text-foreground [&>button]:w-full md:[&>button]:w-[300px]"
          />
        </div>
        <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:gap-4">
          <Select
            value={selectedVehicleType}
            onValueChange={setSelectedVehicleType}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select Vehicle Type" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-300">
              <SelectItem value="total">Total Vehicles</SelectItem>
              <SelectItem value="2W">2-Wheelers</SelectItem>
              <SelectItem value="3W">3-Wheelers</SelectItem>
              <SelectItem value="4W">4-Wheelers</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={selectedManufacturer}
            onValueChange={setSelectedManufacturer}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select Manufacturer" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-300">
              {uniqueManufacturers.map((manufacturer) => (
                <SelectItem key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards - Mobile Responsive */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Registrations
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {data.totalRegistrations.toLocaleString()}
            </div>
            <p className={cn("text-xs", getGrowthColor(data.totalYoYGrowth))}>
              {data.totalYoYGrowth >= 0 ? "+" : ""}
              {data.totalYoYGrowth.toFixed(2)}% YoY
            </p>
            <p className={cn("text-xs", getGrowthColor(data.totalQoQGrowth))}>
              {data.totalQoQGrowth >= 0 ? "+" : ""}
              {data.totalQoQGrowth.toFixed(2)}% QoQ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedVehicleType === "total" ? "Total" : selectedVehicleType}
              -Wheeler Registrations
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {filteredVehicleTypeData.length > 0
                ? filteredVehicleTypeData[filteredVehicleTypeData.length - 1][
                    selectedVehicleType as keyof VehicleTypeData
                  ]?.toLocaleString() || "N/A"
                : "N/A"}
            </div>
            <p
              className={cn(
                "text-xs",
                getGrowthColor(
                  filteredVehicleTypeData.length > 0
                    ? filteredVehicleTypeData[
                        filteredVehicleTypeData.length - 1
                      ].yoy_growth
                    : 0
                )
              )}
            >
              {filteredVehicleTypeData.length > 0 &&
              filteredVehicleTypeData[filteredVehicleTypeData.length - 1]
                .yoy_growth >= 0
                ? "+"
                : ""}
              {filteredVehicleTypeData.length > 0
                ? filteredVehicleTypeData[
                    filteredVehicleTypeData.length - 1
                  ].yoy_growth.toFixed(2)
                : "N/A"}
              % YoY
            </p>
            <p
              className={cn(
                "text-xs",
                getGrowthColor(
                  filteredVehicleTypeData.length > 0
                    ? filteredVehicleTypeData[
                        filteredVehicleTypeData.length - 1
                      ].qoq_growth
                    : 0
                )
              )}
            >
              {filteredVehicleTypeData.length > 0 &&
              filteredVehicleTypeData[filteredVehicleTypeData.length - 1]
                .qoq_growth >= 0
                ? "+"
                : ""}
              {filteredVehicleTypeData.length > 0
                ? filteredVehicleTypeData[
                    filteredVehicleTypeData.length - 1
                  ].qoq_growth.toFixed(2)
                : "N/A"}
              % QoQ
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedManufacturer === "All" ? "Top" : selectedManufacturer}{" "}
              Registrations
            </CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {selectedManufacturer === "All"
                ? filteredManufacturerData
                    .reduce((sum, item) => sum + item.registrations, 0)
                    .toLocaleString()
                : filteredManufacturerData.length > 0
                ? filteredManufacturerData[
                    filteredManufacturerData.length - 1
                  ].registrations.toLocaleString()
                : "N/A"}
            </div>
            <p
              className={cn(
                "text-xs",
                getGrowthColor(
                  filteredManufacturerData.length > 0
                    ? filteredManufacturerData[
                        filteredManufacturerData.length - 1
                      ].yoy_growth
                    : 0
                )
              )}
            >
              {filteredManufacturerData.length > 0 &&
              filteredManufacturerData[filteredManufacturerData.length - 1]
                .yoy_growth >= 0
                ? "+"
                : ""}
              {filteredManufacturerData.length > 0
                ? filteredManufacturerData[
                    filteredManufacturerData.length - 1
                  ].yoy_growth.toFixed(2)
                : "N/A"}
              % YoY
            </p>
            <p
              className={cn(
                "text-xs",
                getGrowthColor(
                  filteredManufacturerData.length > 0
                    ? filteredManufacturerData[
                        filteredManufacturerData.length - 1
                      ].qoq_growth
                    : 0
                )
              )}
            >
              {filteredManufacturerData.length > 0 &&
              filteredManufacturerData[filteredManufacturerData.length - 1]
                .qoq_growth >= 0
                ? "+"
                : ""}
              {filteredManufacturerData.length > 0
                ? filteredManufacturerData[
                    filteredManufacturerData.length - 1
                  ].qoq_growth.toFixed(2)
                : "N/A"}
              % QoQ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Mobile Responsive */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">
            Vehicle Type Registration Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <ChartContainer
            config={{}}
            className="min-h-[250px] md:min-h-[300px] w-full"
          >
            <LineChart
              data={filteredVehicleTypeData}
              width={300}
              height={250}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), "MMM yy")}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={20}
                fontSize={10}
              />
              <YAxis tickLine={false} axisLine={false} fontSize={10} />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              <Line
                dataKey="2W"
                type="monotone"
                stroke="#8884d8"
                name="2-Wheelers"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="3W"
                type="monotone"
                stroke="#82ca9d"
                name="3-Wheelers"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="4W"
                type="monotone"
                stroke="#ffc658"
                name="4-Wheelers"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="total"
                type="monotone"
                stroke="#ff7300"
                name="Total"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="mb-4 md:mb-6">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">
            Manufacturer Registration Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <ChartContainer
            config={{}}
            className="min-h-[250px] md:min-h-[300px] w-full"
          >
            <BarChart
              data={filteredManufacturerData}
              width={300}
              height={250}
              margin={{ top: 5, right: 5, left: 5, bottom: 60 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="manufacturer"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={8}
              />
              <YAxis tickLine={false} axisLine={false} fontSize={10} />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              <Bar
                dataKey="registrations"
                fill="#8884d8"
                name="Registrations"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
