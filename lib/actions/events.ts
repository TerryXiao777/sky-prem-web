"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { RsvpStatus } from "@/app/generated/prisma/client";

function parseCreateEvent(data: FormData) {
    const title = String(data.get("title") ?? "").trim();
    if (title.length < 3 || title.length > 120) {
        throw new Error("标题必须在3到120个字符之间.");
    }
    const description = String(data.get("description") ?? "").trim();
    const location = String(data.get("location") ?? "").trim();
    const eventDate = String(data.get("eventDate") ?? "").trim();

    return {
        title,
        description: description.length ? description.slice(0, 2000) : "",
        location: location.length ? location.slice(0, 200) : "",
        eventDate: eventDate.length ? eventDate : null,
    };
}

export async function createEventAction(data: FormData) {
    const session = await getSession();
    const userId = session.data?.user?.id;
    if (!userId) {
        throw new Error("Unauthorized: 未登录或会话已失效.");
    }

    const input = parseCreateEvent(data);

    // redirect() 抛的是框架控制流异常(NEXT_REDIRECT)，必须在 try 之外调用，
    // 否则会被catch 吞掉：事件虽已入库，但页面不跳转、用户以为保存失败。
    const created = await prisma.event.create({
        data: {
            ownerUserId: userId,
            title: input.title,
            description: input.description,
            location: input.location,
            eventDate: input.eventDate ? new Date(input.eventDate) : null,
        },
    });

    redirect(`/events/${created.id}`);
}

// 注意：eventId 由 .bind(null, eventId) 从组件侧预绑定，因此它排在FormData 之前。
// 漏掉这个参数会导致函数体内eventId / input 全部变成未定义标识符。
export async function createInviteLinkAction(eventId: string, _formData: FormData) {
    const session = await getSession();
    const userId = session.data?.user?.id;
    if (!userId) {
        throw new Error("Unauthorized: 未登录或会话已失效.");
    }

    const owns = await prisma.event.findFirst({
        where: {
            id: eventId,
            ownerUserId: userId,
        },
        select: {
            id: true,
        },
    });

    if (!owns) {
        throw new Error("事件未找到. 请检查事件ID是否正确.");
    }

    const token = crypto.randomUUID().replace(/-/g, "");

    await prisma.eventInvite.upsert({
        where: {
            eventId
        },
        create: {
            eventId,
            token,
        },
        update: {
            token,
        },
    });

    // 生成后回详情页，由revalidatePath 让服务端缓存失效，inviteUrl 立即可见。
    revalidatePath(`/events/${eventId}`);
}

function parseRsvp(data: FormData) {
    // 起点必须是 0：误写成 slice(2,...) / slice(3,...) 会把"王五"这类短姓名直接切成空串，
    // 导致明明填了姓名却抛"请填写姓名"。
    const name = String(data.get("name") ?? "").trim().slice(0, 120);
    const email = String(data.get("email") ?? "").trim().slice(0, 320);
    const rawStatus = String(data.get("status") ?? "").trim();

    if (name.length < 1) {
        throw new Error("请填写姓名.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("邮箱格式不正确.");
    }
    // 用生成枚举做校验并收窄类型：rawStatus 是 string，直接返回会触发 ts(2322)，
    // 硬编码字符串比较则可能因枚举值变更而在运行时永远匹配失败。
    const status = Object.values(RsvpStatus).find((s) => s === rawStatus);
    if (!status) {
        throw new Error("请选择参会状态.");
    }

    return { name, email, status };
}

/**
 * 访客通过邀请链接提交 RSVP。无需登录，身份由 token 背后的 EventInvite 决定。
 * 成功后用redirect 回同一页并带 submitted=1，让页面切到「已提交」态。
 */
export async function submitOrUpdateRsvpAction(token: string, formData: FormData) {
    
    const input = parseRsvp(formData);
    
    const invite = await prisma.eventInvite.findUnique({
        where: { token },
        select: { 
            id: true, 
            event: {
                select: {id: true},
            } ,
        },
    });
    if (!invite) {
        throw new Error("邀请链接无效或已被重置.");
    }

    
    const eventId = invite.event.id;
    const emailNormalized = input.email.toLowerCase();

    await prisma.eventRsvp.upsert({
        where: {
            eventId_emailNormalized: {
                eventId,
                emailNormalized,
            },
        },
        create: {
            eventId,
            inviteId: invite.id,
            name: input.name,
            email: input.email,
            emailNormalized,
            status: input.status,
            respondedAt: new Date(),
        },
        update: {
            name: input.name,
            email: input.email,
            status: input.status,
            respondedAt: new Date(),
        },
    });

    revalidatePath(`/invite/${token}`);
    redirect(`/invite/${token}?submitted=1`);
}
