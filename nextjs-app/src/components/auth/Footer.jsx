import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="
      flex
      flex-col
      items-center
      gap-[16px]
      py-[32px]
      w-full
      text-center
    ">
            {/* Copyright */}
            <p className="
        font-['IBM_Plex_Mono']
        text-[12px]
        leading-[16px]
        text-black/40
      ">
                © 2025 Morpheo. All rights reserved.
            </p>

            {/* Links */}
            <div className="
        flex
        items-center
        gap-[24px]
      ">
                <Link
                    href="/terms"
                    className="
            font-['IBM_Plex_Mono']
            text-[12px]
            leading-[16px]
            text-black/40
            hover:text-black/60
            transition-colors
          "
                >
                    Terms
                </Link>
                <Link
                    href="/privacy"
                    className="
            font-['IBM_Plex_Mono']
            text-[12px]
            leading-[16px]
            text-black/40
            hover:text-black/60
            transition-colors
          "
                >
                    Privacy
                </Link>
                {/* Contact link removed as per request */}
            </div>
        </footer>
    );
}
