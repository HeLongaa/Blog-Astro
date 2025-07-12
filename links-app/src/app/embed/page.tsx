import LinkForm from "@/components/LinkForm";
import Providers from "@/components/Providers";

export default function EmbedPage() {
    return (
        <Providers>
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 embed-mode">
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <LinkForm isEmbedMode={true} />
                    </div>
                </div>
            </main>
        </Providers>
    );
}
