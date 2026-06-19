import React from "react";

import { LazyPlayer } from "@/components/lazy-player";
import { RootShell } from "@/components/root-shell";
import { Navbar } from "@/components/site-header/navbar";

export default async function Layout({ children }: React.PropsWithChildren) {
  return (
    <React.Fragment>
      <Navbar />
      <RootShell player={<LazyPlayer />}>{children}</RootShell>
    </React.Fragment>
  );
}
