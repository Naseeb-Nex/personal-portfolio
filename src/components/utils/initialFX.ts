import { SplitText } from "gsap-trial/SplitText";
import gsap from "gsap";
import { smoother } from "../Navbar";

export function initialFX() {
  document.body.style.overflowY = "auto";
  smoother.paused(false);
  document.getElementsByTagName("main")[0].classList.add("main-active");
  gsap.to("body", {
    backgroundColor: "#0b080c",
    duration: 0.5,
    delay: 1,
  });

  var landingText = new SplitText(
    [".landing-intro h2", ".landing-intro h1"],
    {
      type: "chars,lines",
      linesClass: "split-line",
    }
  );
  gsap.fromTo(
    landingText.chars,
    { opacity: 0, y: 80, filter: "blur(5px)" },
    {
      opacity: 1,
      duration: 1.2,
      filter: "blur(0px)",
      ease: "power3.inOut",
      y: 0,
      stagger: 0.025,
      delay: 0.3,
    }
  );

  // Synchronize the scroller entrance with the name title
  gsap.fromTo(
    ".landing-info",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      y: 0,
      delay: 0.8,
    }
  );

  gsap.fromTo(
    [".header", ".icons-section", ".nav-fade"],
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      delay: 0.1,
    }
  );

  const scroller = document.querySelector(".landing-info-scroller");
  if (scroller) {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });

    // Start the scrolling animation after the initial entrance
    tl.to(scroller, {
      yPercent: -33.3333,
      duration: 1.5,
      ease: "power3.inOut",
      delay: 4, // Increased delay to allow the intro name to finish
    }).to(scroller, {
      yPercent: -66.6666,
      duration: 1.5,
      ease: "power3.inOut",
      delay: 2,
    });
  }
}
