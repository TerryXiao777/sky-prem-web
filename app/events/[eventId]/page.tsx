import { Suspense } from "react";
import { getSession } from "@/lib/auth/server";
import { EventDetailContent } from "@/components/event-detail-content";


export default function EventDetailsPage({params,} : {
    params: Promise<{ eventId: string }>
}) {
    return (
        // cacheComponents 下，读取 cookies()/params 的逻辑必须包在 <Suspense> 内，
        // 否则构建期预渲染会报 "uncached or runtime data during prerendering"。
        <Suspense fallback={<p className="text-sm text-[var(--muted-foreground)]">加载中…</p>}>
            <EventDetailsShell params={params} />
        </Suspense>
    );
}

async function EventDetailsShell({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = await params;
    const session = await getSession();

    return <EventDetailContent eventId={eventId} userId={session.data?.user?.id ?? ""} />
}
