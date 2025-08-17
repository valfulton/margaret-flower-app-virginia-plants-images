module.exports = {

"[project]/.next-internal/server/app/api/flowers/[id]/route/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/app/api/flowers/[id]/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "GET": ()=>GET
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$4$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.4.6_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/server.js [app-route] (ecmascript)");
;
/** split "1;2, 3  4" -> ["1","2","3","4"] */ function splitCodes(raw) {
    if (!raw) return [];
    return raw.split(/[;, ]+/).map((s)=>s.trim()).filter(Boolean);
}
async function GET(_req, ctx) {
    const params = await ctx.params;
    const idNum = Number(params.id);
    if (!Number.isFinite(idNum)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$4$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Invalid id'
        }, {
            status: 400
        });
    }
    // Use a basic supabase client for public data access (no auth required)
    const { createClient } = await __turbopack_context__.r("[project]/node_modules/.pnpm/@supabase+supabase-js@2.54.0/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript, async loader)")(__turbopack_context__.i);
    const supabase = createClient(("TURBOPACK compile-time value", "https://rnlflqfmmtobyyihjiyu.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubGZscWZtbXRvYnl5aWhqaXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NzE4NDgsImV4cCI6MjA3MDI0Nzg0OH0.w32YxtrReU3GoVn2mehYtFghasj0hdqrI2CLbze_oBY"));
    // 1) Base flower row (pull everything so we don’t miss fields)
    const { data: flower, error: flowerErr } = await supabase.from('flowers').select('*').eq('id', idNum).single();
    if (flowerErr || !flower) {
        console.error('flower fetch error', flowerErr);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$4$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Not found'
        }, {
            status: 404
        });
    }
    // 2) Build lookups. Each may be a single code or delimited list — handle both.
    const lookups = {};
    // helper to fetch *one* row by exact code
    const fetchOne = async (table, codeField, code)=>{
        if (!code) return null;
        const { data } = await supabase.from(table).select('*').eq(codeField, code).maybeSingle();
        return data ?? null;
    };
    // helper to fetch *many* rows by codes
    const fetchMany = async (table, codeField, raw)=>{
        const codes = splitCodes(raw);
        if (!codes.length) return [];
        const { data } = await supabase.from(table).select('*').in(codeField, codes);
        return data ?? [];
    };
    // single-or-many lookups (adjusted to your schema names)
    lookups.height = await fetchOne('height', 'height_code', flower.height_code);
    lookups.bloom = await fetchMany('bloom', 'bloom_code', flower.bloom_code);
    lookups.sun = await fetchMany('sun', 'sun_code', flower.sun_code);
    lookups.moisture = await fetchMany('moisture', 'moist_code', flower.moist_code);
    lookups.category = await fetchMany('categories', 'cat_code', flower.cat_code);
    lookups.deer = await fetchMany('deer', 'deer_code', flower.deer_code);
    lookups.wildlife = await fetchMany('wildlife', 'wild_code', flower.wild_code);
    lookups.soil = await fetchMany('soil', 'soil_code', flower.soil_code);
    lookups.credit = await fetchOne('photo_credits', 'credit_code', flower.credit_code);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$4$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ...flower,
        lookups
    });
}
}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__d8c225ee._.js.map