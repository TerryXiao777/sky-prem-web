import { Suspense } from "react";
import { getSession } from "@/lib/auth/server";
import { DashboardContent } from "@/components/dashboard-content";

// 读取 cookie 属于运行时数据访问：必须置于 <Suspense> 边界内，
// 否则在cacheComponents 下预渲染会报 "encountered uncached or runtime data during prerendering"。
async function DashboardShell() {
    const session = await getSession();
    return <DashboardContent userId={session.data?.user?.id ?? ""} />;
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<p className="text-sm text-[var(--muted-foreground)]">加载中…</p>}>
            <DashboardShell />
        </Suspense>
    );
}