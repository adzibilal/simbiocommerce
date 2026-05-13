"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const Sidebar = () => {
  const pathname = usePathname();
  // Accordion tertutup secara default
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <div className="hidden lg:flex lg:flex-shrink-0 font-euclid-circular-a">
      <div className="flex flex-col w-64 bg-white border-r border-gray-3 h-screen">
        <div className="flex items-center h-16 flex-shrink-0 px-6 bg-white border-b border-gray-3">
          <span className="text-xl font-bold text-blue">Simbio</span>
          <span className="text-xl font-bold text-dark">Admin</span>
        </div>
        
        {/* Menu Container */}
        <div className="flex-1 p-4 pt-0 overflow-y-auto sm:pt-0 sm:p-6 mt-4">
          <span className="block mb-3 font-normal uppercase text-gray-5 text-xs">Menu</span>
          <div className="flex flex-col gap-2">
            
            {/* Dashboard */}
            <div className="flex flex-col gap-1">
              <Link 
                className={`flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent ${pathname === "/admin/dashboard" ? "bg-blue/10 text-blue" : ""}`}
                href="/admin/dashboard"
              >
                {/* Clean Dashboard Icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Dashboard
              </Link>
            </div>

            {/* Orders */}
            <div className="flex flex-col gap-1">
              <Link 
                className={`flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent ${pathname === "/admin/orders" ? "bg-blue/10 text-blue" : ""}`}
                href="/admin/orders"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.0203 11.9167C8.0203 11.537 7.71249 11.2292 7.3328 11.2292C6.9531 11.2292 6.6453 11.537 6.6453 11.9167V15.5833C6.6453 15.963 6.9531 16.2708 7.3328 16.2708C7.71249 16.2708 8.0203 15.963 8.0203 15.5833V11.9167Z" fill="currentColor"></path><path d="M14.6661 11.2292C15.0458 11.2292 15.3536 11.537 15.3536 11.9167V15.5833C15.3536 15.963 15.0458 16.2708 14.6661 16.2708C14.2864 16.2708 13.9786 15.963 13.9786 15.5833V11.9167C13.9786 11.537 14.2864 11.2292 14.6661 11.2292Z" fill="currentColor"></path><path d="M11.687 11.9167C11.687 11.537 11.3792 11.2292 10.9995 11.2292C10.6198 11.2292 10.312 11.537 10.312 11.9167V15.5833C10.312 15.963 10.6198 16.2708 10.9995 16.2708C11.3792 16.2708 11.687 15.963 11.687 15.5833V11.9167Z" fill="currentColor"></path><path fillRule="evenodd" clipRule="evenodd" d="M15.8338 3.18356C15.3979 3.01319 14.9095 2.98443 14.2829 2.97987C14.0256 2.43753 13.473 2.0625 12.8328 2.0625H9.16613C8.52593 2.0625 7.97332 2.43753 7.716 2.97987C7.08942 2.98443 6.60107 3.01319 6.16515 3.18356C5.64432 3.38713 5.19129 3.73317 4.85788 4.18211C4.52153 4.63502 4.36364 5.21554 4.14631 6.01456L3.57076 8.12557C3.21555 8.30747 2.90473 8.55242 2.64544 8.88452C2.07527 9.61477 1.9743 10.4845 2.07573 11.4822C2.17415 12.4504 2.47894 13.6695 2.86047 15.1955L2.88467 15.2923C3.12592 16.2573 3.32179 17.0409 3.55475 17.6524C3.79764 18.2899 4.10601 18.8125 4.61441 19.2095C5.12282 19.6064 5.70456 19.7788 6.38199 19.8598C7.03174 19.9375 7.8394 19.9375 8.83415 19.9375H13.1647C14.1594 19.9375 14.9671 19.9375 15.6169 19.8598C16.2943 19.7788 16.876 19.6064 17.3844 19.2095C17.8928 18.8125 18.2012 18.2899 18.4441 17.6524C18.6771 17.0409 18.8729 16.2573 19.1142 15.2923L19.1384 15.1956C19.5199 13.6695 19.8247 12.4504 19.9231 11.4822C20.0245 10.4845 19.9236 9.61477 19.3534 8.88452C19.0941 8.55245 18.7833 8.30751 18.4282 8.12562L17.8526 6.01455C17.6353 5.21554 17.4774 4.63502 17.141 4.18211C16.8076 3.73317 16.3546 3.38713 15.8338 3.18356ZM6.66568 4.46423C6.86717 4.38548 7.11061 4.36231 7.71729 4.35618C7.97516 4.89706 8.527 5.27083 9.16613 5.27083H12.8328C13.4719 5.27083 14.0238 4.89706 14.2816 4.35618C14.8883 4.36231 15.1318 4.38548 15.3332 4.46423C15.6137 4.57384 15.8576 4.76017 16.0372 5.00191C16.1986 5.21928 16.2933 5.52299 16.56 6.50095L16.8841 7.68964C15.9328 7.56246 14.7046 7.56248 13.1787 7.5625H8.82014C7.29428 7.56248 6.06614 7.56246 5.11483 7.68963L5.43895 6.50095C5.7056 5.52299 5.80033 5.21928 5.96176 5.00191C6.14129 4.76017 6.38523 4.57384 6.66568 4.46423ZM9.16613 3.4375C9.03956 3.4375 8.93696 3.5401 8.93696 3.66667C8.93696 3.79323 9.03956 3.89583 9.16613 3.89583H12.8328C12.9594 3.89583 13.062 3.79323 13.062 3.66667C13.062 3.5401 12.9594 3.4375 12.8328 3.4375H9.16613ZM3.72922 9.73071C3.98482 9.40334 4.38904 9.18345 5.22428 9.06262C6.07737 8.93921 7.23405 8.9375 8.87703 8.9375H13.1218C14.7648 8.9375 15.9215 8.93921 16.7746 9.06262C17.6098 9.18345 18.014 9.40334 18.2696 9.73071C18.5252 10.0581 18.6405 10.5036 18.5552 11.3432C18.468 12.2007 18.1891 13.3233 17.7906 14.9172C17.5365 15.9338 17.3595 16.6372 17.1592 17.1629C16.9655 17.6713 16.7758 17.9402 16.5382 18.1257C16.3007 18.3112 15.9938 18.43 15.4536 18.4946C14.895 18.5614 14.1697 18.5625 13.1218 18.5625H8.87703C7.8291 18.5625 7.10386 18.5614 6.54525 18.4946C6.005 18.43 5.69817 18.3112 5.4606 18.1257C5.22304 17.9402 5.03337 17.6713 4.83967 17.1629C4.63938 16.6372 4.46237 15.9338 4.20822 14.9172C3.80973 13.3233 3.53086 12.2007 3.44368 11.3432C3.35832 10.5036 3.47362 10.0581 3.72922 9.73071Z" fill="currentColor"></path></svg>
                Orders
              </Link>
            </div>

            {/* Customers */}
            <div className="flex flex-col gap-1">
              <Link 
                className={`flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent ${pathname === "/admin/customers" ? "bg-blue/10 text-blue" : ""}`}
                href="/admin/customers"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8.25065" cy="5.49992" r="3.66667" stroke="currentColor" strokeWidth="1.5"></circle><path d="M13.75 8.25C15.2688 8.25 16.5 7.01878 16.5 5.5C16.5 3.98122 15.2688 2.75 13.75 2.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path><ellipse cx="8.25065" cy="15.5834" rx="6.41667" ry="3.66667" stroke="currentColor" strokeWidth="1.5"></ellipse><path d="M16.5 12.8333C18.1081 13.1859 19.25 14.0789 19.25 15.1249C19.25 16.0685 18.3207 16.8876 16.9583 17.2978" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                Customers
              </Link>
            </div>

            {/* Products */}
            <div className="flex flex-col gap-1">
              <Link 
                className={`flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent ${pathname === "/admin/products" ? "bg-blue/10 text-blue" : ""}`}
                href="/admin/products"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M11.0007 2.52075C9.86166 2.52075 8.93825 3.44416 8.93825 4.58325V4.81652C9.32096 4.81241 9.7341 4.81241 10.1806 4.81242H11.8209C12.2674 4.81241 12.6805 4.81241 13.0632 4.81652V4.58325C13.0632 3.44416 12.1398 2.52075 11.0007 2.52075ZM14.4382 4.86461V4.58325C14.4382 2.68477 12.8992 1.14575 11.0007 1.14575C9.10227 1.14575 7.56325 2.68477 7.56325 4.58325V4.86461C7.4395 4.87364 7.32008 4.88423 7.20481 4.89666C6.39965 4.98344 5.72632 5.16523 5.12838 5.57506C4.92273 5.71601 4.72957 5.87437 4.55102 6.04839C4.03188 6.55434 3.72157 7.17894 3.47857 7.95144C3.24264 8.70145 3.05197 9.65486 2.81238 10.8529L2.79489 10.9403C2.44964 12.6665 2.17757 14.0268 2.09943 15.1102C2.0196 16.2172 2.13116 17.1485 2.65553 17.9555C2.83049 18.2248 3.03469 18.4739 3.26443 18.6983C3.95297 19.3707 4.84429 19.6628 5.94544 19.8016C7.02315 19.9374 8.41035 19.9374 10.1707 19.9374H11.8308C13.5911 19.9374 14.9783 19.9374 16.0561 19.8016C17.1572 19.6628 18.0485 19.3707 18.7371 18.6983C18.9668 18.4739 19.171 18.2248 19.346 17.9555C19.8703 17.1485 19.9819 16.2172 19.9021 15.1102C19.8239 14.0268 19.5519 12.6666 19.2066 10.9404L19.1891 10.8529C18.9495 9.65488 18.7589 8.70146 18.5229 7.95144C18.2799 7.17894 17.9696 6.55434 17.4505 6.04839C17.2719 5.87437 17.0788 5.71601 16.8731 5.57506C16.2752 5.16523 15.6018 4.98344 14.7967 4.89666C14.6814 4.88423 14.562 4.87364 14.4382 4.86461ZM7.35216 6.26374C6.66767 6.33751 6.24481 6.47683 5.90575 6.70922C5.76504 6.80567 5.63287 6.91402 5.51071 7.03308C5.21633 7.31998 4.99679 7.70731 4.79021 8.36403C4.5791 9.03514 4.40204 9.91573 4.15289 11.1614C3.79581 12.9469 3.54205 14.2223 3.47087 15.2091C3.40067 16.1826 3.51921 16.7611 3.80853 17.2064C3.92824 17.3906 4.06796 17.5611 4.22514 17.7146C4.60505 18.0856 5.14912 18.3153 6.11741 18.4374C7.09906 18.5611 8.39947 18.5624 10.2202 18.5624H11.7813C13.602 18.5624 14.9024 18.5611 15.8841 18.4374C16.8524 18.3153 17.3965 18.0856 17.7764 17.7146C17.9335 17.5611 18.0733 17.3906 18.193 17.2064C18.4823 16.7611 18.6008 16.1826 18.5306 15.2091C18.4595 14.2223 18.2057 12.9469 17.8486 11.1614C17.5995 9.91573 17.4224 9.03514 17.2113 8.36403C17.0047 7.70731 16.7852 7.31998 16.4908 7.03308C16.3686 6.91402 16.2365 6.80567 16.0958 6.70922C15.7567 6.47683 15.3338 6.33751 14.6493 6.26374C13.9499 6.18835 13.0517 6.18742 11.7813 6.18742H10.2202C8.94985 6.18742 8.05163 6.18835 7.35216 6.26374ZM8.1783 13.1017C8.53629 12.9752 8.92908 13.1628 9.05561 13.5208C9.33907 14.3228 10.104 14.8958 11.0009 14.8958C11.8979 14.8958 12.6628 14.3228 12.9462 13.5208C13.0728 13.1628 13.4656 12.9752 13.8236 13.1017C14.1815 13.2282 14.3692 13.621 14.2426 13.979C13.7711 15.3132 12.4987 16.2708 11.0009 16.2708C9.50314 16.2708 8.23077 15.3132 7.7592 13.979C7.63267 13.621 7.82031 13.2282 8.1783 13.1017Z" fill="currentColor"></path></svg>
                Products
              </Link>
            </div>

            {/* Categories */}
            <div className="flex flex-col gap-1">
              <Link 
                className={`flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent ${pathname === "/admin/categories" ? "bg-blue/10 text-blue" : ""}`}
                href="/admin/categories"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.82697 19.2501H12.2441C14.286 19.2501 15.3069 19.2501 16.1591 18.7617C17.0114 18.2733 17.5524 17.3782 18.6346 15.588L19.2587 14.5556C20.1691 13.0495 20.6243 12.2964 20.6243 11.4584C20.6243 10.6204 20.1691 9.86737 19.2587 8.36123L18.6346 7.32884C17.5524 5.53861 17.0114 4.64349 16.1591 4.15512C15.3069 3.66675 14.286 3.66675 12.2441 3.66675H9.82697C6.27449 3.66675 4.49825 3.66675 3.39463 4.80781C2.29102 5.94887 2.29102 7.78539 2.29102 11.4584C2.29102 15.1314 2.29102 16.968 3.39463 18.109C4.49825 19.2501 6.27449 19.2501 9.82697 19.2501Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path><path d="M6.875 7.32886V15.5833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                Categories
              </Link>
            </div>

            {/* Coupons */}
            <div className="flex flex-col gap-1">
              <Link 
                className={`flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent ${pathname === "/admin/coupons" ? "bg-blue/10 text-blue" : ""}`}
                href="/admin/coupons"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M9.11109 2.97925H12.8901C14.5791 2.97923 15.9166 2.97922 16.9632 3.11959C18.0401 3.26402 18.9116 3.56825 19.599 4.25395C20.5428 5.19536 20.7722 6.49177 20.8445 8.21155L20.8454 8.23371C20.8517 8.3839 20.8582 8.53725 20.8525 8.66642C20.8465 8.80383 20.8252 9.00224 20.7155 9.19825C20.6396 9.33389 20.5379 9.42765 20.4702 9.48377C20.3967 9.54463 20.3151 9.59978 20.2373 9.64885C20.0872 9.74352 19.8843 9.85687 19.6463 9.98975L19.6288 9.99951C19.2753 10.197 19.0397 10.572 19.0397 11.0001C19.0397 11.4282 19.2753 11.8032 19.6288 12.0007L19.6464 12.0105C19.8843 12.1433 20.0873 12.2566 20.2373 12.3513C20.3151 12.4004 20.3967 12.4555 20.4702 12.5164C20.5379 12.5725 20.6396 12.6663 20.7155 12.8019C20.8252 12.9979 20.8465 13.1963 20.8525 13.3337C20.8465 13.4629 20.8517 13.6163 20.8454 13.7665L20.8445 13.7886C20.7722 15.5084 20.5428 16.8048 19.599 17.7462C18.9116 18.4319 18.0401 18.7361 16.9632 18.8806C15.9166 19.0209 14.5791 19.0209 12.8901 19.0209H9.11109C7.42208 19.0209 6.08462 19.0209 5.03796 18.8806C3.96107 18.7361 3.08959 18.4319 2.40219 17.7462C1.45843 16.8048 1.22904 15.5084 1.15674 13.7886L1.1558 13.7664C1.14946 13.6163 1.14299 13.4629 1.14867 13.3337C1.15471 13.1963 1.17596 12.9979 1.28568 12.8019C1.36161 12.6663 1.46329 12.5725 1.53104 12.5164C1.6045 12.4555 1.68609 12.4004 1.76388 12.3513C1.91397 12.2566 2.11695 12.1433 2.35489 12.0104L2.37239 12.0006C2.72595 11.8032 2.9615 11.4282 2.9615 11.0001C2.9615 10.572 2.72595 10.197 2.37239 9.99951L2.35488 9.98973C2.11694 9.85686 1.91396 9.74352 1.76388 9.64885C1.68609 9.59978 1.6045 9.54463 1.53104 9.48377C1.46329 9.42765 1.36161 9.33389 1.28568 9.19825C1.17596 9.00225 1.15471 8.80382 1.14867 8.66642C1.14299 8.53726 1.14946 8.38391 1.1558 8.23372C1.15612 8.22632 1.15643 8.21893 1.15674 8.21155C1.22904 6.49177 1.45843 5.19536 2.40219 4.25395C3.08959 3.56825 3.96107 3.26402 5.03796 3.11959C6.08462 2.97922 7.42208 2.97923 9.11109 2.97925ZM19.4769 13.3689C19.4769 13.3689 19.4771 13.3699 19.4773 13.372L19.4769 13.3689ZM19.4791 13.4989C19.479 13.5049 19.4788 13.5112 19.4787 13.5176C19.4772 13.5763 19.4743 13.6444 19.4707 13.7309C19.3992 15.4322 19.1668 16.2353 18.628 16.7727C18.2387 17.161 17.7055 17.3937 16.7805 17.5178C15.8358 17.6445 14.5907 17.6459 12.8385 17.6459H9.1627C7.41052 17.6459 6.16538 17.6445 5.22073 17.5178C4.29569 17.3937 3.76246 17.161 3.37325 16.7727C2.83444 16.2353 2.60205 15.4322 2.53053 13.7309C2.52689 13.6444 2.52405 13.5763 2.52253 13.5176C2.52237 13.5112 2.52222 13.5049 2.5221 13.4989C2.63637 13.4283 2.80049 13.3365 3.0428 13.2011C3.81265 12.7712 4.3365 11.9476 4.3365 11.0001C4.3365 10.0526 3.81265 9.22894 3.0428 8.79902C2.80049 8.66371 2.63637 8.57181 2.52209 8.50125C2.52222 8.49525 2.52237 8.48901 2.52253 8.48253C2.52405 8.42389 2.52689 8.35576 2.53053 8.26931C2.60205 6.56794 2.83444 5.76489 3.37325 5.22743C3.76246 4.83918 4.29568 4.60645 5.22073 4.48239C6.16538 4.3557 7.41052 4.35425 9.1627 4.35425H12.8385C14.5907 4.35425 15.8358 4.3557 16.7805 4.48239C17.7055 4.60645 18.2387 4.83918 18.628 5.22743C19.1668 5.76489 19.3992 6.56794 19.4707 8.26931C19.4743 8.35576 19.4772 8.42389 19.4787 8.48252C19.4788 8.48901 19.479 8.49525 19.4791 8.50125C19.3648 8.57181 19.2007 8.66371 18.9584 8.79902C18.1886 9.22894 17.6647 10.0526 17.6647 11.0001C17.6647 11.9476 18.1886 12.7712 18.9584 13.2011C19.2007 13.3365 19.2007 13.4283 19.4791 13.4989ZM19.593 8.42491L19.592 8.42576C19.5958 8.42222 19.5966 8.42194 19.593 8.42491ZM19.4769 8.63122C19.4769 8.63122 19.477 8.63014 19.4773 8.62819L19.4769 8.63122ZM2.40821 8.42491C2.40463 8.42194 2.40538 8.42222 2.40925 8.42576L2.40821 8.42491ZM2.5239 8.62818C2.52422 8.63013 2.52432 8.63122 2.52432 8.63122L2.5239 8.62818ZM2.52432 13.3689C2.52432 13.3689 2.52422 13.37 2.5239 13.372L2.52432 13.3689ZM2.40925 13.5744C2.40538 13.5779 2.40462 13.5782 2.40821 13.5753L2.40925 13.5744ZM19.592 13.5744L19.593 13.5753C19.5966 13.5782 19.5958 13.5779 19.592 13.5744ZM14.2367 7.76395C14.5052 8.03243 14.5052 8.46773 14.2367 8.73622L8.73674 14.2362C8.46825 14.5047 8.03295 14.5047 7.76447 14.2362C7.49598 13.9677 7.49598 13.5324 7.76447 13.2639L13.2645 7.76395C13.533 7.49546 13.9683 7.49546 14.2367 7.76395Z" fill="currentColor"></path></svg>
                Coupons
              </Link>
            </div>

            {/* Reviews */}
            <div className="flex flex-col gap-1">
              <Link 
                className={`flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent ${pathname === "/admin/reviews" ? "bg-blue/10 text-blue" : ""}`}
                href="/admin/reviews"
              >
                {/* Clean Reviews Icon (Star) */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Reviews
              </Link>
            </div>

            {/* Customization (Collapsible) */}
            <div className="flex flex-col gap-1">
              <button 
                type="button" 
                className="flex items-center justify-between w-full font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm text-left hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent"
                onClick={() => toggleMenu("customization")}
              >
                <span className="flex items-center gap-2.5">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M7.97506 1.14576H14.026C14.2276 1.14570 14.3821 1.14566 14.5171 1.16016C15.7585 1.29337 16.7086 2.31274 16.7662 3.54754C17.8577 3.87348 18.6355 4.88346 18.6496 6.04183C19.2005 6.20714 19.6757 6.46788 20.0647 6.88805C20.6623 7.53361 20.8475 8.3292 20.8546 9.25855C20.8614 10.152 20.7022 11.2811 20.5045 12.6832L20.1021 15.5373C19.9475 16.6337 19.8219 17.5244 19.6266 18.2223C19.4222 18.9526 19.1209 19.5534 18.5631 20.0152C18.0097 20.4734 17.3532 20.671 16.5772 20.7641C15.8269 20.8541 14.883 20.8541 13.7077 20.8541H8.29361C7.11836 20.8541 6.17441 20.8541 5.42409 20.7641C4.64808 20.671 3.99156 20.4734 3.43818 20.0152C2.88038 19.5534 2.57911 18.9526 2.37471 18.2223C2.17935 17.5244 2.05379 16.6337 1.89923 15.5373L1.49683 12.6832C1.29912 11.2811 1.13991 10.152 1.14669 9.25855C1.15375 8.3292 1.33896 7.53361 1.93661 6.88805C2.32551 6.46798 2.80056 6.20726 3.35132 6.04194C3.36535 4.88346 4.14322 3.87338 5.23487 3.54748C5.29253 2.3127 6.24263 1.29337 7.48394 1.16016C7.61901 1.14566 7.77352 1.1457 7.97506 1.14576ZM4.75725 5.80044C5.6059 5.72907 6.64624 5.72908 7.8986 5.7291H14.1027C15.3549 5.72908 16.3951 5.72908 17.2436 5.80041C17.1179 5.24341 16.6204 4.81243 16.0072 4.81243H5.9937C5.38053 4.81243 4.88299 5.24343 4.75725 5.80044ZM14.3704 2.52731C14.8748 2.58143 15.2734 2.95738 15.371 3.43743H6.63008C6.72772 2.95738 7.12631 2.58143 7.63066 2.52731C7.68225 2.52177 7.75577 2.52077 8.01322 2.52077H13.9879C14.2453 2.52077 14.3188 2.52177 14.3704 2.52731ZM2.9456 7.82216C3.22326 7.52225 3.64079 7.32332 4.4521 7.21541C5.27814 7.10554 6.38393 7.1041 7.95034 7.1041H14.051C15.6174 7.1041 16.7232 7.10554 17.5492 7.21541C18.3605 7.32332 18.778 7.52225 19.0557 7.82216C19.3269 8.11511 19.4739 8.51376 19.4796 9.26899C19.4856 10.0482 19.3425 11.0758 19.135 12.5475L18.7473 15.2975C18.5843 16.4533 18.4702 17.2525 18.3025 17.8517C18.1409 18.4288 17.9509 18.737 17.6862 18.9561C17.4172 19.1789 17.056 19.3218 16.4134 19.3989C15.7545 19.4779 14.8933 19.4791 13.6632 19.4791H8.33806C7.108 19.4791 6.24676 19.4779 5.58791 19.3989C4.9453 19.3218 4.58411 19.1789 4.31507 18.9561C4.05044 18.737 3.86035 18.4288 3.69882 17.8517C3.5311 17.2525 3.41697 16.4533 3.25402 15.2975L2.8663 12.5475C2.65881 11.0758 2.51574 10.0482 2.52165 9.26899C2.52739 8.51376 2.67439 8.11511 2.9456 7.82216Z" fill="currentColor"></path></svg>
                  Customization
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className={`transform transition-transform ${openMenus.customization ? "rotate-180" : ""}`}><path d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
              </button>
              {openMenus.customization && (
                <div className="flex flex-col gap-1 mt-1 ml-6">
                  <Link className="flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent" href="/admin/seo-settings">SEO Settings</Link>
                  <Link className="flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent" href="/admin/header-settings">Header Settings</Link>
                  <Link className="flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent" href="/admin/hero-banner">Hero Banner</Link>
                  <Link className="flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent" href="/admin/hero-slider">Hero Slider</Link>
                  <Link className="flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent" href="/admin/countdown">Countdown</Link>
                  <Link className="flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent" href="/admin/privacy-policy">Privacy Policy</Link>
                  <Link className="flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent" href="/admin/terms-conditions">Terms &amp; Conditions</Link>
                  <Link className="flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent" href="/admin/testimonials">Testimonials</Link>
                </div>
              )}
            </div>

            {/* Blog (Collapsible) */}
            <div className="flex flex-col gap-1">
              <button 
                type="button" 
                className="flex items-center justify-between w-full font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm text-left hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent"
                onClick={() => toggleMenu("blog")}
              >
                <span className="flex items-center gap-2.5">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="10.5417" cy="11" rx="2.63542" ry="2.75" stroke="currentColor" strokeWidth="1.5"></ellipse><path d="M12.093 1.97281C11.7701 1.83325 11.3608 1.83325 10.5422 1.83325C9.72355 1.83325 9.31424 1.83325 8.99136 1.97281C8.56086 2.15888 8.21883 2.51578 8.04051 2.965C7.95911 3.17006 7.92725 3.40854 7.91479 3.75641C7.89646 4.26763 7.64522 4.74082 7.22064 4.9966C6.79607 5.25239 6.27773 5.24283 5.8443 5.00378C5.54935 4.84111 5.3355 4.75066 5.1246 4.72168C4.66262 4.65822 4.19539 4.78885 3.82571 5.08485C3.54846 5.30685 3.3438 5.67674 2.93448 6.41652C2.52516 7.1563 2.32051 7.52619 2.27489 7.88775C2.21407 8.36982 2.33926 8.85736 2.62293 9.24311C2.7524 9.41918 2.93437 9.56719 3.21678 9.75236C3.63196 10.0246 3.89909 10.4883 3.89907 10.9999C3.89904 11.5115 3.63191 11.9752 3.21678 12.2474C2.93432 12.4326 2.75233 12.5806 2.62284 12.7567C2.33917 13.1424 2.21398 13.63 2.2748 14.112C2.32042 14.4736 2.52508 14.8435 2.93439 15.5833C3.34371 16.323 3.54837 16.6929 3.82563 16.9149C4.19531 17.2109 4.66253 17.3416 5.12452 17.2781C5.3354 17.2491 5.54924 17.1587 5.84416 16.996C6.27763 16.757 6.796 16.7474 7.2206 17.0032C7.64521 17.259 7.89646 17.7322 7.91479 18.2435C7.92725 18.5913 7.95911 18.8298 8.04051 19.0348C8.21883 19.4841 8.56086 19.841 8.99136 20.027C9.31424 20.1666 9.72355 20.1666 10.5422 20.1666C11.3608 20.1666 11.7701 20.1666 12.093 20.027C12.5235 19.841 12.8655 19.4841 13.0439 19.0348C13.1253 18.8298 13.1571 18.5913 13.1696 18.2434C13.1879 17.7322 13.4391 17.259 13.8637 17.0032C14.2883 16.7474 14.8067 16.7569 15.2402 16.996C15.5351 17.1586 15.7489 17.2491 15.9598 17.278C16.4218 17.3415 16.889 17.2109 17.2587 16.9149C17.5359 16.6929 17.7406 16.323 18.1499 15.5832C18.5592 14.8434 18.7639 14.4735 18.8095 14.112C18.8703 13.6299 18.7451 13.1424 18.4614 12.7566C18.332 12.5805 18.15 12.4325 17.8675 12.2473C17.4524 11.9751 17.1853 11.5114 17.1853 10.9998C17.1853 10.4883 17.4524 10.0247 17.8675 9.75251C18.15 9.5673 18.332 9.41927 18.4615 9.24317C18.7452 8.85742 18.8704 8.36988 18.8096 7.88781C18.764 7.52626 18.5593 7.15637 18.15 6.41659C17.7407 5.6768 17.536 5.30691 17.2587 5.08491C16.8891 4.78892 16.4218 4.65828 15.9599 4.72175C15.749 4.75072 15.5351 4.84116 15.2402 5.00382C14.8067 5.24288 14.2884 5.25244 13.8638 4.99663C13.4392 4.74083 13.1879 4.26761 13.1696 3.75636C13.1571 3.40852 13.1253 3.17005 13.0439 2.965C12.8655 2.51578 12.5235 2.15888 12.093 1.97281Z" stroke="currentColor" strokeWidth="1.5"></path></svg>
                  Blog
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className={`transform transition-transform ${openMenus.blog ? "rotate-180" : ""}`}><path d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
              </button>
              {openMenus.blog && (
                <div className="flex flex-col gap-1 mt-1 ml-6">
                  <Link className="flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent" href="/admin/posts">Posts</Link>
                  <Link className="flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent" href="/admin/post-authors">Post Authors</Link>
                  <Link className="flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent" href="/admin/post-categories">Post Categories</Link>
                </div>
              )}
            </div>

          </div>
        </div>
        
        {/* Logout */}
        <div className="p-4 border-t border-gray-3">
          <Link
            href="/login"
            className="flex items-center px-4 py-3 text-custom-sm font-medium text-red hover:bg-red/5 rounded-lg duration-200"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
