
import { Button } from "./ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card ,CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { RsvpStatus as PrismaRsvpStatus } from "@/app/generated/prisma/enums";

export function countByStatus (rsvps: {status: PrismaRsvpStatus}[]) {
   let goingCount = 0;
   let maybeCount = 0;
   let notGoingCount = 0;
   
   for (const r of rsvps){
    if (r.status === PrismaRsvpStatus.going) goingCount++;
    else if (r.status === PrismaRsvpStatus.maybe) maybeCount++;
    else if (r.status === PrismaRsvpStatus.not_going) notGoingCount++;
   }
   return { goingCount, maybeCount, notGoingCount };
}

export async function DashboardContent ({ userId }: { userId: string }) {

    const rows = await prisma.event.findMany({
        where: { ownerUserId: userId },
        orderBy: {createdAt: "desc"},
        select: {
            id: true,
            title: true,
            eventDate: true,
            location: true,
            rsvps: {select: {status: true}},
        },
    });

    const events = rows.map((row) => ({
        id: row.id,
        title: row.title,
        eventDate: row.eventDate
            ? row.eventDate.toLocaleString("zh-CN", {
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", hour12: false,
            })
            : null,
        location: row.location,
        ...countByStatus(row.rsvps),
    }));

    return (
    <div className="flex flex-1 flex-col gap-6">
        <div>
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">你的事件</h1>
                <p className="text-sm text-[var(--muted-foreground)]">跟踪参会者反馈并管理邀请链接 </p>
            </div>

            <Button asChild>
                <Link href={"/events/new"}>创建新事件</Link>
            </Button>
        </div>

        {/** TODO: Add event list */}

        {events.length === 0 ? (
            <Card>
                <CardHeader >
                    <CardTitle>没有事件</CardTitle>
                    
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-[var(--muted-foreground)]">创建您的首个活动以开始收集回复</p>
                </CardContent>
            </Card>
        ) : (
            <div className="grid gap-4 md:grid-cols-2">
                {events.map((event) => (
                <Card key={event.id}>
                    <CardHeader className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <Button size="sm" asChild>
                                <Link href={`/events/${event.id}`}>查看</Link>
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="secondary" >Going: {event.goingCount}</Badge>
                            <Badge variant="secondary" >Maybe: {event.maybeCount}</Badge>
                            <Badge variant="secondary" >{" "} Not Going: {event.notGoingCount}</Badge>
                        </div>
                        <p>{event.eventDate
                            ? event.eventDate
                            : "没有日期选择"}

                            {event.location ? ` - ${event.location}` : ""}

                        </p>
                    </CardHeader>
                    
                </Card>
            ))}
            </div>
        )}
    </div> 
    );
}