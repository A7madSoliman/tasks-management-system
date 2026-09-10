declare module "*.svg" {
  import type React from "react";
  const Component: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export default Component;
}
