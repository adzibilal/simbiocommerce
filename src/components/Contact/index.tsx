"use client";

import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { submitContact } from "@/app/actions/contact";

interface StoreInfo {
  email: string;
  phone: string;
  address: string;
}

const Contact = ({ storeInfo }: { storeInfo: StoreInfo | null }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const result = await submitContact(form);
    if (result.success) {
      setStatus("success");
      setForm({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
    } else {
      setStatus("error");
      setErrorMsg(result.error || "Failed to send message");
    }
  };

  return (
    <>
      <Breadcrumb title={"Contact"} pages={["contact"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="py-5 px-4 sm:px-7.5 border-b border-gray-3">
                <p className="font-medium text-xl text-dark">Contact Information</p>
              </div>

              <div className="p-4 sm:p-7.5">
                <div className="flex flex-col gap-4">
                  <p className="flex items-center gap-4">
                    <svg className="text-blue shrink-0" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M9.11365 2.97913H12.8837C14.5684 2.97911 15.9027 2.9791 16.947 3.1195C18.0217 3.26399 18.8916 3.56843 19.5776 4.25443C20.2636 4.94043 20.568 5.8103 20.7125 6.88502C20.8529 7.9293 20.8529 9.26363 20.8529 10.9482V11.0517C20.8529 12.7363 20.8529 14.0706 20.7125 15.1149C20.568 16.1896 20.2636 17.0595 19.5776 17.7455C18.8916 18.4315 18.0217 18.7359 16.947 18.8804C15.9027 19.0208 14.5684 19.0208 12.8837 19.0208H9.11366C7.42904 19.0208 6.09471 19.0208 5.05043 18.8804C3.97571 18.7359 3.10584 18.4315 2.41984 17.7455C1.73384 17.0595 1.4294 16.1896 1.28491 15.1149C1.14451 14.0706 1.14452 12.7363 1.14453 11.0517V10.9482C1.14452 9.26363 1.14451 7.9293 1.28491 6.88502C1.4294 5.8103 1.73384 4.94043 2.41984 4.25443C3.10584 3.56843 3.97571 3.26399 5.05043 3.1195C6.09471 2.9791 7.42904 2.97911 9.11365 2.97913ZM5.23364 4.48224C4.31139 4.60623 3.78005 4.83876 3.39211 5.2267C3.00417 5.61465 2.77164 6.14599 2.64764 7.06824C2.52099 8.01026 2.51953 9.25204 2.51953 11C2.51953 12.7479 2.52099 13.9897 2.64764 14.9317C2.77164 15.8539 3.00417 16.3853 3.39211 16.7732C3.78005 17.1612 4.31139 17.3937 5.23364 17.5177C6.17567 17.6443 7.41745 17.6458 9.16536 17.6458H12.832C14.58 17.6458 15.8217 17.6443 16.7638 17.5177C17.686 17.3937 18.2173 17.1612 18.6053 16.7732C18.9932 16.3853 19.2258 15.8539 19.3498 14.9317C19.4764 13.9897 19.4779 12.7479 19.4779 11C19.4779 9.25204 19.4764 8.01026 19.3498 7.06824C19.2258 6.14599 18.9932 5.61465 18.6053 5.2267C18.2173 4.83876 17.686 4.60623 16.7638 4.48224C15.8217 4.35559 14.58 4.35413 12.832 4.35413H9.16537C7.41745 4.35413 6.17567 4.35559 5.23364 4.48224ZM4.97055 6.89317C5.21362 6.60148 5.64713 6.56207 5.93883 6.80514L7.91781 8.4543C8.77303 9.16697 9.36678 9.66017 9.86807 9.98258C10.3533 10.2947 10.6824 10.3994 10.9987 10.3994C11.315 10.3994 11.6441 10.2947 12.1293 9.98258C12.6306 9.66017 13.2244 9.16697 14.0796 8.4543L16.0586 6.80514C16.3503 6.56207 16.7838 6.60148 17.0269 6.89317C17.2699 7.18486 17.2305 7.61837 16.9388 7.86145L14.9254 9.53932C14.1129 10.2164 13.4543 10.7652 12.8731 11.139C12.2677 11.5284 11.678 11.7744 10.9987 11.7744C10.3194 11.7744 9.72973 11.5284 9.12428 11.139C8.54306 10.7652 7.88452 10.2164 7.07203 9.53933L5.05857 7.86145C4.76688 7.61837 4.72747 7.18486 4.97055 6.89317Z" fill="currentColor" />
                    </svg>
                    {storeInfo?.email || "support@example.com"}
                  </p>

                  <p className="flex items-center gap-4">
                    <svg className="text-blue shrink-0" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M4.59146 4.03966C6.13153 2.4996 8.73041 2.61667 9.80274 4.53812L10.3977 5.60414C11.0979 6.85889 10.7995 8.44205 9.77441 9.47969C9.76075 9.49839 9.6884 9.60375 9.67938 9.78783C9.66788 10.0228 9.75133 10.5662 10.5932 11.4081C11.4348 12.2497 11.9781 12.3333 12.2132 12.3219C12.3974 12.3129 12.5029 12.2405 12.5216 12.2269C13.5592 11.2018 15.1424 10.9034 16.3971 11.6036L17.4632 12.1985C19.3846 13.2709 19.5017 15.8698 17.9616 17.4098C17.1378 18.2336 16.0425 18.9655 14.7553 19.0143C12.8478 19.0867 9.6805 18.594 6.54387 15.4574C3.40724 12.3208 2.91463 9.15348 2.98694 7.24596C3.03574 5.95877 3.76769 4.86343 4.59146 4.03966Z" fill="currentColor" />
                    </svg>
                    {storeInfo?.phone || "-"}
                  </p>

                  <p className="flex gap-4">
                    <svg className="mt-0.5 shrink-0" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M3.89453 7.80506C3.89453 4.08157 7.12254 1.14581 10.9987 1.14581C14.8749 1.14581 18.1029 4.08157 18.1029 7.80506C18.1029 11.2986 15.9369 15.4 12.4423 16.8934C11.5248 17.2855 10.4726 17.2855 9.55514 16.8934C6.06051 15.4 3.89453 11.2986 3.89453 7.80506ZM10.9987 2.52081C7.7872 2.52081 5.26953 4.93234 5.26953 7.80506C5.26953 10.856 7.19951 14.3915 10.0955 15.629C10.6678 15.8736 11.3296 15.8736 11.9019 15.629C14.7979 14.3915 16.7279 10.856 16.7279 7.80506C16.7279 4.93234 14.2102 2.52081 10.9987 2.52081ZM10.9987 7.10415C10.3659 7.10415 9.85286 7.61715 9.85286 8.24998C9.85286 8.88281 10.3659 9.39581 10.9987 9.39581C11.6315 9.39581 12.1445 8.88281 12.1445 8.24998C12.1445 7.61715 11.6315 7.10415 10.9987 7.10415ZM8.47786 8.24998C8.47786 6.85776 9.60648 5.72915 10.9987 5.72915C12.3909 5.72915 13.5195 6.85776 13.5195 8.24998C13.5195 9.6422 12.3909 10.7708 10.9987 10.7708C9.60648 10.7708 8.47786 9.6422 8.47786 8.24998Z" fill="currentColor" />
                    </svg>
                    {storeInfo?.address || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-10">
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p className="text-lg font-medium text-dark">Message sent successfully!</p>
                  <p className="text-dark-4 text-sm">We'll get back to you as soon as possible.</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-2 inline-flex font-medium text-white bg-blue py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                    <div className="w-full">
                      <label htmlFor="firstName" className="block mb-2.5">First Name <span className="text-red">*</span></label>
                      <input
                        type="text"
                        id="firstName"
                        required
                        value={form.firstName}
                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                        placeholder="John"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                    <div className="w-full">
                      <label htmlFor="lastName" className="block mb-2.5">Last Name <span className="text-red">*</span></label>
                      <input
                        type="text"
                        id="lastName"
                        required
                        value={form.lastName}
                        onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                        placeholder="Doe"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                    <div className="w-full">
                      <label htmlFor="email" className="block mb-2.5">Email <span className="text-red">*</span></label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                    <div className="w-full">
                      <label htmlFor="phone" className="block mb-2.5">Phone</label>
                      <input
                        type="text"
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="Enter your phone"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label htmlFor="subject" className="block mb-2.5">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      placeholder="Type your subject"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="mb-7.5">
                    <label htmlFor="message" className="block mb-2.5">Message <span className="text-red">*</span></label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Type your message"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  {status === "error" && (
                    <p className="mb-4 text-sm text-red">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60"
                  >
                    {status === "loading" ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
