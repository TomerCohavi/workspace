import { SystemEditor } from "@/components/SystemEditor";

export default async function SystemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SystemEditor slug={slug} />;
}
