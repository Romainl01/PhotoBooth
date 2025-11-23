import LegalLayout from '@/components/auth/LegalLayout';

export default function TermsOfService() {
    return (
        <LegalLayout>
            <h1 className="text-3xl font-bold mb-6 font-['IBM_Plex_Mono']">Terms of Service</h1>
            <p className="mb-8 text-sm text-gray-500 font-['IBM_Plex_Mono']">Last updated: November 23, 2025</p>

            <div className="font-['IBM_Plex_Mono'] space-y-8 text-black/80">
                <section>
                    <h2 className="text-xl font-bold mb-3 text-black">1. Acceptance of Terms</h2>
                    <p className="leading-relaxed">
                        By accessing and using Morpheo, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 text-black">2. Use of Service</h2>
                    <p className="leading-relaxed">
                        You agree to use Morpheo for lawful purposes only. You are prohibited from using the service to generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 text-black">3. User Content</h2>
                    <p className="leading-relaxed">
                        You retain all rights to the images you upload. By uploading content, you grant us a license to use, process, and display that content solely for the purpose of providing the service to you.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 text-black">4. Disclaimer</h2>
                    <p className="leading-relaxed">
                        The service is provided &quot;as is&quot; without warranties of any kind, whether express or implied. We do not guarantee that the service will be uninterrupted or error-free.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 text-black">5. Contact</h2>
                    <p className="leading-relaxed">
                        If you have any questions about these Terms, please contact us at: <a href="mailto:romainlagrange33@gmail.com" className="text-blue-600 hover:underline">romainlagrange33@gmail.com</a>
                    </p>
                </section>
            </div>
        </LegalLayout>
    )
}
