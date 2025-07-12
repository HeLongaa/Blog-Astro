import LinkForm from "@/components/LinkForm";
import Providers from "@/components/Providers";

export default function Home() {
  return (
    <Providers>
      <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-center mb-8">友链申请</h1>
          <LinkForm />
        </div>
      </main>
    </Providers>
  );
}
