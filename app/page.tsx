/* dev-expert · anti-slop: P4 H5 E5 S4 R5 V4 */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";


const FEATURES = [
  {
    title: "创建活动",
    description: "几秒内设置标题、日期和详情。",
  },
  {
    title: "分享邀请链接",
    description: "为每个活动生成唯一的邀请令牌。",
  },
  {
    title: "追踪出席情况",
    description: "一眼查看参与者名单与回复统计。",
    extra: "参加、待定、不参加的统计始终保持最新。",
  },
] as const;

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-12 sm:gap-16">
      <section className="space-y-6">
        <Badge variant="secondary" className="w-fit">
          Next.js 16 + Neon Auth + Neon Postgres
        </Badge>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            快速筹划活动并追踪回复情况
          </h1>
          <p className="max-w-2xl text-[var(--muted-foreground)]">
            创建活动，分享专属邀请链接，并实时查看参与者状态更新，包括
            “参加”、“可能参加”和“不参加”的人数统计。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/auth/sign-up">创建账号</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/auth/sign-in">登录</Link>
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link href="/dashboard">进入仪表板</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            {"extra" in feature ? (
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.extra}</p>
              </CardContent>
            ) : null}
          </Card>
        ))}
      </section>
    </div>
  );
}
