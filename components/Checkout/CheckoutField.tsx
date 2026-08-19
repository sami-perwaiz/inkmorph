"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

import { CHECKOUT } from "@/lib/checkoutTokens";

const inputClassName = [
  "w-full min-w-0 border border-solid bg-white px-3.5 py-2.5",
  "font-poppins text-base font-normal leading-7 outline-none",
  "placeholder:text-[#A3A3A3] focus-visible:ring-2 focus-visible:ring-[#057AF0]/25",
].join(" ");

interface CheckoutFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function CheckoutField({
  label,
  htmlFor,
  error,
  optional = false,
  children,
  className = "",
}: CheckoutFieldProps) {
  return (
    <div className={`flex w-full min-w-0 flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="font-poppins text-sm font-medium leading-[22px]"
        style={{ color: CHECKOUT.labelColor }}
      >
        {label}
        {optional ? " (Optional)" : null}
      </label>
      {children}
      {error ? (
        <p className="font-inter text-sm leading-[22px]" style={{ color: CHECKOUT.error }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface CheckoutInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function CheckoutInput({ error, className = "", style, ...props }: CheckoutInputProps) {
  return (
    <input
      className={`${inputClassName} ${className}`}
      style={{
        borderColor: error ? CHECKOUT.error : CHECKOUT.inputBorder,
        borderRadius: CHECKOUT.inputRadius,
        boxShadow: CHECKOUT.inputShadow,
        color: CHECKOUT.labelColor,
        ...style,
      }}
      {...props}
    />
  );
}

interface CheckoutSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function CheckoutSelect({ error, className = "", style, children, ...props }: CheckoutSelectProps) {
  return (
    <div className="relative w-full">
      <select
        className={`${inputClassName} appearance-none pr-10 ${className}`}
        style={{
          borderColor: error ? CHECKOUT.error : CHECKOUT.inputBorder,
          borderRadius: CHECKOUT.inputRadius,
          boxShadow: CHECKOUT.inputShadow,
          color: CHECKOUT.labelColor,
          ...style,
        }}
        {...props}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2"
        aria-hidden
      >
        <path
          d="M5 7.5 10 12.5 15 7.5"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function CheckoutSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="w-full font-poppins text-lg font-medium leading-7 text-black">
      {children}
    </h2>
  );
}

export function CheckoutRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 tablet:grid-cols-2">{children}</div>
  );
}
