"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";

const CheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn("w-6 h-6 ", className)}
    >
      <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
};

const CheckFilled = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("w-6 h-6 ", className)}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

type LoadingState = {
  text: string;
};

const LoaderCore = ({
  loadingStates,
  value = 0,
}: {
  loadingStates: LoadingState[];
  value?: number;
}) => {
  return (
    <div className="flex relative justify-start max-w-xl mx-auto flex-col mt-0">
      {loadingStates.map((loadingState, index) => {
        const distance = Math.abs(index - value);
        const opacity = Math.max(1 - distance * 0.3, 0);

        return (
          <motion.div
            key={index}
            className={cn("text-left flex gap-2 mb-4")}
            initial={{ opacity: 0, y: -(value * 40) }}
            animate={{ opacity: opacity, y: -(value * 40) }}
            transition={{ duration: 0.5 }}
          >
            <div>
              {index > value && (
                <CheckIcon className="text-black dark:text-white" />
              )}
              {index <= value && (
                <CheckFilled
                  className={cn(
                    "text-black dark:text-white",
                    value === index &&
                      "text-black dark:text-lime-500 opacity-100"
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "text-black dark:text-white",
                value === index && "text-black dark:text-lime-500 opacity-100"
              )}
            >
              {loadingState.text}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export const MultiStepLoader = ({
  loadingStates,
  loading,
  currentState = 0,
  loop = false,
}: {
  loadingStates: LoadingState[];
  loading?: boolean;
  currentState?: number;
  loop?: boolean;
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [displayState, setDisplayState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setIsExiting(true);
      const timeout = setTimeout(() => setIsExiting(false), 500);
      return () => clearTimeout(timeout);
    }
    setIsExiting(false);
  }, [loading]);

  // Add delay for state transitions
  useEffect(() => {
    if (loading) {
      if (currentState > 0) {
        if (displayState === 0) {
          const timeout = setTimeout(() => {
            setDisplayState(currentState);
          }, 200);
          return () => clearTimeout(timeout);
        } else if (currentState > displayState) {
          const timeout = setTimeout(() => {
            setDisplayState(currentState);
          }, 200);
          return () => clearTimeout(timeout);
        } else {
          setDisplayState(currentState);
        }
      } else {
        setDisplayState(currentState);
      }
    } else {
      setDisplayState(currentState);
    }
  }, [currentState, loading, displayState]);

  return (
    <AnimatePresence mode="wait">
      {(loading || isExiting) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full h-full fixed inset-0 z-[100] flex items-start justify-center"
        >
          <div className="absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-[40vh] bg-transparent" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,var(--background)/40_60%,var(--background)/60_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,transparent_0%,transparent_50%,var(--background)/30_100%)]" />
            <div className="absolute inset-0 backdrop-blur-[1px] bg-[radial-gradient(1000px_circle_at_center,transparent_0%,var(--background)/10_100%)]" />
          </div>

          <div className="relative z-10 mt-[45vh]">
            <LoaderCore value={displayState} loadingStates={loadingStates} />
          </div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
                opacity: [0.05, 0.03, 0.05],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute right-1/4 top-1/3 w-[40rem] h-[40rem] bg-accent/5 dark:bg-primary/5 rounded-full blur-[100px]"
            />
            
            <motion.div
              animate={{
                x: [0, -30, 0],
                y: [0, 50, 0],
                opacity: [0.03, 0.05, 0.03],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute left-1/4 bottom-1/3 w-[40rem] h-[40rem] bg-primary/5 dark:bg-accent/5 rounded-full blur-[100px]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
