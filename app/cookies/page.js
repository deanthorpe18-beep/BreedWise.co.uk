import { generateMetadata } from "@/lib/seo/metadata";

export const metadata = generateMetadata({
    title: "Cookie Policy",
    description: "How BreedWise uses cookies and similar technologies.",
});

export default function CookiePolicyPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            <h1 className="text-3xl font-semibold text-[#2D3436]">Cookie Policy</h1>
            <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>

            <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600">
                <section>
                    <h2 className="text-lg font-semibold text-slate-900">What are cookies?</h2>
                    <p className="mt-2">Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.</p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-slate-900">How we use cookies</h2>
                    <p className="mt-2">BreedWise uses cookies and similar technologies for the following purposes:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li><strong>Essential cookies:</strong> These are necessary for the website to function properly. They enable core features such as user authentication and security.</li>
                        <li><strong>Analytics cookies:</strong> These help us understand how visitors interact with our website by collecting and reporting information anonymously. We use this data to improve our service.</li>
                        <li><strong>Marketing cookies:</strong> We do not currently use marketing or advertising cookies.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-slate-900">Managing your preferences</h2>
                    <p className="mt-2">When you first visit BreedWise, you will see a cookie banner allowing you to choose which types of cookies you accept. You can change your preferences at any time by clearing your browser cookies for breedwise.co.uk — the banner will reappear on your next visit.</p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-slate-900">Third-party cookies</h2>
                    <p className="mt-2">We do not use third-party advertising cookies. Our analytics data is stored locally on your device and is not shared with external advertising networks.</p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-slate-900">Contact us</h2>
                    <p className="mt-2">If you have any questions about our use of cookies, please contact us at <a href="mailto:info@breedwise.co.uk" className="text-[#00BFA5] hover:underline">info@breedwise.co.uk</a>.</p>
                </section>
            </div>
        </div>
    );
}
