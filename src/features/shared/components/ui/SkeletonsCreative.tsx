import { Skeleton } from "./skeleton";

export function LoginCreativeSplitSkeleton() {
  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-white">
      {/* Left Column (Brand area) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-slate-50 relative overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full rounded-none opacity-20" />
        <div className="relative z-10 space-y-4">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="relative z-10 flex flex-col max-w-lg mt-auto mb-auto space-y-6">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <Skeleton className="h-12 w-3/4 rounded-lg" />
          <Skeleton className="h-8 w-5/6 rounded-lg" />
          <Skeleton className="h-6 w-full max-w-sm rounded-lg" />
        </div>
        <div className="relative z-10">
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Right Column (Form area) */}
      <div className="flex w-full flex-col justify-center px-6 sm:px-12 lg:w-1/2 xl:px-24">
        {/* Mobile top logo */}
        <div className="mb-8 flex flex-col items-center lg:hidden space-y-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <Skeleton className="h-8 w-40" />
        </div>

        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="mb-8 space-y-4">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-5/6" />
          </div>

          {/* Form */}
          <div className="flex flex-col gap-5">
            <div className="space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CareersCreativeSplitSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Header */}
      <div className="w-full bg-slate-100 py-24 px-6 md:px-12 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full rounded-none opacity-30" />
        <div className="relative z-10 text-center flex flex-col items-center space-y-6">
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <Skeleton className="h-12 w-64 md:w-96 rounded-xl" />
          <Skeleton className="h-6 w-80 max-w-full rounded-lg" />
        </div>
      </div>

      {/* Filter Section */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-10">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
          <Skeleton className="h-12 w-full flex-1 rounded-xl" />
          <Skeleton className="h-12 w-full md:w-48 rounded-xl" />
          <Skeleton className="h-12 w-full md:w-48 rounded-xl" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-6">
        <Skeleton className="h-5 w-24 rounded" />
      </div>

      {/* Grid of JobListings */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col space-y-4 shadow-sm">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-7 w-3/4" />
              <div className="space-y-2 mt-4">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="mt-8">
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
