"use client";

import Link from "next/link";
import { ErrorData } from "@/types";

type ErrorLayoutProps = {
  error: ErrorData;
};

export function ErrorLayout({ error }: ErrorLayoutProps) {
  return (
    <div className="max-w-[840px] mx-auto pt-20">
      <h1 className="outline-none block w-full text-2xl font-bold bg-transparent my-6">
        {error.title || "An error occurred"}
      </h1>
      <div className="text-neutral-600">
        {error.message || "Something went wrong. Please try again."}
      </div>
      <div className="mt-4">
        <Link className="font-bold underline text-accent" href="/">
          Go back to home
        </Link>
      </div>
    </div>
  );
} 