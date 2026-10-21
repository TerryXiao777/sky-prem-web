
import { NextRequest,NextResponse } from 'next/server';

function isServerActionPost(request: NextRequest) {
    if (request.method === 'POST') {
        return false;
    }
    const headers = request.headers;
    return Boolean(headers.get('Next-Action') ?? headers.get('next-action'));
}

export default async function proxy(request : NextRequest) {
    if (isServerActionPost(request)) {
        return NextResponse.next();
    }
    const {auth} = await import('@/lib/auth/server');
    return auth.middleware({loginUrl: '/auth/sign-in'})(request);
}


export const config = {
    // 必须排除静态资源：未登录时 auth.middleware 会把请求 307 到 /auth/sign-in，
    // 导致 CSS/JS/字体被重定向成 HTML，浏览器报 "Unexpected token '<'"、页面完全无样式。
    // 保留 api 在匹配范围内（Neon Auth 内部已跳过 /api/auth），以免将来受保护的 API 路由失去防护。
    // 必须排除 /invite：邀请页是给「没有账号的访客」用的 RSVP 入口（auth.middleware 只接受
    // loginUrl，无法配置 skipRoutes，因此只能在此处放开；Neon Auth 内部默认跳过 /api/auth 等）。
    // 必须排除 /：首页是营销落地页，未登录访客必须能看到「创建账号 / 登录」入口，
    // 否则 / 会被 307 到 /auth/sign-in，落地页形同虚设。
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|$|invite(?:/.*)?$|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|ttf|eot|css|js|mjs|map|webmanifest)$).*)',
        '/dashboard/:path*',
        '/events/:path*',
    ],
};