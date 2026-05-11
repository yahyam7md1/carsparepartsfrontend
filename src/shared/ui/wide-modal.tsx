"use client";

import clsx from "clsx";
import { Modal, type ModalProps } from "./modal";

/**
 * Wide admin dialogs: uses most of the viewport height so compact forms can avoid in-modal scroll.
 */
/** Use `vh` (not `dvh`) so height stays stable when the OS file picker opens/closes. */
export const wideModalPanelClassName =
  "max-h-[min(94vh,calc(100vh-0.75rem))] w-full max-w-[calc(100vw-0.5rem)] sm:max-w-[min(50rem,calc(100vw-1.25rem))] lg:max-w-[min(54rem,calc(100vw-1.75rem))]";

/** Always center vertically — `items-start` left the panel pinned to the top after native dialog quirks. */
const wideOverlay = "items-center justify-center p-2 sm:p-3 sm:pt-5";

const wideHeader = "px-4 py-2 sm:px-5 sm:py-2.5";

const wideTitle = "text-base leading-tight";

const wideBody = "px-4 py-2 sm:px-5 sm:py-2.5";

const wideFooter = "px-4 py-2 sm:px-5 sm:py-2.5";

export type WideModalProps = Omit<ModalProps, "panelClassName"> & {
  /** Appended after wide defaults (e.g. `max-h-[...]` overrides). */
  panelClassName?: string;
};

/** Same behavior as {@link Modal}, with wide / dense chrome for admin forms. */
export function WideModal({
  panelClassName,
  overlayClassName,
  headerClassName,
  titleClassName,
  bodyClassName,
  footerClassName,
  ...props
}: WideModalProps) {
  return (
    <Modal
      {...props}
      overlayClassName={clsx(wideOverlay, overlayClassName)}
      headerClassName={clsx(wideHeader, headerClassName)}
      titleClassName={clsx(wideTitle, titleClassName)}
      bodyClassName={clsx(wideBody, bodyClassName)}
      footerClassName={clsx(wideFooter, footerClassName)}
      panelClassName={clsx(wideModalPanelClassName, panelClassName)}
    />
  );
}
