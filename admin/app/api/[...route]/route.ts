import { createApp } from "@/server/app";
import { createFsRepository } from "@/server/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const app = createApp(createFsRepository());

async function handle(req: Request) {
  return app.fetch(req);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
export const OPTIONS = handle;
