import { toast } from "sonner";

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function extractErrorMessage(
  err: unknown,
  fallback = "An unexpected error occurred.",
): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return fallback;
}

export const showToast = {
  success(message: string, options?: ToastOptions) {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  error(err: unknown, options?: ToastOptions & { title?: string }) {
    const message = options?.title || extractErrorMessage(err);
    const description = options?.title
      ? extractErrorMessage(err)
      : options?.description;

    return toast.error(message, {
      description,
      duration: options?.duration ?? 5000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  warning(message: string, options?: ToastOptions) {
    return toast.warning(message, {
      description: options?.description,
      duration: options?.duration ?? 5000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  info(message: string, options?: ToastOptions) {
    return toast.info(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
      description?: string;
    },
  ) {
    return toast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: (err: unknown) => {
        if (typeof options.error === "function") {
          return options.error(err);
        }
        return options.error || extractErrorMessage(err);
      },
      description: options.description,
    });
  },

  verificationRequired(options?: {
    message?: string;
    onVerifyClick?: () => void;
  }) {
    return toast.warning("Email Verification Required", {
      description:
        options?.message ||
        "Please verify your email address to access this high-privilege feature.",
      duration: 7000,
      action: {
        label: "Verify Email",
        onClick: () => {
          if (options?.onVerifyClick) {
            options.onVerifyClick();
          } else if (typeof window !== "undefined") {
            window.location.href = "/verify-email";
          }
        },
      },
    });
  },

  dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  },
};

export { toast };
