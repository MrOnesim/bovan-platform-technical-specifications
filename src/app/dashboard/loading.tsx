import { Skeleton, SkeletonHeading } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="container-bovan py-12 md:py-16">
      <SkeletonHeading />
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 md:p-8 rounded-2xl bg-[#fafafa] border border-[#e5e5e5]">
            <Skeleton className="w-12 h-12 rounded-full mb-4" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-3 w-24 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}