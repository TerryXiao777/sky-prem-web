import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {Form, FormField, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createEventAction } from "@/lib/actions/events";


export default async function NewEventPage() {
    return (
    <div className="w-full max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>创建新事件</CardTitle>
            </CardHeader>
            <CardContent>
                {/* action 必须传 Server Action 函数引用；传字符串会被当成普通 URL 表单提交 */}
                <Form action={createEventAction}>
                    <FormField>
                        <Label htmlFor="title">标题</Label>
                        <Input id="title" name="title" required placeholder="输入活动标题" />
                    </FormField>

                    <FormField>
                        <Label htmlFor="description">描述</Label>
                        <Textarea id="description" name="description" placeholder="活动可选详情" />
                    </FormField>

                    <FormField>
                        <Label htmlFor="location">地点</Label>
                        <Input id="location" name="location" placeholder="活动地点" />
                    </FormField>

                    <FormField>
                        <Label htmlFor="eventDate">日期时间</Label>
                        <Input id="eventDate" name="eventDate" type="datetime-local" />
                        <FormMessage>选填项，后续可补填</FormMessage>
                    </FormField>

                    <div className="flex items-center gap-3">
                        <Button type="submit">创建事件</Button>
                        <Button type="button" variant={"outline"} asChild ><Link href="/dashboard">取消</Link></Button>
                    </div>
                </Form>
            </CardContent>
        </Card>
    </div>
    );
    
}