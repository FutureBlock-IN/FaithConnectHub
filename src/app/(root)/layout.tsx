import React from "react";

import { Player } from "@/components/player";
import { RootShell } from "@/components/root-shell";
import { Navbar } from "@/components/site-header/navbar";

export default async function Layout({ children }: React.PropsWithChildren) {
  return (
    <React.Fragment>
      <Navbar />
      <RootShell player={<Player />}>{children}</RootShell>
    </React.Fragment>
  );
}
