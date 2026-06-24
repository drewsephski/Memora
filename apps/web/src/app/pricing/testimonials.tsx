"use client";

import { useEffect, useRef } from "react";

export const Testimonials = () => {
  const senjaContainerRef = useRef<HTMLDivElement>(null);
  const senjaContainerRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (senjaContainerRef.current) {
      const script = document.createElement("script");
      script.src =
        "https://widget.senja.io/widget/fbd84a7e-61cb-4140-80c5-746dc0c3b3eb/platform.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  useEffect(() => {
    if (senjaContainerRef2.current) {
      const script = document.createElement("script");
      script.src =
        "https://widget.senja.io/widget/99489516-c9b7-4162-9558-50851e82e446/platform.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return (
    <section className="mt-20 md:mt-24">
      <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12">
        What people are saying
      </h2>
      <div
        ref={senjaContainerRef2}
        className="senja-embed"
        data-id="99489516-c9b7-4162-9558-50851e82e446"
        data-mode="shadow"
        data-lazyload="false"
        style={{ display: "block", marginTop: "2rem" }}
      ></div>
      <div
        ref={senjaContainerRef}
        className="senja-embed mt-[-30px]"
        data-id="fbd84a7e-61cb-4140-80c5-746dc0c3b3eb"
        data-mode="shadow"
        data-lazyload="false"
        style={{ display: "block" }}
      ></div>
    </section>
  );
};
