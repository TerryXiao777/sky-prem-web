
import { Suspense } from "react";
import { InviteRsvpContent } from "@/components/invite-rsvp-content";


export default function InvitePage({params, searchParams} : {
    params: Promise<{ token: string }>;
    searchParams: Promise<{ submitted?: string }>;
}) {
    return (
        // cacheComponents 下params / searchParams 必须在 <Suspense> 内读取，
        // 否则构建期预渲染会报 "uncached or runtime data during prerendering"。
        <Suspense fallback={<p className="text-sm text-[var(--muted-foreground)]">加载中…</p>}>
            <InviteShell params={params} searchParams={searchParams} />
        </Suspense>
    );
}

async function InviteShell({
    params,
    searchParams,
}: {
    params: Promise<{ token: string }>;
    searchParams: Promise<{ submitted?: string }>;
}) {
    const { token } = await params;
    const query = await searchParams;

    return <InviteRsvpContent token={token} submitted={query.submitted === "1"} />
}
