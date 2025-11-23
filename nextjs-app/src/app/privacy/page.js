import LegalLayout from '@/components/auth/LegalLayout';

export default function PrivacyPolicy() {
    return (
        <LegalLayout>
            <h1 className="text-3xl font-bold mb-6 font-['IBM_Plex_Mono']">Privacy Policy</h1>
            <p className="mb-8 text-sm text-gray-500 font-['IBM_Plex_Mono']">Last updated: November 23, 2025</p>

            <div className="font-['IBM_Plex_Mono'] space-y-8 text-black/80">
                <section>
                    <h2 className="text-xl font-bold mb-3 text-black">1. Introduction</h2>
                    <p className="leading-relaxed">
                        Welcome to Morpheo (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy.
                        This Privacy Policy explains how we collect, use, and safeguard your information when you use our application and services.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 text-black">2. Information We Collect</h2>
                    <p className="mb-3 leading-relaxed">
                        We collect information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services, when you participate in activities on the application, or otherwise when you contact us.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Google Account Information:</strong> When you sign in using Google, we collect your name, email address, and profile picture to create your account and personalize your experience.</li>
                        <li><strong>User Content:</strong> We collect the images you upload and the generated images you create using our service.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 text-black">3. How We Use Your Information</h2>
                    <p className="mb-3 leading-relaxed">
                        We use the information we collect or receive:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>To facilitate account creation and logon process.</li>
                        <li>To provide and manage the service (generating images).</li>
                        <li>To communicate with you about your account or our services.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 text-black">4. Data Security</h2>
                    <p className="leading-relaxed">
                        We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 text-black">5. Contact Us</h2>
                    <p className="leading-relaxed">
                        If you have questions or comments about this policy, you may email us at: <a href="mailto:romainlagrange33@gmail.com" className="text-blue-600 hover:underline">romainlagrange33@gmail.com</a>
                    </p>
                </section>
            </div>
        </LegalLayout>
    )
}
