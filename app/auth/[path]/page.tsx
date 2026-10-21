import { Suspense } from "react";
import {AuthView} from "@neondatabase/auth/react";

async function AuthViewAsync({ params } : {params: Promise<{path: string}> }) {
    const { path } = await params;
    return <AuthView path={path} />;
}

export default function AuthPage({ params } : {params: Promise<{path: string}> }) {
    return (
        <main className="container mx-auto flex grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
            <Suspense fallback={null}>
                <AuthViewAsync params={params} />
            </Suspense>
        </main>
    );
}
