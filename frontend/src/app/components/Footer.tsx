const SocialIcon = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-gray-300 hover:text-white transition-colors"
  >
    {children}
  </a>
);

export default function Footer() {
  return (
    <footer className="bg-dark-blue text-white py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:flex-wrap space-y-8 md:space-y-0 not-lg:items-center not-lg:text-center lg:justify-evenly">
          <div className="footer-section">
            <h2 className="text-2xl font-semibold funnel-text">Animus</h2>
            <p className="text-gray-300 text-sm">
              Analizador demográfico de salud mental
            </p>
          </div>

          <div className="footer-section">
            <h3 className="text-lg funnel-text font-semibold mb-2">Contacto</h3>
            <p className="text-gray-300">123 Av. Salud</p>
            <p className="text-gray-300">Culiacán, Sinaloa, Mexico</p>
            <p className="text-gray-300 mt-2">contacto@animus.com</p>
          </div>

          <div className="footer-section">
            <h3 className="text-lg funnel-text font-semibold mb-2">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-6">
              <SocialIcon href="https://twitter.com">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </SocialIcon>
              <SocialIcon href="https://instagram.com">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 4.22c.636-.247 1.363-.416 2.427-.465C9.793 2.013 10.147 2 12.315 2zm-1.163 1.943c-1.01.048-1.625.21-2.096.385a3.007 3.007 0 00-1.08 1.08c-.175.47-.337 1.086-.385 2.096-.047 1.024-.06 1.347-.06 3.556s.013 2.533.06 3.556c.048 1.01.21 1.625.385 2.096a3.007 3.007 0 001.08 1.08c.47.175 1.086.337 2.096.385 1.024.047 1.347.06 3.556.06s2.533-.013 3.556-.06c1.01-.048 1.625-.21 2.096-.385a3.007 3.007 0 001.08-1.08c.175-.47.337-1.086.385-2.096.047-1.024.06-1.347.06-3.556s-.013-2.533-.06-3.556c-.048-1.01-.21-1.625-.385-2.096a3.007 3.007 0 00-1.08-1.08c-.47-.175-1.086-.337-2.096-.385-1.024-.047-1.347-.06-3.556-.06s-2.533.013-3.556.06zM12 6.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 1.942a3.193 3.193 0 110 6.386 3.193 3.193 0 010-6.386zm6.35-2.88a1.215 1.215 0 100 2.43 1.215 1.215 0 000-2.43z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </SocialIcon>
              <SocialIcon href="https://facebook.com">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </SocialIcon>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-8 pt-6 text-center text-gray-300 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Animus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
