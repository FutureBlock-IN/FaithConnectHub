import React from "react";

import { RootShell } from "@/components/root-shell";
import { Navbar } from "@/components/site-header/navbar";

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <React.Fragment>
      <Navbar />
      <RootShell>{children}</RootShell>
    </React.Fragment>
  );
}
