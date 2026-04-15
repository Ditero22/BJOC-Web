import { Skeleton } from "./skeleton";

const BAR_CHART_SKELETON_HEIGHTS = [
  "42%",
  "68%",
  "55%",
  "84%",
  "61%",
  "73%",
  "49%",
];

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
  showHeader = true,
}: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {showHeader && (
          <thead>
            <tr className="border-b border-[#F0F0F0] bg-gray-50">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="py-3 px-5">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-[#F0F0F0] last:border-b-0"
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="py-4 px-5">
                  {colIndex === 0 ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ) : colIndex === columns - 1 ? (
                    <div className="flex items-center justify-center gap-2">
                      <Skeleton className="w-8 h-8 rounded-lg" />
                      <Skeleton className="w-8 h-8 rounded-lg" />
                    </div>
                  ) : (
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface CardSkeletonProps {
  showHeader?: boolean;
  showFooter?: boolean;
  lines?: number;
}

export function CardSkeleton({
  showHeader = true,
  showFooter = true,
  lines = 4,
}: CardSkeletonProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      {showHeader && (
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
      )}

      <Skeleton className="h-6 w-16 rounded-full mb-4" />

      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      {showFooter && <Skeleton className="h-10 w-full rounded-lg mt-4" />}
    </div>
  );
}

interface FormSkeletonProps {
  fields?: number;
  columns?: 1 | 2;
}

export function FormSkeleton({ fields = 6, columns = 2 }: FormSkeletonProps) {
  return (
    <div
      className={`grid gap-4 ${columns === 2 ? "grid-cols-2" : "grid-cols-1"}`}
    >
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

interface ChartSkeletonProps {
  type?: "bar" | "line" | "pie" | "area";
  height?: number;
}

export function ChartSkeleton({
  type = "bar",
  height = 200,
}: ChartSkeletonProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      <div className="relative" style={{ height }}>
        {type === "bar" && (
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around gap-2 h-full pt-8">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-8 rounded-t"
                style={{ height: BAR_CHART_SKELETON_HEIGHTS[i] }}
              />
            ))}
          </div>
        )}

        {type === "line" && (
          <div className="h-full flex flex-col justify-between">
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-2 w-full rounded" />
          </div>
        )}

        {type === "pie" && (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="w-32 h-32 rounded-full" />
          </div>
        )}

        {type === "area" && (
          <div className="h-full flex flex-col justify-end">
            <Skeleton className="h-3/4 w-full rounded-t-lg" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showBadge?: boolean;
}

export function ListSkeleton({
  items = 5,
  showAvatar = true,
  showBadge = false,
}: ListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0"
        >
          {showAvatar && <Skeleton className="w-10 h-10 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {showBadge && <Skeleton className="h-6 w-16 rounded-full" />}
        </div>
      ))}
    </div>
  );
}

interface ModalSkeletonProps {
  showHeader?: boolean;
  contentLines?: number;
  showFooter?: boolean;
}

export function ModalSkeleton({
  showHeader = true,
  contentLines = 6,
  showFooter = true,
}: ModalSkeletonProps) {
  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      )}

      <div className="space-y-4">
        {Array.from({ length: contentLines }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>

      {showFooter && (
        <div className="flex items-center justify-end gap-3 pt-4">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      )}
    </div>
  );
}

interface StatsCardSkeletonProps {
  count?: number;
}

export function StatsCardSkeleton({ count = 4 }: StatsCardSkeletonProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

interface PageHeaderSkeletonProps {
  showDescription?: boolean;
}

export function PageHeaderSkeleton({
  showDescription = true,
}: PageHeaderSkeletonProps) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      {showDescription && <Skeleton className="h-4 w-96" />}
    </div>
  );
}

interface FilterBarSkeletonProps {
  filterCount?: number;
  showSearch?: boolean;
  showButton?: boolean;
}

export function FilterBarSkeleton({
  filterCount = 4,
  showSearch = true,
  showButton = true,
}: FilterBarSkeletonProps) {
  return (
    <div className="flex items-center gap-3">
      {showSearch && <Skeleton className="h-10 w-64 rounded-lg" />}
      {Array.from({ length: filterCount }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-32 rounded-lg" />
      ))}
      {showButton && <Skeleton className="h-10 w-24 rounded-lg ml-auto" />}
    </div>
  );
}

interface InfrastructureTableSkeletonProps {
  rows?: number;
}

export function InfrastructureTableSkeleton({
  rows = 4,
}: InfrastructureTableSkeletonProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="py-3 px-4">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="py-3 px-4">
                <Skeleton className="h-4 w-12" />
              </th>
              <th className="py-3 px-4">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="py-3 px-4">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="py-3 px-4">
                <Skeleton className="h-4 w-16" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-b-0">
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-12" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-24" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface AlertsPanelSkeletonProps {
  items?: number;
}

export function AlertsPanelSkeleton({ items = 3 }: AlertsPanelSkeletonProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: items }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <Skeleton className="w-2 h-2 rounded-full mt-1.5" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface IntegrationListSkeletonProps {
  items?: number;
}

export function IntegrationListSkeleton({
  items = 3,
}: IntegrationListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="border-b border-gray-100 pb-5 last:border-b-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <div className="flex items-center gap-4 mt-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
