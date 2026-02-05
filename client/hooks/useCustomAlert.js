import { useState, useCallback } from "react";

/**
 * Custom Hook for managing CustomAlert state
 * Returns:
 * - alertProps: Props to pass to <CustomAlert /> ({ visible, title, message, ... })
 * - showAlert: Function to trigger alert ({ title, message, onConfirm, onCancel, confirmText, confirmColor })
 * - hideAlert: Function to close alert manually
 */
export function useCustomAlert() {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: null,
    confirmText: "OK",
    cancelText: "Cancel",
    confirmColor: "bg-indigo-500",
  });

  const showAlert = useCallback(
    ({
      title,
      message,
      onConfirm = () => {},
      onCancel = null,
      confirmText = "OK",
      cancelText = "Cancel",
      confirmColor = "bg-indigo-500",
      icon = "alert-circle",
      iconColor = "#ef4444",
    }) => {
      setAlertConfig({
        visible: true,
        title,
        message,
        onConfirm: () => {
          setAlertConfig((prev) => ({ ...prev, visible: false }));
          if (onConfirm) onConfirm();
        },
        onCancel: onCancel
          ? () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              onCancel();
            }
          : null,
        confirmText,
        cancelText,
        confirmColor,
        icon,
        iconColor,
      });
    },
    [],
  );

  const hideAlert = useCallback(() => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    alertProps: {
      ...alertConfig,
      onCancel: alertConfig.onCancel || hideAlert, // Default to just hiding if no cancel action
    },
    showAlert,
    hideAlert,
  };
}
