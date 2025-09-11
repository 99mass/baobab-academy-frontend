import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../utils/translations";

export default function Footer() {
  const { lang } = useLanguage();
  const { t } = useTranslation(lang);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-full mx-2 sm:mx-6 px-2 sm:px-4 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <img
                src="/logo_fibem_no_bg.png"
                alt="FIBEM Logo"
                className="w-12 h-9 sm:w-16 sm:h-12"
              />
              <span className="text-sm sm:text-md font-bold text-white pl-2">{t('platformLearning')}</span>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md text-sm sm:text-base">
              {t('footerDescription')}
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4 text-[#0096F0]" />
                <span className="text-sm">contact@fibem.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="w-fit sm:justify-self-start lg:justify-self-end">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#0096F0]">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-[#0096F0] transition-colors"
                >
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link
                  to="/courses"
                  className="text-gray-300 hover:text-[#0096F0] transition-colors"
                >
                  {t('catalogCourses')}
                </Link>
              </li>
              <li>
                <Link
                  to="/auth"
                  className="text-gray-300 hover:text-[#0096F0] transition-colors"
                >
                  {t('login')}
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#0096F0] transition-colors"
                >
                  {t('about')}
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="w-fit sm:justify-self-end lg:justify-self-end">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#0096F0]">
              {t('support')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#0096F0] transition-colors"
                >
                  {t('helpCenter')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#0096F0] transition-colors"
                >
                  {t('faq')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#0096F0] transition-colors"
                >
                  {t('contact')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#0096F0] transition-colors"
                >
                  {t('termsOfUse')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#0096F0]">{t('contact')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-8">
              <div>
                <h4 className="font-semibold text-gray-300 text-sm sm:text-base">FIBEM {t('senegal')}</h4>
                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                  Rue 7 Corniche x 6, Médina, Dakar<br />
                  Dakar, {t('senegal')}<br />
                  +221 30 84 31 62
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-300 text-sm sm:text-base">FIBEM {t('france')}</h4>
                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                  51 Rue du Grévarin – 27200 Vernon<br />
                  75001 Paris, {t('france')}<br />
                  +33 6 05 51 14 32
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
            <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-0">
              © 2025 FIBEM.{" "}
              <span className="text-[#DFB216] text-xs sm:text-sm font-medium">
                @SEN FIBEM — {t('senegal')}
              </span>{" "}
              {t('allRightsReserved')}
            </p>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6">
              <a
                href="#"
                className="text-gray-300 hover:text-[#0096F0] transition-colors text-xs sm:text-sm"
              >
                {t('privacyPolicy')}
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-[#0096F0] transition-colors text-xs sm:text-sm"
              >
                {t('legalNotices')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
