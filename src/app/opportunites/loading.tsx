import { Skeleton, SkeletonGrid, SkeletonHeading } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="container-bovan py-12 md:py-16">
      <SkeletonHeading />
      <div className="mt-10">
        <SkeletonGrid count={8} className="grid md:grid-cols-2 gap-4" />
      </div>
    </div>
  );
}