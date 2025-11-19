'use client';

import SkeuomorphicRectButton from '../ui/SkeuomorphicRectButton';
import SkeuomorphicCircleButton from '../ui/SkeuomorphicCircleButton';

export default function InAppBrowserModal({ onDismiss }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className="
          relative
          w-full max-w-[340px]
          bg-[#232323]
          rounded-[32px]
          border-[1px] border-black
          shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
          overflow-hidden
        "
            >
                {/* Inner Bevel/Highlight */}
                <div className="absolute inset-0 rounded-[32px] border-[1px] border-white/10 pointer-events-none" />

                {/* Close Button (Top Left) - Moved outside inner padding container */}
                <div className="absolute top-4 left-4 z-20">
                    <SkeuomorphicCircleButton
                        diameter={40}
                        gradientId="close-btn-gradient"
                        onClick={onDismiss}
                        className="cursor-pointer w-[40px] h-[40px]"
                    >
                        <svg
                            x="10"
                            y="10"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </SkeuomorphicCircleButton>
                </div>

                <div className="p-8 flex flex-col items-center text-center relative z-10">

                    {/* Spacing for the top buttons */}
                    <div className="h-8 w-full mb-4" />

                    {/* Text Content */}
                    <div className="flex flex-col gap-6 mb-8">
                        <h2
                            className="text-white text-2xl font-bold tracking-tight"
                            style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace' }}
                        >
                            Browser not supported
                        </h2>

                        <div
                            className="text-white text-base leading-relaxed flex flex-col gap-4"
                            style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace' }}
                        >
                            <p>
                                For security reasons, Google Sign-In doesn't work here.
                            </p>
                            <p>
                                Please open this page in <span className="text-[#FAB617]">Safari</span> or <span className="text-[#FAB617]">Chrome</span>.
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <SkeuomorphicRectButton
                        width={276}
                        height={56}
                        gradientId="dismiss-btn-gradient"
                        onClick={onDismiss}
                        className="w-full"
                    >
                        <span
                            className="text-white font-medium text-lg"
                            style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace' }}
                        >
                            Got it
                        </span>
                    </SkeuomorphicRectButton>

                </div>
            </div>
        </div>
    );
}
