"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  closeBranchModal,
  openBranchModal,
  useBranchModalOpen,
} from "@/lib/branch-modal-store";
import { SPLASH_COMPLETE_EVENT, SPLASH_STORAGE_KEY } from "@/lib/splash";
import type { Branch } from "@/types/branch";

const BRANCH_STORAGE_KEY = "magnifico-branch";

interface BranchBranchesContextValue {
  branches: Branch[];
}

interface BranchActiveContextValue {
  activeBranch: Branch | null;
  setBranch: (id: string) => void;
}

interface BranchHasSelectedContextValue {
  hasSelected: boolean;
}

const BranchBranchesContext = createContext<BranchBranchesContextValue | null>(
  null
);
const BranchActiveContext = createContext<BranchActiveContextValue | null>(null);
const BranchHasSelectedContext =
  createContext<BranchHasSelectedContextValue | null>(null);

export function BranchProvider({
  branches,
  children,
}: {
  branches: Branch[];
  children: React.ReactNode;
}) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(BRANCH_STORAGE_KEY);
    } catch {
      stored = null;
    }

    const valid =
      stored && branches.some((b) => b.slug === stored) ? stored : null;

    setSelectedSlug(valid);
    setHydrated(true);
  }, [branches]);

  // Prompt for a branch only after splash completes — opening during splash
  // used to capture overflow:hidden and leave the page permanently unscrollable.
  useEffect(() => {
    if (!hydrated || selectedSlug !== null || branches.length === 0) return;

    const promptBranchSelection = () => openBranchModal();

    let splashSeen = false;
    try {
      splashSeen = Boolean(sessionStorage.getItem(SPLASH_STORAGE_KEY));
    } catch {
      splashSeen = false;
    }

    if (splashSeen) {
      promptBranchSelection();
      return;
    }

    window.addEventListener(SPLASH_COMPLETE_EVENT, promptBranchSelection, {
      once: true,
    });
    return () => {
      window.removeEventListener(SPLASH_COMPLETE_EVENT, promptBranchSelection);
    };
  }, [hydrated, selectedSlug, branches.length]);

  const setBranch = useCallback(
    (id: string) => {
      const branch = branches.find((b) => b.id === id);
      if (!branch) return;
      setSelectedSlug(branch.slug);
      try {
        localStorage.setItem(BRANCH_STORAGE_KEY, branch.slug);
      } catch {
        /* ignore persistence errors */
      }
      closeBranchModal();
    },
    [branches]
  );

  const activeBranch = useMemo(() => {
    if (!selectedSlug || branches.length === 0) return null;
    return branches.find((b) => b.slug === selectedSlug) ?? null;
  }, [branches, selectedSlug]);

  const hasSelected = hydrated && selectedSlug !== null;

  const branchesValue = useMemo<BranchBranchesContextValue>(
    () => ({ branches }),
    [branches]
  );

  const activeValue = useMemo<BranchActiveContextValue>(
    () => ({ activeBranch, setBranch }),
    [activeBranch, setBranch]
  );

  const hasSelectedValue = useMemo<BranchHasSelectedContextValue>(
    () => ({ hasSelected }),
    [hasSelected]
  );

  return (
    <BranchBranchesContext.Provider value={branchesValue}>
      <BranchActiveContext.Provider value={activeValue}>
        <BranchHasSelectedContext.Provider value={hasSelectedValue}>
          {children}
        </BranchHasSelectedContext.Provider>
      </BranchActiveContext.Provider>
    </BranchBranchesContext.Provider>
  );
}

export function useBranchBranches(): BranchBranchesContextValue {
  const ctx = useContext(BranchBranchesContext);
  if (!ctx) {
    throw new Error("useBranchBranches must be used within a BranchProvider");
  }
  return ctx;
}

export function useBranchActive(): BranchActiveContextValue {
  const ctx = useContext(BranchActiveContext);
  if (!ctx) {
    throw new Error("useBranchActive must be used within a BranchProvider");
  }
  return ctx;
}

export function useBranchHasSelected(): BranchHasSelectedContextValue {
  const ctx = useContext(BranchHasSelectedContext);
  if (!ctx) {
    throw new Error(
      "useBranchHasSelected must be used within a BranchProvider"
    );
  }
  return ctx;
}

/** Combined branch data — prefer granular hooks on hot paths. */
export function useBranchData() {
  const { branches } = useBranchBranches();
  const { activeBranch, setBranch } = useBranchActive();
  const { hasSelected } = useBranchHasSelected();
  return { branches, activeBranch, hasSelected, setBranch };
}

/** Stable open/close actions — external store, no React context re-renders. */
export function useBranchModalDispatch() {
  return { openBranchModal, closeBranchModal };
}

/** Subscribe only when the modal open state must drive UI. */
export function useBranchModalState() {
  return { isModalOpen: useBranchModalOpen() };
}

/** Convenience hook — prefer granular hooks in hot paths (header, homepage). */
export function useBranch() {
  const data = useBranchData();
  const dispatch = useBranchModalDispatch();
  const { isModalOpen } = useBranchModalState();
  return { ...data, ...dispatch, isModalOpen };
}

export { openBranchModal, closeBranchModal, useBranchModalOpen } from "@/lib/branch-modal-store";
