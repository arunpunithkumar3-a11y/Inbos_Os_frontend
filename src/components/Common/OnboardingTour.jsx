
import React, { useEffect, useState, useRef } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";

export default function OnboardingTour() {
  const {
    tourActive,
    tourStep,
    skipTour,
    finishTour,
    nextTourStep,
    prevTourStep,
  } = useWorkspace();

  const tooltipRef = useRef(null);
  const [coords, setCoords] = useState({
    spotlight: { top: 0, left: 0, width: 0, height: 0, opacity: 0 },
    tooltip: { top: 0, left: 0, opacity: 0 },
  });

  const steps = [
    {
      title: "Welcome to Inbox OS",
      description: "Your premium minimal workspace for AI-powered email management. Let's show you around in 5 quick steps!",
      target: "#welcome-state",
      placement: "bottom",
    },
    {
      title: "Gmail Authentication",
      description: "Connect your Google account here. Once connected, Inbox OS gains secure capabilities to read, compose, and manage your emails.",
      target: "#btn-connect-gmail",
      placement: "bottom",
    },
    {
      title: "AI Chat Core Interface",
      description: "Draft professional replies, search receipts, summarize recent invoices, or coordinate alerts using conversational AI queries.",
      target: ".input-container",
      placement: "top",
    },
    {
      title: "Recent Conversations History",
      description: "Switch between ongoing email conversations, delete finished histories safely, or start fresh conversation slates.",
      target: ".threads-section",
      placement: "right",
    },
    {
      title: "Workspace Settings",
      description: "Open this panel to toggle presentation properties (like floating toast alerts) to match your workflow.",
      target: "#btn-open-settings",
      placement: "top",
    },
  ];

  const currentStep = steps[tourStep];

  useEffect(() => {
    if (!tourActive || !currentStep) return;

    const updatePosition = () => {
      const targetEl = document.querySelector(currentStep.target);
      if (!targetEl) {
        console.warn(`Tour target element missing: ${currentStep.target}`);

        if (tourStep < steps.length - 1) {
          nextTourStep();
        } else {
          finishTour();
        }
        return;
      }

      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

      setTimeout(() => {
        const rect = targetEl.getBoundingClientRect();

        const spotlight = {
          top: rect.top + window.scrollY - 6,
          left: rect.left + window.scrollX - 6,
          width: rect.width + 12,
          height: rect.height + 12,
          opacity: 1,
        };

        if (!tooltipRef.current) return;
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const gap = 14;

        let top = 0;
        let left = 0;

        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        const placement = currentStep.placement;

        if (placement === "top") {
          top = rect.top + scrollY - tooltipRect.height - gap;
          left = rect.left + scrollX + (rect.width - tooltipRect.width) / 2;
        } else if (placement === "bottom") {
          top = rect.bottom + scrollY + gap;
          left = rect.left + scrollX + (rect.width - tooltipRect.width) / 2;
        } else if (placement === "left") {
          top = rect.top + scrollY + (rect.height - tooltipRect.height) / 2;
          left = rect.left + scrollX - tooltipRect.width - gap;
        } else if (placement === "right") {
          top = rect.top + scrollY + (rect.height - tooltipRect.height) / 2;
          left = rect.right + scrollX + gap;
        }

        const padding = 10;
        left = Math.max(
          padding,
          Math.min(left, window.innerWidth - tooltipRect.width - padding)
        );
        top = Math.max(
          padding,
          Math.min(top, window.innerHeight - tooltipRect.height - padding)
        );

        setCoords({
          spotlight,
          tooltip: {
            top,
            left,
            opacity: 1,
          },
        });
      }, 300);
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        skipTour();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (tourStep < steps.length - 1) {
          nextTourStep();
        } else {
          finishTour();
        }
      } else if (e.key === "ArrowLeft" && tourStep > 0) {
        e.preventDefault();
        prevTourStep();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [tourActive, tourStep]);

  if (!tourActive) return null;

  const isLastStep = tourStep === steps.length - 1;
  const nextButtonText = isLastStep ? "Finish" : "Next";

  return (
    <>
      {}
      <div className="tour-backdrop-blocker" onClick={skipTour} />

      {}
      <div
        className="tour-spotlight"
        style={{
          top: `${coords.spotlight.top}px`,
          left: `${coords.spotlight.left}px`,
          width: `${coords.spotlight.width}px`,
          height: `${coords.spotlight.height}px`,
          opacity: coords.spotlight.opacity,
          transition: "all 0.25s ease-out",
        }}
      />

      {}
      <div
        ref={tooltipRef}
        className="tour-tooltip active"
        data-placement={currentStep.placement}
        style={{
          top: `${coords.tooltip.top}px`,
          left: `${coords.tooltip.left}px`,
          opacity: coords.tooltip.opacity,
          position: "absolute",
          zIndex: 10001,
          transition: "opacity 0.15s ease-in-out",
        }}
      >
        <div className="tour-tooltip-arrow"></div>
        <div>
          <h4 className="tour-tooltip-title">{currentStep.title}</h4>
          <p className="tour-tooltip-desc">{currentStep.description}</p>
        </div>
        <div className="tour-tooltip-footer">
          <span className="tour-tooltip-progress">
            Step {tourStep + 1} of {steps.length}
          </span>
          <div className="tour-tooltip-actions">
            <button className="tour-btn tour-btn-skip" onClick={skipTour}>
              Skip
            </button>
            {tourStep > 0 && (
              <button className="tour-btn tour-btn-prev" onClick={prevTourStep}>
                Prev
              </button>
            )}
            <button
              className="tour-btn tour-btn-next"
              onClick={isLastStep ? finishTour : nextTourStep}
            >
              {nextButtonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
