
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RsvpStatus } from "@/app/generated/prisma/enums";
import { submitOrUpdateRsvpAction } from "@/lib/actions/events";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Form, FormField } from "./ui/form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";



const STATUS_OPTIONS: { value: RsvpStatus; label: string }[] = [
    { value: RsvpStatus.going, label: "参加" },
    { value: RsvpStatus.maybe, label: "待定" },
    { value: RsvpStatus.not_going, label: "不参加" },
];

export async function InviteRsvpContent({ 
    token, 
    submitted 
}: { 
    token: string; 
    submitted: boolean 
}) {

    const row = await prisma.eventInvite.findFirst({
        // 必须按 token 过滤：否则会命中库中任意一条邀请。
        where: { token },
        select: {
            id: true,
            event: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    location: true,
                    eventDate: true,
                },
            },
        },
    });

    if (!row) {
        notFound();
    }

    const e = row.event;
    const event = {
        title: e.title,
        description: e.description,
        location: e.location,
        // 在数据层一次性格式化，渲染层直出。避免对已格式化字符串再 new Date()（会得到 Invalid Date）。
        eventDate: e.eventDate ? e.eventDate.toLocaleString("zh-CN", {
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", hour12: false,
            })
            : null,
    }

    const submitRsvpForToken = submitOrUpdateRsvpAction.bind(null, token);

    if (submitted) {
        return (
            <div className="mx-auto w-full max-w-2xl">
            <Card>
                <CardHeader className="space-y-3">
                    <Badge variant="secondary" className="w-fit">已收到你的回复</Badge>
                    <CardTitle>{event.title}</CardTitle>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        {
                            // 直接输出数据层已格式化好的字符串；再套new Date() 会得到 Invalid Date。
                            event.eventDate || "没有选择日期"
                        }
                        {
                            event.location ? ` - ${event.location}` : ""
                        }
                    </p>
                    {event.description ? (
                        <p className="text-sm text-[var(--muted-foreground)]">
                            {event.description}
                        </p>
                    ) : null}
                </CardHeader>
                <CardContent>
                    {true ? (
                        <p className="mb-4 rounded-md border border-[var(--accent)]/50 bg-[var(--accent)]/15">
                            Thanks. Your RSVP has been recorded (or updated).

                        </p>
                    ) : null}
                    <Form action={submitRsvpForToken}>
                        <FormField>
                            <Label htmlFor="name">姓名</Label>
                            <Input id="name" name="name" required placeholder="输入你的姓名" maxLength={120} />
                        </FormField>
                        <FormField>
                            <Label htmlFor="email">邮箱</Label>
                            <Input id="email" name="email" type="email" required placeholder="输入你的邮箱" maxLength={320} />
                        </FormField>
                        <FormField>
                            <Label htmlFor="status">参会状态</Label>
                            <select 
                                id="status" 
                                name="status" 
                                required 
                                defaultValue={RsvpStatus.going}
                                className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]">
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </FormField>
                        <Button type="submit" className="self-start">提交回复</Button>
                    </Form>
                    
                </CardContent>
            </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-2xl">
            <Card>
                <CardHeader className="space-y-3">
                    <CardTitle>{event.title}</CardTitle>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        {
                            // 直接输出数据层已格式化好的字符串；再套 new Date() 会得到 Invalid Date。
                            event.eventDate || "没有选择日期"
                        }
                        {
                            event.location ? ` · ${event.location}` : ""
                        }
                    </p>
                    {event.description ? (
                        <p className="text-sm text-[var(--muted-foreground)]">
                            {event.description}
                        </p>
                    ) : null}
                </CardHeader>
                <CardContent>
                    <Form action={submitRsvpForToken}>
                        <FormField>
                            <Label htmlFor="name">姓名</Label>
                            <Input id="name" name="name" required placeholder="输入你的姓名" maxLength={120} />
                        </FormField>
                        <FormField>
                            <Label htmlFor="email">邮箱</Label>
                            <Input id="email" name="email" type="email" required placeholder="输入你的邮箱" maxLength={320} />
                        </FormField>
                        <FormField>
                            <Label htmlFor="status">参会状态</Label>
                            <select
                                id="status"
                                name="status"
                                required
                                defaultValue={RsvpStatus.going}
                                className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]">
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </FormField>
                        <Button type="submit" className="self-start">提交回复</Button>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
