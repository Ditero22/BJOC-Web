import { Skeleton } from "@/features/shared/components/ui";

export function AuthSkeleton() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-6xl min-h-[620px] flex flex-col md:flex-row bg-white rounded-[30px] shadow-2xl overflow-hidden">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#3EB076] to-[#104027] p-12 flex flex-col justify-center gap-6">
          <Skeleton className="h-6 w-32 bg-white/25" />
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="size-20 rounded-full bg-white/30" />
            <Skeleton className="h-12 w-32 bg-white/25" />
          </div>
          <Skeleton className="h-4 w-3/4 bg-white/20" />
          <Skeleton className="h-4 w-5/6 bg-white/20" />
        </div>

        <div className="w-full md:w-1/2 px-10 md:px-16 lg:px-20 py-12 flex flex-col justify-center gap-6">
          <div className="space-y-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>

          <div className="space-y-6">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-11 w-48 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
