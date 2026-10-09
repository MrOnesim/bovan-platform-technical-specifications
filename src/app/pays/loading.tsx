import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="container-bovan py-12 md:py-16">
      <div className="grid lg:grid-cols-[1fr,1.4fr] gap-12">
        <div className="space-y-6">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <div className="space-y-3 pt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        </div>
        <div className="bg-[#0a0a0a] rounded-3xl p-6 md:p-10">
          <Skeleton className="h-[500px] w-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}