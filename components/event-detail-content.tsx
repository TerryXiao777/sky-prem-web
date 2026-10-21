
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { countByStatus } from "./dashboard-content";

import { Button } from "./ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import { Form } from "./ui/form";
import { createInviteLinkAction } from "@/lib/actions/events";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";



export async function EventDetailContent({userId, eventId}: {
    userId: string,
    eventId: string
}) {

    const row = await prisma.event.findFirst({
        where: { id: eventId, ownerUserId: userId },
        select: {
            id: true,
            title: true,
            description: true,
            location: true,
            eventDate: true,
            invite: {select: {token: true}},
            rsvps: {select: {status: true}},
        },
        
    });

    if (!row) {
        notFound();
    }

    const counts = countByStatus(row.rsvps);

    const event = {
        id: row.id,
        title: row.title,
        description: row.description,
        location: row.location,
        eventDate: row.eventDate
            ? row.eventDate.toLocaleString("zh-CN", {
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", hour12: false,
            })
            : null,
        invite: row.invite?.token ?? null,
        goingCount: counts.goingCount,
        maybeCount: counts.maybeCount,
        notGoingCount: counts.notGoingCount,
        
    };

    const rsvpRows = await prisma.eventRsvp.findMany({
        where: { eventId },
        orderBy: { respondedAt: "desc" },
        select: { 
            id: true, 
            name: true, 
            email: true, 
            status: true,
            respondedAt: true,
        },
    });

    const rsvps = rsvpRows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        status: row.status,
        respondedAt: row.respondedAt ? row.respondedAt.toLocaleString("zh-CN", {
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", hour12: false,
            })
            : null,
    }));

    const createInviteActionForEvent = createInviteLinkAction.bind(
        null,
        event.id,
    );

    // 变量名必须与 .env 的 NEXT_PUBLIC_APP_URL 一致（曾误写成 NEXT_PUBLIC_URL，
    // 取到 undefined 后被 ?? "" 静默兜底成空串，生成出没有域名的相对路径链接）。
    // 这里刻意不兜底：缺变量时直接在服务端报错，避免把坏链接发给访客。
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
        throw new Error("缺少环境变量 NEXT_PUBLIC_APP_URL，无法生成邀请链接.");
    }

    const inviteUrl = event.invite
        ? `${appUrl.replace(/\/$/, "")}/invite/${event.invite}`
        : null;


    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-3">
                    <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
                    <p>{event.eventDate || "没有选择日期"}
                    {event.location ? ` - ${event.location}` : ""}
                    </p>
                    
                    {event.description && (
                        <p className="max-w-2xl text-sm text-[var(--muted-foreground)]">{event.description}</p>
                    )}
                   
                </div>

                <Button asChild variant="outline">
                    <Link href="/dashboard">返回</Link>
                </Button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
               <Badge>Going: {event.goingCount}</Badge>
                <Badge variant="secondary" >Maybe: {event.maybeCount}</Badge>
                <Badge variant="outline" >Not Going: {event.notGoingCount}</Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>邀请链接</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>请将此链接分享给宾客，以便他们无需创建帐户即可回复。</p>

                    {inviteUrl ? (
                        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
                            {inviteUrl}
                        </div>
                    ) : <p className="text-sm text-[var(--muted-foreground)]">尚未生成邀请链接。</p>}

                    {/* action必须传函数引用。加引号会变成普通字符串属性，
                        浏览器会把它当相对URL 跳转（曾导致 /events/%7BcreateInviteActionForEvent%7D uuid 崩溃）。*/}
                    <Form action={createInviteActionForEvent}>
                        <Button type="submit">生成邀请链接</Button>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>出席者</CardTitle>
                </CardHeader>
                <CardContent>
                    {rsvps.length === 0 ? 
                        (
                            <p className="text-sm text-[var(--muted-foreground)]">
                                目前还没有出席者。
                            </p>
                        )
                        : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>姓名</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>状态</TableHead>
                                        <TableHead>更新</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rsvps.map((rsvp) => (
                                        <TableRow key={rsvp.id}>
                                            <TableCell>{rsvp.name}</TableCell>
                                            <TableCell>{rsvp.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {rsvp.status === "not_going" 
                                                        ? "Not Going" : rsvp.status
                                                    }
                                                </Badge>
                                                
                                            </TableCell>
                                            <TableCell>{rsvp.respondedAt}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )
                    }
                </CardContent>
            </Card>
        </div>
    )
}